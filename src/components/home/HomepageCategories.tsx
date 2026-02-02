import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const HomepageCategories = () => {
  const { isRTL } = useLanguage();
  const { categories, loading } = useCategories();
  const [categoryImages, setCategoryImages] = useState<Map<string, string>>(new Map());

  // Fetch product images for categories without images
  useEffect(() => {
    const fetchProductImages = async () => {
      const categoriesNeedingImages = categories.filter(cat => !cat.image_url);
      if (categoriesNeedingImages.length === 0) return;

      const imageMap = new Map<string, string>();
      
      await Promise.all(
        categoriesNeedingImages.map(async (category) => {
          const { data: products } = await supabase
            .from('products')
            .select('id')
            .eq('category_id', category.id)
            .eq('status', 'approved')
            .limit(1);

          if (products && products.length > 0) {
            const { data: media } = await supabase
              .from('product_media')
              .select('url')
              .eq('product_id', products[0].id)
              .eq('is_primary', true)
              .limit(1);

            if (media && media.length > 0) {
              imageMap.set(category.id, media[0].url);
            }
          }
        })
      );

      setCategoryImages(imageMap);
    };

    if (categories.length > 0) {
      fetchProductImages();
    }
  }, [categories]);

  if (loading) {
    return (
      <section className="py-4 bg-background">
        <div className="container px-1 sm:px-1.5 lg:px-2">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full" />
                <Skeleton className="h-3 w-12" />
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

  return (
    <section className="py-4 bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container px-1 sm:px-1.5 lg:px-2">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
          {categories.map((category) => {
            const productImage = categoryImages.get(category.id);
            const displayImage = category.image_url || productImage;

            return (
              <Link
                key={category.id}
                to={`/categories?category=${category.slug}`}
                className="group flex flex-col items-center text-center"
              >
                {/* Circular Image */}
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-muted border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
                  {displayImage ? (
                    <img
                      src={displayImage}
                      alt={category.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <Package className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                
                {/* Category Name */}
                <span className="mt-2 text-[10px] sm:text-xs md:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-2 max-w-[70px] sm:max-w-[80px] md:max-w-[100px] font-medium">
                  {category.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HomepageCategories;
