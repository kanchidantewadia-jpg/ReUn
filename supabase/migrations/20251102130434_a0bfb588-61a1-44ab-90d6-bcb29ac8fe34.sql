-- Make storage buckets private (fix critical security issue)
UPDATE storage.buckets 
SET public = false 
WHERE id IN ('missing-persons-photos', 'cctv-footage');

-- Drop existing overly permissive storage policies
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view footage" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload footage" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own footage uploads" ON storage.objects;

-- Create secure storage policies for missing-persons-photos
-- Authenticated users can view photos (for legitimate search purposes)
CREATE POLICY "Authenticated users can view missing person photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'missing-persons-photos' 
  AND auth.role() = 'authenticated'
);

-- Only authenticated users can upload photos
CREATE POLICY "Authenticated users can upload missing person photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'missing-persons-photos' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own uploads
CREATE POLICY "Users can update their own missing person photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'missing-persons-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own uploads
CREATE POLICY "Users can delete their own missing person photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'missing-persons-photos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create secure storage policies for cctv-footage
-- Only authenticated users can view footage
CREATE POLICY "Authenticated users can view cctv footage"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'cctv-footage' 
  AND auth.role() = 'authenticated'
);

-- Only authenticated users can upload footage
CREATE POLICY "Authenticated users can upload cctv footage"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'cctv-footage' 
  AND auth.role() = 'authenticated'
);

-- Users can update their own footage uploads
CREATE POLICY "Users can update their own cctv footage"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'cctv-footage' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own footage uploads
CREATE POLICY "Users can delete their own cctv footage"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'cctv-footage' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);