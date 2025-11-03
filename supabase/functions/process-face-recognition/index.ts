import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FaceRecognitionRequest {
  cctvFootageId: string;
  cctvImageUrl: string;
  missingPersonId: string;
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

    // Extract JWT token and create authenticated client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user has admin or moderator role
    const { data: hasAdminRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "admin"
    });

    const { data: hasModeratorRole } = await supabase.rpc("has_role", {
      _user_id: user.id,
      _role: "moderator"
    });

    if (!hasAdminRole && !hasModeratorRole) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions. Admin or moderator role required." }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { cctvFootageId, cctvImageUrl, missingPersonId }: FaceRecognitionRequest = await req.json();

    console.log("Processing face recognition for footage:", cctvFootageId);

    // Fetch the missing person's photo
    const { data: missingPerson, error: personError } = await supabase
      .from("missing_persons")
      .select("photo_url, full_name, contact_phone")
      .eq("id", missingPersonId)
      .single();

    if (personError || !missingPerson?.photo_url) {
      console.log("No photo available for comparison");
      return new Response(
        JSON.stringify({ matched: false, confidence: 0, reason: "No reference photo available" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // TODO: Implement actual face recognition using AI service
    // For now, we'll simulate a basic matching system
    // In production, integrate with services like:
    // - AWS Rekognition
    // - Azure Face API
    // - Google Cloud Vision API
    // - Or Lovable AI for image comparison

    console.log("Simulating face recognition comparison...");
    const simulatedConfidence = Math.random() * 100;
    const isMatch = simulatedConfidence > 70;

    // Update the CCTV footage record with match results
    const { error: updateError } = await supabase
      .from("cctv_footage")
      .update({
        matched_person_id: isMatch ? missingPersonId : null,
        face_match_confidence: simulatedConfidence,
      })
      .eq("id", cctvFootageId);

    if (updateError) {
      console.error("Error updating footage record:", updateError);
    }

    // If match found, send SMS notification
    if (isMatch) {
      console.log("Match found! Sending notification...");
      
      // Note: This would need the contact_email field to send email notification
      // Skipping notification for now as contact_phone is being used
      console.log("Match found but email notification not implemented yet");
    }

    return new Response(
      JSON.stringify({
        matched: isMatch,
        confidence: simulatedConfidence,
        message: isMatch ? "Potential match found" : "No match found",
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in process-face-recognition:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
