import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Send SMS notification for high-confidence matches
async function sendHighConfidenceAlertSMS(
  supabase: any,
  personId: string,
  personName: string,
  confidence: number,
  matchReason: string
) {
  try {
    // Get the report owner's phone and preferences
    const { data: reportData, error: reportError } = await supabase
      .from('missing_persons')
      .select('user_id, full_name')
      .eq('id', personId)
      .single();

    if (reportError || !reportData) {
      console.log('Could not find report owner for SMS notification');
      return;
    }

    // Get profile with phone number and SMS preference
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone_number, sms_notifications, full_name')
      .eq('user_id', reportData.user_id)
      .single();

    if (profileError || !profile || !profile.phone_number || !profile.sms_notifications) {
      console.log('SMS notifications disabled or no phone number for user');
      return;
    }

    // Send SMS via Twilio
    const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
    const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
      console.log('Twilio credentials not configured');
      return;
    }

    const confidencePercent = Math.round(confidence * 100);
    const message = `🚨 REUN Alert: High-confidence match (${confidencePercent}%) found for ${personName}! Reason: ${matchReason}. Please check the app for details.`;

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
    const authHeader = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);

    const smsResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: profile.phone_number,
        From: TWILIO_PHONE_NUMBER,
        Body: message,
      }),
    });

    if (smsResponse.ok) {
      console.log(`SMS alert sent successfully for ${personName} to ${profile.phone_number}`);
    } else {
      const errorText = await smsResponse.text();
      console.error('Failed to send SMS alert:', errorText);
    }
  } catch (error) {
    console.error('Error sending SMS alert:', error);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'Image data is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all missing persons with photos
    const { data: missingPersons, error: fetchError } = await supabase
      .from('missing_persons')
      .select('id, full_name, age, gender, last_seen_location, last_seen_date, status, photo_url, height, weight, clothing_description, distinguishing_features, additional_info, latitude, longitude')
      .not('photo_url', 'is', null)
      .eq('status', 'missing');

    if (fetchError) {
      console.error('Error fetching missing persons:', fetchError);
      throw new Error('Failed to fetch missing persons');
    }

    if (!missingPersons || missingPersons.length === 0) {
      return new Response(
        JSON.stringify({ matches: [], message: 'No missing persons with photos in database' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get signed URLs for all photos
    interface PersonWithUrl {
      id: string;
      full_name: string;
      age: number | null;
      gender: string | null;
      last_seen_location: string;
      last_seen_date: string;
      status: string;
      photo_url: string | null;
      height: string | null;
      weight: string | null;
      clothing_description: string | null;
      distinguishing_features: string | null;
      additional_info: string | null;
      latitude: number | null;
      longitude: number | null;
      signed_url?: string;
    }

    const personsWithUrls: PersonWithUrl[] = await Promise.all(
      missingPersons.map(async (person): Promise<PersonWithUrl> => {
        if (person.photo_url) {
          const { data: signedData } = await supabase.storage
            .from('missing-persons-photos')
            .createSignedUrl(person.photo_url, 3600);
          return { ...person, signed_url: signedData?.signedUrl };
        }
        return { ...person, signed_url: undefined };
      })
    );

    // Use Lovable AI to analyze and compare faces
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a face comparison assistant. You will be given an uploaded image and a list of missing persons with their photos. 
            
Your task is to:
1. Analyze the facial features in the uploaded image
2. Compare with each missing person's photo
3. Return a JSON array of potential matches with confidence scores

IMPORTANT: 
- Be conservative with matches. Only return persons with genuine facial similarity.
- Consider age, gender, and distinguishing features
- Return matches sorted by confidence (highest first)
- Confidence should be between 0 and 1 (0.7+ is a good match)

Return ONLY a valid JSON object in this format:
{
  "matches": [
    {"id": "person_uuid", "confidence": 0.85, "reason": "Similar facial structure, eye shape, and approximate age match"},
  ],
  "analysis": "Brief description of the person in the uploaded image"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this uploaded image and compare it against these missing persons:\n\n${personsWithUrls.map(p => 
                  `ID: ${p.id}\nName: ${p.full_name}\nAge: ${p.age || 'Unknown'}\nGender: ${p.gender || 'Unknown'}\nFeatures: ${p.distinguishing_features || 'None listed'}\nPhoto URL: ${p.signed_url || 'No photo'}`
                ).join('\n\n')}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              },
              ...personsWithUrls
                .filter(p => p.signed_url)
                .map(p => ({
                  type: 'image_url' as const,
                  image_url: { url: p.signed_url! }
                }))
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error('AI service error');
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content || '';
    
    // Parse the AI response
    let analysisResult;
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = { matches: [], analysis: content };
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      analysisResult = { matches: [], analysis: content };
    }

    // Enrich matches with person data
    const enrichedMatches = (analysisResult.matches || [])
      .filter((match: any) => match.confidence >= 0.5)
      .map((match: any) => {
        const person = personsWithUrls.find(p => p.id === match.id);
        if (person) {
          return {
            ...person,
            match_confidence: match.confidence,
            match_reason: match.reason,
          };
        }
        return null;
      })
      .filter(Boolean);

    // Send SMS alerts for high-confidence matches (70%+)
    const highConfidenceMatches = enrichedMatches.filter((m: any) => m.match_confidence >= 0.7);
    console.log(`Found ${highConfidenceMatches.length} high-confidence matches`);
    
    for (const match of highConfidenceMatches) {
      await sendHighConfidenceAlertSMS(
        supabase,
        match.id,
        match.full_name,
        match.match_confidence,
        match.match_reason || 'Facial features match'
      );
    }

    return new Response(
      JSON.stringify({ 
        matches: enrichedMatches,
        analysis: analysisResult.analysis,
        total_compared: personsWithUrls.length,
        sms_alerts_sent: highConfidenceMatches.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-by-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
