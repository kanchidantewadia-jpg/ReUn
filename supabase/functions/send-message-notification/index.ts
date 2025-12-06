import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MessageNotificationRequest {
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  messagePreview: string;
  missingPersonName: string;
  missingPersonId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization - only allow service role calls (from database triggers)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    
    // Check if this is a service role key call (from database trigger)
    // Service role calls are trusted internal calls
    if (token !== SUPABASE_SERVICE_ROLE_KEY) {
      // If not service role, verify it's a valid user JWT
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);
      
      if (userError || !user) {
        console.error("Invalid authentication:", userError?.message);
        return new Response(
          JSON.stringify({ error: "Invalid authentication" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Only allow admins or moderators to call this directly
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      const isPrivileged = roles?.some(r => r.role === "admin" || r.role === "moderator");
      
      if (!isPrivileged) {
        console.error("User lacks required privileges:", user.id);
        return new Response(
          JSON.stringify({ error: "Insufficient permissions" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    const {
      recipientEmail,
      recipientName,
      senderName,
      messagePreview,
      missingPersonName,
      missingPersonId,
    }: MessageNotificationRequest = await req.json();

    console.log("Sending message notification email to:", recipientEmail);

    const appUrl = "https://reunite-app.lovable.app";
    const messageUrl = `${appUrl}/person/${missingPersonId}`;

    // Create HTML email template
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 48px;">
            <h1 style="color: #333; font-size: 24px; font-weight: bold; margin: 0 0 24px 0;">New Message Notification</h1>
            
            <p style="color: #333; font-size: 16px; line-height: 26px; margin: 0 0 16px 0;">Hello ${recipientName},</p>
            
            <p style="color: #333; font-size: 16px; line-height: 26px; margin: 0 0 24px 0;">
              You have received a new message from <strong>${senderName}</strong> regarding your missing person report for <strong>${missingPersonName}</strong>.
            </p>

            <div style="background-color: #f4f4f4; border-radius: 8px; padding: 24px; margin: 24px 0; border: 1px solid #e0e0e0;">
              <p style="color: #666; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0;">Message Preview:</p>
              <p style="color: #333; font-size: 14px; line-height: 22px; margin: 0; font-style: italic;">${messagePreview}</p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${messageUrl}" style="background-color: #5469d4; border-radius: 5px; color: #fff; font-size: 16px; font-weight: bold; text-decoration: none; padding: 14px 32px; display: inline-block;">View Full Message</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 32px 0;">

            <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 12px 0;">
              This is an automated notification from ReUnite - Reuniting Families.<br>
              If you no longer wish to receive these notifications, you can adjust your notification preferences in your account settings.
            </p>

            <p style="color: #8898aa; font-size: 12px; line-height: 16px; margin: 12px 0;">
              <a href="${appUrl}" style="color: #5469d4; text-decoration: underline;">ReUnite</a> - Helping reunite missing persons with their families
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ReUnite <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `New message from ${senderName} about ${missingPersonName}`,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-message-notification function:", error);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
