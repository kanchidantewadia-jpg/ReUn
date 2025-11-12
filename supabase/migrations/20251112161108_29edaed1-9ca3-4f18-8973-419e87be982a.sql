-- Add latitude and longitude to missing_persons table
ALTER TABLE public.missing_persons 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Create index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_missing_persons_location ON public.missing_persons(latitude, longitude);

-- Add notification preferences to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{
  "show_phone": false,
  "show_email": true
}'::jsonb;