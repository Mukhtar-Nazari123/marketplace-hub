-- First drop the dependent view
DROP VIEW IF EXISTS public.products_with_translations;

-- Now drop redundant columns from products table
ALTER TABLE public.products DROP COLUMN IF EXISTS name;
ALTER TABLE public.products DROP COLUMN IF EXISTS description;

-- Recreate the view without depending on products.name/description
CREATE VIEW public.products_with_translations WITH (security_invoker = on) AS
SELECT 
  p.id,
  p.seller_id,
  p.category_id,
  p.subcategory_id,
  p.slug,
  p.price_afn,
  p.compare_price_afn,
  p.cost_price_afn,
  p.quantity,
  p.low_stock_threshold,
  p.weight,
  p.sku,
  p.barcode,
  p.status,
  p.rejection_reason,
  p.is_featured,
  p.is_deal,
  p.deal_start_at,
  p.deal_end_at,
  p.delivery_fee,
  p.metadata,
  p.images,
  p.created_at,
  p.updated_at,
  -- Translations with fallback chain (en -> fa -> ps)
  COALESCE(t_en.name, t_fa.name, t_ps.name) as name,
  COALESCE(t_en.description, t_fa.description, t_ps.description) as description,
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