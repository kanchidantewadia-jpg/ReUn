import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_PHONE_NUMBER = Deno.env.get("TWILIO_PHONE_NUMBER");

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
      throw new Error(`Twilio API error: ${error}`);
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
