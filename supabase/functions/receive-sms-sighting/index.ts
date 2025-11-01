import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSSightingData {
  From: string;
  Body: string;
  FromCity?: string;
  FromState?: string;
  FromCountry?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received SMS sighting webhook");
    
    // Parse form data from Twilio
    const formData = await req.formData();
    const from = formData.get("From") as string;
    const body = formData.get("Body") as string;
    const city = formData.get("FromCity") as string || "";
    const state = formData.get("FromState") as string || "";
    
    console.log(`SMS from ${from}: ${body}`);

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse SMS format: "SEEN [name/id] at [location] - [description]"
    // Example: "SEEN John Doe at Main Street Station - wearing blue jacket"
    const smsPattern = /SEEN\s+(.+?)\s+at\s+(.+?)(?:\s+-\s+(.+))?$/i;
    const match = body.match(smsPattern);

    if (!match) {
      // Invalid format - send help message back
      console.log("Invalid SMS format");
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Invalid format. Use: SEEN [person name] at [location] - [description]</Message></Response>',
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/xml" },
        }
      );
    }

    const personName = match[1].trim();
    const location = match[2].trim();
    const description = match[3]?.trim() || "";

    // Find matching missing person by name (fuzzy match)
    const { data: missingPersons, error: searchError } = await supabase
      .from("missing_persons")
      .select("id, full_name")
      .ilike("full_name", `%${personName}%`)
      .limit(1);

    if (searchError || !missingPersons || missingPersons.length === 0) {
      console.error("No matching missing person found:", searchError);
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>No matching missing person found. Please check the name and try again.</Message></Response>',
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/xml" },
        }
      );
    }

    const missingPerson = missingPersons[0];
    console.log(`Matched to missing person: ${missingPerson.full_name}`);

    // Insert sighting record
    const { data: sighting, error: insertError } = await supabase
      .from("community_sightings")
      .insert({
        missing_person_id: missingPerson.id,
        reporter_phone: from,
        sighting_location: `${location} (${city}, ${state})`.trim(),
        sighting_description: description,
        source: "sms",
        verified: false,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting sighting:", insertError);
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Error recording sighting. Please try again.</Message></Response>',
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "text/xml" },
        }
      );
    }

    console.log("Sighting recorded successfully:", sighting.id);

    // Send confirmation SMS
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thank you! Your sighting of ${missingPerson.full_name} at ${location} has been recorded. Reference ID: ${sighting.id.substring(0, 8)}</Message></Response>`,
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      }
    );
  } catch (error) {
    console.error("Error in receive-sms-sighting:", error);
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>System error. Please try again later.</Message></Response>',
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      }
    );
  }
});