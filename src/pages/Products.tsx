import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { products, sellers } from '@/data/mockData';
import ProductFilters, { FilterState } from '@/components/ui/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const Products = () => {
  const { t, language, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const filterType = searchParams.get('filter'); // 'new', 'sale', 'seller'
  const sellerId = searchParams.get('seller');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('latest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 150000],
    rating: 0,
    brands: [],
    categories: [],
    inStock: false,
    onSale: false,
  });

  const ITEMS_PER_PAGE = 12;

  const currentSeller = sellers.find(s => s.id === sellerId);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by type
    if (filterType === 'new') {
      result = result.filter(p => p.isNew);
    } else if (filterType === 'sale') {
      result = result.filter(p => p.discount && p.discount > 0);
    } else if (filterType === 'seller' && sellerId) {
      result = result.filter(p => p.seller.id === sellerId);
    }

    // Apply price range filter
    result = result.filter(
      p => p.price >= filters.priceRange[0] && p.price <= filters.priceRange[1]
    );

    // Filter by rating
    if (filters.rating > 0) {
      result = result.filter(p => p.rating >= filters.rating);
    }

    // Filter by brands
    if (filters.brands.length > 0) {
      result = result.filter(p => filters.brands.includes(p.brand));
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category));
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
  }, [filterType, sellerId, filters, sortBy]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getTitle = () => {
    if (filterType === 'new') return t.product.newProducts;
    if (filterType === 'sale') return t.filters.discount;
    if (currentSeller) return currentSeller.name;
    return t.product.allProducts;
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              {t.pages.home}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <span className="text-primary">{t.pages.products}</span>
          </div>
        </div>
      </div>

      {/* Hero Banner for New Products */}
      {filterType === 'new' && (
        <div className="bg-gradient-to-r from-primary to-cyan-400 py-12">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-4">
              <Sparkles className="text-white" size={20} />
              <span className="text-white font-medium">{t.product.newProducts}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {isRTL ? 'جدیدترین محصولات فروشگاه' : 'Latest Store Products'}
            </h1>
            <p className="text-white/80">
              {isRTL ? 'بهترین و جدیدترین محصولات را کشف کنید' : 'Discover the best and newest products'}
            </p>
          </div>
        </div>
      )}

      {/* Seller Info */}
      {currentSeller && (
        <div className="bg-card border-b border-border py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <img
                src={currentSeller.avatar}
                alt={currentSeller.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-primary"
              />
              <div>
                <h1 className="text-xl font-bold text-foreground">{currentSeller.name}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>⭐ {currentSeller.rating}</span>
                  <span>•</span>
                  <span>{currentSeller.productCount} {isRTL ? 'محصول' : 'products'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            {/* Quick Filters */}
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border mb-6">
              <h3 className="font-bold text-foreground mb-4">{isRTL ? 'دسترسی سریع' : 'Quick Access'}</h3>
              <div className="space-y-2">
                <Link
                  to="/products"
                  className={`block p-2 rounded-lg transition-colors ${
                    !filterType ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  {t.product.allProducts}
                </Link>
                <Link
                  to="/products?filter=new"
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    filterType === 'new' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Sparkles size={16} />
                  {t.product.newProducts}
                </Link>
                <Link
                  to="/products?filter=sale"
                  className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                    filterType === 'sale' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}
                >
                  <Badge variant="sale" className="text-xs">%</Badge>
                  {t.filters.discount}
                </Link>
              </div>
            </div>

            {/* Sellers */}
            <div className="bg-card rounded-xl p-4 shadow-sm border border-border mb-6">
              <h3 className="font-bold text-foreground mb-4">{t.filters.seller}</h3>
              <div className="space-y-2">
                {sellers.map((seller) => (
                  <Link
                    key={seller.id}
                    to={`/products?filter=seller&seller=${seller.id}`}
                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      sellerId === seller.id ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                    }`}
                  >
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <span className="text-sm">{seller.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            <ProductFilters onFilterChange={setFilters} />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-foreground">{getTitle()}</h1>
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

            {/* Products Grid */}
            <ProductGrid
              products={paginatedProducts}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  {isRTL ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </Button>
                {[...Array(totalPages)].map((_, i) => (
                  <Button
                    key={i}
                    variant={currentPage === i + 1 ? 'cyan' : 'outline'}
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
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  {isRTL ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </Button>
              </div>
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

export default Products;
