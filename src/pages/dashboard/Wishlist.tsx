import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, ShoppingCart, Trash2, Package } from 'lucide-react';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[] | null;
    status: string;
    quantity: number;
  } | null;
}

const Wishlist = () => {
  const { isRTL } = useLanguage();
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && user) {
      fetchWishlist();
    }
  }, [user, authLoading]);

  const fetchWishlist = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('wishlist')
      .select(`
        id,
        product_id,
        created_at,
        product:products (
          id,
          name,
          price,
          images,
          status,
          quantity
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'خطا در بارگذاری علاقه‌مندی‌ها' : 'Failed to load wishlist',
        variant: 'destructive',
      });
    } else {
      setWishlist((data as unknown as WishlistItem[]) || []);
    }
    setLoading(false);
  };

  const removeFromWishlist = async (wishlistId: string) => {
    setRemovingIds(prev => new Set(prev).add(wishlistId));

    const { error } = await supabase
      .from('wishlist')
      .delete()
      .eq('id', wishlistId);

    if (error) {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'خطا در حذف از علاقه‌مندی‌ها' : 'Failed to remove from wishlist',
        variant: 'destructive',
      });
    } else {
      setWishlist(prev => prev.filter(item => item.id !== wishlistId));
      toast({
        title: isRTL ? 'حذف شد' : 'Removed',
        description: isRTL ? 'محصول از علاقه‌مندی‌ها حذف شد' : 'Product removed from wishlist',
      });
    }

    setRemovingIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(wishlistId);
      return newSet;
    });
  };

  const addToCart = (productName: string) => {
    // Placeholder for cart functionality
    toast({
      title: isRTL ? 'به سبد اضافه شد' : 'Added to Cart',
      description: isRTL ? `${productName} به سبد خرید اضافه شد` : `${productName} added to cart`,
    });
  };

  const texts = {
    title: isRTL ? 'علاقه‌مندی‌ها' : 'Wishlist',
    description: isRTL ? 'محصولات مورد علاقه شما' : 'Your favorite products',
    empty: isRTL ? 'لیست علاقه‌مندی‌های شما خالی است' : 'Your wishlist is empty',
    emptyDesc: isRTL ? 'محصولات مورد علاقه خود را به لیست اضافه کنید' : 'Add your favorite products to the list',
    browseProducts: isRTL ? 'مشاهده محصولات' : 'Browse Products',
    addToCart: isRTL ? 'افزودن به سبد' : 'Add to Cart',
    remove: isRTL ? 'حذف' : 'Remove',
    outOfStock: isRTL ? 'ناموجود' : 'Out of Stock',
    unavailable: isRTL ? 'محصول ناموجود است' : 'Product unavailable',
  };

  const formatPrice = (price: number) => {
    return isRTL 
      ? `${price.toLocaleString('fa-IR')} افغانی`
      : `${price.toLocaleString()} AFN`;
  };

  return (
    <DashboardLayout 
      title={texts.title} 
      description={texts.description}
      allowedRoles={['buyer']}
    >
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-3 sm:p-4 space-y-3 sm:space-y-4">
                  <Skeleton className="w-full h-32 sm:h-40 rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-10 sm:h-9 flex-1" />
                    <Skeleton className="h-10 sm:h-9 w-10 sm:w-9" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{texts.empty}</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">{texts.emptyDesc}</p>
            <Button onClick={() => navigate('/products')} className="min-h-[44px]">
              <Package className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {texts.browseProducts}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {wishlist.map((item) => {
              const product = item.product;
              const isAvailable = product && product.status === 'active' && product.quantity > 0;
              const imageUrl = product?.images?.[0] || '/placeholder.svg';

              return (
                <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-lg">
                  <CardContent className="p-0">
                    {/* Product Image */}
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <img
                        src={imageUrl}
                        alt={product?.name || ''}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                      {!isAvailable && product && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                          <span className="text-muted-foreground font-medium">
                            {texts.outOfStock}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="p-4 space-y-3">
                      {product ? (
                        <>
                          <h3 
                            className="font-medium text-foreground line-clamp-2 cursor-pointer hover:text-primary transition-colors"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            {product.name}
                          </h3>
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(product.price)}
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground text-sm">{texts.unavailable}</p>
                      )}

                      {/* Actions - Touch-friendly */}
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1 min-h-[44px]"
                          disabled={!isAvailable}
                          onClick={() => product && addToCart(product.name)}
                        >
                          <ShoppingCart className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                          {texts.addToCart}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive min-h-[44px] min-w-[44px]"
                          disabled={removingIds.has(item.id)}
                          onClick={() => removeFromWishlist(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wishlist;