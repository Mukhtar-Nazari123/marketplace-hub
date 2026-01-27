import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
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

const PRODUCTS_PER_PAGE = 12;

const DiscoverProducts = () => {
  const { t, isRTL } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const productIds = products.map((p) => p.id);
  const { getRating } = useProductRatings(productIds);

  const fetchProducts = useCallback(async (pageNum: number, append: boolean = false) => {
    if (pageNum === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, images, is_featured, currency, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(pageNum * PRODUCTS_PER_PAGE, (pageNum + 1) * PRODUCTS_PER_PAGE - 1);

      if (error) throw error;

      const newProducts = (data as Product[]) || [];

      // Shuffle products for random appearance
      const shuffled = [...newProducts].sort(() => Math.random() - 0.5);

      if (append) {
        setProducts((prev) => [...prev, ...shuffled]);
      } else {
        setProducts(shuffled);
      }

      setHasMore(newProducts.length === PRODUCTS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(0);
  }, [fetchProducts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const getProductCardData = (product: Product) => {
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

  if (isLoading) {
    return (
      <section className="py-1 bg-background">
        <div className="container">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-background">
      <div className="container">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="font-display font-bold text-2xl text-foreground mb-1">
            {isRTL ? "کشف محصولات" : "Discover Products"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isRTL
              ? "محصولات محبوب و پرطرفدار از تمام دسته‌بندی‌ها را کاوش کنید"
              : "Explore popular and trending items from all categories"}
          </p>
        </div>

        {/* Product Grid - Responsive */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${Math.min(index, 11) * 50}ms`, animationFillMode: "forwards" }}
            >
              <ProductCard {...getProductCardData(product)} />
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <Button variant="outline" size="lg" onClick={loadMore} disabled={isLoadingMore} className="min-w-[200px]">
              {isLoadingMore ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  {isRTL ? "در حال بارگذاری..." : "Loading..."}
                </>
              ) : isRTL ? (
                "نمایش بیشتر"
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DiscoverProducts;
