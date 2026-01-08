-- Create social_links table
CREATE TABLE public.social_links (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform text NOT NULL,
  url text NOT NULL,
  icon text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Social links are viewable by everyone"
ON public.social_links
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage social links"
ON public.social_links
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_social_links_updated_at
BEFORE UPDATE ON public.social_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default social links
INSERT INTO public.social_links (platform, url, icon, is_active, display_order) VALUES
('facebook', 'https://facebook.com', 'Facebook', true, 1),
('twitter', 'https://twitter.com', 'Twitter', true, 2),
('instagram', 'https://instagram.com', 'Instagram', true, 3),
('youtube', 'https://youtube.com', 'Youtube', true, 4);