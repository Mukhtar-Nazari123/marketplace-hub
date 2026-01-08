import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductRatings } from "@/hooks/useProductRatings";

interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  currency: string;
  created_at: string;
}

const TodayDeals = () => {
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const productIds = products.map(p => p.id);
  const { getRating, loading: ratingsLoading } = useProductRatings(productIds);

  useEffect(() => {
    fetchActiveProducts();
  }, []);

  const fetchActiveProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, compare_at_price, images, currency, created_at')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: isRTL ? 300 : -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: isRTL ? -300 : 300, behavior: 'smooth' });
    }
  };

  const getProductCardData = (product: Product) => {
    const currency = (product.currency as 'AFN' | 'USD') || 'AFN';
    
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
      discount,
      image: product.images?.[0],
      currency,
      countdown: { hours: 90, minutes: 48, seconds: 53 },
    };
  };

  return (
    <section className="py-12 bg-background">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 text-accent-foreground" />
              <h2 className="font-display font-bold text-lg text-accent-foreground">{t.deals.todayDeal}</h2>
            </div>
            <Button variant="link" className="text-muted-foreground hover:text-cyan gap-1">
              {t.deals.seeAll}
              {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full" onClick={scrollRight}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" onClick={scrollLeft}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products - Horizontal Scroll */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {isLoading ? (
            [...Array(5)].map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : products.length > 0 ? (
            products.map((product, index) => (
              <div
                key={product.id}
                className="w-[160px] md:w-[180px] lg:w-[200px] flex-shrink-0 opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
              >
                <ProductCard {...getProductCardData(product)} />
              </div>
            ))
          ) : (
            <div className="w-full text-center py-12 text-muted-foreground">
              {isRTL ? 'هنوز محصولی فعال نشده است' : 'No active products yet'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TodayDeals;
