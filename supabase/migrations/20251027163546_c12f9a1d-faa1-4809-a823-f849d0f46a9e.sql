-- Create secure OTP storage for phone verification
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code text NOT NULL,
  purpose text NOT NULL DEFAULT 'signup',
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  consumed boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON public.otp_codes (phone);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON public.otp_codes (expires_at);
CREATE INDEX IF NOT EXISTS idx_otp_codes_phone_created ON public.otp_codes (phone, created_at DESC);

-- Enable RLS and deny direct access; Edge functions use service role and bypass RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- No public policies; all access via backend function with service role
