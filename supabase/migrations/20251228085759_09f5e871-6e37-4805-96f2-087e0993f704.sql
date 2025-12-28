-- Add phone and addresses columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS addresses jsonb DEFAULT '[]'::jsonb;