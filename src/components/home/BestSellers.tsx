import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductRatings } from "@/hooks/useProductRatings";
import { Link } from "react-router-dom";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const productIds = products.map((p) => p.id);
  const { getRating } = useProductRatings(productIds);

  useEffect(() => {
    fetchBestSellers();
  }, []);

  const fetchBestSellers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, images, is_featured, currency, created_at")
        .eq("status", "active")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(12);

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

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-orange px-4 py-2 rounded-lg">
            <h2 className="font-display font-bold text-lg text-accent-foreground">
              {t.bestSellers.weeklyBestSellers}
            </h2>
          </div>
          <Link to="/products" className="text-muted-foreground hover:text-cyan flex items-center gap-1">
            {t.deals.seeAll} {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          </Link>
        </div>
        <div className="relative group">
          {/* Left Scroll Button - Floating in middle */}
          <Button
            variant="secondary"
            size="icon"
            className={`absolute ${isRTL ? 'right-0' : 'left-0'} top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border border-border hover:bg-background transition-opacity duration-200 hidden md:flex ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={() => scroll(isRTL ? "right" : "left")}
          >
            {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>

          {/* Right Scroll Button - Floating in middle */}
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
            className="flex gap-4 pb-4 overflow-x-auto scrollbar-hide"
            style={{ scrollBehavior: "smooth" }}
          >
              {isLoading ? (
                [...Array(6)].map((_, index) => (
                  <div key={index} className="flex-shrink-0 w-[200px] md:w-[220px] space-y-3">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))
              ) : products.length > 0 ? (
                products.map((product, index) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-[200px] md:w-[220px] opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
                  >
                    <ProductCard {...getProductCardData(product)} />
                  </div>
                ))
              ) : (
              <div className="w-full text-center py-12 text-muted-foreground">
                {isRTL ? "هنوز محصولی فعال نشده است" : "No active products yet"}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
