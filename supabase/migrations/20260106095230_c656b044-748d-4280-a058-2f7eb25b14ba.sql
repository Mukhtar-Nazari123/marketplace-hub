-- Add missing columns first
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS delivery_fee_afn NUMERIC(12,2) DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS settlement_currency TEXT NOT NULL DEFAULT 'AFN' CHECK (settlement_currency IN ('AFN', 'USD'));

-- Add constraint for order totals validation
ALTER TABLE public.orders
ADD CONSTRAINT order_totals_check
CHECK (
  total_usd = subtotal_usd
  AND total_afn = subtotal_afn + delivery_fee_afn
);