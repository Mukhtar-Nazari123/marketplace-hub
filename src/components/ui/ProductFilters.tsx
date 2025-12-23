import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Star, ChevronDown, ChevronUp } from 'lucide-react';
import { categories, brands } from '@/data/mockData';

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  className?: string;
}

export interface FilterState {
  priceRange: [number, number];
  rating: number;
  brands: string[];
  categories: string[];
  inStock: boolean;
  onSale: boolean;
}

const ProductFilters = ({ onFilterChange, className = '' }: ProductFiltersProps) => {
  const { t, language, isRTL } = useLanguage();
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 150000]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [inStock, setInStock] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    rating: true,
    brand: true,
    category: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBrandChange = (brand: string) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const applyFilters = () => {
    onFilterChange({
      priceRange,
      rating: selectedRating,
      brands: selectedBrands,
      categories: selectedCategories,
      inStock,
      onSale,
    });
  };

  const clearFilters = () => {
    setPriceRange([0, 150000]);
    setSelectedRating(0);
    setSelectedBrands([]);
    setSelectedCategories([]);
    setInStock(false);
    setOnSale(false);
    onFilterChange({
      priceRange: [0, 150000],
      rating: 0,
      brands: [],
      categories: [],
      inStock: false,
      onSale: false,
    });
  };

  return (
    <div className={`bg-card rounded-xl p-4 shadow-sm border border-border ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">{t.filters.title}</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          {t.filters.clear}
        </Button>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full py-2 text-sm font-medium"
          onClick={() => toggleSection('price')}
        >
          <span>{t.filters.priceRange}</span>
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.price && (
          <div className="mt-3 space-y-3">
            <Slider
              value={priceRange}
              onValueChange={(value) => setPriceRange(value as [number, number])}
              min={0}
              max={150000}
              step={1000}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{t.filters.min}: {priceRange[0].toLocaleString()}</span>
              <span>{t.filters.max}: {priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Rating */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full py-2 text-sm font-medium"
          onClick={() => toggleSection('rating')}
        >
          <span>{t.filters.rating}</span>
          {expandedSections.rating ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.rating && (
          <div className="mt-3 space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                className={`flex items-center gap-1 w-full p-2 rounded-lg transition-colors ${
                  selectedRating === rating ? 'bg-primary/10' : 'hover:bg-muted'
                }`}
                onClick={() => setSelectedRating(selectedRating === rating ? 0 : rating)}
              >
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}
                  />
                ))}
                <span className="text-sm text-muted-foreground mx-1">{isRTL ? 'و بالاتر' : '& up'}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Brand */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full py-2 text-sm font-medium"
          onClick={() => toggleSection('brand')}
        >
          <span>{t.filters.brand}</span>
          {expandedSections.brand ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.brand && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {brands.map((brand) => (
              <label key={brand} className="flex items-center gap-2 cursor-pointer p-1">
                <Checkbox
                  checked={selectedBrands.includes(brand)}
                  onCheckedChange={() => handleBrandChange(brand)}
                />
                <span className="text-sm">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Category */}
      <div className="mb-6">
        <button
          className="flex items-center justify-between w-full py-2 text-sm font-medium"
          onClick={() => toggleSection('category')}
        >
          <span>{t.filters.category}</span>
          {expandedSections.category ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.category && (
          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 cursor-pointer p-1">
                <Checkbox
                  checked={selectedCategories.includes(cat.slug)}
                  onCheckedChange={() => handleCategoryChange(cat.slug)}
                />
                <span className="text-sm">{cat.name[language]}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Quick Filters */}
      <div className="space-y-2 mb-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={inStock} onCheckedChange={(checked) => setInStock(!!checked)} />
          <span className="text-sm">{t.product.inStock}</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox checked={onSale} onCheckedChange={(checked) => setOnSale(!!checked)} />
          <span className="text-sm">{t.filters.discount}</span>
        </label>
      </div>

      <Button variant="cyan" className="w-full" onClick={applyFilters}>
        {t.filters.apply}
      </Button>
    </div>
  );
};

export default ProductFilters;
