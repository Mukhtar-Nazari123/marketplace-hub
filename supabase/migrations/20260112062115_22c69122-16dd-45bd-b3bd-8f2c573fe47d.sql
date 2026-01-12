-- Create home_banners table with multilingual support
CREATE TABLE public.home_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_fa TEXT,
  subtitle_en TEXT,
  subtitle_fa TEXT,
  button_text_en TEXT DEFAULT 'Shop Now',
  button_text_fa TEXT DEFAULT 'خرید کنید',
  price_text_en TEXT,
  price_text_fa TEXT,
  button_url TEXT,
  background_type TEXT NOT NULL DEFAULT 'color',
  background_color TEXT DEFAULT '#0ea5e9',
  background_image_path TEXT,
  icon_or_image_path TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Active home banners are viewable by everyone" 
ON public.home_banners 
FOR SELECT 
USING ((is_active = true) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage home banners" 
ON public.home_banners 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_home_banners_updated_at
BEFORE UPDATE ON public.home_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();