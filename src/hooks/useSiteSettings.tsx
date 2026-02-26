import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage, Language } from '@/lib/i18n';
import { useEffect } from 'react';

export interface SiteSettings {
  id: string;
  site_name_en: string;
  site_name_fa: string;
  site_name_ps: string | null;
  logo_url: string | null;
  footer_logo_url: string | null;
  favicon_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  const { language } = useLanguage();
  const lang = language as Language;
  
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .single();
      
      if (error) throw error;
      return data as SiteSettings;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Get localized site name
  const getSiteName = () => {
    if (!settings) {
      if (lang === 'ps') return 'مارکېټ';
      if (lang === 'fa') return 'مارکت';
      return 'Market';
    }
    if (lang === 'ps') return settings.site_name_ps || settings.site_name_fa || settings.site_name_en;
    if (lang === 'fa') return settings.site_name_fa || settings.site_name_en;
    return settings.site_name_en;
  };

  const siteName = getSiteName();

  // Dynamically update favicon
  useEffect(() => {
    if (settings?.favicon_url) {
      const existingFavicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (existingFavicon) {
        existingFavicon.href = settings.favicon_url;
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = settings.favicon_url;
        document.head.appendChild(link);
      }
    }
  }, [settings?.favicon_url]);

  return {
    settings,
    siteName,
    logoUrl: settings?.logo_url || null,
    footerLogoUrl: settings?.footer_logo_url || null,
    faviconUrl: settings?.favicon_url || null,
    isLoading,
    error,
  };
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<SiteSettings, 'id' | 'created_at' | 'updated_at'>>) => {
      // Get current settings first
      const { data: current, error: fetchError } = await supabase
        .from('site_settings')
        .select('id')
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('site_settings')
        .update(updates)
        .eq('id', current.id)
        .select()
        .single();

      if (error) throw error;
      return data as SiteSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });
};

export const uploadSiteAsset = async (file: File, folder: 'logo' | 'favicon'): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('site-assets')
    .upload(fileName, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('site-assets')
    .getPublicUrl(fileName);

  return publicUrl;
};
