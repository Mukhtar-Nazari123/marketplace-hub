-- Add currency column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS currency text NOT NULL DEFAULT 'AFN';

-- Update existing orders to use currency from their first seller_order (if available)
UPDATE public.orders o
SET currency = COALESCE(
  (SELECT so.currency FROM public.seller_orders so WHERE so.order_id = o.id LIMIT 1),
  'AFN'
)
WHERE o.currency = 'AFN';

-- Add a comment for documentation
COMMENT ON COLUMN public.orders.currency IS 'The display currency for this order (e.g., AFN, USD)';