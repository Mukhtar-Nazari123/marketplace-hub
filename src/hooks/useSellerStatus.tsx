import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | null;

export interface SellerVerificationData {
  status: SellerStatus;
  profile_completed: boolean;
  completion_step: number;
  business_name: string | null;
  store_logo: string | null;
  store_banner: string | null;
}

export const useSellerStatus = () => {
  const { user, role } = useAuth();
  const [status, setStatus] = useState<SellerStatus>(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [completionStep, setCompletionStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user || role !== 'seller') {
      setStatus(null);
      setProfileCompleted(false);
      setCompletionStep(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('seller_verifications')
        .select('status, profile_completed, completion_step')
        .eq('seller_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching seller status:', error);
        setStatus(null);
      } else if (data) {
        setStatus(data.status as SellerStatus);
        setProfileCompleted(data.profile_completed ?? false);
        setCompletionStep(data.completion_step ?? 0);
      } else {
        // No verification record exists, create one as pending
        const { error: insertError } = await supabase
          .from('seller_verifications')
          .insert({
            seller_id: user.id,
            status: 'pending'
          });

        if (insertError) {
          console.error('Error creating seller verification:', insertError);
        }
        setStatus('pending');
        setProfileCompleted(false);
        setCompletionStep(0);
      }
    } catch (error) {
      console.error('Error in seller status:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [user, role]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, profileCompleted, completionStep, loading, refetch: fetchStatus };
};