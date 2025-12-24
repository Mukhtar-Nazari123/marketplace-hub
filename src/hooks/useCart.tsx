import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/i18n';

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    name: string;
    price: number;
    images: string[] | null;
    quantity: number;
  };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  loading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<boolean>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user, role } = useAuth();
  const { isRTL } = useLanguage();

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          id,
          product_id,
          quantity,
          products (
            id,
            name,
            price,
            images,
            quantity
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setItems((data || []).map(item => ({
        ...item,
        product: item.products as CartItem['product']
      })));
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number = 1): Promise<boolean> => {
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
        description: isRTL ? 'فقط خریداران می‌توانند به سبد خرید اضافه کنند' : 'Only buyers can add to cart',
        variant: 'destructive',
      });
      return false;
    }

    try {
      const existingItem = items.find(item => item.product_id === productId);

      if (existingItem) {
        const { error } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart')
          .insert({ user_id: user.id, product_id: productId, quantity });

        if (error) throw error;
      }

      await fetchCart();
      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'محصول به سبد خرید اضافه شد' : 'Product added to cart',
      });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'خطا در افزودن به سبد خرید' : 'Failed to add to cart',
        variant: 'destructive',
      });
      return false;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.product_id !== productId));
      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'محصول از سبد خرید حذف شد' : 'Product removed from cart',
      });
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || quantity < 1) return;

    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setItems(prev => prev.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      ));
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      setItems([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const isInCart = (productId: string) => {
    return items.some(item => item.product_id === productId);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isInCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
