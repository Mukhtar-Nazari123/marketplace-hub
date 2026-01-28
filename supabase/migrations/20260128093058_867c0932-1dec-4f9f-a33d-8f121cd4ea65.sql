-- Update notify_admin_new_product to include Pashto
CREATE OR REPLACE FUNCTION public.notify_admin_new_product()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_seller_name TEXT;
  v_store_name TEXT;
  v_store_logo TEXT;
  v_product_image TEXT;
BEGIN
  -- Get seller info from seller_verifications
  SELECT 
    COALESCE(sv.business_name, p.full_name, 'Unknown Seller'),
    sv.business_name,
    sv.store_logo
  INTO v_seller_name, v_store_name, v_store_logo
  FROM public.profiles p
  LEFT JOIN public.seller_verifications sv ON sv.seller_id = p.user_id
  WHERE p.user_id = NEW.seller_id;

  -- Get first product image
  v_product_image := CASE 
    WHEN NEW.images IS NOT NULL AND array_length(NEW.images, 1) > 0 
    THEN NEW.images[1] 
    ELSE NULL 
  END;

  INSERT INTO public.admin_notifications (
    type,
    title_en,
    title_fa,
    title_ps,
    message_en,
    message_fa,
    message_ps,
    related_entity_type,
    related_entity_id,
    product_name,
    product_image_url,
    store_name,
    store_logo_url,
    seller_name,
    seller_id
  ) VALUES (
    'NEW_PRODUCT',
    'New Product Added',
    'محصول جدید اضافه شد',
    'نوی محصول اضافه شو',
    format('Seller store %s added a new product "%s"', COALESCE(v_store_name, v_seller_name), NEW.name),
    format('فروشگاه %s محصول جدید «%s» را اضافه کرد', COALESCE(v_store_name, v_seller_name), NEW.name),
    format('د %s پلورنځي نوی محصول «%s» اضافه کړ', COALESCE(v_store_name, v_seller_name), NEW.name),
    'product',
    NEW.id,
    NEW.name,
    v_product_image,
    v_store_name,
    v_store_logo,
    v_seller_name,
    NEW.seller_id
  );

  RETURN NEW;
END;
$function$;

-- Update notify_admin_new_order to include Pashto
CREATE OR REPLACE FUNCTION public.notify_admin_new_order()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_buyer_name TEXT;
  v_first_item RECORD;
BEGIN
  -- Get buyer name
  SELECT full_name INTO v_buyer_name
  FROM public.profiles
  WHERE user_id = NEW.buyer_id;

  -- Get first order item for image
  SELECT product_name, product_image, seller_id INTO v_first_item
  FROM public.order_items
  WHERE order_id = NEW.id
  LIMIT 1;

  INSERT INTO public.admin_notifications (
    type,
    title_en,
    title_fa,
    title_ps,
    message_en,
    message_fa,
    message_ps,
    related_entity_type,
    related_entity_id,
    order_total,
    order_currency,
    order_number,
    product_name,
    product_image_url,
    buyer_name,
    buyer_id
  ) VALUES (
    'NEW_ORDER',
    'New Order Placed',
    'سفارش جدید ثبت شد',
    'نوی امر ثبت شو',
    format('New order #%s placed — Total %s %s', NEW.order_number, NEW.total_afn, NEW.currency),
    format('سفارش جدید #%s ثبت شد — مجموع %s افغانی', NEW.order_number, NEW.total_afn),
    format('نوی امر #%s ثبت شو — ټول %s افغانۍ', NEW.order_number, NEW.total_afn),
    'order',
    NEW.id,
    NEW.total_afn,
    NEW.currency,
    NEW.order_number,
    v_first_item.product_name,
    v_first_item.product_image,
    COALESCE(v_buyer_name, 'Guest'),
    NEW.buyer_id
  );

  RETURN NEW;
END;
$function$;

-- Update notify_admin_new_store to include Pashto
CREATE OR REPLACE FUNCTION public.notify_admin_new_store()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_seller_name TEXT;
BEGIN
  -- Get seller name from profiles
  SELECT full_name INTO v_seller_name
  FROM public.profiles
  WHERE user_id = NEW.seller_id;

  -- Only notify when profile is completed
  IF NEW.profile_completed = true AND (OLD IS NULL OR OLD.profile_completed = false) THEN
    INSERT INTO public.admin_notifications (
      type,
      title_en,
      title_fa,
      title_ps,
      message_en,
      message_fa,
      message_ps,
      related_entity_type,
      related_entity_id,
      store_name,
      store_logo_url,
      seller_name,
      seller_id
    ) VALUES (
      'NEW_STORE',
      'New Seller Store Registered',
      'فروشگاه جدید ثبت شد',
      'نوی پلورنځی ثبت شو',
      format('New seller store "%s" registered', COALESCE(NEW.business_name, 'Unnamed Store')),
      format('فروشگاه جدید «%s» ثبت شد', COALESCE(NEW.business_name, 'فروشگاه بدون نام')),
      format('نوی پلورنځی «%s» ثبت شو', COALESCE(NEW.business_name, 'بې نوم پلورنځی')),
      'store',
      NEW.id,
      NEW.business_name,
      NEW.store_logo,
      COALESCE(v_seller_name, 'Unknown Seller'),
      NEW.seller_id
    );
  END IF;

  RETURN NEW;
END;
$function$;