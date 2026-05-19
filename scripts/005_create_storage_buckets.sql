-- Create storage buckets for courses
-- This script creates the necessary buckets for PDF and audio uploads

-- Create courses bucket for PDFs and images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('courses', 'courses', true, 524288000, ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/mp3'])
ON CONFLICT (id) DO NOTHING;

-- Create policy to allow authenticated users to read
CREATE POLICY IF NOT EXISTS "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'courses');

-- Create policy to allow admins to upload
CREATE POLICY IF NOT EXISTS "Allow admin uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'courses' 
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);

-- Create policy to allow admins to update
CREATE POLICY IF NOT EXISTS "Allow admin updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'courses'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);

-- Create policy to allow admins to delete
CREATE POLICY IF NOT EXISTS "Allow admin deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'courses'
  AND auth.uid() IN (
    SELECT id FROM profiles WHERE is_admin = true
  )
);
