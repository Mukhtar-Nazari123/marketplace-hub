
-- Create email_verification_codes table
CREATE TABLE public.email_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NOT NULL,
  verification_code text NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  is_used boolean NOT NULL DEFAULT false,
  attempt_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_email_verification_codes_user_id ON public.email_verification_codes (user_id);
CREATE INDEX idx_email_verification_codes_email ON public.email_verification_codes (email);
CREATE INDEX idx_email_verification_codes_expires_at ON public.email_verification_codes (expires_at);

-- Enable RLS
ALTER TABLE public.email_verification_codes ENABLE ROW LEVEL SECURITY;

-- RLS: Only service role / edge functions can insert/update/select (via service_role key)
-- Users should NOT directly access this table from the client
CREATE POLICY "Service role full access" ON public.email_verification_codes
  FOR ALL USING (true) WITH CHECK (true);

-- Create cleanup function for expired codes
CREATE OR REPLACE FUNCTION public.cleanup_expired_verification_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.email_verification_codes
  WHERE expires_at < now() - interval '1 hour'
     OR (is_used = true AND created_at < now() - interval '1 hour');
END;
$$;
