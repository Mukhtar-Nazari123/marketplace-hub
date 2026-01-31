import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/integrations/supabase/client";
import { FilterState } from "@/components/ui/ProductFilters";
import FilterBar from "@/components/products/FilterBar";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import StickyNavbar from "@/components/layout/StickyNavbar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Package, Heart, ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductRatings } from "@/hooks/useProductRatings";
import CompactRating from "@/components/ui/CompactRating";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { getLocalizedProductName } from "@/lib/localizedProduct";

interface DbProduct {
  id: string;
  name: string;
  name_en?: string | null;
  name_fa?: string | null;
  name_ps?: string | null;
  slug: string;
  price_afn: number;
  compare_price_afn: number | null;
  images: string[] | null;
  category_id: string | null;
  quantity: number;
  is_featured: boolean;
  metadata: Record<string, unknown> | null;
}

const Categories = () => {
  const { t, language, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const selectedCategorySlug = searchParams.get("category");
  const selectedSubcategorySlug = searchParams.get("subcategory");

  const {
    getRootCategories,
    getCategoryBySlug,
    getSubcategoryBySlug,
    getSubcategories,
    loading: categoriesLoading,
  } = useCategories();
  const rootCategories = getRootCategories();

  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 150000],
    rating: 0,
    brands: [],
    categories: [],
    inStock: false,
    onSale: false,
  });
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [categoryImages, setCategoryImages] = useState<Map<string, string>>(new Map());

  const currentCategory = selectedCategorySlug ? getCategoryBySlug(selectedCategorySlug) : undefined;
  const currentSubcategory = selectedSubcategorySlug ? getSubcategoryBySlug(selectedSubcategorySlug) : undefined;

  const ITEMS_PER_PAGE = 24;

  const getLocalizedName = (item?: { name: string; name_fa?: string | null; name_ps?: string | null } | null) => {
    if (!item) return "";
    if (language === 'ps') return item.name_ps || item.name_fa || item.name;
    if (language === 'fa') return item.name_fa || item.name;
    return item.name;
  };

  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  // Memoize subcategories to prevent infinite re-renders
  const subcategories = useMemo(() => {
    return currentCategory ? getSubcategories(currentCategory.id) : [];
  }, [currentCategory?.id, getSubcategories]);

  // Fetch one product image per category for display
  useEffect(() => {
    const fetchCategoryImages = async () => {
      if (rootCategories.length === 0) return;

      try {
        const imageMap = new Map<string, string>();

        // Fetch one product per category using product_media
        for (const cat of rootCategories) {
          // First get a product ID for this category
          const { data: product } = await supabase
            .from("products")
            .select("id")
            .eq("category_id", cat.id)
            .eq("status", "active")
            .limit(1)
            .maybeSingle();

          if (product?.id) {
            // Then get the primary image from product_media
            const { data: media } = await supabase
              .from("product_media")
              .select("url")
              .eq("product_id", product.id)
              .eq("media_type", "image")
              .order("sort_order")
              .limit(1)
              .maybeSingle();

            if (media?.url) {
              imageMap.set(cat.id, media.url);
            }
          }
        }

        setCategoryImages(imageMap);
      } catch (error) {
        console.error("Error fetching category images:", error);
      }
    };

    if (!categoriesLoading) {
      fetchCategoryImages();
    }
  }, [rootCategories, categoriesLoading]);

  // Fetch products from database
  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        let query = supabase
          .from("products_with_translations")
          .select(
            "id, name, name_en, name_fa, name_ps, slug, price_afn, compare_price_afn, images, category_id, quantity, is_featured, metadata",
          )
          .eq("status", "active");

        if (currentCategory) {
          if (currentSubcategory) {
            // Filter by subcategory_id when a subcategory is selected
            query = query.eq("subcategory_id", currentSubcategory.id);
          } else {
            // Filter by category_id when only category is selected
            query = query.eq("category_id", currentCategory.id);
          }
        }

        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) throw error;
        setDbProducts((data || []) as DbProduct[]);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setProductsLoading(false);
      }
    };

    if (!categoriesLoading) {
      fetchProducts();
    }
  }, [currentCategory?.id, currentSubcategory?.id, subcategories, categoriesLoading, language]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategorySlug, selectedSubcategorySlug, filters, sortBy]);

  // Convert DB products to display format
  const displayProducts = useMemo(() => {
    return dbProducts.map((p) => {
      const metadata = p.metadata as { brand?: string } | null;
      const currency = "AFN";

      const hasComparePrice = p.compare_price_afn && p.compare_price_afn !== p.price_afn;
      let effectivePrice = p.price_afn;
      let effectiveOriginalPrice: number | undefined = undefined;

      if (hasComparePrice) {
        effectivePrice = Math.min(p.price_afn, p.compare_price_afn!);
        effectiveOriginalPrice = Math.max(p.price_afn, p.compare_price_afn!);
      }

      const discount = effectiveOriginalPrice
        ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
        : undefined;

      return {
        id: p.id,
        name: getLocalizedProductName(p, language),
        slug: p.slug,
        price: effectivePrice,
        originalPrice: effectiveOriginalPrice,
        images: p.images || ["/placeholder.svg"],
        category: currentCategory?.slug || "",
        subcategory: currentSubcategory?.slug,
        brand: metadata?.brand || "",
        rating: 0,
        reviewCount: 0,
        inStock: p.quantity > 0,
        isNew: p.is_featured,
        isHot: false,
        discount,
        currency,
        currencySymbol: "AFN",
        seller: { id: "", name: "", rating: 0, productCount: 0, avatar: "" },
        description: { fa: "", en: "" },
        specifications: [],
      };
    });
  }, [dbProducts, currentCategory, currentSubcategory, language]);

  const filteredProducts = useMemo(() => {
    let result = [...displayProducts];

    // Filter by price range
    result = result.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

    // Filter by rating
    if (filters.rating > 0) {
      result = result.filter((p) => p.rating >= filters.rating);
    }

    // Filter by stock
    if (filters.inStock) {
      result = result.filter((p) => p.inStock);
    }

    // Filter by sale
    if (filters.onSale) {
      result = result.filter((p) => p.discount && p.discount > 0);
    }

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "popularity":
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case "latest":
      default:
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return result;
  }, [displayProducts, filters, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const productIds = useMemo(() => paginatedProducts.map((p) => p.id), [paginatedProducts]);
  const { getRating } = useProductRatings(productIds);

  const isLoading = categoriesLoading || productsLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Auto-hide Sticky Navbar */}
      <StickyNavbar>
        <Header />
        <Navigation />
      </StickyNavbar>

      {/* Temu-Style Filter Bar */}
      <FilterBar
        selectedSort={sortBy}
        onSortChange={setSortBy}
        selectedCategory={selectedCategorySlug}
        onCategoryChange={(cat) => {
          if (cat) {
            window.location.href = `/categories?category=${cat}`;
          } else {
            window.location.href = "/categories";
          }
        }}
      />

      <div className="container mx-auto px-4 py-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {(currentSubcategory && getLocalizedName(currentSubcategory)) ||
                (currentCategory && getLocalizedName(currentCategory)) ||
                t.categories.allCategories}
            </h1>
            <p className="text-muted-foreground">
              {filteredProducts.length} {getLabel('products', 'محصول', 'محصولات')}
            </p>
          </div>
        </div>

        {/* Category Cards (when no category selected) */}
        {!selectedCategorySlug && (
          <div className="mb-8">
            {categoriesLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-xl" />
                ))}
              </div>
            ) : rootCategories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
                {rootCategories.map((cat) => {
                  const productImage = categoryImages.get(cat.id);
                  const displayImage = cat.image_url || productImage;
                  const catLabel = getLocalizedName(cat);

                  return (
                    <Link
                      key={cat.id}
                      to={`/categories?category=${cat.slug}`}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-border"
                    >
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={catLabel}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-16 w-16 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <h3 className="text-white font-bold text-sm sm:text-base">{catLabel}</h3>
                        <p className="text-white/70 text-xs">
                          {cat.subcategories?.length || 0} {t.categories.subcategories}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {getLabel('No categories available yet', 'هنوز دسته‌بندی‌ای وجود ندارد', 'تر اوسه پورې هیڅ کټګوري نشته')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Products Grid - Full Width like Discover Products */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-8 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : paginatedProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {getLabel('No products found', 'محصولی یافت نشد', 'هیڅ محصول ونه موندل شو')}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {getLabel('No products available in this category.', 'محصولی در این دسته‌بندی موجود نیست.', 'پدې کټګوري کې هیڅ محصول شتون نلري.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} getRating={getRating} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </Button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <Button
                key={i}
                variant={currentPage === i + 1 ? "cyan" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

// Inline ProductCard component for the grid
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    originalPrice?: number;
    images: string[];
    isNew?: boolean;
    isHot?: boolean;
    discount?: number;
    currency?: string;
    currencySymbol?: string;
  };
  getRating: (id: string) => { averageRating: number; reviewCount: number };
}

const ProductCard = ({ product, getRating }: ProductCardProps) => {
  const { language, isRTL } = useLanguage();
  const [isHovered, setIsHovered] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const isWishlisted = isInWishlist(product.id);
  const isBuyer = role === "buyer";
  const currencySymbol = product.currencySymbol || (product.currency === "USD" ? "$" : "AFN");

  const { averageRating, reviewCount } = getRating(product.id);

  // Name is already localized
  const getName = () => product.name;

  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    setIsAddingToCart(true);
    await addToCart(product.id);
    setIsAddingToCart(false);
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/login");
      return;
    }
    await toggleWishlist(product.id);
  };

  return (
    <div
      className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden flex-shrink-0">
        <Link to={`/products/${product.slug}`}>
          <img
            src={product.images[0] || "/placeholder.svg"}
            alt={getName()}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Badges */}
        <div className={`absolute top-2 ${isRTL ? "right-2" : "left-2"} flex flex-col gap-1`}>
          {product.isNew && <Badge variant="new">{getLabel('New', 'جدید', 'نوی')}</Badge>}
          {product.isHot && <Badge variant="hot">{getLabel('Hot', 'داغ', 'ګرم')}</Badge>}
          {product.discount && product.discount > 0 && <Badge variant="sale">-{product.discount}%</Badge>}
        </div>

        {/* Quick Actions */}
        <div
          className={`absolute top-2 ${isRTL ? "left-2" : "right-2"} flex flex-col gap-2 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
          }`}
        >
          {(!user || isBuyer) && (
            <button
              onClick={handleWishlistToggle}
              className={cn(
                "p-2 rounded-full transition-colors shadow-md",
                isWishlisted
                  ? "bg-primary text-white"
                  : "bg-white/90 dark:bg-gray-800/90 hover:bg-primary hover:text-white",
              )}
            >
              <Heart size={18} className={isWishlisted ? "fill-current" : ""} />
            </button>
          )}
          <Link
            to={`/products/${product.slug}`}
            className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-full hover:bg-primary hover:text-white transition-colors shadow-md"
          >
            <Eye size={18} />
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 md:p-3 flex flex-col flex-grow">
        {/* Price */}
        <div className="flex items-baseline gap-1.5 flex-shrink-0 mb-1">
          <span className="text-sm sm:text-base md:text-lg font-bold text-primary truncate">
            {product.currency === "USD" ? "$" : ""}
            {product.price.toLocaleString()} {product.currency !== "USD" ? currencySymbol : ""}
          </span>
          {product.originalPrice && product.originalPrice !== product.price && (
            <span className="text-[10px] sm:text-xs text-muted-foreground line-through truncate">
              {product.currency === "USD" ? "$" : ""}
              {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Name */}
        <Link to={`/products/${product.slug}`} className="flex-shrink-0">
          <h3 className="text-xs sm:text-sm text-foreground truncate hover:text-primary transition-colors">
            {getName()}
          </h3>
        </Link>

        {/* Rating */}
        <div className="h-4 mt-1 flex-shrink-0">
          <CompactRating rating={averageRating} reviewCount={reviewCount} size="sm" />
        </div>

        {/* Add to Cart */}
        <div className="mt-auto pt-2 flex-shrink-0">
          <Button
            variant="cyan"
            size="sm"
            className="w-full gap-2 text-xs"
            onClick={handleAddToCart}
            disabled={isAddingToCart}
          >
            <ShoppingCart size={14} className={isAddingToCart ? "animate-pulse" : ""} />
            {getLabel('Add', 'افزودن', 'اضافه کړئ')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Categories;
