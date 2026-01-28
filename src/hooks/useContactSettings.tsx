import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage, Language } from '@/lib/i18n';

export interface ContactSettings {
  id: string;
  address_en: string | null;
  address_fa: string | null;
  address_ps: string | null;
  phone: string | null;
  support_email: string | null;
  working_hours_en: string | null;
  working_hours_fa: string | null;
  working_hours_ps: string | null;
  updated_at: string;
  updated_by: string | null;
  created_at: string;
}

export const useContactSettings = () => {
  const { language } = useLanguage();
  const lang = language as Language;

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['contact-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_contact_settings')
        .select('*')
        .single();

      if (error) throw error;
      return data as ContactSettings;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Get localized values
  const getLocalizedAddress = () => {
    if (!settings) return lang === 'ps' ? 'کابل، افغانستان' : lang === 'fa' ? 'کابل، افغانستان' : 'Kabul, Afghanistan';
    if (lang === 'ps') return settings.address_ps || settings.address_fa || settings.address_en;
    if (lang === 'fa') return settings.address_fa || settings.address_en;
    return settings.address_en;
  };

  const getLocalizedWorkingHours = () => {
    if (!settings) {
      if (lang === 'ps') return 'شنبه - پنجشنبه: ۹:۰۰ سهار - ۶:۰۰ ماښام';
      if (lang === 'fa') return 'شنبه - پنجشنبه: ۹:۰۰ صبح - ۶:۰۰ عصر';
      return 'Saturday - Thursday: 9:00 AM - 6:00 PM';
    }
    if (lang === 'ps') return settings.working_hours_ps || settings.working_hours_fa || settings.working_hours_en;
    if (lang === 'fa') return settings.working_hours_fa || settings.working_hours_en;
    return settings.working_hours_en;
  };

  return {
    settings,
    address: getLocalizedAddress() || (lang === 'fa' ? 'کابل، افغانستان' : 'Kabul, Afghanistan'),
    phone: settings?.phone || '+93 70 123 4567',
    email: settings?.support_email || 'support@market.af',
    workingHours: getLocalizedWorkingHours() || (lang === 'fa' ? 'شنبه - پنجشنبه: ۹:۰۰ صبح - ۶:۰۰ عصر' : 'Saturday - Thursday: 9:00 AM - 6:00 PM'),
    isLoading,
    error,
  };
};

export const useUpdateContactSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Omit<ContactSettings, 'id' | 'created_at' | 'updated_at'>>) => {
      // Get current user for updated_by
      const { data: { user } } = await supabase.auth.getUser();

      // Get current settings first
      const { data: current, error: fetchError } = await supabase
        .from('site_contact_settings')
        .select('id')
        .single();

      if (fetchError) throw fetchError;

      const { data, error } = await supabase
        .from('site_contact_settings')
        .update({
          ...updates,
          updated_by: user?.id || null,
        })
        .eq('id', current.id)
        .select()
        .single();

      if (error) throw error;
      return data as ContactSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-settings'] });
    },
  });
};
