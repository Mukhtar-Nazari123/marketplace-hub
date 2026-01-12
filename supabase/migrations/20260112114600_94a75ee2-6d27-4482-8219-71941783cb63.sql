-- Create admin_notifications table
CREATE TABLE public.admin_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('NEW_PRODUCT', 'NEW_ORDER', 'NEW_STORE')),
  title_en TEXT NOT NULL,
  title_fa TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_fa TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  product_name TEXT,
  product_image_url TEXT,
  order_total NUMERIC(12,2),
  order_currency TEXT,
  order_number TEXT,
  buyer_name TEXT,
  buyer_id UUID,
  store_name TEXT,
  store_logo_url TEXT,
  seller_name TEXT,
  seller_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Only admins can view notifications
CREATE POLICY "Admins can view notifications"
ON public.admin_notifications
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update notifications (mark as read)
CREATE POLICY "Admins can update notifications"
ON public.admin_notifications
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert notifications (via triggers using SECURITY DEFINER)
CREATE POLICY "System can insert notifications"
ON public.admin_notifications
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_admin_notifications_type ON public.admin_notifications(type);
CREATE INDEX idx_admin_notifications_created_at ON public.admin_notifications(created_at DESC);
CREATE INDEX idx_admin_notifications_is_read ON public.admin_notifications(is_read);

-- Function to create notification when new product is added
CREATE OR REPLACE FUNCTION public.notify_admin_new_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    message_en,
    message_fa,
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
    format('Seller store %s added a new product "%s"', COALESCE(v_store_name, v_seller_name), NEW.name),
    format('فروشگاه %s محصول جدید «%s» را اضافه کرد', COALESCE(v_store_name, v_seller_name), NEW.name),
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
$$;

-- Trigger for new products
CREATE TRIGGER on_product_created
AFTER INSERT ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_product();

-- Function to create notification when new order is placed
CREATE OR REPLACE FUNCTION public.notify_admin_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
    message_en,
    message_fa,
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
    format('New order #%s placed — Total %s %s', NEW.order_number, NEW.total_afn, NEW.currency),
    format('سفارش جدید #%s ثبت شد — مجموع %s افغانی', NEW.order_number, NEW.total_afn),
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
$$;

-- Trigger for new orders
CREATE TRIGGER on_order_created
AFTER INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_order();

-- Function to create notification when new store is registered
CREATE OR REPLACE FUNCTION public.notify_admin_new_store()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
      message_en,
      message_fa,
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
      format('New seller store "%s" registered', COALESCE(NEW.business_name, 'Unnamed Store')),
      format('فروشگاه جدید «%s» ثبت شد', COALESCE(NEW.business_name, 'فروشگاه بدون نام')),
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
$$;

-- Trigger for new stores (on update when profile_completed becomes true)
CREATE TRIGGER on_store_completed
AFTER INSERT OR UPDATE OF profile_completed ON public.seller_verifications
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_new_store();