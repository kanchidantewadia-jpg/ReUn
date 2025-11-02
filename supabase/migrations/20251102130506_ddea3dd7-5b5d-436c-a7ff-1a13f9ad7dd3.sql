-- Add RLS policies for otp_codes table (was missing policies)
-- Service role can manage OTP codes (used by edge functions)
CREATE POLICY "Service role can insert OTP codes"
ON public.otp_codes FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can select OTP codes"
ON public.otp_codes FOR SELECT
TO service_role
USING (true);

CREATE POLICY "Service role can update OTP codes"
ON public.otp_codes FOR UPDATE
TO service_role
USING (true);

-- Users cannot directly access OTP codes (only via edge functions)
-- This prevents users from viewing or manipulating OTP codes directly