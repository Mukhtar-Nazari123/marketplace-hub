-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  compare_at_price DECIMAL(12, 2),
  cost_price DECIMAL(12, 2),
  sku TEXT,
  barcode TEXT,
  quantity INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 5,
  weight DECIMAL(10, 2),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'rejected', 'draft', 'archived')),
  rejection_reason TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  images TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal DECIMAL(12, 2) NOT NULL,
  shipping_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  shipping_address JSONB,
  billing_address JSONB,
  payment_method TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create banners table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position TEXT NOT NULL DEFAULT 'home' CHECK (position IN ('home', 'category', 'promo', 'sidebar')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create promotions table
CREATE TABLE public.promotions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(12, 2) NOT NULL,
  min_order_amount DECIMAL(12, 2),
  max_discount_amount DECIMAL(12, 2),
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  applies_to TEXT NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all', 'category', 'product', 'seller')),
  applies_to_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seller verification table
CREATE TABLE public.seller_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT,
  business_type TEXT,
  tax_id TEXT,
  phone TEXT,
  address JSONB,
  documents JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  rejection_reason TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin action logs table
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create CMS content table
CREATE TABLE public.cms_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(page, section)
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;

-- Categories policies (public read, admin write)
CREATE POLICY "Categories are viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Products policies
CREATE POLICY "Active products are viewable by everyone" ON public.products FOR SELECT USING (status = 'active' OR seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers can insert their own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own products" ON public.products FOR UPDATE USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers can delete their own products" ON public.products FOR DELETE USING (auth.uid() = seller_id OR public.has_role(auth.uid(), 'admin'));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (buyer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can create their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (buyer_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Order items policies
CREATE POLICY "Users can view their order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
  OR seller_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin')
);
CREATE POLICY "Users can insert order items" ON public.order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
);

-- Banners policies
CREATE POLICY "Active banners are viewable by everyone" ON public.banners FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Promotions policies
CREATE POLICY "Active promotions are viewable by everyone" ON public.promotions FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage promotions" ON public.promotions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Seller verifications policies
CREATE POLICY "Sellers can view their own verification" ON public.seller_verifications FOR SELECT USING (seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sellers can insert their verification" ON public.seller_verifications FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their verification" ON public.seller_verifications FOR UPDATE USING (seller_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Admin logs policies (admin only)
CREATE POLICY "Admins can view logs" ON public.admin_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert logs" ON public.admin_logs FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CMS content policies
CREATE POLICY "Published content is viewable by everyone" ON public.cms_content FOR SELECT USING (is_published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage content" ON public.cms_content FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seller_verifications_updated_at BEFORE UPDATE ON public.seller_verifications FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_cms_content_updated_at BEFORE UPDATE ON public.cms_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_products_seller_id ON public.products(seller_id);
CREATE INDEX idx_products_category_id ON public.products(category_id);
CREATE INDEX idx_products_status ON public.products(status);
CREATE INDEX idx_orders_buyer_id ON public.orders(buyer_id);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_seller_id ON public.order_items(seller_id);
CREATE INDEX idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX idx_admin_logs_entity ON public.admin_logs(entity_type, entity_id);