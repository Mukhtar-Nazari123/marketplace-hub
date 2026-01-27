import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterBarProps {
  onSortChange?: (value: string) => void;
  onCategoryChange?: (value: string | null) => void;
  onBrandChange?: (value: string | null) => void;
  onColorChange?: (value: string | null) => void;
  selectedSort?: string;
  selectedCategory?: string | null;
  selectedBrand?: string | null;
  selectedColor?: string | null;
  availableBrands?: string[];
  availableColors?: string[];
}

const FilterBar = ({
  onSortChange,
  onCategoryChange,
  onBrandChange,
  onColorChange,
  selectedSort = 'relevance',
  selectedCategory = null,
  selectedBrand = null,
  selectedColor = null,
  availableBrands = [],
  availableColors = [],
}: FilterBarProps) => {
  const { isRTL } = useLanguage();
  const { getRootCategories, loading: categoriesLoading } = useCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const rootCategories = getRootCategories();

  // Sort options
  const sortOptions: FilterOption[] = [
    { value: 'relevance', label: isRTL ? 'مرتبط‌ترین' : 'Relevance' },
    { value: 'latest', label: isRTL ? 'جدیدترین' : 'Latest' },
    { value: 'price-low', label: isRTL ? 'ارزان‌ترین' : 'Price: Low to High' },
    { value: 'price-high', label: isRTL ? 'گران‌ترین' : 'Price: High to Low' },
    { value: 'popularity', label: isRTL ? 'محبوب‌ترین' : 'Most Popular' },
  ];

  // Category options from database
  const categoryOptions: FilterOption[] = rootCategories.map(cat => ({
    value: cat.slug,
    label: isRTL && cat.name_fa ? cat.name_fa : cat.name,
  }));

  // Brand options
  const brandOptions: FilterOption[] = availableBrands.map(brand => ({
    value: brand,
    label: brand,
  }));

  // Color options
  const colorOptions: FilterOption[] = availableColors.map(color => ({
    value: color,
    label: color,
  }));

  // Common colors for marketplace (fallback if no colors provided)
  const defaultColors: FilterOption[] = [
    { value: 'black', label: isRTL ? 'مشکی' : 'Black' },
    { value: 'white', label: isRTL ? 'سفید' : 'White' },
    { value: 'red', label: isRTL ? 'قرمز' : 'Red' },
    { value: 'blue', label: isRTL ? 'آبی' : 'Blue' },
    { value: 'green', label: isRTL ? 'سبز' : 'Green' },
    { value: 'gold', label: isRTL ? 'طلایی' : 'Gold' },
    { value: 'silver', label: isRTL ? 'نقره‌ای' : 'Silver' },
  ];

  const effectiveColorOptions = colorOptions.length > 0 ? colorOptions : defaultColors;

  return (
    <div className="bg-background border-b border-border sticky top-0 z-30">
      <div 
        ref={scrollRef}
        className="container mx-auto px-4 py-3 overflow-x-auto scrollbar-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className={cn(
          "flex items-center gap-2",
          isRTL ? "flex-row-reverse" : "flex-row"
        )}>
          {/* Filter Icon */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50 border border-border flex-shrink-0">
            <SlidersHorizontal size={16} className="text-muted-foreground" />
          </div>
          {/* Sort By */}
          <FilterPill
            label={isRTL ? 'ترتیب' : 'Sort by'}
            options={sortOptions}
            selectedValue={selectedSort}
            onSelect={(value) => onSortChange?.(value)}
            isRTL={isRTL}
          />

          {/* Category */}
          {!categoriesLoading && categoryOptions.length > 0 && (
            <FilterPill
              label={isRTL ? 'دسته‌بندی' : 'Category'}
              options={categoryOptions}
              selectedValue={selectedCategory}
              onSelect={(value) => onCategoryChange?.(value === selectedCategory ? null : value)}
              isRTL={isRTL}
              allowClear
            />
          )}

          {/* Brand */}
          {brandOptions.length > 0 && (
            <FilterPill
              label={isRTL ? 'برند' : 'Brand'}
              options={brandOptions}
              selectedValue={selectedBrand}
              onSelect={(value) => onBrandChange?.(value === selectedBrand ? null : value)}
              isRTL={isRTL}
              allowClear
            />
          )}

          {/* Color */}
          <FilterPill
            label={isRTL ? 'رنگ' : 'Color'}
            options={effectiveColorOptions}
            selectedValue={selectedColor}
            onSelect={(value) => onColorChange?.(value === selectedColor ? null : value)}
            isRTL={isRTL}
            allowClear
          />
        </div>
      </div>
    </div>
  );
};

interface FilterPillProps {
  label: string;
  options: FilterOption[];
  selectedValue: string | null;
  onSelect: (value: string) => void;
  isRTL: boolean;
  allowClear?: boolean;
}

const FilterPill = ({
  label,
  options,
  selectedValue,
  onSelect,
  isRTL,
  allowClear = false,
}: FilterPillProps) => {
  const [open, setOpen] = useState(false);
  
  const selectedOption = options.find(opt => opt.value === selectedValue);
  const isActive = !!selectedValue && !!selectedOption;
  
  const displayLabel = isActive ? selectedOption.label : label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200",
            "border hover:shadow-sm active:scale-[0.98]",
            isActive
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-muted/50 text-foreground border-border hover:bg-muted hover:border-muted-foreground/30"
          )}
        >
          <span className="max-w-[120px] truncate">{displayLabel}</span>
          <ChevronDown 
            size={14} 
            className={cn(
              "transition-transform duration-200 flex-shrink-0",
              open && "rotate-180"
            )} 
          />
        </button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-48 p-1 bg-popover border border-border shadow-lg rounded-lg",
          isRTL && "text-right"
        )}
        align={isRTL ? "end" : "start"}
        sideOffset={8}
      >
        <div className="max-h-64 overflow-y-auto">
          {allowClear && selectedValue && (
            <button
              onClick={() => {
                onSelect(selectedValue);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                "text-muted-foreground hover:bg-muted hover:text-foreground",
                isRTL ? "flex-row-reverse text-right" : "text-left"
              )}
            >
              <span>{isRTL ? 'پاک کردن' : 'Clear'}</span>
            </button>
          )}
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSelect(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                selectedValue === option.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "hover:bg-muted",
                isRTL ? "flex-row-reverse text-right" : "text-left"
              )}
            >
              <span className="flex-1 truncate">{option.label}</span>
              {selectedValue === option.value && (
                <Check size={14} className="flex-shrink-0 text-primary" />
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FilterBar;
