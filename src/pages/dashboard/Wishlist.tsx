import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Heart, Package } from 'lucide-react';
import ProductCard from '@/components/home/ProductCard';
import { useProductRatings } from '@/hooks/useProductRatings';

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: {
    id: string;
    name: string;
    price: number;
    compare_at_price: number | null;
    images: string[] | null;
    status: string;
    quantity: number;
    is_featured: boolean;
    currency: string;
    created_at: string;
  } | null;
}

const Wishlist = () => {
  const { isRTL, language } = useLanguage();
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Get product IDs for ratings
  const productIds = wishlist
    .filter(item => item.product !== null)
    .map(item => item.product!.id);
  const { getRating } = useProductRatings(productIds);

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
          compare_at_price,
          images,
          status,
          quantity,
          is_featured,
          currency,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching wishlist:', error);
      toast({
        title: language === 'ps' ? 'تېروتنه' : language === 'fa' ? 'خطا' : 'Error',
        description: language === 'ps' ? 'د خوښې لیست پورته کولو کې تېروتنه' : language === 'fa' ? 'خطا در بارگذاری علاقه‌مندی‌ها' : 'Failed to load wishlist',
        variant: 'destructive',
      });
    } else {
      setWishlist((data as unknown as WishlistItem[]) || []);
    }
    setLoading(false);
  };

  const texts = {
    en: {
      title: 'Wishlist',
      description: 'Your favorite products',
      empty: 'Your wishlist is empty',
      emptyDesc: 'Add your favorite products to the list',
      browseProducts: 'Browse Products',
    },
    fa: {
      title: 'علاقه‌مندی‌ها',
      description: 'محصولات مورد علاقه شما',
      empty: 'لیست علاقه‌مندی‌های شما خالی است',
      emptyDesc: 'محصولات مورد علاقه خود را به لیست اضافه کنید',
      browseProducts: 'مشاهده محصولات',
    },
    ps: {
      title: 'د خوښې لیست',
      description: 'ستاسو خوښې محصولات',
      empty: 'ستاسو د خوښې لیست خالي دی',
      emptyDesc: 'خپل خوښ محصولات لیست ته اضافه کړئ',
      browseProducts: 'محصولات وګورئ',
    },
  };

  const t = texts[language as keyof typeof texts] || texts.en;

  const getProductCardData = (product: WishlistItem['product']) => {
    if (!product) return null;

    const currency = (product.currency as "AFN" | "USD") || "AFN";
    const hasDiscount = product.compare_at_price && product.compare_at_price !== product.price;
    let originalPrice: number | undefined;
    let currentPrice = product.price;
    let discount: number | undefined;

    if (hasDiscount) {
      if (product.compare_at_price! > product.price) {
        originalPrice = product.compare_at_price!;
        currentPrice = product.price;
      } else {
        originalPrice = product.price;
        currentPrice = product.compare_at_price!;
      }
      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { averageRating, reviewCount } = getRating(product.id);

    return {
      id: product.id,
      name: product.name,
      price: currentPrice,
      originalPrice,
      rating: averageRating,
      reviews: reviewCount,
      isNew,
      isHot: product.is_featured,
      discount,
      image: product.images?.[0],
      currency,
    };
  };

  return (
    <DashboardLayout 
      title={t.title} 
      description={t.description}
      allowedRoles={['buyer']}
    >
      <div className="space-y-4 sm:space-y-6 animate-fade-in">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center px-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">{t.empty}</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">{t.emptyDesc}</p>
            <Button onClick={() => navigate('/products')} className="min-h-[44px]">
              <Package className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t.browseProducts}
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {wishlist.map((item, index) => {
              const cardData = getProductCardData(item.product);
              if (!cardData) return null;

              return (
                <div
                  key={item.id}
                  className="opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index, 11) * 50}ms`, animationFillMode: "forwards" }}
                >
                  <ProductCard {...cardData} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Wishlist;