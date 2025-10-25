-- Fix contact information exposure by creating a public view without sensitive data
-- and requiring authentication for full contact details

-- Create a view for public access without contact information
CREATE VIEW public_missing_persons AS
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

-- Update RLS policy to require authentication for full table access
DROP POLICY IF EXISTS "Anyone can view missing persons reports" ON missing_persons;

CREATE POLICY "Authenticated users can view all details"
ON missing_persons FOR SELECT
TO authenticated
USING (true);

-- Report owners can still update their reports
-- (existing "Users can update their own reports" policy remains)

-- Restrict profiles visibility to prevent user identity mapping
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add explicit DELETE protection policies for evidence preservation
CREATE POLICY "Prevent deletion of missing person reports"
ON missing_persons FOR DELETE
USING (false);

CREATE POLICY "Prevent deletion of messages"
ON messages FOR DELETE
USING (false);

CREATE POLICY "Prevent deletion of CCTV footage"
ON cctv_footage FOR DELETE
USING (false);

-- Add explicit storage policies for delete protection
CREATE POLICY "Prevent deletion of photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'missing-persons-photos' AND
  false
);

CREATE POLICY "Prevent deletion of CCTV footage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cctv-footage' AND
  false
);

CREATE POLICY "Prevent updates to photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'missing-persons-photos' AND
  false
);

CREATE POLICY "Prevent updates to CCTV"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cctv-footage' AND
  false
);