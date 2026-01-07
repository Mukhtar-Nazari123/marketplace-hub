-- Create site_settings table (single-row table for global settings)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name_en TEXT NOT NULL DEFAULT 'Market',
  site_name_fa TEXT NOT NULL DEFAULT 'مارکت',
  logo_url TEXT,
  favicon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Site settings are viewable by everyone"
ON public.site_settings
FOR SELECT
USING (true);

-- Admin-only write access
CREATE POLICY "Admins can manage site settings"
ON public.site_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default row
INSERT INTO public.site_settings (site_name_en, site_name_fa)
VALUES ('Market', 'مارکت');

-- Create storage bucket for site assets
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true);

-- Storage policies for site-assets bucket
CREATE POLICY "Site assets are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site assets"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site assets"
ON storage.objects
FOR DELETE
USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));