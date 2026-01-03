-- Create promo_cards table for dynamic promotional cards on home page
CREATE TABLE public.promo_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_fa TEXT,
  subtitle TEXT,
  subtitle_fa TEXT,
  starting_price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  badge_text TEXT,
  badge_text_fa TEXT,
  badge_variant TEXT NOT NULL DEFAULT 'new',
  color_theme TEXT NOT NULL DEFAULT 'cyan',
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  link_url TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.promo_cards ENABLE ROW LEVEL SECURITY;

-- Policy: Active promo cards are viewable by everyone
CREATE POLICY "Active promo cards are viewable by everyone"
ON public.promo_cards
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Policy: Admins can manage promo cards
CREATE POLICY "Admins can manage promo cards"
ON public.promo_cards
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_promo_cards_updated_at
BEFORE UPDATE ON public.promo_cards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default promo cards (matching current static content)
INSERT INTO public.promo_cards (title, title_fa, subtitle, subtitle_fa, starting_price, currency, badge_text, badge_text_fa, badge_variant, color_theme, sort_order) VALUES
('Top Selling iMAC', 'پرفروش‌ترین iMAC', 'Latest Generation', 'نسل جدید', 399, 'USD', 'Now Available!', 'اکنون موجود!', 'new', 'cyan', 1),
('Top Selling Kitchen Essentials', 'پرفروش‌ترین لوازم آشپزخانه', 'Kitchen Essentials', 'لوازم آشپزخانه', 199, 'USD', 'Now Available!', 'اکنون موجود!', 'sale', 'orange', 2),
('Top Selling Must-Have Gadgets', 'پرفروش‌ترین گجت‌های ضروری', 'Must-Have Gadgets', 'گجت‌های ضروری', 99, 'USD', 'Now Available!', 'اکنون موجود!', 'new', 'cyan', 3);