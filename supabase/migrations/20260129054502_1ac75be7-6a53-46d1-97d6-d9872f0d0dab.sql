-- ============================================
-- PART 2: Multilingual, Media & Attribute Expansion
-- ============================================

-- 1️⃣ product_translations already exists ✅
-- 2️⃣ product_media already exists ✅

-- 3️⃣ Create product_attributes Table (If Not Exists)
CREATE TABLE IF NOT EXISTS public.product_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_key TEXT NOT NULL,
  attribute_value TEXT NOT NULL,
  language_code TEXT DEFAULT NULL, -- null = universal, 'en'/'fa'/'ps' = localized
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Unique constraint per product + key + language
  UNIQUE (product_id, attribute_key, language_code)
);

-- Enable RLS on product_attributes
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for product_attributes
CREATE POLICY "Anyone can view attributes for active products"
  ON public.product_attributes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_attributes.product_id
      AND (p.status = 'active' OR p.seller_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Sellers can insert attributes for their products"
  ON public.product_attributes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_attributes.product_id
      AND p.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update attributes for their products"
  ON public.product_attributes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_attributes.product_id
      AND (p.seller_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "Sellers can delete attributes for their products"
  ON public.product_attributes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_attributes.product_id
      AND (p.seller_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_product_attributes_updated_at
  BEFORE UPDATE ON public.product_attributes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 4️⃣ Add Indexes (If Not Exists)

-- product_attributes indexes
CREATE INDEX IF NOT EXISTS idx_product_attributes_product_id 
  ON public.product_attributes(product_id);

CREATE INDEX IF NOT EXISTS idx_product_attributes_key 
  ON public.product_attributes(attribute_key);

CREATE INDEX IF NOT EXISTS idx_product_attributes_language 
  ON public.product_attributes(language_code);

CREATE INDEX IF NOT EXISTS idx_product_attributes_key_value 
  ON public.product_attributes(attribute_key, attribute_value);

-- product_translations indexes (if missing)
CREATE INDEX IF NOT EXISTS idx_product_translations_product_id 
  ON public.product_translations(product_id);

CREATE INDEX IF NOT EXISTS idx_product_translations_language 
  ON public.product_translations(language);

CREATE INDEX IF NOT EXISTS idx_product_translations_product_language 
  ON public.product_translations(product_id, language);

-- product_media indexes (if missing)
CREATE INDEX IF NOT EXISTS idx_product_media_product_id 
  ON public.product_media(product_id);

CREATE INDEX IF NOT EXISTS idx_product_media_sort 
  ON public.product_media(product_id, sort_order);

-- products table indexes (if missing)
CREATE INDEX IF NOT EXISTS idx_products_status 
  ON public.products(status);

CREATE INDEX IF NOT EXISTS idx_products_deal_end_at 
  ON public.products(deal_end_at) WHERE is_deal = true;

CREATE INDEX IF NOT EXISTS idx_products_seller_id 
  ON public.products(seller_id);

CREATE INDEX IF NOT EXISTS idx_products_category_id 
  ON public.products(category_id);

-- 5️⃣ Data Migration: Migrate images[] to product_media (if not already done)
INSERT INTO public.product_media (product_id, media_type, url, sort_order, is_primary)
SELECT 
  p.id as product_id,
  'image' as media_type,
  unnest(p.images) as url,
  row_number() OVER (PARTITION BY p.id ORDER BY ordinality) - 1 as sort_order,
  row_number() OVER (PARTITION BY p.id ORDER BY ordinality) = 1 as is_primary
FROM public.products p
CROSS JOIN LATERAL unnest(p.images) WITH ORDINALITY
WHERE p.images IS NOT NULL 
  AND array_length(p.images, 1) > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.product_media pm WHERE pm.product_id = p.id
  );

-- Migrate existing metadata attributes to product_attributes table
-- Extract brand from metadata
INSERT INTO public.product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
SELECT 
  p.id,
  'brand',
  p.metadata->>'brand',
  NULL,
  0
FROM public.products p
WHERE p.metadata->>'brand' IS NOT NULL
  AND p.metadata->>'brand' != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.product_attributes pa 
    WHERE pa.product_id = p.id AND pa.attribute_key = 'brand'
  );

-- Extract color from metadata if exists
INSERT INTO public.product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
SELECT 
  p.id,
  'color',
  p.metadata->>'color',
  NULL,
  1
FROM public.products p
WHERE p.metadata->>'color' IS NOT NULL
  AND p.metadata->>'color' != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.product_attributes pa 
    WHERE pa.product_id = p.id AND pa.attribute_key = 'color'
  );

-- Extract size from metadata if exists
INSERT INTO public.product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
SELECT 
  p.id,
  'size',
  p.metadata->>'size',
  NULL,
  2
FROM public.products p
WHERE p.metadata->>'size' IS NOT NULL
  AND p.metadata->>'size' != ''
  AND NOT EXISTS (
    SELECT 1 FROM public.product_attributes pa 
    WHERE pa.product_id = p.id AND pa.attribute_key = 'size'
  );