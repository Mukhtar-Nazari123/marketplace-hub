-- Create table for designed hero banners (pre-made image banners)
CREATE TABLE public.designed_hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  cta_link TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.designed_hero_banners ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (anyone can view active banners)
CREATE POLICY "Anyone can view active designed banners"
ON public.designed_hero_banners
FOR SELECT
USING (is_active = true);

-- Create policy for admin full access
CREATE POLICY "Admins can manage designed banners"
ON public.designed_hero_banners
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create table for hero banner settings (which type is active)
CREATE TABLE public.hero_banner_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  banner_type TEXT NOT NULL DEFAULT 'dynamic' CHECK (banner_type IN ('dynamic', 'designed')),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.hero_banner_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view banner settings"
ON public.hero_banner_settings
FOR SELECT
USING (true);

-- Create policy for admin management
CREATE POLICY "Admins can manage banner settings"
ON public.hero_banner_settings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Insert default setting
INSERT INTO public.hero_banner_settings (banner_type) VALUES ('dynamic');

-- Create trigger for updated_at on designed_hero_banners
CREATE TRIGGER update_designed_hero_banners_updated_at
BEFORE UPDATE ON public.designed_hero_banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();