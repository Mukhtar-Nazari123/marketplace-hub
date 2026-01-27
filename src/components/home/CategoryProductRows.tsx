import { ChevronLeft, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { useCategories, Category } from "@/hooks/useCategories";
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

interface CategoryRowProps {
  category: Category;
  isRTL: boolean;
  t: any;
}

const CategoryRow = ({ category, isRTL, t }: CategoryRowProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const productIds = products.map((p) => p.id);
  const { getRating } = useProductRatings(productIds);

  useEffect(() => {
    fetchProducts();
  }, [category.id]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, compare_at_price, images, is_featured, currency, created_at")
        .eq("status", "active")
        .eq("category_id", category.id)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setProducts((data as Product[]) || []);
    } catch (error) {
      console.error("Error fetching products for category:", category.name, error);
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

  // Don't render if no products
  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <div className="mb-10">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display font-bold text-xl text-foreground">
            {isRTL && category.name_fa ? category.name_fa : category.name}
          </h3>
          <Link
            to={`/products?category=${category.slug}`}
            className="text-sm text-muted-foreground hover:text-cyan flex items-center gap-1 transition-colors"
          >
            {t.deals.seeAll}
            {isRTL ? <ArrowLeft className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
          </Link>
        </div>
      </div>

      {/* Horizontal Scroll Container */}
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
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2 px-1"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {isLoading
            ? [...Array(5)].map((_, index) => (
                <div key={index} className="flex-shrink-0 w-48 md:w-56">
                  <div className="space-y-3">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))
            : products.map((product, index) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-48 md:w-56 opacity-0 animate-fade-in-up"
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
                >
                  <ProductCard {...getProductCardData(product)} />
                </div>
              ))}
        </div>
      </div>
    </div>
  );
};

const CategoryProductRows = () => {
  const { t, isRTL } = useLanguage();
  const { categories, loading: categoriesLoading } = useCategories();
  const [categoriesWithProducts, setCategoriesWithProducts] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!categoriesLoading && categories.length > 0) {
      fetchCategoriesWithProducts();
    }
  }, [categories, categoriesLoading]);

  const fetchCategoriesWithProducts = async () => {
    setIsLoading(true);
    try {
      // Get product counts per category
      const { data: productCounts, error } = await supabase
        .from("products")
        .select("category_id")
        .eq("status", "active");

      if (error) throw error;

      // Count products per category
      const countMap = new Map<string, number>();
      productCounts?.forEach((p) => {
        if (p.category_id) {
          countMap.set(p.category_id, (countMap.get(p.category_id) || 0) + 1);
        }
      });

      // Filter categories that have products
      const filtered = categories.filter((cat) => countMap.get(cat.id) && countMap.get(cat.id)! > 0);
      setCategoriesWithProducts(filtered);
    } catch (error) {
      console.error("Error fetching categories with products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (categoriesLoading || isLoading) {
    return (
      <section className="py-12 bg-background">
        <div className="container">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="mb-10">
              <Skeleton className="h-8 w-48 mb-4" />
              <div className="flex gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex-shrink-0 w-48 md:w-56">
                    <div className="space-y-3">
                      <Skeleton className="aspect-square rounded-lg" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (categoriesWithProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-1 bg-background">
      <div className="container">
        <div className="mb-8">
          <h2 className="font-display font-bold text-2xl text-foreground">
            {isRTL ? "خرید بر اساس دسته‌بندی" : "Shop by Category"}
          </h2>
        </div>

        {categoriesWithProducts.map((category) => (
          <CategoryRow key={category.id} category={category} isRTL={isRTL} t={t} />
        ))}
      </div>
    </section>
  );
};

export default CategoryProductRows;
