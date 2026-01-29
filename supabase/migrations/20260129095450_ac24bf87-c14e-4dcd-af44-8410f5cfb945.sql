-- Update triggers to get images from product_media table instead of products.images

-- Update notify_admin_new_product trigger
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
  v_product_name TEXT;
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

  -- Get first product image from product_media
  SELECT url INTO v_product_image
  FROM public.product_media
  WHERE product_id = NEW.id AND media_type = 'image'
  ORDER BY sort_order
  LIMIT 1;

  -- Get product name from translations
  v_product_name := COALESCE(
    (SELECT name FROM public.product_translations WHERE product_id = NEW.id AND language = 'en' LIMIT 1),
    (SELECT name FROM public.product_translations WHERE product_id = NEW.id AND language = 'fa' LIMIT 1),
    'New Product'
  );

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
    format('Seller store %s added a new product "%s"', COALESCE(v_store_name, v_seller_name), v_product_name),
    format('فروشگاه %s محصول جدید «%s» را اضافه کرد', COALESCE(v_store_name, v_seller_name), v_product_name),
    format('د %s پلورنځي نوی محصول «%s» اضافه کړ', COALESCE(v_store_name, v_seller_name), v_product_name),
    'product',
    NEW.id,
    v_product_name,
    v_product_image,
    v_store_name,
    v_store_logo,
    v_seller_name,
    NEW.seller_id
  );

  RETURN NEW;
END;
$function$;

-- Update notify_seller_product_status trigger
CREATE OR REPLACE FUNCTION public.notify_seller_product_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_product_image TEXT;
  v_product_name TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get first product image from product_media
  SELECT url INTO v_product_image
  FROM public.product_media
  WHERE product_id = NEW.id AND media_type = 'image'
  ORDER BY sort_order
  LIMIT 1;

  -- Get product name from translations
  v_product_name := COALESCE(
    (SELECT name FROM public.product_translations WHERE product_id = NEW.id AND language = 'en' LIMIT 1),
    (SELECT name FROM public.product_translations WHERE product_id = NEW.id AND language = 'fa' LIMIT 1),
    'Product'
  );

  IF NEW.status = 'active' AND OLD.status = 'pending' THEN
    INSERT INTO public.notifications (
      user_id, user_role, type,
      title_en, title_fa,
      message_en, message_fa,
      related_entity_type, related_entity_id,
      product_id, product_name, product_image_url, seller_id
    ) VALUES (
      NEW.seller_id, 'seller', 'PRODUCT_APPROVED',
      'Product Approved! ✅', 'محصول تأیید شد! ✅',
      'Your product "' || v_product_name || '" is now live and visible to customers.',
      'محصول «' || v_product_name || '» اکنون فعال و قابل مشاهده برای مشتریان است.',
      'product', NEW.id,
      NEW.id, v_product_name, v_product_image, NEW.seller_id
    );
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (
      user_id, user_role, type,
      title_en, title_fa,
      message_en, message_fa,
      related_entity_type, related_entity_id,
      product_id, product_name, product_image_url, seller_id,
      rejection_reason
    ) VALUES (
      NEW.seller_id, 'seller', 'PRODUCT_REJECTED',
      'Product Rejected', 'محصول رد شد',
      'Your product "' || v_product_name || '" was rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'Not specified'),
      'محصول «' || v_product_name || '» رد شد. دلیل: ' || COALESCE(NEW.rejection_reason, 'مشخص نشده'),
      'product', NEW.id,
      NEW.id, v_product_name, v_product_image, NEW.seller_id,
      NEW.rejection_reason
    );
  END IF;

  RETURN NEW;
END;
$function$;

-- Update notify_seller_new_review trigger
CREATE OR REPLACE FUNCTION public.notify_seller_new_review()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_product RECORD;
  v_buyer_name TEXT;
  v_product_image TEXT;
  v_product_name TEXT;
BEGIN
  -- Get product info
  SELECT id, seller_id INTO v_product
  FROM public.products
  WHERE id = NEW.product_id
  LIMIT 1;

  -- Get product name from translations
  v_product_name := COALESCE(
    (SELECT name FROM public.product_translations WHERE product_id = NEW.product_id AND language = 'en' LIMIT 1),
    (SELECT name FROM public.product_translations WHERE product_id = NEW.product_id AND language = 'fa' LIMIT 1),
    'Product'
  );

  -- Get buyer name
  SELECT full_name INTO v_buyer_name
  FROM public.profiles
  WHERE user_id = NEW.buyer_id
  LIMIT 1;

  -- Get first product image from product_media
  SELECT url INTO v_product_image
  FROM public.product_media
  WHERE product_id = NEW.product_id AND media_type = 'image'
  ORDER BY sort_order
  LIMIT 1;

  -- Insert notification for seller
  INSERT INTO public.notifications (
    user_id, user_role, type,
    title_en, title_fa,
    message_en, message_fa,
    related_entity_type, related_entity_id,
    product_id, product_name, product_image_url,
    buyer_name, rating, seller_id
  ) VALUES (
    v_product.seller_id, 'seller', 'NEW_REVIEW',
    'New Review Received ⭐', 'نظر جدید دریافت شد ⭐',
    COALESCE(v_buyer_name, 'A customer') || ' left a ' || NEW.rating || '-star review on "' || v_product_name || '"',
    COALESCE(v_buyer_name, 'یک مشتری') || ' یک نظر ' || NEW.rating || ' ستاره برای «' || v_product_name || '» ثبت کرد',
    'review', NEW.id,
    v_product.id, v_product_name, v_product_image,
    v_buyer_name, NEW.rating, v_product.seller_id
  );

  RETURN NEW;
END;
$function$;

-- Update get_product_name and get_product_description to not fallback to products table
CREATE OR REPLACE FUNCTION public.get_product_name(p_product_id uuid, p_language text DEFAULT 'en'::text)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT name FROM product_translations WHERE product_id = p_product_id AND language = p_language),
    (SELECT name FROM product_translations WHERE product_id = p_product_id AND language = 'fa'),
    (SELECT name FROM product_translations WHERE product_id = p_product_id AND language = 'en'),
    'Unnamed Product'
  );
$function$;

CREATE OR REPLACE FUNCTION public.get_product_description(p_product_id uuid, p_language text DEFAULT 'en'::text)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT description FROM product_translations WHERE product_id = p_product_id AND language = p_language),
    (SELECT description FROM product_translations WHERE product_id = p_product_id AND language = 'fa'),
    (SELECT description FROM product_translations WHERE product_id = p_product_id AND language = 'en'),
    ''
  );
$function$;