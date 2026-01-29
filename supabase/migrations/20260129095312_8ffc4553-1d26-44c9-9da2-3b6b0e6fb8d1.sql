-- Drop and recreate the view to remove dependency on images column
DROP VIEW IF EXISTS public.products_with_translations;

-- Drop the redundant images column from products table
ALTER TABLE public.products DROP COLUMN IF EXISTS images;

-- Recreate the view, getting images from product_media table
CREATE VIEW public.products_with_translations AS
SELECT 
  p.id,
  p.seller_id,
  p.category_id,
  p.subcategory_id,
  p.price_afn,
  p.compare_price_afn,
  p.cost_price_afn,
  p.quantity,
  p.low_stock_threshold,
  p.weight,
  p.is_deal,
  p.deal_start_at,
  p.deal_end_at,
  p.delivery_fee,
  p.metadata,
  p.created_at,
  p.updated_at,
  p.slug,
  p.sku,
  p.barcode,
  p.status,
  p.rejection_reason,
  p.is_featured,
  -- Get images from product_media table (array of URLs sorted by sort_order)
  COALESCE(
    (SELECT array_agg(pm.url ORDER BY pm.sort_order)
     FROM public.product_media pm 
     WHERE pm.product_id = p.id AND pm.media_type = 'image'),
    ARRAY[]::text[]
  ) as images,
  -- Fallback chain for name: en -> fa -> ps
  COALESCE(t_en.name, t_fa.name, t_ps.name) as name,
  -- Fallback chain for description: en -> fa -> ps
  COALESCE(t_en.description, t_fa.description, t_ps.description) as description,
  -- Individual language fields for explicit access
  t_en.name as name_en,
  t_fa.name as name_fa,
  t_ps.name as name_ps,
  t_en.description as description_en,
  t_fa.description as description_fa,
  t_ps.description as description_ps,
  t_en.short_description as short_description_en,
  t_fa.short_description as short_description_fa,
  t_ps.short_description as short_description_ps
FROM public.products p
LEFT JOIN public.product_translations t_en ON t_en.product_id = p.id AND t_en.language = 'en'
LEFT JOIN public.product_translations t_fa ON t_fa.product_id = p.id AND t_fa.language = 'fa'
LEFT JOIN public.product_translations t_ps ON t_ps.product_id = p.id AND t_ps.language = 'ps';

-- Grant access to the view
GRANT SELECT ON public.products_with_translations TO anon, authenticated;