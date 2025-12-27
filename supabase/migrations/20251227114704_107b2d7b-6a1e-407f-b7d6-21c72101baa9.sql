-- Add subcategory_id column to products table
ALTER TABLE public.products
ADD COLUMN subcategory_id uuid REFERENCES public.subcategories(id);

-- Create index for better query performance
CREATE INDEX idx_products_subcategory_id ON public.products(subcategory_id);