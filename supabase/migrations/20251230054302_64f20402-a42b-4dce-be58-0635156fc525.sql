-- Create reviews table for product ratings
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (product_id, buyer_id)
);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Everyone can view reviews
CREATE POLICY "Reviews are viewable by everyone"
ON public.reviews
FOR SELECT
USING (true);

-- Buyers can insert their own reviews (must have delivered order for the product)
CREATE POLICY "Buyers can insert reviews for delivered products"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = buyer_id
  AND EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    WHERE o.id = reviews.order_id
      AND o.buyer_id = auth.uid()
      AND o.status = 'delivered'
      AND oi.product_id = reviews.product_id
  )
);

-- Buyers can update their own reviews within 7 days
CREATE POLICY "Buyers can update their reviews within 7 days"
ON public.reviews
FOR UPDATE
USING (
  auth.uid() = buyer_id
  AND created_at > now() - interval '7 days'
);

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
ON public.reviews
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster product reviews lookup
CREATE INDEX idx_reviews_product_id ON public.reviews(product_id);
CREATE INDEX idx_reviews_buyer_id ON public.reviews(buyer_id);