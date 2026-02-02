import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
        <div className="container px-2">
          <div className="flex gap-4 overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                <Skeleton className="w-16 h-16 rounded-full" />
                <Skeleton className="h-3 w-14" />
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

  // Split categories into 2 rows
  const halfLength = Math.ceil(categories.length / 2);
  const firstRow = categories.slice(0, halfLength);
  const secondRow = categories.slice(halfLength);

  const CategoryItem = ({ category }: { category: typeof categories[0] }) => {
    const productImage = categoryImages.get(category.id);
    const displayImage = category.image_url || productImage;

    return (
      <Link
        to={`/categories?category=${category.slug}`}
        className="group flex flex-col items-center text-center flex-shrink-0"
      >
        {/* Circular Image */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18 rounded-full overflow-hidden bg-muted border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
          {displayImage ? (
            <img
              src={displayImage}
              alt={category.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Package className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Category Name */}
        <span className="mt-1.5 text-[10px] sm:text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 max-w-[60px] sm:max-w-[70px] font-medium leading-tight">
          {category.name}
        </span>
      </Link>
    );
  };

  return (
    <section className="py-3 bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container px-2">
        <ScrollArea className="w-full" dir={isRTL ? 'rtl' : 'ltr'}>
          <div className="flex flex-col gap-3">
            {/* First Row */}
            <div className={`flex gap-4 sm:gap-5 md:gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {firstRow.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))}
            </div>
            
            {/* Second Row */}
            {secondRow.length > 0 && (
              <div className={`flex gap-4 sm:gap-5 md:gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {secondRow.map((category) => (
                  <CategoryItem key={category.id} category={category} />
                ))}
              </div>
            )}
          </div>
          <ScrollBar orientation="horizontal" className="h-2" />
        </ScrollArea>
      </div>
    </section>
  );
};

export default HomepageCategories;
