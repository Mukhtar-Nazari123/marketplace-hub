import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductRatings } from "@/hooks/useProductRatings";

interface Product {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  is_featured: boolean;
  currency: string;
  created_at: string;
}

const BestSellers = () => {
  const { t, isRTL } = useLanguage();
  const { getRootCategories, loading: categoriesLoading } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const rootCategories = getRootCategories().slice(0, 5);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const productIds = products.map((p) => p.id);
  const { getRating } = useProductRatings(productIds);

  // Set first category as active when categories load
  useEffect(() => {
    if (rootCategories.length > 0 && !activeCategory) {
      setActiveCategory(rootCategories[0].slug);
    }
  }, [rootCategories, activeCategory]);

  useEffect(() => {
    fetchActiveProducts();
  }, []);

  const fetchActiveProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, images, is_featured, currency, created_at")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getProductCardData = (product: Product) => {
    const currency = (product.currency as "AFN" | "USD") || "AFN";

    // Handle inverted price scenario: if compare_at_price exists and differs from price
    // The original price is the higher value, current price is the lower value
    const hasDiscount = product.compare_at_price && product.compare_at_price !== product.price;
    let originalPrice: number | undefined;
    let currentPrice = product.price;
    let discount: number | undefined;

    if (hasDiscount) {
      // If compare_at_price > price, normal scenario
      // If compare_at_price < price, data is inverted - use compare_at_price as current
      if (product.compare_at_price! > product.price) {
        originalPrice = product.compare_at_price!;
        currentPrice = product.price;
      } else {
        originalPrice = product.price;
        currentPrice = product.compare_at_price!;
      }
      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    // Check if product is new (created within last 7 days)
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
    <section className="py-12 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange px-4 py-2 rounded-lg">
              <h2 className="font-display font-bold text-lg text-accent-foreground">
                {t.bestSellers.weeklyBestSellers}
              </h2>
            </div>
            <Button variant="link" className="text-muted-foreground hover:text-cyan gap-1">
              {t.deals.seeAll} <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {categoriesLoading ? (
              [...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-24" />)
            ) : rootCategories.length > 0 ? (
              rootCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${
                    activeCategory === category.slug
                      ? "bg-cyan text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {category.name}
                </button>
              ))
            ) : (
              <span className="text-sm text-muted-foreground">{isRTL ? "دسته‌بندی موجود نیست" : "No categories"}</span>
            )}
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
              {isRTL ? "هنوز محصولی فعال نشده است" : "No active products yet"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
