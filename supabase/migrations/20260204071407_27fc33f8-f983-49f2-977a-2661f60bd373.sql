-- Add selected_delivery_option_id column to cart table
ALTER TABLE public.cart
ADD COLUMN selected_delivery_option_id UUID NULL REFERENCES public.delivery_options(id) ON DELETE SET NULL;