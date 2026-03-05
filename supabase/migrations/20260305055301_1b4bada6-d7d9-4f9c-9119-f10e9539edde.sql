
-- Allow admins to update order_items (to nullify product_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Admins can update order items'
  ) THEN
    CREATE POLICY "Admins can update order items"
    ON public.order_items FOR UPDATE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;

  -- Allow admins to delete cart items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'cart' AND policyname = 'Admins can delete cart items'
  ) THEN
    CREATE POLICY "Admins can delete cart items"
    ON public.cart FOR DELETE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;

  -- Allow admins to delete wishlist items
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'wishlist' AND policyname = 'Admins can delete wishlist items'
  ) THEN
    CREATE POLICY "Admins can delete wishlist items"
    ON public.wishlist FOR DELETE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
