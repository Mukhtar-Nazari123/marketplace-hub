import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  is_featured: boolean;
  metadata: Record<string, unknown> | null;
}

const BestSellers = () => {
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const categories = [
    t.categories.electronics,
    t.bestSellers.television,
    t.bestSellers.airConditional,
    t.bestSellers.laptopsAccessories,
    t.bestSellers.smartphoneTablets,
  ];
  
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  useEffect(() => {
    fetchActiveProducts();
  }, []);

  const fetchActiveProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, compare_at_price, images, is_featured, metadata')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
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
      badge: discount ? 'sale' as const : product.is_featured ? 'new' as const : undefined,
      discount,
      image: product.images?.[0],
      currency,
    };
  };

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange px-4 py-2 rounded-lg">
              <h2 className="font-display font-bold text-lg text-accent-foreground">{t.bestSellers.weeklyBestSellers}</h2>
            </div>
            <Button variant="link" className="text-muted-foreground hover:text-cyan gap-1">
              {t.deals.seeAll} <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${
                  activeCategory === category ? "bg-cyan text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
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

export default BestSellers;