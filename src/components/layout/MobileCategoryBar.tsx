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
      <div className="lg:hidden bg-background border-b border-muted-foreground/20">
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
    <div className="lg:hidden bg-background border-b border-muted-foreground/20" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container px-2 sm:px-3 lg:px-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className={`flex gap-1 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            {/* All Categories Link */}
          <Link
            to="/categories"
            className="flex-shrink-0 px-3 py-1.5 text-sm font-semibold text-foreground border-b-2 border-primary"
          >
            {isRTL ? 'همه' : 'All'}
          </Link>

          {/* Category Links */}
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories?category=${category.slug}`}
              className="flex-shrink-0 px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors border-b-2 border-transparent hover:border-primary/50"
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
