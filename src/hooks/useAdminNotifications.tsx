import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type NotificationType = 'NEW_PRODUCT' | 'NEW_ORDER' | 'NEW_STORE';

export interface AdminNotification {
  id: string;
  type: NotificationType;
  title_en: string;
  title_fa: string;
  title_ps: string | null;
  message_en: string;
  message_fa: string;
  message_ps: string | null;
  related_entity_type: string | null;
  related_entity_id: string | null;
  product_name: string | null;
  product_image_url: string | null;
  order_total: number | null;
  order_currency: string | null;
  order_number: string | null;
  buyer_name: string | null;
  buyer_id: string | null;
  store_name: string | null;
  store_logo_url: string | null;
  seller_name: string | null;
  seller_id: string | null;
  is_read: boolean;
  created_at: string;
}

export const useAdminNotifications = (filter?: NotificationType | 'ALL') => {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-notifications', filter],
    queryFn: async () => {
      let query = supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter && filter !== 'ALL') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AdminNotification[];
    },
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['admin-notifications-unread-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('admin_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      
      if (error) throw error;
      return count || 0;
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-unread-count'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-notifications-unread-count'] });
    },
  });

  return {
    notifications,
    isLoading,
    unreadCount,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
};
