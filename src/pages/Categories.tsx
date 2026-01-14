import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import ProductFilters, { FilterState } from '@/components/ui/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';


interface DbProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  category_id: string | null;
  quantity: number;
  is_featured: boolean;
  metadata: Record<string, unknown> | null;
  currency: string;
}

interface CategoryImage {
  category_id: string;
  image_url: string;
}

const Categories = () => {
  const { t, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const selectedCategorySlug = searchParams.get('category');
  const selectedSubcategorySlug = searchParams.get('subcategory');

  const { getRootCategories, getCategoryBySlug, getSubcategoryBySlug, getSubcategories, loading: categoriesLoading } = useCategories();
  const rootCategories = getRootCategories();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
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
        
        // Fetch one product per category
        for (const cat of rootCategories) {
          const { data } = await supabase
            .from('products')
            .select('images')
            .eq('category_id', cat.id)
            .eq('status', 'active')
            .not('images', 'is', null)
            .limit(1)
            .maybeSingle();
          
          if (data?.images && data.images.length > 0) {
            imageMap.set(cat.id, data.images[0]);
          }
        }
        
        setCategoryImages(imageMap);
      } catch (error) {
        console.error('Error fetching category images:', error);
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
          .from('products')
          .select('id, name, slug, price, compare_at_price, images, category_id, quantity, is_featured, metadata, currency')
          .eq('status', 'active');

        if (currentCategory) {
          if (currentSubcategory) {
            // Filter by subcategory_id when a subcategory is selected
            query = query.eq('subcategory_id', currentSubcategory.id);
          } else {
            // Filter by category_id when only category is selected
            query = query.eq('category_id', currentCategory.id);
          }
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;
        setDbProducts((data || []) as DbProduct[]);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setProductsLoading(false);
      }
    };

    if (!categoriesLoading) {
      fetchProducts();
    }
  }, [currentCategory?.id, currentSubcategory?.id, subcategories, categoriesLoading]);

  // Convert DB products to display format
  const displayProducts = useMemo(() => {
    return dbProducts.map(p => {
      const metadata = p.metadata as { brand?: string } | null;
      // Use currency from database column (primary source)
      const currency = p.currency || 'AFN';
      
      // Determine effective prices: lower price is the sale price, higher is original
      const hasComparePrice = p.compare_at_price && p.compare_at_price !== p.price;
      let effectivePrice = p.price;
      let effectiveOriginalPrice: number | undefined = undefined;
      
      if (hasComparePrice) {
        // Always use the lower value as the sale price, higher as original (strikethrough)
        effectivePrice = Math.min(p.price, p.compare_at_price!);
        effectiveOriginalPrice = Math.max(p.price, p.compare_at_price!);
      }
      
      const discount = effectiveOriginalPrice
        ? Math.round(((effectiveOriginalPrice - effectivePrice) / effectiveOriginalPrice) * 100)
        : undefined;

      return {
        id: p.id,
        name: { fa: p.name, en: p.name },
        slug: p.slug,
        price: effectivePrice,
        originalPrice: effectiveOriginalPrice,
        images: p.images || ['/placeholder.svg'],
        category: currentCategory?.slug || '',
        subcategory: currentSubcategory?.slug,
        brand: metadata?.brand || '',
        rating: 0,
        reviewCount: 0,
        inStock: p.quantity > 0,
        isNew: p.is_featured,
        isHot: false,
        discount,
        currency,
        currencySymbol: currency === 'USD' ? '$' : 'AFN',
        seller: { id: '', name: '', rating: 0, productCount: 0, avatar: '' },
        description: { fa: '', en: '' },
        specifications: [],
      };
    });
  }, [dbProducts, currentCategory, currentSubcategory]);

  // Only use DB products
  const allProducts = displayProducts;

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    // Filter by price range
    result = result.filter(
      p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Filter by rating
    if (filters.rating > 0) {
      result = result.filter(p => p.rating >= filters.rating);
    }

    // Filter by stock
    if (filters.inStock) {
      result = result.filter(p => p.inStock);
    }

    // Filter by sale
    if (filters.onSale) {
      result = result.filter(p => p.discount && p.discount > 0);
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'popularity':
        result.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
      case 'latest':
      default:
        result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return result;
  }, [allProducts, filters, sortBy]);

  const isLoading = categoriesLoading || productsLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navbar */}
      <div className="sticky top-0 z-50">
        <TopBar />
        <Header />
        <Navigation />
      </div>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              {t.pages.home}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <Link to="/categories" className="text-muted-foreground hover:text-primary">
              {t.categories.title}
            </Link>
            {currentCategory && (
              <>
                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                <span className="text-primary">{currentCategory.name}</span>
              </>
            )}
            {currentSubcategory && (
              <>
                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                <span className="text-primary">{currentSubcategory.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            {/* Categories List */}
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border mb-6">
              <h3 className="font-bold text-foreground mb-4">{t.categories.allCategories}</h3>
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : rootCategories.length > 0 ? (
                <div className="space-y-2">
                  {rootCategories.map((cat) => (
                    <div key={cat.id}>
                      <Link
                        to={`/categories?category=${cat.slug}`}
                        className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                          selectedCategorySlug === cat.slug
                            ? 'bg-primary/10 text-primary'
                            : 'hover:bg-muted'
                        }`}
                      >
                        <span className="text-sm">{cat.name}</span>
                        {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                      </Link>
                      {selectedCategorySlug === cat.slug && cat.subcategories && cat.subcategories.length > 0 && (
                        <div className={`${isRTL ? 'pr-4' : 'pl-4'} mt-1 space-y-1`}>
                          {cat.subcategories.map((sub) => (
                            <Link
                              key={sub.id}
                              to={`/categories?category=${cat.slug}&subcategory=${sub.slug}`}
                              className={`block p-2 text-sm rounded-lg transition-colors ${
                                selectedSubcategorySlug === sub.slug
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                              }`}
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'دسته‌بندی موجود نیست' : 'No categories available'}
                </p>
              )}
            </div>

            <ProductFilters onFilterChange={setFilters} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {currentSubcategory?.name || currentCategory?.name || t.categories.allCategories}
                </h1>
                <p className="text-muted-foreground">
                  {filteredProducts.length} {isRTL ? 'محصول' : 'products'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Button
                  variant="outline"
                  className="lg:hidden gap-2"
                  onClick={() => setShowFilters(true)}
                >
                  <SlidersHorizontal size={18} />
                  {t.filters.title}
                </Button>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder={t.filters.sortBy} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">{t.filters.latest}</SelectItem>
                    <SelectItem value="popularity">{t.filters.popularity}</SelectItem>
                    <SelectItem value="price-low">{t.filters.priceLowHigh}</SelectItem>
                    <SelectItem value="price-high">{t.filters.priceHighLow}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Category Cards (when no category selected) */}
            {!selectedCategorySlug && (
              <div className="mb-8">
                {categoriesLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="aspect-square rounded-xl" />
                    ))}
                  </div>
                ) : rootCategories.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {rootCategories.map((cat) => {
                      const productImage = categoryImages.get(cat.id);
                      const displayImage = cat.image_url || productImage;
                      
                      return (
                        <Link
                          key={cat.id}
                          to={`/categories?category=${cat.slug}`}
                          className="group relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border border-border"
                        >
                          {displayImage ? (
                            <img
                              src={displayImage}
                              alt={cat.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-16 w-16 text-muted-foreground" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-lg">{cat.name}</h3>
                            <p className="text-white/70 text-sm">
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
                      {isRTL ? 'هنوز دسته‌بندی‌ای وجود ندارد' : 'No categories available yet'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-square rounded-lg" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            ) : (
              <ProductGrid
                products={filteredProducts}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div className={`absolute top-0 bottom-0 ${isRTL ? 'right-0' : 'left-0'} w-80 bg-background overflow-y-auto animate-slide-in-right`}>
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-bold">{t.filters.title}</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                <X size={20} />
              </Button>
            </div>
            <div className="p-4">
              <ProductFilters onFilterChange={(f) => { setFilters(f); setShowFilters(false); }} />
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Categories;