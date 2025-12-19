// Deno Edge Function: send-otp
// Sends and verifies OTP codes using email (Resend) and stores codes in the database

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.76.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json", ...corsHeaders },
    ...init,
  });
}

function badRequest(message: string) {
  return jsonResponse({ error: message }, { status: 400 });
}

function errorResponse(message: string, status: number = 500) {
  return jsonResponse({ error: message }, { status });
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function sendOTPEmail(to: string, code: string, purpose: string = "signup") {
  if (!RESEND_API_KEY) {
    throw new Error("Email service is not configured");
  }
  
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: "ReUn Verification <onboarding@resend.dev>",
      to: [to],
      subject: purpose === "password_reset" 
        ? "Reset Your ReUn Password" 
        : "Your ReUn Verification Code",
      html: purpose === "password_reset" 
        ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Password Reset</h1>
          <p>You requested to reset your password. Use this code to continue:</p>
          <h2 style="color: #007bff; font-size: 32px; letter-spacing: 8px;">${code}</h2>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
        </div>
      `
        : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Verification Code</h1>
          <p>Your ReUn verification code is:</p>
          <h2 style="color: #007bff; font-size: 32px; letter-spacing: 8px;">${code}</h2>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 12px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `,
    }),
  });
  
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Email send failed: ${resp.status}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, email, code, purpose } = await req.json();

    if (!action) return badRequest("Missing action");
    if (!email || typeof email !== "string") return badRequest("Missing email");

    const normalizedEmail = email.trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) return badRequest("Invalid email format");

    const usePurpose = typeof purpose === "string" && purpose.length > 0 ? purpose : "signup";

    if (action === "request") {
      // Enhanced rate limiting
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      // Check last minute (prevent spam)
      const { data: recentMinute, error: recentError } = await supabase
        .from("otp_codes")
        .select("id")
        .eq("email", normalizedEmail)
        .gte("created_at", oneMinuteAgo)
        .limit(1);
      
      if (recentError) throw recentError;
      
      if (recentMinute && recentMinute.length > 0) {
        return errorResponse("Please wait a minute before requesting another code.", 429);
      }

      // Check hourly limit (3 per hour)
      const { data: recentHour } = await supabase
        .from("otp_codes")
        .select("id")
        .eq("email", normalizedEmail)
        .gte("created_at", oneHourAgo);
      
      if (recentHour && recentHour.length >= 3) {
        return errorResponse("Too many requests. Please try again later.", 429);
      }

      // Check daily limit (10 per day)
      const { data: recentDay } = await supabase
        .from("otp_codes")
        .select("id")
        .eq("email", normalizedEmail)
        .gte("created_at", oneDayAgo);
      
      if (recentDay && recentDay.length >= 10) {
        return errorResponse("Daily limit reached. Please try again tomorrow.", 429);
      }

      // Cleanup expired OTP codes (older than 24 hours)
      await supabase
        .from("otp_codes")
        .delete()
        .lt("created_at", oneDayAgo);

      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      const { error: insertError } = await supabase.from("otp_codes").insert({
        email: normalizedEmail,
        code: newCode,
        purpose: usePurpose,
        expires_at: expiresAt,
      });
      if (insertError) throw insertError;

      await sendOTPEmail(normalizedEmail, newCode, usePurpose);

      return jsonResponse({ ok: true, message: "OTP sent" });
    }

    if (action === "verify") {
      if (!code || typeof code !== "string") return badRequest("Missing code");

      const nowIso = new Date().toISOString();
      const { data: records, error: fetchError } = await supabase
        .from("otp_codes")
        .select("id, code, attempts, expires_at, consumed")
        .eq("email", normalizedEmail)
        .eq("purpose", usePurpose)
        .lte("created_at", nowIso)
        .order("created_at", { ascending: false })
        .limit(1);
      if (fetchError) throw fetchError;
      const record = records?.[0];
      if (!record) return badRequest("No OTP found. Please request a new code.");
      if (record.consumed) return badRequest("Code already used. Request a new one.");
      if (new Date(record.expires_at).getTime() < Date.now()) return badRequest("Code expired. Request a new one.");
      if (record.attempts >= 5) return badRequest("Too many attempts. Request a new code.");

      const isMatch = record.code === code.trim();

      const { error: updateError } = await supabase
        .from("otp_codes")
        .update({
          attempts: record.attempts + 1,
          consumed: isMatch ? true : false,
        })
        .eq("id", record.id);
      if (updateError) throw updateError;

      if (!isMatch) return badRequest("Invalid code. Try again.");

      return jsonResponse({ ok: true, message: "OTP verified" });
    }

    return badRequest("Invalid action");
  } catch (err) {
    console.error("send-otp error", err);
    // Don't leak internal error details to client
    return errorResponse("Unable to process request. Please try again later.", 500);
  }
});
