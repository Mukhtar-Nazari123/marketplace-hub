import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useProducts, formatProductForDisplay } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { FilterState } from "@/components/ui/ProductFilters";
import FilterBar from "@/components/products/FilterBar";
import HomepageCategories from "@/components/home/HomepageCategories";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import StickyNavbar from "@/components/layout/StickyNavbar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles, Loader2, Search, Heart, ShoppingCart, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProductRatings } from "@/hooks/useProductRatings";
import CompactRating from "@/components/ui/CompactRating";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useCurrencyRate } from "@/hooks/useCurrencyRate";

const Products = () => {
  const { t, language, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const filterType = searchParams.get("filter"); // 'new', 'sale'
  const categorySlug = searchParams.get("category");
  const subcategorySlug = searchParams.get("subcategory");
  const searchQuery = searchParams.get("search");

  // Pass search query to backend
  const { products: dbProducts, loading } = useProducts({
    status: "active",
    search: searchQuery || undefined,
  });
  const { getRootCategories, getSubcategoryBySlug } = useCategories();

  const [sortBy, setSortBy] = useState("latest");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 500000],
    rating: 0,
    brands: [],
    categories: [],
    inStock: false,
    onSale: false,
  });

  const ITEMS_PER_PAGE = 24;

  // Convert DB products to display format
  const products = useMemo(() => {
    return dbProducts.map((p) => formatProductForDisplay(p, language));
  }, [dbProducts, language]);

  const rootCategories = getRootCategories();

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by subcategory first (more specific)
    if (subcategorySlug) {
      const subcategory = getSubcategoryBySlug(subcategorySlug);
      if (subcategory) {
        result = result.filter((p) => p.subcategory === subcategorySlug);
      }
    } else if (categorySlug) {
      // Filter by category slug only if no subcategory
      result = result.filter((p) => p.category === categorySlug);
    }

    // Filter by type
    if (filterType === "new") {
      result = result.filter((p) => p.isNew);
    } else if (filterType === "sale") {
      result = result.filter((p) => p.discount && p.discount > 0);
    }

    // Apply price range filter
    result = result.filter((p) => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]);

    // Filter by rating
    if (filters.rating > 0) {
      result = result.filter((p) => p.rating >= filters.rating);
    }

    // Filter by brands
    if (filters.brands.length > 0) {
      result = result.filter((p) => filters.brands.includes(p.brand));
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      result = result.filter((p) => filters.categories.includes(p.category));
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
  }, [categorySlug, subcategorySlug, filterType, filters, sortBy, products, getSubcategoryBySlug]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [categorySlug, subcategorySlug, filterType, filters, sortBy, searchQuery]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const productIds = useMemo(() => paginatedProducts.map((p) => p.id), [paginatedProducts]);
  const { getRating } = useProductRatings(productIds);

  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  const getTitle = () => {
    if (searchQuery && searchQuery.trim()) {
      return getLabel(
        `Search results for "${searchQuery}"`,
        `نتایج جستجو برای "${searchQuery}"`,
        `د "${searchQuery}" لپاره د لټون پایلې`
      );
    }
    if (filterType === "new") return getLabel('New Arrivals', 'محصولات جدید', 'نوي محصولات');
    if (filterType === "sale") return getLabel('Discounted Products', 'محصولات تخفیف‌دار', 'تخفیف شوي محصولات');
    if (categorySlug) {
      const category = rootCategories.find((c) => c.slug === categorySlug);
      if (category) {
        // Category name is already localized by useCategories hook
        return category.name;
      }
      return getLabel('All Products', 'همه محصولات', 'ټول محصولات');
    }
    return getLabel('All Products', 'همه محصولات', 'ټول محصولات');
  };

  // Extract unique brands from products
  const availableBrands = useMemo(() => {
    const brands = products.map((p) => p.brand).filter(Boolean);
    return [...new Set(brands)];
  }, [products]);

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
        selectedCategory={categorySlug}
        onCategoryChange={(cat) => {
          const newParams = new URLSearchParams(searchParams);
          if (cat) {
            newParams.set("category", cat);
            newParams.delete("subcategory"); // Clear subcategory when category changes
          } else {
            newParams.delete("category");
            newParams.delete("subcategory");
          }
          setSearchParams(newParams);
        }}
        selectedSubcategory={subcategorySlug}
        onSubcategoryChange={(sub) => {
          const newParams = new URLSearchParams(searchParams);
          if (sub) {
            newParams.set("subcategory", sub);
          } else {
            newParams.delete("subcategory");
          }
          setSearchParams(newParams);
        }}
        availableBrands={availableBrands}
        selectedBrand={filters.brands[0] || null}
        onBrandChange={(brand) => {
          setFilters((prev) => ({
            ...prev,
            brands: brand ? [brand] : [],
          }));
        }}
      />

      {/* Categories Scroll */}
      <HomepageCategories />

      {/* Hero Banner for New Products */}
      {filterType === "new" && (
        <div className="bg-gradient-to-r from-primary to-cyan-400 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-4">
              <Sparkles className="text-white" size={20} />
              <span className="text-white font-medium">
                {getLabel('New Arrivals', 'محصولات جدید', 'نوي محصولات')}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {getLabel('Latest Store Products', 'جدیدترین محصولات فروشگاه', 'د پلورنځي نوي محصولات')}
            </h1>
            <p className="text-white/80">
              {getLabel('Discover the best and newest products', 'بهترین و جدیدترین محصولات را کشف کنید', 'غوره او نوي محصولات ومومئ')}
            </p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{getTitle()}</h1>
          </div>
        </div>

        {/* Products Grid - Full Width like Discover Products */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
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
              <Search className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {getLabel('No products found', 'محصولی یافت نشد', 'هیڅ محصول ونه موندل شو')}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {searchQuery
                ? getLabel(
                    `No results found for "${searchQuery}". Try a different search term.`,
                    `نتیجه‌ای برای "${searchQuery}" پیدا نشد. لطفاً عبارت دیگری را جستجو کنید.`,
                    `د "${searchQuery}" لپاره هیڅ پایله ونه موندل شوه. بل کلیمه وازمایئ.`
                  )
                : getLabel(
                    'No products match the selected filters.',
                    'محصولی با فیلترهای انتخاب شده یافت نشد.',
                    'انتخاب شوي فلټرونو سره هیڅ محصول سمون نه خوري.'
                  )}
            </p>
            {searchQuery && (
              <Link to="/products">
                <Button variant="outline" className="mt-4">
                  {getLabel('View all products', 'مشاهده همه محصولات', 'ټول محصولات وګورئ')}
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} getRating={getRating} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
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
  const { convertToUSD, rate } = useCurrencyRate();

  const isWishlisted = isInWishlist(product.id);
  const isBuyer = role === "buyer";
  const currencySymbol = isRTL ? "افغانی" : "AFN";

  const { averageRating, reviewCount } = getRating(product.id);
  
  // Calculate USD equivalent
  const usdPrice = rate ? convertToUSD(product.price) : null;

  // Name is already localized from the hook
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
        <div className="flex flex-col flex-shrink-0 mb-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base md:text-lg font-bold text-primary truncate">
              {isRTL ? product.price.toLocaleString('fa-AF') : product.price.toLocaleString()} {currencySymbol}
            </span>
            {product.originalPrice && product.originalPrice !== product.price && (
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through truncate">
                {isRTL ? product.originalPrice.toLocaleString('fa-AF') : product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          {/* USD Equivalent */}
          {usdPrice !== null && (
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              ≈ ${usdPrice.toFixed(2)} USD
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

export default Products;
