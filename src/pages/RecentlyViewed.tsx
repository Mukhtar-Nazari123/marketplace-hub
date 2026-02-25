import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useProductRatings } from '@/hooks/useProductRatings';
import { getLocalizedProductName, LocalizableProduct } from '@/lib/localizedProduct';
import { supabase } from '@/integrations/supabase/client';
import PublicLayout from '@/components/layout/PublicLayout';
import ProductCard from '@/components/home/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Clock, Trash2 } from 'lucide-react';

const RecentlyViewed = () => {
  const { language, isRTL } = useLanguage();
  const { productIds, clearAll, count } = useRecentlyViewed();
  const { getRating } = useProductRatings(productIds);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const l = (en: string, fa: string, ps: string) => {
    if (language === 'fa') return fa;
    if (language === 'ps') return ps;
    return en;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('products_with_translations')
        .select('*, product_media(url, is_primary, sort_order)')
        .in('id', productIds)
        .eq('status', 'approved');

      if (data) {
        const ordered = productIds
          .map(id => data.find((p: any) => p.id === id))
          .filter(Boolean);
        setProducts(ordered);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [productIds]);

  const getCardData = (product: any) => {
    const price = product.price_afn || 0;
    const comparePrice = product.compare_price_afn;
    const hasDiscount = comparePrice && comparePrice !== price;
    let originalPrice: number | undefined;
    let currentPrice = price;
    let discount: number | undefined;

    if (hasDiscount) {
      if (comparePrice > price) {
        originalPrice = comparePrice;
        currentPrice = price;
      } else {
        originalPrice = price;
        currentPrice = comparePrice;
      }
      discount = Math.round(((originalPrice! - currentPrice) / originalPrice!) * 100);
    }

    const primaryMedia = product.product_media
      ?.filter((m: any) => m.is_primary)
      ?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0];
    const image = primaryMedia?.url || product.product_media?.[0]?.url;

    const isNew = product.created_at
      ? new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      : false;

    const { averageRating, reviewCount } = getRating(product.id);

    return {
      id: product.id,
      name: getLocalizedProductName(product as LocalizableProduct, language),
      price: currentPrice,
      originalPrice,
      rating: averageRating,
      reviews: reviewCount,
      isNew,
      isHot: product.is_featured || false,
      discount,
      image,
      currency: 'AFN' as const,
    };
  };

  return (
    <PublicLayout>
      <div className="container px-4 py-6 max-w-6xl mx-auto" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              {l('Recently Viewed', 'بازدیدهای اخیر', 'وروستي لیدنې')}
            </h1>
            {count > 0 && (
              <span className="text-sm text-muted-foreground">({count})</span>
            )}
          </div>
          {count > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4 mr-1" />
              {l('Clear', 'پاک کردن', 'پاکول')}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Clock className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">
              {l('No recently viewed products', 'محصول اخیری مشاهده نشده', 'وروستي لیدل شوي محصولات نشته')}
            </h2>
            <p className="text-sm text-muted-foreground">
              {l('Products you view will appear here', 'محصولاتی که مشاهده می‌کنید اینجا نمایش داده می‌شود', 'هغه محصولات چې تاسو یې ګورئ دلته ښکاره کیږي')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => {
              const cardData = getCardData(product);
              return <ProductCard key={product.id} {...cardData} />;
            })}
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default RecentlyViewed;
