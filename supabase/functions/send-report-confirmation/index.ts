import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportConfirmationRequest {
  reporterName: string;
  reporterEmail: string;
  missingPersonName: string;
  reportId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication (JWT verification handled by Supabase)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { reporterName, reporterEmail, missingPersonName, reportId }: ReportConfirmationRequest = await req.json();
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    console.log("Sending confirmation email to:", reporterEmail);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Missing Persons Alert <onboarding@resend.dev>",
        to: [reporterEmail],
        subject: "Missing Person Report Confirmed",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Report Confirmed</h1>
            <p>Dear ${reporterName},</p>
            <p>Your missing person report for <strong>${missingPersonName}</strong> has been successfully registered in our system.</p>
            <p><strong>Report ID:</strong> ${reportId}</p>
            <h2 style="color: #333;">What happens next?</h2>
            <ul>
              <li>Your report is now visible to our community and registered users</li>
              <li>You will receive SMS updates if there are any developments</li>
              <li>Law enforcement and volunteers can access the information</li>
              <li>CCTV footage can be uploaded and analyzed for matches</li>
            </ul>
            <p>We will keep you informed of any updates via SMS to your registered phone number.</p>
            <p>Thank you for using our service. We hope for a safe return.</p>
            <p style="color: #666; font-size: 12px;">If you did not file this report, please contact us immediately.</p>
          </div>
        `,
      }),
    });

    const data = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", data);
      throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data);

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-report-confirmation:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
