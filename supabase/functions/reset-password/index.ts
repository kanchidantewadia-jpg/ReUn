import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, code, newPassword } = await req.json();

    if (!email || !code || !newPassword) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify the OTP code first
    const normalizedEmail = email.trim().toLowerCase();
    const nowIso = new Date().toISOString();
    
    const { data: records, error: fetchError } = await supabase
      .from("otp_codes")
      .select("id, code, attempts, expires_at, consumed")
      .eq("email", normalizedEmail)
      .eq("purpose", "password_reset")
      .lte("created_at", nowIso)
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;
    
    const record = records?.[0];
    if (!record) {
      return new Response(JSON.stringify({ error: "No reset code found. Please request a new one." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (record.consumed) {
      return new Response(JSON.stringify({ error: "Code already used. Request a new one." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (new Date(record.expires_at).getTime() < Date.now()) {
      return new Response(JSON.stringify({ error: "Code expired. Request a new one." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    if (record.attempts >= 5) {
      return new Response(JSON.stringify({ error: "Too many attempts. Request a new code." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const isMatch = record.code === code.trim();

    // Update attempts
    await supabase
      .from("otp_codes")
      .update({ attempts: record.attempts + 1, consumed: isMatch })
      .eq("id", record.id);

    if (!isMatch) {
      return new Response(JSON.stringify({ error: "Invalid code. Try again." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const user = users.users.find((u) => u.email?.toLowerCase() === normalizedEmail);
    if (!user) {
      return new Response(JSON.stringify({ error: "No account found with this email." }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Update the password using admin API
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ ok: true, message: "Password updated successfully" }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (err) {
    console.error("reset-password error", err);
    return new Response(JSON.stringify({ error: "Unable to process request. Please try again later." }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
