import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/lib/i18n';

export interface ContactSettings {
  id: string;
  address_en: string | null;
  address_fa: string | null;
  phone: string | null;
  support_email: string | null;
  working_hours_en: string | null;
  working_hours_fa: string | null;
  updated_at: string;
  updated_by: string | null;
  created_at: string;
}

export const useContactSettings = () => {
  const { language } = useLanguage();

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
  const address = settings
    ? (language === 'fa' ? settings.address_fa : settings.address_en)
    : null;

  const workingHours = settings
    ? (language === 'fa' ? settings.working_hours_fa : settings.working_hours_en)
    : null;

  return {
    settings,
    address: address || (language === 'fa' ? 'کابل، افغانستان' : 'Kabul, Afghanistan'),
    phone: settings?.phone || '+93 70 123 4567',
    email: settings?.support_email || 'support@market.af',
    workingHours: workingHours || (language === 'fa' ? 'شنبه - پنجشنبه: ۹:۰۰ صبح - ۶:۰۰ عصر' : 'Saturday - Thursday: 9:00 AM - 6:00 PM'),
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
