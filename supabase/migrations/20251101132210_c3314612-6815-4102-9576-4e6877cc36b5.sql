-- Create table for community sightings/reports
CREATE TABLE IF NOT EXISTS public.community_sightings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  missing_person_id UUID NOT NULL REFERENCES public.missing_persons(id) ON DELETE CASCADE,
  reporter_phone TEXT,
  reporter_name TEXT,
  sighting_location TEXT NOT NULL,
  sighting_description TEXT,
  sighting_photo_url TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  sighting_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'sms', -- 'sms', 'web', 'app'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.community_sightings ENABLE ROW LEVEL SECURITY;

-- Anyone can view sightings
CREATE POLICY "Anyone can view sightings"
ON public.community_sightings
FOR SELECT
USING (true);

-- Authenticated users can submit sightings
CREATE POLICY "Authenticated users can submit sightings"
ON public.community_sightings
FOR INSERT
TO authenticated
WITH CHECK (true);

-- System can insert sightings (for SMS reports)
CREATE POLICY "Service role can insert sightings"
ON public.community_sightings
FOR INSERT
TO service_role
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_sightings_missing_person ON public.community_sightings(missing_person_id);
CREATE INDEX idx_sightings_date ON public.community_sightings(sighting_date DESC);