-- Allow everyone to view basic seller info (business_name, store_logo) for product display
-- This creates a new policy for public read access to seller verifications

CREATE POLICY "Everyone can view approved seller public info"
ON public.seller_verifications
FOR SELECT
USING (
  status = 'approved' 
  OR seller_id = auth.uid() 
  OR has_role(auth.uid(), 'admin'::app_role)
);