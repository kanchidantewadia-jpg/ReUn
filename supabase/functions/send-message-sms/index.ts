import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface MessageSMSRequest {
  recipientPhone: string;
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
      recipientPhone,
      recipientName,
      senderName,
      messagePreview,
      missingPersonName,
      missingPersonId,
    }: MessageSMSRequest = await req.json();

    console.log("Sending SMS notification to:", recipientPhone);

    const appUrl = "https://reunite-app.lovable.app";
    const messageUrl = `${appUrl}/person/${missingPersonId}`;

    // Create SMS message
    const smsBody = `🚨 URGENT - Child Case Alert\n\nHello ${recipientName},\n\n${senderName} sent a message about ${missingPersonName}:\n\n"${messagePreview}"\n\nView: ${messageUrl}\n\n- ReUnite`;

    // Send SMS via Twilio
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: recipientPhone,
          From: TWILIO_PHONE_NUMBER!,
          Body: smsBody,
        }),
      }
    );

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      console.error("Twilio error:", error);
      throw new Error("SMS service temporarily unavailable");
    }

    const result = await twilioResponse.json();
    console.log("SMS sent successfully:", result.sid);

    return new Response(JSON.stringify({ success: true, sid: result.sid }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-message-sms function:", error);
    return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
