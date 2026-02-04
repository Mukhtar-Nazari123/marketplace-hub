-- Add delivery option details to order_items
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS selected_delivery_option_id uuid REFERENCES public.delivery_options(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS delivery_label text,
ADD COLUMN IF NOT EXISTS delivery_price_afn numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS delivery_hours integer;