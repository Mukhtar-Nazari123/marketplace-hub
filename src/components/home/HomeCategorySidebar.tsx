import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useCategories, Category } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface HomeCategorySidebarProps {
  onCategoryHover?: (category: Category | null) => void;
}

const HomeCategorySidebar = ({ onCategoryHover }: HomeCategorySidebarProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const { isRTL } = useLanguage();
  const { categories, loading } = useCategories();

  const handleMouseEnter = (category: Category) => {
    setHoveredCategory(category.id);
    onCategoryHover?.(category);
  };

  const handleMouseLeave = () => {
    setHoveredCategory(null);
    onCategoryHover?.(null);
  };

  if (loading) {
    return (
      <div className="bg-background border border-muted-foreground/20 rounded-xl shadow-sm overflow-hidden">
        <div className="p-3 space-y-1">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div 
      className="bg-background border border-muted-foreground/20 rounded-xl shadow-sm overflow-hidden h-full"
      onMouseLeave={handleMouseLeave}
    >
      <div className="py-2">
        {categories.map((category) => (
          <Link
            key={category.id}
            to={`/categories?category=${category.slug}`}
            className={cn(
              "flex items-center justify-between px-4 py-3 transition-all duration-200",
              "hover:bg-primary/10 hover:text-primary",
              hoveredCategory === category.id 
                ? "bg-primary/10 text-primary border-primary" 
                : "text-foreground",
              isRTL ? "border-r-3" : "border-l-3",
              hoveredCategory === category.id 
                ? "border-primary" 
                : "border-transparent"
            )}
            onMouseEnter={() => handleMouseEnter(category)}
          >
            <span className={cn(
              "font-medium text-sm",
              isRTL ? "text-right" : "text-left"
            )}>
              {isRTL && category.name_fa ? category.name_fa : category.name}
            </span>
            {isRTL ? (
              <ChevronLeft className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default HomeCategorySidebar;
