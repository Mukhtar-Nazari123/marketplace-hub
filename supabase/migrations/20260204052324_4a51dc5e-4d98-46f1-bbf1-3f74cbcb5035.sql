-- Create delivery_options table for seller-defined shipping options
CREATE TABLE public.delivery_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  shipping_type TEXT NOT NULL DEFAULT 'standard',
  label_en TEXT NOT NULL,
  label_fa TEXT,
  label_ps TEXT,
  price_afn NUMERIC NOT NULL DEFAULT 0,
  delivery_hours INTEGER NOT NULL DEFAULT 72,
  confidence_percent INTEGER,
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.delivery_options ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active delivery options"
ON public.delivery_options
FOR SELECT
USING (is_active = true);

CREATE POLICY "Sellers can manage their own delivery options"
ON public.delivery_options
FOR ALL
USING (auth.uid() = seller_id)
WITH CHECK (auth.uid() = seller_id);

-- Index for fast lookups
CREATE INDEX idx_delivery_options_product ON public.delivery_options(product_id, is_active);
CREATE INDEX idx_delivery_options_seller ON public.delivery_options(seller_id);

-- Trigger for updated_at
CREATE TRIGGER update_delivery_options_updated_at
BEFORE UPDATE ON public.delivery_options
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();