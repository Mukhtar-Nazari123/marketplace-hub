-- Create notifications table for buyer and seller notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_role TEXT NOT NULL CHECK (user_role IN ('buyer', 'seller')),
  type TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_fa TEXT NOT NULL,
  message_en TEXT NOT NULL,
  message_fa TEXT NOT NULL,
  related_entity_type TEXT,
  related_entity_id UUID,
  -- Additional context fields
  order_id UUID,
  order_number TEXT,
  order_status TEXT,
  product_id UUID,
  product_name TEXT,
  product_image_url TEXT,
  store_name TEXT,
  store_logo_url TEXT,
  seller_id UUID,
  buyer_name TEXT,
  order_total NUMERIC,
  order_currency TEXT,
  rating INTEGER,
  rejection_reason TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- System can insert notifications (via triggers)
CREATE POLICY "System can insert notifications"
ON public.notifications
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- =============================================
-- TRIGGER: Order Status Changed → Notify Buyer
-- =============================================
CREATE OR REPLACE FUNCTION notify_buyer_order_status()
RETURNS TRIGGER AS $$
DECLARE
  v_buyer_name TEXT;
  v_store_name TEXT;
  v_store_logo TEXT;
  v_status_en TEXT;
  v_status_fa TEXT;
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
    WHEN 'confirmed' THEN 'Confirmed'
    WHEN 'processing' THEN 'Processing'
    WHEN 'shipped' THEN 'Shipped'
    WHEN 'delivered' THEN 'Delivered'
    WHEN 'completed' THEN 'Completed'
    WHEN 'cancelled' THEN 'Cancelled'
    WHEN 'refunded' THEN 'Refunded'
    ELSE NEW.status
  END;

  v_status_fa := CASE NEW.status
    WHEN 'confirmed' THEN 'تأیید شده'
    WHEN 'processing' THEN 'در حال پردازش'
    WHEN 'shipped' THEN 'ارسال شده'
    WHEN 'delivered' THEN 'تحویل داده شده'
    WHEN 'completed' THEN 'تکمیل شده'
    WHEN 'cancelled' THEN 'لغو شده'
    WHEN 'refunded' THEN 'بازپرداخت شده'
    ELSE NEW.status
  END;

  -- Insert notification for buyer
  INSERT INTO public.notifications (
    user_id, user_role, type,
    title_en, title_fa,
    message_en, message_fa,
    related_entity_type, related_entity_id,
    order_id, order_number, order_status,
    order_total, order_currency
  ) VALUES (
    NEW.buyer_id, 'buyer', 'ORDER_STATUS_CHANGED',
    'Order Status Updated', 'وضعیت سفارش به‌روزرسانی شد',
    'Your order #' || NEW.order_number || ' status changed to ' || v_status_en,
    'وضعیت سفارش #' || NEW.order_number || ' به ' || v_status_fa || ' تغییر کرد',
    'order', NEW.id,
    NEW.id, NEW.order_number, NEW.status,
    NEW.total_afn, NEW.currency
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_buyer_order_status
AFTER UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION notify_buyer_order_status();

-- =============================================
-- TRIGGER: New Order → Notify Seller
-- =============================================
CREATE OR REPLACE FUNCTION notify_seller_new_order()
RETURNS TRIGGER AS $$
DECLARE
  v_buyer_name TEXT;
  v_order_info RECORD;
BEGIN
  -- Get buyer name
  SELECT full_name INTO v_buyer_name
  FROM public.profiles
  WHERE user_id = NEW.buyer_id
  LIMIT 1;

  -- Get order info
  SELECT order_number, total_afn, currency INTO v_order_info
  FROM public.orders
  WHERE id = NEW.order_id
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
    'New order #' || v_order_info.order_number || ' from ' || COALESCE(v_buyer_name, 'Customer'),
    'سفارش جدید #' || v_order_info.order_number || ' از ' || COALESCE(v_buyer_name, 'مشتری'),
    'seller_order', NEW.id,
    NEW.order_id, v_order_info.order_number,
    v_buyer_name, NEW.total, NEW.currency,
    NEW.seller_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_seller_new_order
AFTER INSERT ON public.seller_orders
FOR EACH ROW
EXECUTE FUNCTION notify_seller_new_order();

-- =============================================
-- TRIGGER: Store Approved/Rejected → Notify Seller
-- =============================================
CREATE OR REPLACE FUNCTION notify_seller_store_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on status change to approved or rejected
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'approved' THEN
    INSERT INTO public.notifications (
      user_id, user_role, type,
      title_en, title_fa,
      message_en, message_fa,
      related_entity_type, related_entity_id,
      store_name, store_logo_url, seller_id
    ) VALUES (
      NEW.seller_id, 'seller', 'STORE_APPROVED',
      'Store Approved! 🎉', 'فروشگاه تأیید شد! 🎉',
      'Your store "' || COALESCE(NEW.business_name, 'Your Store') || '" has been approved. You can now start selling!',
      'فروشگاه «' || COALESCE(NEW.business_name, 'فروشگاه شما') || '» تأیید شد. اکنون می‌توانید فروش را شروع کنید!',
      'seller_verification', NEW.id,
      NEW.business_name, NEW.store_logo, NEW.seller_id
    );
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (
      user_id, user_role, type,
      title_en, title_fa,
      message_en, message_fa,
      related_entity_type, related_entity_id,
      store_name, store_logo_url, seller_id,
      rejection_reason
    ) VALUES (
      NEW.seller_id, 'seller', 'STORE_REJECTED',
      'Store Application Rejected', 'درخواست فروشگاه رد شد',
      'Your store "' || COALESCE(NEW.business_name, 'Your Store') || '" application was rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'Not specified'),
      'درخواست فروشگاه «' || COALESCE(NEW.business_name, 'فروشگاه شما') || '» رد شد. دلیل: ' || COALESCE(NEW.rejection_reason, 'مشخص نشده'),
      'seller_verification', NEW.id,
      NEW.business_name, NEW.store_logo, NEW.seller_id,
      NEW.rejection_reason
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_seller_store_status
AFTER UPDATE ON public.seller_verifications
FOR EACH ROW
EXECUTE FUNCTION notify_seller_store_status();

-- =============================================
-- TRIGGER: Product Approved/Rejected → Notify Seller
-- =============================================
CREATE OR REPLACE FUNCTION notify_seller_product_status()
RETURNS TRIGGER AS $$
DECLARE
  v_product_image TEXT;
BEGIN
  -- Only trigger on status change
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Get first product image
  v_product_image := CASE WHEN array_length(NEW.images, 1) > 0 THEN NEW.images[1] ELSE NULL END;

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
      'Your product "' || NEW.name || '" is now live and visible to customers.',
      'محصول «' || NEW.name || '» اکنون فعال و قابل مشاهده برای مشتریان است.',
      'product', NEW.id,
      NEW.id, NEW.name, v_product_image, NEW.seller_id
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
      'Your product "' || NEW.name || '" was rejected. Reason: ' || COALESCE(NEW.rejection_reason, 'Not specified'),
      'محصول «' || NEW.name || '» رد شد. دلیل: ' || COALESCE(NEW.rejection_reason, 'مشخص نشده'),
      'product', NEW.id,
      NEW.id, NEW.name, v_product_image, NEW.seller_id,
      NEW.rejection_reason
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_seller_product_status
AFTER UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION notify_seller_product_status();

-- =============================================
-- TRIGGER: New Review → Notify Seller
-- =============================================
CREATE OR REPLACE FUNCTION notify_seller_new_review()
RETURNS TRIGGER AS $$
DECLARE
  v_product RECORD;
  v_buyer_name TEXT;
  v_product_image TEXT;
BEGIN
  -- Get product info
  SELECT id, name, seller_id, images INTO v_product
  FROM public.products
  WHERE id = NEW.product_id
  LIMIT 1;

  -- Get buyer name
  SELECT full_name INTO v_buyer_name
  FROM public.profiles
  WHERE user_id = NEW.buyer_id
  LIMIT 1;

  -- Get first product image
  v_product_image := CASE WHEN array_length(v_product.images, 1) > 0 THEN v_product.images[1] ELSE NULL END;

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
    COALESCE(v_buyer_name, 'A customer') || ' left a ' || NEW.rating || '-star review on "' || v_product.name || '"',
    COALESCE(v_buyer_name, 'یک مشتری') || ' یک نظر ' || NEW.rating || ' ستاره برای «' || v_product.name || '» ثبت کرد',
    'review', NEW.id,
    v_product.id, v_product.name, v_product_image,
    v_buyer_name, NEW.rating, v_product.seller_id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_notify_seller_new_review
AFTER INSERT ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION notify_seller_new_review();