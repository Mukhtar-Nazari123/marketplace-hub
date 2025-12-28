-- Add seller_policies column to orders table to store snapshot of seller policies at time of order
ALTER TABLE public.orders ADD COLUMN seller_policies jsonb DEFAULT '[]'::jsonb;

-- Add comment for clarity
COMMENT ON COLUMN public.orders.seller_policies IS 'Snapshot of seller return and shipping policies at time of order placement';