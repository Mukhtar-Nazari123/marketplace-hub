import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductRatings } from "@/hooks/useProductRatings";
import { getLocalizedProductName } from "@/lib/localizedProduct";

interface DealProduct {
  id: string;
  name: string;
  name_en?: string | null;
  name_fa?: string | null;
  name_ps?: string | null;
  price_afn: number;
  compare_price_afn: number | null;
  images: string[];
  created_at: string;
  is_deal: boolean;
  deal_start_at: string | null;
  deal_end_at: string | null;
}

const TodayDeals = () => {
  const { t, isRTL, language } = useLanguage();
  const [products, setProducts] = useState<DealProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const productIds = products.map((p) => p.id);
  const { getRating, loading: ratingsLoading } = useProductRatings(productIds);

  useEffect(() => {
    fetchActiveDeals();

    // Refresh deals every minute to check for expired ones
    const interval = setInterval(fetchActiveDeals, 60000);
    return () => clearInterval(interval);
  }, [language]);

  const fetchActiveDeals = async () => {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("products_with_translations")
        .select("id, name, name_en, name_fa, name_ps, price_afn, compare_price_afn, images, created_at, is_deal, deal_start_at, deal_end_at")
        .eq("status", "active")
        .eq("is_deal", true)
        .lte("deal_start_at", now)
        .gte("deal_end_at", now)
        .order("deal_end_at", { ascending: true })
        .limit(10);

      if (error) throw error;
      setProducts((data || []).map(p => ({ ...p, name: p.name || 'Untitled' })) as DealProduct[]);
    } catch (error) {
      console.error("Error fetching deal products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateArrowVisibility = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const isAtStart = isRTL ? scrollLeft >= -10 : scrollLeft <= 10;
    const isAtEnd = isRTL
      ? scrollLeft <= -(scrollWidth - clientWidth - 10)
      : scrollLeft >= scrollWidth - clientWidth - 10;

    setShowLeftArrow(!isAtStart);
    setShowRightArrow(!isAtEnd);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    updateArrowVisibility();
    container.addEventListener("scroll", updateArrowVisibility);
    return () => container.removeEventListener("scroll", updateArrowVisibility);
  }, [products, isRTL]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const newScrollLeft =
      direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  const getProductCardData = (product: DealProduct) => {
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
      discount,
      image: product.images?.[0],
      currency,
      isDeal: product.is_deal,
      dealStartAt: product.deal_start_at,
      dealEndAt: product.deal_end_at,
    };
  };

  // Don't render section if no active deals
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="py-1 bg-background">
      <div className="container px-2 sm:px-3 lg:px-4">
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
        </div>

        {/* Products - Horizontal Scroll with Floating Arrows */}
        <div className="relative group">
          {/* Left Scroll Button - Floating */}
          <Button
            variant="secondary"
            size="icon"
            className={`absolute ${isRTL ? "right-0" : "left-0"} top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border border-border hover:bg-background transition-opacity duration-200 hidden md:flex ${showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={() => scroll(isRTL ? "right" : "left")}
          >
            {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>

          {/* Right Scroll Button - Floating */}
          <Button
            variant="secondary"
            size="icon"
            className={`absolute ${isRTL ? "left-0" : "right-0"} top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border border-border hover:bg-background transition-opacity duration-200 hidden md:flex ${showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            onClick={() => scroll(isRTL ? "left" : "right")}
          >
            {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>

          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 scroll-smooth px-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {isLoading
              ? [...Array(5)].map((_, index) => (
                  <div key={index} className="w-[200px] md:w-[220px] flex-shrink-0 space-y-3">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-14 rounded-lg" />
                  </div>
                ))
              : products.map((product, index) => (
                  <div
                    key={product.id}
                    className="w-[200px] md:w-[220px] flex-shrink-0 opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
                  >
                    <ProductCard {...getProductCardData(product)} />
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TodayDeals;
