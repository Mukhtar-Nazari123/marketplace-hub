-- Add variant selection columns to cart table
ALTER TABLE public.cart
ADD COLUMN selected_color TEXT NULL,
ADD COLUMN selected_size TEXT NULL;