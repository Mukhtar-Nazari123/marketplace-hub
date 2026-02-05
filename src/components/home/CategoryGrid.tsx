import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Package, ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryGrid = () => {
  const { t, isRTL } = useLanguage();
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <section className="py-8 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  // Get categories with their subcategories
  const categoriesWithSubs = categories.filter(cat => cat.subcategories && cat.subcategories.length > 0);

  return (
    <section className="py-8 bg-muted/30" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container">
        {/* Section Header */}
        <div className={`flex items-center justify-between mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <h2 className={`text-xl md:text-2xl font-bold text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
            {isRTL ? 'دسته‌بندی‌ها' : 'Shop by Category'}
          </h2>
          <Link 
            to="/categories" 
            className={`text-primary hover:underline text-sm font-medium flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {isRTL ? 'مشاهده همه' : 'View All'}
            {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Link>
        </div>

        {/* Categories Grid - Temu Style */}
        {categoriesWithSubs.map((category) => (
          <div key={category.id} className="mb-8 last:mb-0">
            {/* Category Title */}
            <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <h3 className={`text-lg font-semibold text-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                {category.name}
              </h3>
              <Link 
                to={`/categories?category=${category.slug}`}
                className={`text-sm text-primary hover:underline flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {isRTL ? 'بیشتر' : 'More'}
                {isRTL ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
              </Link>
            </div>

            {/* Subcategories Grid - Circular Images */}
            <div className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3 md:gap-4 ${isRTL ? 'direction-rtl' : ''}`}>
              {category.subcategories?.slice(0, 10).map((sub) => (
                <Link
                  key={sub.id}
                  to={`/categories?category=${category.slug}&subcategory=${sub.slug}`}
                  className="group flex flex-col items-center text-center"
                >
                  {/* Circular Image */}
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                    {sub.image_url ? (
                      <img
                        src={sub.image_url}
                        alt={sub.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  {/* Subcategory Name */}
                  <span className={`mt-2 text-xs md:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 max-w-[80px] md:max-w-[100px] ${isRTL ? 'text-center' : ''}`}>
                    {sub.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Fallback: Show all categories without subcategories as simple grid */}
        {categoriesWithSubs.length === 0 && (
          <div className={`grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4 ${isRTL ? 'direction-rtl' : ''}`}>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/categories?category=${category.slug}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105 flex items-center justify-center">
                  <Package className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className={`mt-2 text-xs md:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 ${isRTL ? 'text-center' : ''}`}>
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;
