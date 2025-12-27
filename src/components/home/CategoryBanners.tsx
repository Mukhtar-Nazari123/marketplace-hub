import { ArrowLeft, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const CategoryBanners = () => {
  const { t, isRTL } = useLanguage();
  const { getRootCategories, loading } = useCategories();
  
  const rootCategories = getRootCategories().slice(0, 3);

  // Gradient colors for categories
  const gradients = [
    "from-cyan to-cyan-dark",
    "from-orange to-orange-dark",
    "from-cyan to-cyan-dark",
  ];

  if (loading) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} className="h-[180px] rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (rootCategories.length === 0) {
    return (
      <section className="py-12">
        <div className="container">
          <div className="text-center py-12 text-muted-foreground">
            {isRTL ? 'هنوز دسته‌بندی‌ای وجود ندارد' : 'No categories available yet'}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-6">
          {rootCategories.map((category, index) => (
            <Link
              key={category.id}
              to={`/categories?category=${category.slug}`}
              className={`group relative rounded-xl overflow-hidden bg-gradient-to-br ${gradients[index % gradients.length]} p-6 min-h-[180px] hover-lift animate-fade-in-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-40 h-40 bg-primary-foreground rounded-full -translate-y-1/2 -translate-x-1/2" />
              </div>

              {/* Icon */}
              <div className={`absolute bottom-6 opacity-20 ${isRTL ? 'left-6' : 'right-6'}`}>
                {category.image_url ? (
                  <img 
                    src={category.image_url} 
                    alt={category.name} 
                    className="h-24 w-24 object-contain opacity-50"
                  />
                ) : (
                  <Package className="h-24 w-24 text-primary-foreground" />
                )}
              </div>

              {/* Content */}
              <div className="relative z-10">
                <h3 className="font-display text-xl font-bold text-primary-foreground mb-4">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 text-primary-foreground/80 group-hover:text-primary-foreground transition-colors">
                  <span className="font-medium">{t.hero.shopNow}</span>
                  <ArrowLeft className={`h-4 w-4 transition-transform ${isRTL ? 'group-hover:-translate-x-1' : 'group-hover:translate-x-1 rotate-180'}`} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryBanners;