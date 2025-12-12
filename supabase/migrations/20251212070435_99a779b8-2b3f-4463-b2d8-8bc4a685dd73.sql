-- Update authenticated_missing_persons view to include coordinates
DROP VIEW IF EXISTS public.authenticated_missing_persons;
CREATE VIEW public.authenticated_missing_persons AS
SELECT 
  id,
  full_name,
  age,
  gender,
  last_seen_location,
  last_seen_date,
  status,
  photo_url,
  height,
  weight,
  clothing_description,
  distinguishing_features,
  additional_info,
  latitude,
  longitude,
  created_at,
  updated_at
FROM missing_persons
WHERE visibility = 'public' AND verification_status = 'pending' OR verification_status = 'verified';

-- Grant access
GRANT SELECT ON public.authenticated_missing_persons TO authenticated;