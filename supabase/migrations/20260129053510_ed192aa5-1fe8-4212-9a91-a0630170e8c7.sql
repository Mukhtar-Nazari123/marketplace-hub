-- ============================================
-- PART 1: Product Table Normalization & Cleanup
-- Safe migration preserving all existing data
-- ============================================

-- Step 1: Migrate existing name/description to product_translations (EN)
-- Only insert if not already exists
INSERT INTO public.product_translations (product_id, language, name, description, short_description, is_complete)
SELECT 
  p.id,
  'en',
  p.name,
  p.description,
  COALESCE((p.metadata->>'shortDescription')::text, LEFT(p.description, 200)),
  true
FROM public.products p
WHERE NOT EXISTS (
  SELECT 1 FROM public.product_translations pt 
  WHERE pt.product_id = p.id AND pt.language = 'en'
)
AND p.name IS NOT NULL;

-- Step 2: Rename price columns for clarity (AFN as base currency)
-- Only rename if old columns exist and new ones don't
DO $$
BEGIN
  -- Rename price → price_afn
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'price')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'price_afn') THEN
    ALTER TABLE public.products RENAME COLUMN price TO price_afn;
  END IF;
  
  -- Rename compare_at_price → compare_price_afn
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'compare_at_price')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'compare_price_afn') THEN
    ALTER TABLE public.products RENAME COLUMN compare_at_price TO compare_price_afn;
  END IF;
  
  -- Rename cost_price → cost_price_afn
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'cost_price')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'cost_price_afn') THEN
    ALTER TABLE public.products RENAME COLUMN cost_price TO cost_price_afn;
  END IF;
END $$;

-- Step 3: Drop the currency column (AFN is now enforced)
ALTER TABLE public.products DROP COLUMN IF EXISTS currency;

-- Step 4: Add deprecation comments to columns that will be removed in Part 2
COMMENT ON COLUMN public.products.name IS 'DEPRECATED: Use product_translations table. Will be removed in Part 2.';
COMMENT ON COLUMN public.products.description IS 'DEPRECATED: Use product_translations table. Will be removed in Part 2.';
COMMENT ON COLUMN public.products.images IS 'DEPRECATED: Will be migrated to product_media table in Part 2.';

-- Step 5: Create product_media table for future media management
CREATE TABLE IF NOT EXISTS public.product_media (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video')),
  url TEXT NOT NULL,
  alt_text_en TEXT,
  alt_text_fa TEXT,
  alt_text_ps TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON public.product_media(product_id);
CREATE INDEX IF NOT EXISTS idx_product_media_sort_order ON public.product_media(product_id, sort_order);

-- Enable RLS on product_media
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_media
CREATE POLICY "Anyone can view product media for active products"
  ON public.product_media FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_media.product_id
      AND (p.status = 'active' OR p.seller_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "Sellers can insert media for their products"
  ON public.product_media FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_media.product_id
      AND p.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update media for their products"
  ON public.product_media FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_media.product_id
      AND (p.seller_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

CREATE POLICY "Sellers can delete media for their products"
  ON public.product_media FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_media.product_id
      AND (p.seller_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
    )
  );

-- Add updated_at trigger for product_media
CREATE TRIGGER update_product_media_updated_at
  BEFORE UPDATE ON public.product_media
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 6: Create a helper view for backward compatibility
-- This allows existing code to work while we transition
CREATE OR REPLACE VIEW public.products_with_translations AS
SELECT 
  p.*,
  COALESCE(pt_en.name, p.name) as name_en,
  COALESCE(pt_fa.name, p.name) as name_fa,
  COALESCE(pt_ps.name, pt_fa.name, p.name) as name_ps,
  COALESCE(pt_en.description, p.description) as description_en,
  COALESCE(pt_fa.description, p.description) as description_fa,
  COALESCE(pt_ps.description, pt_fa.description, p.description) as description_ps,
  pt_en.short_description as short_description_en,
  pt_fa.short_description as short_description_fa,
  pt_ps.short_description as short_description_ps
FROM public.products p
LEFT JOIN public.product_translations pt_en ON pt_en.product_id = p.id AND pt_en.language = 'en'
LEFT JOIN public.product_translations pt_fa ON pt_fa.product_id = p.id AND pt_fa.language = 'fa'
LEFT JOIN public.product_translations pt_ps ON pt_ps.product_id = p.id AND pt_ps.language = 'ps';

-- Add comment to the view
COMMENT ON VIEW public.products_with_translations IS 'Backward-compatible view joining products with translations. Use this during the transition period.';

-- Step 7: Create a function to get localized product name
CREATE OR REPLACE FUNCTION public.get_product_name(
  p_product_id UUID,
  p_language TEXT DEFAULT 'en'
)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT name FROM product_translations WHERE product_id = p_product_id AND language = p_language),
    (SELECT name FROM product_translations WHERE product_id = p_product_id AND language = 'fa'),
    (SELECT name FROM product_translations WHERE product_id = p_product_id AND language = 'en'),
    (SELECT name FROM products WHERE id = p_product_id)
  );
$$;

-- Step 8: Create a function to get localized product description
CREATE OR REPLACE FUNCTION public.get_product_description(
  p_product_id UUID,
  p_language TEXT DEFAULT 'en'
)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT description FROM product_translations WHERE product_id = p_product_id AND language = p_language),
    (SELECT description FROM product_translations WHERE product_id = p_product_id AND language = 'fa'),
    (SELECT description FROM product_translations WHERE product_id = p_product_id AND language = 'en'),
    (SELECT description FROM products WHERE id = p_product_id)
  );
$$;