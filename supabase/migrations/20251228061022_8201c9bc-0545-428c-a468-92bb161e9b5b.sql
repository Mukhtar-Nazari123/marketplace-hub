-- Add delivery_fee column to products table
ALTER TABLE public.products 
ADD COLUMN delivery_fee numeric NOT NULL DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN public.products.delivery_fee IS 'Delivery fee set by seller for this product';