import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HomeBanner {
  id: string;
  title_en: string;
  title_fa: string | null;
  subtitle_en: string | null;
  subtitle_fa: string | null;
  button_text_en: string | null;
  button_text_fa: string | null;
  price_text_en: string | null;
  price_text_fa: string | null;
  button_url: string | null;
  background_type: string;
  background_color: string | null;
  background_image_path: string | null;
  icon_or_image_path: string | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface HomeBannerInput {
  title_en: string;
  title_fa?: string | null;
  subtitle_en?: string | null;
  subtitle_fa?: string | null;
  button_text_en?: string | null;
  button_text_fa?: string | null;
  price_text_en?: string | null;
  price_text_fa?: string | null;
  button_url?: string | null;
  background_type?: string;
  background_color?: string | null;
  background_image_path?: string | null;
  icon_or_image_path?: string | null;
  is_active?: boolean;
  priority?: number;
}

interface UseHomeBannersOptions {
  activeOnly?: boolean;
}

export const useHomeBanners = (options: UseHomeBannersOptions = { activeOnly: true }) => {
  const [banners, setBanners] = useState<HomeBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('home_banners')
        .select('*')
        .order('priority', { ascending: true });

      if (options.activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setBanners(data || []);
    } catch (err) {
      console.error('Error fetching home banners:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch home banners');
    } finally {
      setLoading(false);
    }
  }, [options.activeOnly]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const createBanner = async (input: HomeBannerInput) => {
    const { data, error } = await supabase
      .from('home_banners')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    await fetchBanners();
    return data;
  };

  const updateBanner = async (id: string, input: Partial<HomeBannerInput>) => {
    const { data, error } = await supabase
      .from('home_banners')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchBanners();
    return data;
  };

  const deleteBanner = async (id: string) => {
    const { error } = await supabase
      .from('home_banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchBanners();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    return updateBanner(id, { is_active: isActive });
  };

  return {
    banners,
    loading,
    error,
    refetch: fetchBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleActive,
  };
};
