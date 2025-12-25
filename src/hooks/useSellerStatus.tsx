import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type SellerStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | null;

export const useSellerStatus = () => {
  const { user, role } = useAuth();
  const [status, setStatus] = useState<SellerStatus>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!user || role !== 'seller') {
      setStatus(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('seller_verifications')
        .select('status')
        .eq('seller_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching seller status:', error);
        setStatus(null);
      } else if (data) {
        setStatus(data.status as SellerStatus);
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

  return { status, loading, refetch: fetchStatus };
};