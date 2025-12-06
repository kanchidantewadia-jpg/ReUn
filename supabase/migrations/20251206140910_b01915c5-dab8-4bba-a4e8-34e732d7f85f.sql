-- Recreate the view with SECURITY INVOKER (the default, safe option)
DROP VIEW IF EXISTS public.public_community_sightings;

CREATE VIEW public.public_community_sightings 
WITH (security_invoker = on)
AS
SELECT 
  id,
  missing_person_id,
  sighting_location,
  sighting_description,
  sighting_date,
  latitude,
  longitude,
  verified,
  created_at,
  sighting_photo_url,
  source
FROM public.community_sightings;

-- Grant access to the public view
GRANT SELECT ON public.public_community_sightings TO anon, authenticated;