import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CurrencyRate {
  id: string;
  base_currency: string;
  target_currency: string;
  exchange_rate: number;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

export const useCurrencyRate = () => {
  const [rate, setRate] = useState<CurrencyRate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRate = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('currency_rates')
        .select('*')
        .eq('base_currency', 'AFN')
        .eq('target_currency', 'USD')
        .eq('is_active', true)
        .single();

      if (fetchError) throw fetchError;
      setRate(data);
    } catch (err: any) {
      console.error('Error fetching currency rate:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  // Convert AFN to USD
  const convertToUSD = (afnAmount: number): number => {
    if (!rate || rate.exchange_rate === 0) return 0;
    return afnAmount / rate.exchange_rate;
  };

  // Format USD with proper formatting
  const formatUSD = (afnAmount: number): string => {
    const usdAmount = convertToUSD(afnAmount);
    return `$${usdAmount.toFixed(2)}`;
  };

  return {
    rate,
    loading,
    error,
    convertToUSD,
    formatUSD,
    refetch: fetchRate,
  };
};

export default useCurrencyRate;
