import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useLanguage } from "@/lib/i18n";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductRatings } from "@/hooks/useProductRatings";

interface DealProduct {
  id: string;
  name: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  currency: string;
  created_at: string;
  is_deal: boolean;
  deal_start_at: string | null;
  deal_end_at: string | null;
}

const TodayDeals = () => {
  const { t, isRTL } = useLanguage();
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
  }, []);

  const fetchActiveDeals = async () => {
    try {
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, images, currency, created_at, is_deal, deal_start_at, deal_end_at")
        .eq("status", "active")
        .eq("is_deal", true)
        .lte("deal_start_at", now) // Deal has started
        .gte("deal_end_at", now) // Deal hasn't ended
        .order("deal_end_at", { ascending: true }) // Show soonest expiring first
        .limit(10);

      if (error) throw error;
      setProducts((data as DealProduct[]) || []);
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
    const newScrollLeft = direction === "left"
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({ left: newScrollLeft, behavior: "smooth" });
  };

  const getProductCardData = (product: DealProduct) => {
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
      discount,
      image: product.images?.[0],
      currency,
      // Pass real deal data for countdown
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
    <section className="py-12 pt-1 bg-background">
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
        </div>

        {/* Products - Horizontal Scroll with Floating Arrows */}
        <div className="relative group">
          {/* Left Scroll Button - Floating */}
          <Button
            variant="secondary"
            size="icon"
            className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border border-border hover:bg-background transition-opacity duration-200 hidden md:flex ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => scroll(isRTL ? "right" : "left")}
          >
            {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>

          {/* Right Scroll Button - Floating */}
          <Button
            variant="secondary"
            size="icon"
            className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border border-border hover:bg-background transition-opacity duration-200 hidden md:flex ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
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
