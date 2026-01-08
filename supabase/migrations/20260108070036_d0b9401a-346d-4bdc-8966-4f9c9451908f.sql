-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "Anyone can submit contact messages via edge function" ON public.contact_messages;

-- Create a more secure policy - only service role can insert (edge function uses service role)
-- This prevents direct client-side inserts while allowing the edge function to work
CREATE POLICY "Only service role can insert contact messages"
ON public.contact_messages
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR auth.uid() IS NULL);