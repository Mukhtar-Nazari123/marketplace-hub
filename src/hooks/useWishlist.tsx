import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
}

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  addToWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  itemCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth();
  const { isRTL } = useLanguage();

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlist')
        .select('id, product_id, created_at')
        .eq('user_id', user.id);

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addToWishlist = async (productId: string): Promise<boolean> => {
    if (!user) {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'لطفاً ابتدا وارد شوید' : 'Please login first',
        variant: 'destructive',
      });
      return false;
    }

    if (role !== 'buyer') {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'فقط خریداران می‌توانند به علاقه‌مندی‌ها اضافه کنند' : 'Only buyers can add to wishlist',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('wishlist')
        .insert({ user_id: user.id, product_id: productId })
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [...prev, data]);
      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'محصول به علاقه‌مندی‌ها اضافه شد' : 'Added to wishlist',
      });
      return true;
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'خطا در افزودن به علاقه‌مندی‌ها' : 'Failed to add to wishlist',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.product_id !== productId));
      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'محصول از علاقه‌مندی‌ها حذف شد' : 'Removed from wishlist',
      });
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some(item => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider value={{
      items,
      loading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      itemCount: items.length,
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
