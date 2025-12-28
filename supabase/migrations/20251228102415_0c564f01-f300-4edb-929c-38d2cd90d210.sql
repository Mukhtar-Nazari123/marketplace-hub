-- Create seller_orders table for routing orders to sellers
CREATE TABLE public.seller_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'AFN',
  shipping_address JSONB,
  buyer_name TEXT,
  buyer_phone TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.seller_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Sellers can only view their own orders
CREATE POLICY "Sellers can view their own orders"
ON public.seller_orders
FOR SELECT
USING (seller_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- Sellers can update their own orders (status changes)
CREATE POLICY "Sellers can update their own orders"
ON public.seller_orders
FOR UPDATE
USING (seller_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

-- System can insert seller orders (when buyer places order)
CREATE POLICY "Buyers can create seller orders via order placement"
ON public.seller_orders
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_id
    AND orders.buyer_id = auth.uid()
  )
);

-- Admins can manage all seller orders
CREATE POLICY "Admins can manage all seller orders"
ON public.seller_orders
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_seller_orders_updated_at
BEFORE UPDATE ON public.seller_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_seller_orders_seller_id ON public.seller_orders(seller_id);
CREATE INDEX idx_seller_orders_order_id ON public.seller_orders(order_id);
CREATE INDEX idx_seller_orders_status ON public.seller_orders(status);

-- Enable realtime for seller orders
ALTER PUBLICATION supabase_realtime ADD TABLE seller_orders;