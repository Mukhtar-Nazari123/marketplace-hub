import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const MobileCategoryBar = () => {
  const { isRTL } = useLanguage();
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="lg:hidden bg-background/15 backdrop-blur-sm border-b border-white/10">
        <div className="flex gap-6 px-4 py-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-6 w-16 flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="lg:hidden bg-background/15 backdrop-blur-sm border-b border-white/10" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container px-1 sm:px-1.5 lg:px-2">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className={`flex gap-1 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* All Categories Link */}
          <Link
            to="/categories"
            className="flex-shrink-0 px-3 py-1.5 text-sm font-semibold text-black dark:text-white border-b-2 border-primary"
          >
            {isRTL ? 'همه' : 'All'}
          </Link>

          {/* Category Links */}
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories?category=${category.slug}`}
              className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white transition-colors border-b-2 border-transparent hover:border-primary/50"
            >
              {category.name}
            </Link>
          ))}
          </div>
          <ScrollBar orientation="horizontal" className="h-2.5" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default MobileCategoryBar;
