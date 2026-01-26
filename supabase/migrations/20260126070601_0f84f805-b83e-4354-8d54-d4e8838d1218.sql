-- Add background_color column to hero_banners table
ALTER TABLE public.hero_banners 
ADD COLUMN background_color TEXT DEFAULT NULL;