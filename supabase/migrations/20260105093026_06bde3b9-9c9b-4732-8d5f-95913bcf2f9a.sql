-- Add storage policies for admin users to manage files in seller-assets bucket

-- Allow admins to upload files
CREATE POLICY "Admins can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'seller-assets' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update files
CREATE POLICY "Admins can update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'seller-assets' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete files
CREATE POLICY "Admins can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'seller-assets' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow public read access to all files in seller-assets bucket
CREATE POLICY "Public read access for seller-assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'seller-assets');