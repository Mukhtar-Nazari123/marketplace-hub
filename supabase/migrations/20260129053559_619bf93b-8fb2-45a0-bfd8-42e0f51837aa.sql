-- Fix security definer view issue by using security_invoker
DROP VIEW IF EXISTS public.products_with_translations;

CREATE VIEW public.products_with_translations
WITH (security_invoker = on)
AS
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

COMMENT ON VIEW public.products_with_translations IS 'Backward-compatible view joining products with translations. Uses security_invoker for proper RLS enforcement.';