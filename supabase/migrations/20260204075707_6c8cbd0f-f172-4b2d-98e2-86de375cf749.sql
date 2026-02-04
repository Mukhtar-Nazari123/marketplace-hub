-- Add selected_color and selected_size columns to order_items table
-- These columns store the variant selections made by the buyer at checkout time

ALTER TABLE public.order_items 
ADD COLUMN selected_color text DEFAULT NULL,
ADD COLUMN selected_size text DEFAULT NULL;

-- Add a comment for documentation
COMMENT ON COLUMN public.order_items.selected_color IS 'Color variant selected by buyer at checkout';
COMMENT ON COLUMN public.order_items.selected_size IS 'Size variant selected by buyer at checkout';