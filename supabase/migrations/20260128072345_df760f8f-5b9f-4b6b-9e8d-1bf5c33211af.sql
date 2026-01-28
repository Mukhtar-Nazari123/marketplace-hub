-- Update notify_buyer_order_status trigger to include Pashto translations
CREATE OR REPLACE FUNCTION public.notify_buyer_order_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_buyer_name TEXT;
  v_store_name TEXT;
  v_store_logo TEXT;
  v_status_en TEXT;
  v_status_fa TEXT;
  v_status_ps TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get buyer name
  SELECT full_name INTO v_buyer_name
  FROM public.profiles
  WHERE user_id = NEW.buyer_id
  LIMIT 1;

  -- Get status labels
  v_status_en := CASE NEW.status
    WHEN 'pending' THEN 'Pending'
    WHEN 'confirmed' THEN 'Confirmed'
    WHEN 'processing' THEN 'Processing'
    WHEN 'shipped' THEN 'Shipped'
    WHEN 'delivered' THEN 'Delivered'
    WHEN 'completed' THEN 'Completed'
    WHEN 'cancelled' THEN 'Cancelled'
    WHEN 'refunded' THEN 'Refunded'
    WHEN 'rejected' THEN 'Rejected'
    ELSE NEW.status
  END;

  v_status_fa := CASE NEW.status
    WHEN 'pending' THEN 'در انتظار'
    WHEN 'confirmed' THEN 'تأیید شده'
    WHEN 'processing' THEN 'در حال پردازش'
    WHEN 'shipped' THEN 'ارسال شده'
    WHEN 'delivered' THEN 'تحویل داده شده'
    WHEN 'completed' THEN 'تکمیل شده'
    WHEN 'cancelled' THEN 'لغو شده'
    WHEN 'refunded' THEN 'بازپرداخت شده'
    WHEN 'rejected' THEN 'رد شده'
    ELSE NEW.status
  END;

  v_status_ps := CASE NEW.status
    WHEN 'pending' THEN 'انتظار کې'
    WHEN 'confirmed' THEN 'تایید شوی'
    WHEN 'processing' THEN 'پروسس کېږي'
    WHEN 'shipped' THEN 'لیږل شوی'
    WHEN 'delivered' THEN 'تحویل شوی'
    WHEN 'completed' THEN 'بشپړ شوی'
    WHEN 'cancelled' THEN 'لغوه شوی'
    WHEN 'refunded' THEN 'بیرته ورکړل شوی'
    WHEN 'rejected' THEN 'رد شوی'
    ELSE NEW.status
  END;

  -- Insert notification for buyer
  INSERT INTO public.notifications (
    user_id, user_role, type,
    title_en, title_fa, title_ps,
    message_en, message_fa, message_ps,
    related_entity_type, related_entity_id,
    order_id, order_number, order_status,
    order_total, order_currency
  ) VALUES (
    NEW.buyer_id, 'buyer', 'ORDER_STATUS_CHANGED',
    'Order Status Updated', 'وضعیت سفارش به‌روزرسانی شد', 'د امر حالت تازه شو',
    'Your order #' || NEW.order_number || ' status changed to ' || v_status_en,
    'وضعیت سفارش #' || NEW.order_number || ' به ' || v_status_fa || ' تغییر کرد',
    'ستاسو د امر #' || NEW.order_number || ' حالت ' || v_status_ps || ' ته بدل شو',
    'order', NEW.id,
    NEW.id, NEW.order_number, NEW.status,
    NEW.total_afn, NEW.currency
  );

  RETURN NEW;
END;
$function$;