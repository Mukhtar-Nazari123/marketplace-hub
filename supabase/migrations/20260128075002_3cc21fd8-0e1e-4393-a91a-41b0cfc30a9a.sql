-- Create product_translations table for scalable multilingual product content
CREATE TABLE public.product_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  language text NOT NULL CHECK (language IN ('en', 'fa', 'ps')),
  name text,
  description text,
  short_description text,
  specifications jsonb DEFAULT '{}'::jsonb,
  meta_title text,
  meta_description text,
  is_complete boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, language)
);

-- Create index for fast lookups
CREATE INDEX idx_product_translations_product_id ON public.product_translations(product_id);
CREATE INDEX idx_product_translations_language ON public.product_translations(language);
CREATE INDEX idx_product_translations_is_complete ON public.product_translations(is_complete);

-- Enable RLS
ALTER TABLE public.product_translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can view translations for active products
CREATE POLICY "Anyone can view product translations"
ON public.product_translations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_translations.product_id
    AND (p.status = 'active' OR p.seller_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Sellers can manage translations for their own products
CREATE POLICY "Sellers can insert translations for their products"
ON public.product_translations FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_translations.product_id
    AND p.seller_id = auth.uid()
  )
);

CREATE POLICY "Sellers can update translations for their products"
ON public.product_translations FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_translations.product_id
    AND (p.seller_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

CREATE POLICY "Sellers can delete translations for their products"
ON public.product_translations FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_translations.product_id
    AND (p.seller_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role))
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_product_translations_updated_at
BEFORE UPDATE ON public.product_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Helper function to check translation completeness
CREATE OR REPLACE FUNCTION public.check_translation_completeness()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  -- Mark as complete if name and description are filled
  NEW.is_complete := (
    NEW.name IS NOT NULL AND 
    NEW.name != '' AND 
    NEW.description IS NOT NULL AND 
    NEW.description != ''
  );
  RETURN NEW;
END;
$$;

-- Trigger to auto-check completeness on insert/update
CREATE TRIGGER check_product_translation_completeness
BEFORE INSERT OR UPDATE ON public.product_translations
FOR EACH ROW
EXECUTE FUNCTION public.check_translation_completeness();