import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Security helper functions
function sanitizeInput(input: string, maxLength: number = 500): string {
  if (!input) return '';
  let sanitized = input.trim().slice(0, maxLength);
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return sanitized;
}

function escapeSqlWildcards(input: string): string {
  return input.replace(/[%_]/g, '\\$&');
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

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

    // Sanitize input data
    const sanitizedBody = sanitizeInput(body, 500);
    const sanitizedFrom = sanitizeInput(from, 20);

    // Parse SMS format: "SEEN [name/id] at [location] - [description]"
    const smsPattern = /SEEN\s+(.+?)\s+at\s+(.+?)(?:\s+-\s+(.+))?$/i;
    const match = sanitizedBody.match(smsPattern);

    if (!match) {
      console.log("Invalid SMS format");
      return new Response(
        '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Invalid format. Use: SEEN [person name] at [location] - [description]</Message></Response>',
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/xml" },
        }
      );
    }

    // Sanitize and validate extracted data
    const personName = sanitizeInput(match[1].trim(), 200);
    const location = sanitizeInput(match[2].trim(), 500);
    const description = match[3] ? sanitizeInput(match[3].trim(), 500) : "";
    
    if (!personName || !location) {
      return new Response(
        `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Invalid format. Please use: SEEN [Name] AT [Location]</Message></Response>`,
        { 
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "text/xml" } 
        }
      );
    }

    // Find matching missing person by name (escape wildcards to prevent injection)
    const escapedPersonName = escapeSqlWildcards(personName);
    const { data: missingPersons, error: searchError } = await supabase
      .from("missing_persons")
      .select("id, full_name")
      .ilike("full_name", `%${escapedPersonName}%`)
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

    // Sanitize reporter location data
    const reporterLocation = city && state 
      ? sanitizeInput(`${city}, ${state}`, 100)
      : "SMS Reporter";

    // Insert sighting record
    const { data: sighting, error: insertError } = await supabase
      .from("community_sightings")
      .insert({
        missing_person_id: missingPerson.id,
        reporter_phone: sanitizedFrom,
        sighting_location: `${location} (${reporterLocation})`.trim(),
        sighting_description: description || `SMS report: ${sanitizedBody}`,
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

    // Escape user data in XML response to prevent XML injection
    const escapedName = escapeXml(missingPerson.full_name);
    const escapedLocation = escapeXml(location);

    // Send confirmation SMS
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Message>Thank you! Your sighting of ${escapedName} at ${escapedLocation} has been recorded. Reference ID: ${sighting.id.substring(0, 8)}</Message></Response>`,
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      }
    );
  } catch (error) {
    console.error("Error in receive-sms-sighting:", error);
    // Generic error message (don't leak internal details)
    return new Response(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>System error. Please try again later.</Message></Response>',
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "text/xml" },
      }
    );
  }
});
