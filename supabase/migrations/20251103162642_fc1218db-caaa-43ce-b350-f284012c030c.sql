-- Clear existing OTP codes and update table to use email instead of phone
DELETE FROM public.otp_codes;

ALTER TABLE public.otp_codes 
  DROP COLUMN phone,
  ADD COLUMN email TEXT NOT NULL;