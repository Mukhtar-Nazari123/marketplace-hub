import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { categories, products } from '@/data/mockData';
import ProductFilters, { FilterState } from '@/components/ui/ProductFilters';
import ProductGrid from '@/components/products/ProductGrid';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const Categories = () => {
  const { t, language, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category');
  const selectedSubcategory = searchParams.get('subcategory');

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

  const currentCategory = categories.find(c => c.slug === selectedCategory);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by category
    if (selectedCategory) {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Filter by subcategory
    if (selectedSubcategory) {
      result = result.filter(p => p.subcategory === selectedSubcategory);
    }

    // Filter by price range
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
  }, [selectedCategory, selectedSubcategory, filters, sortBy]);

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
            <span className="text-foreground">{t.categories.title}</span>
            {currentCategory && (
              <>
                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                <span className="text-primary">{currentCategory.name[language]}</span>
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
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <Link
                      to={`/categories?category=${cat.slug}`}
                      className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                        selectedCategory === cat.slug
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="text-sm">{cat.name[language]}</span>
                      {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                    </Link>
                    {selectedCategory === cat.slug && cat.subcategories.length > 0 && (
                      <div className={`${isRTL ? 'pr-4' : 'pl-4'} mt-1 space-y-1`}>
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/categories?category=${cat.slug}&subcategory=${sub.slug}`}
                            className={`block p-2 text-sm rounded-lg transition-colors ${
                              selectedSubcategory === sub.slug
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                          >
                            {sub.name[language]}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
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
                <h1 className="text-2xl font-bold text-foreground">
                  {currentCategory ? currentCategory.name[language] : t.categories.allCategories}
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
            {!selectedCategory && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/categories?category=${cat.slug}`}
                    className="group relative aspect-square rounded-xl overflow-hidden"
                  >
                    <img
                      src={cat.image}
                      alt={cat.name[language]}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-white font-bold text-lg">{cat.name[language]}</h3>
                      <p className="text-white/70 text-sm">
                        {cat.subcategories.length} {t.categories.subcategories}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Products Grid */}
            <ProductGrid
              products={filteredProducts}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
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
