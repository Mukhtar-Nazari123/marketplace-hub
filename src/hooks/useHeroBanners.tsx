import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HeroBanner {
  id: string;
  badge_text: string | null;
  badge_text_fa: string | null;
  title: string;
  title_fa: string | null;
  description: string | null;
  description_fa: string | null;
  cta_text: string | null;
  cta_text_fa: string | null;
  cta_link: string | null;
  background_image: string | null;
  icon_image: string | null;
  highlight_words: string[] | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface HeroBannerInput {
  badge_text?: string | null;
  badge_text_fa?: string | null;
  title: string;
  title_fa?: string | null;
  description?: string | null;
  description_fa?: string | null;
  cta_text?: string | null;
  cta_text_fa?: string | null;
  cta_link?: string | null;
  background_image?: string | null;
  icon_image?: string | null;
  highlight_words?: string[] | null;
  is_active?: boolean;
  display_order?: number;
}

export const useHeroBanners = (activeOnly: boolean = true) => {
  const [heroBanners, setHeroBanners] = useState<HeroBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchHeroBanners = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('hero_banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (activeOnly) {
        query = query.eq('is_active', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setHeroBanners(data || []);
    } catch (error: any) {
      console.error('Error fetching hero banners:', error);
      toast({
        title: 'Error',
        description: 'Failed to load hero banners',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createHeroBanner = async (input: HeroBannerInput) => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .insert([input])
        .select()
        .single();

      if (error) throw error;
      
      await fetchHeroBanners();
      toast({
        title: 'Success',
        description: 'Hero banner created successfully',
      });
      return data;
    } catch (error: any) {
      console.error('Error creating hero banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to create hero banner',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateHeroBanner = async (id: string, input: Partial<HeroBannerInput>) => {
    try {
      const { data, error } = await supabase
        .from('hero_banners')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      await fetchHeroBanners();
      toast({
        title: 'Success',
        description: 'Hero banner updated successfully',
      });
      return data;
    } catch (error: any) {
      console.error('Error updating hero banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to update hero banner',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteHeroBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('hero_banners')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchHeroBanners();
      toast({
        title: 'Success',
        description: 'Hero banner deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting hero banner:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete hero banner',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const toggleHeroBanner = async (id: string, isActive: boolean) => {
    return updateHeroBanner(id, { is_active: isActive });
  };

  useEffect(() => {
    fetchHeroBanners();
  }, [activeOnly]);

  return {
    heroBanners,
    loading,
    fetchHeroBanners,
    createHeroBanner,
    updateHeroBanner,
    deleteHeroBanner,
    toggleHeroBanner,
  };
};
