-- Add new columns to seller_verifications for profile completion
ALTER TABLE public.seller_verifications 
ADD COLUMN IF NOT EXISTS store_logo text,
ADD COLUMN IF NOT EXISTS store_banner text,
ADD COLUMN IF NOT EXISTS business_description text,
ADD COLUMN IF NOT EXISTS contact_email text,
ADD COLUMN IF NOT EXISTS contact_phone text,
ADD COLUMN IF NOT EXISTS return_policy text,
ADD COLUMN IF NOT EXISTS shipping_policy text,
ADD COLUMN IF NOT EXISTS store_visible boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS completion_step integer DEFAULT 0;

-- Create storage bucket for seller assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('seller-assets', 'seller-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for seller assets
CREATE POLICY "Sellers can upload their own assets"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'seller-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can update their own assets"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'seller-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Sellers can delete their own assets"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'seller-assets' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view seller assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'seller-assets');