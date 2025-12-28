-- Add currency column to products table
ALTER TABLE public.products 
ADD COLUMN currency text NOT NULL DEFAULT 'AFN';

-- Add comment for clarity
COMMENT ON COLUMN public.products.currency IS 'Product currency: AFN or USD';