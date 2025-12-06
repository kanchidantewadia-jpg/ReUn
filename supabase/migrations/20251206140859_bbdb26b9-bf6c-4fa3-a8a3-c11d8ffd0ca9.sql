-- Create a public view for community sightings that excludes reporter contact info
CREATE OR REPLACE VIEW public.public_community_sightings AS
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

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can view sightings" ON public.community_sightings;

-- Create new restricted policies for the full table
-- Only report owners and admins can see reporter contact info
CREATE POLICY "Report owners can view full sighting details"
ON public.community_sightings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.missing_persons mp
    WHERE mp.id = missing_person_id
    AND mp.user_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin')
  OR public.has_role(auth.uid(), 'moderator')
);

-- Grant access to the public view
GRANT SELECT ON public.public_community_sightings TO anon, authenticated;