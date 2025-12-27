import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  metadata: Record<string, unknown> | null;
}

const TodayDeals = () => {
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActiveProducts();
  }, []);

  const fetchActiveProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, compare_at_price, images, metadata')
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

  const getProductCardData = (product: Product) => {
    const metadata = product.metadata as { currency?: 'AFN' | 'USD' } | null;
    const currency = metadata?.currency || 'AFN';
    const discount = product.compare_at_price 
      ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
      : undefined;

    return {
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.compare_at_price || undefined,
      rating: 4,
      reviews: 0,
      badge: discount ? 'sale' as const : undefined,
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
            <Button variant="outline" size="icon" className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                className="opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
              >
                <ProductCard {...getProductCardData(product)} />
              </div>
            ))
          ) : (
            <div className="col-span-5 text-center py-12 text-muted-foreground">
              {isRTL ? 'هنوز محصولی فعال نشده است' : 'No active products yet'}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default TodayDeals;