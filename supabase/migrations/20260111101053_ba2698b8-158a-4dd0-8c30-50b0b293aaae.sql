-- Add deal fields to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_deal boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS deal_start_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deal_end_at timestamp with time zone;

-- Create index for efficient deal queries
CREATE INDEX IF NOT EXISTS idx_products_active_deals 
ON public.products (is_deal, deal_end_at) 
WHERE is_deal = true;

-- Add constraint to ensure deal_end_at > deal_start_at when both are set
CREATE OR REPLACE FUNCTION public.validate_deal_dates()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_deal = true AND NEW.deal_start_at IS NOT NULL AND NEW.deal_end_at IS NOT NULL THEN
    IF NEW.deal_end_at <= NEW.deal_start_at THEN
      RAISE EXCEPTION 'deal_end_at must be after deal_start_at';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_deal_dates_trigger ON public.products;
CREATE TRIGGER validate_deal_dates_trigger
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.validate_deal_dates();