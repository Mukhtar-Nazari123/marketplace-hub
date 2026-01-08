import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/lib/i18n';
import { toast } from 'sonner';

interface NewsletterSubscriber {
  id: string;
  email: string;
  status: 'active' | 'unsubscribed';
  subscribed_at: string;
  unsubscribed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Hook for subscribing (public - uses edge function)
export const useNewsletterSubscribe = () => {
  const { language } = useLanguage();

  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(
        'https://bwdsswkrlomfwhwpkwww.supabase.co/functions/v1/newsletter-subscribe',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, locale: language }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      return data;
    },
  });
};

// Hook for admin to fetch all subscribers
export const useNewsletterSubscribers = () => {
  return useQuery({
    queryKey: ['newsletter-subscribers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('subscribed_at', { ascending: false });

      if (error) throw error;
      return data as NewsletterSubscriber[];
    },
  });
};

// Hook for admin to update subscriber status
export const useUpdateSubscriberStatus = () => {
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'active' | 'unsubscribed' }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'unsubscribed') {
        updateData.unsubscribed_at = new Date().toISOString();
      } else {
        updateData.unsubscribed_at = null;
      }

      const { error } = await supabase
        .from('newsletter_subscribers')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      toast.success(isRTL ? 'وضعیت بروزرسانی شد' : 'Status updated');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Hook for admin to delete subscriber
export const useDeleteSubscriber = () => {
  const queryClient = useQueryClient();
  const { isRTL } = useLanguage();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-subscribers'] });
      toast.success(isRTL ? 'عضو حذف شد' : 'Subscriber deleted');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Export subscribers to CSV
export const exportSubscribersToCSV = (subscribers: NewsletterSubscriber[]) => {
  const headers = ['Email', 'Status', 'Subscribed At', 'Unsubscribed At'];
  const rows = subscribers.map(sub => [
    sub.email,
    sub.status,
    new Date(sub.subscribed_at).toLocaleString(),
    sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleString() : '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};
