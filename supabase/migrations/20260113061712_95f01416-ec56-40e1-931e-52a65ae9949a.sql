-- Drop and recreate the notify_seller_new_order function with correct logic
CREATE OR REPLACE FUNCTION public.notify_seller_new_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_buyer_name TEXT;
  v_buyer_id UUID;
  v_order_info RECORD;
BEGIN
  -- Get order info including buyer_id
  SELECT order_number, total_afn, currency, buyer_id INTO v_order_info
  FROM public.orders
  WHERE id = NEW.order_id
  LIMIT 1;

  -- Get buyer name from profiles using buyer_id from orders
  SELECT full_name INTO v_buyer_name
  FROM public.profiles
  WHERE user_id = v_order_info.buyer_id
  LIMIT 1;

  -- Insert notification for seller
  INSERT INTO public.notifications (
    user_id, user_role, type,
    title_en, title_fa,
    message_en, message_fa,
    related_entity_type, related_entity_id,
    order_id, order_number,
    buyer_name, order_total, order_currency,
    seller_id
  ) VALUES (
    NEW.seller_id, 'seller', 'NEW_ORDER',
    'New Order Received', 'سفارش جدید دریافت شد',
    'New order #' || v_order_info.order_number || ' from ' || COALESCE(v_buyer_name, NEW.buyer_name, 'Customer'),
    'سفارش جدید #' || v_order_info.order_number || ' از ' || COALESCE(v_buyer_name, NEW.buyer_name, 'مشتری'),
    'seller_order', NEW.id,
    NEW.order_id, v_order_info.order_number,
    COALESCE(v_buyer_name, NEW.buyer_name), NEW.total, NEW.currency,
    NEW.seller_id
  );

  RETURN NEW;
END;
$function$;