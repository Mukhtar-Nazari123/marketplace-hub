-- Enable full row data for realtime updates
ALTER TABLE public.orders REPLICA IDENTITY FULL;
ALTER TABLE public.seller_orders REPLICA IDENTITY FULL;

-- Add tables to realtime publication (safe if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.seller_orders;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Allow buyers to view seller sub-orders for their own orders (required for buyer realtime + UI)
DO $$
BEGIN
  CREATE POLICY "Buyers can view seller orders for their orders"
  ON public.seller_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE o.id = seller_orders.order_id
        AND o.buyer_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- Keep orders.status in sync with seller_orders.status so admin/buyer see seller progress
CREATE OR REPLACE FUNCTION public.sync_order_status_from_seller_orders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_order_id uuid;
  v_total int;
  v_rejected int;
  v_delivered int;
  v_shipped_or_more int;
  v_confirmed_or_more int;
  v_status text;
BEGIN
  v_order_id := NEW.order_id;

  SELECT
    COUNT(*)::int,
    COUNT(*) FILTER (WHERE status = 'rejected')::int,
    COUNT(*) FILTER (WHERE status = 'delivered')::int,
    COUNT(*) FILTER (WHERE status IN ('shipped', 'delivered'))::int,
    COUNT(*) FILTER (WHERE status IN ('confirmed', 'shipped', 'delivered'))::int
  INTO v_total, v_rejected, v_delivered, v_shipped_or_more, v_confirmed_or_more
  FROM public.seller_orders
  WHERE order_id = v_order_id;

  IF v_total = 0 THEN
    v_status := 'pending';
  ELSIF v_rejected > 0 THEN
    v_status := 'rejected';
  ELSIF v_delivered = v_total THEN
    v_status := 'delivered';
  ELSIF v_shipped_or_more = v_total THEN
    v_status := 'shipped';
  ELSIF v_confirmed_or_more = v_total THEN
    v_status := 'confirmed';
  ELSE
    v_status := 'pending';
  END IF;

  UPDATE public.orders
  SET status = v_status,
      updated_at = now()
  WHERE id = v_order_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_order_status_from_seller_orders ON public.seller_orders;
CREATE TRIGGER trg_sync_order_status_from_seller_orders
AFTER INSERT OR UPDATE OF status
ON public.seller_orders
FOR EACH ROW
EXECUTE FUNCTION public.sync_order_status_from_seller_orders();
