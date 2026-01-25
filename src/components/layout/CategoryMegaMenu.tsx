import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, ChevronDown, ChevronRight, ChevronLeft, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import { useCategories, Category } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const CategoryMegaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const { t, isRTL } = useLanguage();
  const { categories, loading } = useCategories();

  const handleCategoryHover = (category: Category) => {
    setActiveCategory(category);
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
    setActiveCategory(null);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && categories.length > 0) {
      setActiveCategory(categories[0]);
    }
  };

  return (
    <div 
      className="relative"
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button */}
      <Button
        className="rounded-none h-12 px-6 gap-2 font-semibold"
        onClick={handleToggle}
        onMouseEnter={() => {
          setIsOpen(true);
          if (categories.length > 0) {
            setActiveCategory(categories[0]);
          }
        }}
      >
        <Menu className="h-5 w-5" />
        <span className="hidden sm:inline">{t.nav.category}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {/* Mega Menu Dropdown */}
      {isOpen && (
        <div 
          className={`absolute top-full z-50 bg-background border border-muted-foreground/20 shadow-2xl rounded-b-lg animate-fade-in flex ${isRTL ? 'right-0' : 'left-0'}`}
          style={{ minWidth: '700px' }}
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Main Categories Panel - Right side in RTL (due to dir=rtl), Left side in LTR */}
          <div className={`w-64 border-muted-foreground/10 bg-muted/30 max-h-[400px] overflow-y-auto scrollbar-thin ${isRTL ? 'border-l' : 'border-r'}`}>
            {loading ? (
              <div className="p-4 space-y-2">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : categories.length > 0 ? (
              <div className="py-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                      activeCategory?.id === category.id 
                        ? 'bg-primary/10 text-primary border-primary' 
                        : 'text-foreground hover:bg-muted'
                    } ${isRTL ? 'border-r-2' : 'border-l-2'} ${
                      activeCategory?.id === category.id 
                        ? 'border-primary' 
                        : 'border-transparent'
                    }`}
                    onMouseEnter={() => handleCategoryHover(category)}
                  >
                    <span className="font-medium text-sm">
                      {isRTL && category.name_fa ? category.name_fa : category.name}
                    </span>
                    {isRTL ? (
                      <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                {isRTL ? 'دسته‌بندی موجود نیست' : 'No categories available'}
              </div>
            )}
          </div>

          {/* Right Panel - Subcategories Grid (Left side in RTL) */}
          {/* Subcategories Panel - Left side in RTL, Right side in LTR */}
          <div className="flex-1 p-6 max-h-[400px] overflow-y-auto scrollbar-thin">
            {activeCategory ? (
              <>
                {/* Category Title */}
                <div className={`mb-4 pb-3 border-b border-muted-foreground/10 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <Link 
                    to={`/categories?category=${activeCategory.slug}`}
                    className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {isRTL && activeCategory.name_fa ? activeCategory.name_fa : activeCategory.name}
                  </Link>
                </div>

                {/* Subcategories Grid */}
                {activeCategory.subcategories && activeCategory.subcategories.length > 0 ? (
                  <div className="grid grid-cols-5 gap-4">
                    {activeCategory.subcategories.map((sub, index) => (
                      <Link
                        key={sub.id}
                        to={`/categories?category=${activeCategory.slug}&subcategory=${sub.slug}`}
                        className="group flex flex-col items-center text-center"
                        onClick={() => setIsOpen(false)}
                      >
                        {/* Circular Image with HOT badge */}
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-muted to-muted/50 border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                            {sub.image_url ? (
                              <img
                                src={sub.image_url}
                                alt={isRTL && sub.name_fa ? sub.name_fa : sub.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-muted">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          {/* HOT Badge - show on first 2 items as example */}
                          {index < 2 && (
                            <Badge 
                              variant="sale" 
                              className={`absolute -top-1 text-[10px] px-1.5 py-0 ${isRTL ? '-left-1' : '-right-1'}`}
                            >
                              {isRTL ? 'داغ' : 'HOT'}
                            </Badge>
                          )}
                        </div>

                        {/* Subcategory Name */}
                        <span className="mt-2 text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 max-w-[80px]">
                          {isRTL && sub.name_fa ? sub.name_fa : sub.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    {isRTL ? 'زیرمجموعه‌ای موجود نیست' : 'No subcategories available'}
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {isRTL ? 'یک دسته‌بندی انتخاب کنید' : 'Select a category'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMegaMenu;
