
-- Allow admins to delete notifications
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Admins can delete notifications'
  ) THEN
    CREATE POLICY "Admins can delete notifications"
    ON public.notifications FOR DELETE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'seller_verifications' AND policyname = 'Admins can delete seller verifications'
  ) THEN
    CREATE POLICY "Admins can delete seller verifications"
    ON public.seller_verifications FOR DELETE TO authenticated
    USING (has_role(auth.uid(), 'admin'::app_role));
  END IF;
END $$;
