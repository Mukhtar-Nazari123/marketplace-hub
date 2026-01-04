-- Create hero_banners table for dynamic main hero section
CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_text TEXT,
  badge_text_fa TEXT,
  title TEXT NOT NULL,
  title_fa TEXT,
  description TEXT,
  description_fa TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_text_fa TEXT DEFAULT 'خرید کنید',
  cta_link TEXT,
  background_image TEXT,
  icon_image TEXT,
  highlight_words TEXT[], -- Words to style differently
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Active hero banners are viewable by everyone"
ON public.hero_banners
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'));

-- Admins can manage all banners
CREATE POLICY "Admins can manage hero banners"
ON public.hero_banners
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Auto-update timestamp trigger
CREATE TRIGGER update_hero_banners_updated_at
BEFORE UPDATE ON public.hero_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default hero banner
INSERT INTO public.hero_banners (
  badge_text, badge_text_fa, title, title_fa, description, description_fa,
  cta_text, cta_text_fa, cta_link, is_active, display_order
) VALUES (
  '50% OFF', '۵۰٪ تخفیف',
  'Modern Style Headphones Model',
  'مدل هدفون مدرن استایل',
  'Hurry up! Only 100 products at this discounted price.',
  'عجله کنید! فقط ۱۰۰ محصول با این قیمت تخفیف‌دار.',
  'Shop Now', 'خرید کنید',
  '/products',
  true, 0
);