-- Fix security definer view issue
-- Recreate the view with explicit SECURITY INVOKER to ensure RLS is applied per querying user

DROP VIEW IF EXISTS public_missing_persons;

CREATE VIEW public_missing_persons
WITH (security_invoker=true)
AS
SELECT 
  id,
  full_name,
  age,
  gender,
  last_seen_location,
  last_seen_date,
  height,
  weight,
  clothing_description,
  distinguishing_features,
  additional_info,
  photo_url,
  status,
  created_at,
  updated_at
FROM missing_persons;

-- Grant SELECT permission to anonymous users on the view
GRANT SELECT ON public_missing_persons TO anon;
GRANT SELECT ON public_missing_persons TO authenticated;