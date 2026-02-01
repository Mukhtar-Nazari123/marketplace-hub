import { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { useProductRatings } from "@/hooks/useProductRatings";
import { getLocalizedProductName } from "@/lib/localizedProduct";

interface Product {
  id: string;
  name: string;
  name_en?: string | null;
  name_fa?: string | null;
  name_ps?: string | null;
  price_afn: number;
  compare_price_afn: number | null;
  images: string[];
  is_featured: boolean;
  created_at: string;
}

const PRODUCTS_PER_PAGE = 12;

const DiscoverProducts = () => {
  const { t, isRTL, language } = useLanguage();
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
        .from("products_with_translations")
        .select("id, name, name_en, name_fa, name_ps, price_afn, compare_price_afn, images, is_featured, created_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(pageNum * PRODUCTS_PER_PAGE, (pageNum + 1) * PRODUCTS_PER_PAGE - 1);

      if (error) throw error;

      const newProducts = ((data || []).map(p => ({ ...p, name: p.name || 'Untitled' }))) as Product[];

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
  }, [fetchProducts, language]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProducts(nextPage, true);
  };

  const getProductCardData = (product: Product) => {
    const currency = "AFN" as const;

    const hasDiscount = product.compare_price_afn && product.compare_price_afn !== product.price_afn;
    let originalPrice: number | undefined;
    let currentPrice = product.price_afn;
    let discount: number | undefined;

    if (hasDiscount) {
      if (product.compare_price_afn! > product.price_afn) {
        originalPrice = product.compare_price_afn!;
        currentPrice = product.price_afn;
      } else {
        originalPrice = product.price_afn;
        currentPrice = product.compare_price_afn!;
      }
      discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const { averageRating, reviewCount } = getRating(product.id);

    return {
      id: product.id,
      name: getLocalizedProductName(product, language),
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
        <div className="container px-1 sm:px-1.5 lg:px-2">
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

  // Localized text
  const texts = {
    en: { title: "Discover Products", subtitle: "Explore popular and trending items from all categories", loadMore: "Load More", loading: "Loading..." },
    fa: { title: "کشف محصولات", subtitle: "محصولات محبوب و پرطرفدار از تمام دسته‌بندی‌ها را کاوش کنید", loadMore: "نمایش بیشتر", loading: "در حال بارگذاری..." },
    ps: { title: "محصولات کشف کړئ", subtitle: "له ټولو کټګوریو څخه مشهور او ترنډي توکي وپلټئ", loadMore: "نور وښایاست", loading: "پورته کیږي..." }
  };
  const localText = texts[language as keyof typeof texts] || texts.en;

  return (
    <section className="py-1 bg-background">
      <div className="container px-1 sm:px-1.5 lg:px-2">
        {/* Section Header */}
        <div className="mb-6">
          <h2 className="font-display font-bold text-2xl text-foreground mb-1">
            {localText.title}
          </h2>
          <p className="text-sm text-muted-foreground">
            {localText.subtitle}
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
                  {localText.loading}
                </>
              ) : (
                localText.loadMore
              )}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default DiscoverProducts;
