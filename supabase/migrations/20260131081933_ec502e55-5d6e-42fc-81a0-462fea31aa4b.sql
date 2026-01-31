-- Create currency_rates table for admin-defined exchange rates
CREATE TABLE IF NOT EXISTS public.currency_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  base_currency TEXT NOT NULL DEFAULT 'AFN',
  target_currency TEXT NOT NULL DEFAULT 'USD',
  exchange_rate NUMERIC(12, 4) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique constraint to ensure only one active rate per currency pair
CREATE UNIQUE INDEX idx_currency_rates_active_pair 
ON public.currency_rates (base_currency, target_currency) 
WHERE is_active = true;

-- Enable RLS
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

-- Public read access (everyone can see the active rate)
CREATE POLICY "Anyone can view active currency rates"
ON public.currency_rates
FOR SELECT
USING (is_active = true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage currency rates"
ON public.currency_rates
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_currency_rates_updated_at
BEFORE UPDATE ON public.currency_rates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default exchange rate (1 USD = 87 AFN as example)
INSERT INTO public.currency_rates (base_currency, target_currency, exchange_rate, is_active)
VALUES ('AFN', 'USD', 87.50, true)
ON CONFLICT DO NOTHING;