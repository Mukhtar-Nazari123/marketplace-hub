import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PromoCard {
  id: string;
  title: string;
  title_fa: string | null;
  subtitle: string | null;
  subtitle_fa: string | null;
  starting_price: number;
  currency: string;
  badge_text: string | null;
  badge_text_fa: string | null;
  badge_variant: string;
  color_theme: string;
  category_id: string | null;
  product_id: string | null;
  link_url: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface UsePromoCardsOptions {
  activeOnly?: boolean;
}

export const usePromoCards = (options: UsePromoCardsOptions = { activeOnly: true }) => {
  const [promoCards, setPromoCards] = useState<PromoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPromoCards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('promo_cards')
        .select('*')
        .order('sort_order', { ascending: true });

      if (options.activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setPromoCards(data || []);
    } catch (err) {
      console.error('Error fetching promo cards:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch promo cards');
    } finally {
      setLoading(false);
    }
  }, [options.activeOnly]);

  useEffect(() => {
    fetchPromoCards();
  }, [fetchPromoCards]);

  const createPromoCard = async (card: Omit<PromoCard, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('promo_cards')
      .insert(card)
      .select()
      .single();

    if (error) throw error;
    await fetchPromoCards();
    return data;
  };

  const updatePromoCard = async (id: string, updates: Partial<PromoCard>) => {
    const { data, error } = await supabase
      .from('promo_cards')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchPromoCards();
    return data;
  };

  const deletePromoCard = async (id: string) => {
    const { error } = await supabase
      .from('promo_cards')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchPromoCards();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updatePromoCard(id, { is_active: isActive });
  };

  return {
    promoCards,
    loading,
    error,
    refetch: fetchPromoCards,
    createPromoCard,
    updatePromoCard,
    deletePromoCard,
    toggleActive,
  };
};
