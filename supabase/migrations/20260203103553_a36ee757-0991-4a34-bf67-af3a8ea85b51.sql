-- Add color_value column to product_media table for color-specific images
ALTER TABLE public.product_media 
ADD COLUMN color_value text NULL;

-- Add index for efficient color-based queries
CREATE INDEX idx_product_media_color ON public.product_media(product_id, color_value);

-- Add comment for documentation
COMMENT ON COLUMN public.product_media.color_value IS 'Optional color association for variant images. NULL means general product image.';