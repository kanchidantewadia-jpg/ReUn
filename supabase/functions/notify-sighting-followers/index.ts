import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SightingNotificationRequest {
  missingPersonId: string;
  sightingLocation: string;
  sightingDescription?: string;
  sightingDate?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { missingPersonId, sightingLocation, sightingDescription, sightingDate }: SightingNotificationRequest = await req.json();

    console.log("Notifying followers for missing person:", missingPersonId);

    // Get the missing person's name
    const { data: personData, error: personError } = await supabase
      .from("missing_persons")
      .select("full_name")
      .eq("id", missingPersonId)
      .single();

    if (personError || !personData) {
      console.error("Error fetching person:", personError);
      return new Response(
        JSON.stringify({ error: "Missing person not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const personName = personData.full_name;

    // Get all followers of this case
    const { data: followers, error: followersError } = await supabase
      .from("case_follows")
      .select("user_id")
      .eq("missing_person_id", missingPersonId);

    if (followersError) {
      console.error("Error fetching followers:", followersError);
      return new Response(
        JSON.stringify({ error: "Failed to fetch followers" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!followers || followers.length === 0) {
      console.log("No followers for this case");
      return new Response(
        JSON.stringify({ message: "No followers to notify", emailsSent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get follower emails and notification preferences
    let emailsSent = 0;
    for (const follower of followers) {
      // Check if user has email notifications enabled
      const { data: profile } = await supabase
        .from("profiles")
        .select("email_notifications, full_name")
        .eq("user_id", follower.user_id)
        .single();

      if (!profile?.email_notifications) continue;

      // Get user email from auth
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(follower.user_id);

      if (!authUser?.email) continue;

      const caseUrl = `${supabaseUrl.replace('.supabase.co', '')}/person/${missingPersonId}`;

      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: "ReUn Alerts <onboarding@resend.dev>",
            to: [authUser.email],
            subject: `New Sighting Reported: ${personName}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #e74c3c; margin-bottom: 10px;">🔔 New Sighting Alert</h1>
                <p>Hello ${profile.full_name || "there"},</p>
                <p>A new sighting has been reported for <strong>${personName}</strong>, a case you are following.</p>
                
                <div style="background: #f8f9fa; border-left: 4px solid #e74c3c; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0 0 8px 0;"><strong>📍 Location:</strong> ${sightingLocation}</p>
                  ${sightingDate ? `<p style="margin: 0 0 8px 0;"><strong>📅 Date:</strong> ${new Date(sightingDate).toLocaleString()}</p>` : ""}
                  ${sightingDescription ? `<p style="margin: 0;"><strong>📝 Description:</strong> ${sightingDescription}</p>` : ""}
                </div>

                <p>Please check the ReUn platform for more details and to view the full sighting report.</p>
                
                <p style="color: #666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                  You received this email because you are following this case on ReUn. 
                  To stop receiving these alerts, unfollow the case on the platform.
                </p>
              </div>
            `,
          }),
        });

        if (emailResponse.ok) {
          emailsSent++;
          console.log(`Email sent to follower ${follower.user_id}`);
        } else {
          const errorData = await emailResponse.json();
          console.error(`Failed to send email to follower ${follower.user_id}:`, errorData);
        }
      } catch (emailError) {
        console.error(`Error sending email to follower ${follower.user_id}:`, emailError);
      }
    }

    console.log(`Notification complete: ${emailsSent} emails sent to ${followers.length} followers`);

    return new Response(
      JSON.stringify({ message: "Notifications sent", emailsSent, totalFollowers: followers.length }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in notify-sighting-followers:", error);
    return new Response(
      JSON.stringify({ error: "Service temporarily unavailable" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
