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

interface WishlistProduct {
  id: string;
  name_en: string | null;
  name_fa: string | null;
  name_ps: string | null;
  price_afn: number | null;
  compare_price_afn: number | null;
  images: string[] | null;
  status: string | null;
  quantity: number | null;
  is_featured: boolean | null;
  created_at: string | null;
}

interface WishlistItem {
  id: string;
  product_id: string;
  created_at: string;
  product: WishlistProduct | null;
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

  // Helper for localized product name
  const getProductName = (product: WishlistProduct | null): string => {
    if (!product) return '';
    if (language === 'ps') return product.name_ps || product.name_fa || product.name_en || '';
    if (language === 'fa') return product.name_fa || product.name_en || '';
    return product.name_en || '';
  };

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
        product:products_with_translations (
          id,
          name_en,
          name_fa,
          name_ps,
          price_afn,
          compare_price_afn,
          images,
          status,
          quantity,
          is_featured,
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

  const getProductCardData = (product: WishlistProduct | null) => {
    if (!product) return null;

    const currency: "AFN" | "USD" = "AFN";
    const price = product.price_afn || 0;
    const comparePrice = product.compare_price_afn;
    const hasDiscount = comparePrice && comparePrice !== price;
    let originalPrice: number | undefined;
    let currentPrice = price;
    let discount: number | undefined;

    if (hasDiscount) {
      if (comparePrice! > price) {
        originalPrice = comparePrice!;
        currentPrice = price;
      } else {
        originalPrice = price;
        currentPrice = comparePrice!;
      }
      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    const isNew = product.created_at ? new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) : false;
    const { averageRating, reviewCount } = getRating(product.id);

    return {
      id: product.id,
      name: getProductName(product),
      price: currentPrice,
      originalPrice,
      rating: averageRating,
      reviews: reviewCount,
      isNew,
      isHot: product.is_featured || false,
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