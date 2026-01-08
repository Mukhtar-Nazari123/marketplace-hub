-- Create site_contact_settings table for editable contact information
CREATE TABLE public.site_contact_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  address_en TEXT,
  address_fa TEXT,
  phone TEXT,
  support_email TEXT,
  working_hours_en TEXT,
  working_hours_fa TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_contact_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read contact settings (public page)
CREATE POLICY "Anyone can read contact settings"
  ON public.site_contact_settings
  FOR SELECT
  USING (true);

-- Only admins can update contact settings
CREATE POLICY "Admins can update contact settings"
  ON public.site_contact_settings
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Only admins can insert (for initial setup)
CREATE POLICY "Admins can insert contact settings"
  ON public.site_contact_settings
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_site_contact_settings_updated_at
  BEFORE UPDATE ON public.site_contact_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.site_contact_settings (
  address_en,
  address_fa,
  phone,
  support_email,
  working_hours_en,
  working_hours_fa
) VALUES (
  'Kabul, Afghanistan',
  'کابل، افغانستان',
  '+93 70 123 4567',
  'support@market.af',
  'Saturday - Thursday: 9:00 AM - 6:00 PM',
  'شنبه - پنجشنبه: ۹:۰۰ صبح - ۶:۰۰ عصر'
);