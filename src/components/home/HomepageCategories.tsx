import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { getSubcategoryImage } from '@/lib/subcategoryImages';

const HomepageCategories = () => {
  const { isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const selectedCategorySlug = searchParams.get('category');
  
  const { categories, getSubcategories, getCategoryBySlug, loading } = useCategories();
  const [categoryImages, setCategoryImages] = useState<Map<string, string>>(new Map());
  const [subcategoryImages, setSubcategoryImages] = useState<Map<string, string>>(new Map());

  // Get selected category and its subcategories
  const selectedCategory = selectedCategorySlug ? getCategoryBySlug(selectedCategorySlug) : null;
  const subcategories = useMemo(() => {
    return selectedCategory ? getSubcategories(selectedCategory.id) : [];
  }, [selectedCategory?.id, getSubcategories]);

  // Determine what to show: subcategories if category selected, otherwise categories
  const showSubcategories = selectedCategory && subcategories.length > 0;
  const items = showSubcategories ? subcategories : categories;

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

  // Fetch product images for subcategories without images
  useEffect(() => {
    const fetchSubcategoryImages = async () => {
      if (!showSubcategories) return;
      
      const subcatsNeedingImages = subcategories.filter(sub => !sub.image_url);
      if (subcatsNeedingImages.length === 0) return;

      const imageMap = new Map<string, string>();
      
      await Promise.all(
        subcatsNeedingImages.map(async (subcategory) => {
          const { data: products } = await supabase
            .from('products')
            .select('id')
            .eq('subcategory_id', subcategory.id)
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
              imageMap.set(subcategory.id, media[0].url);
            }
          }
        })
      );

      setSubcategoryImages(imageMap);
    };

    if (subcategories.length > 0) {
      fetchSubcategoryImages();
    }
  }, [subcategories, showSubcategories]);

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

  if (items.length === 0) {
    return null;
  }

  // Split items evenly - first row fills with first half, second row gets the rest
  const halfLength = Math.ceil(items.length / 2);
  const firstRow = items.slice(0, halfLength);
  const secondRow = items.slice(halfLength);

  const CategoryItem = ({ item, isSubcategory }: { item: typeof items[0]; isSubcategory: boolean }) => {
    // Get appropriate image based on item type
    const getDisplayImage = () => {
      // First try local bundled image for subcategories
      if (isSubcategory) {
        const localImage = getSubcategoryImage(item.slug);
        if (localImage) return localImage;
      }
      
      // Then try database image_url
      if (item.image_url) return item.image_url;
      
      // Fallback to fetched product images
      if (isSubcategory) {
        return subcategoryImages.get(item.id);
      }
      return categoryImages.get(item.id);
    };

    const displayImage = getDisplayImage();

    // Build the link URL
    const linkUrl = isSubcategory && selectedCategory
      ? `/categories?category=${selectedCategory.slug}&subcategory=${item.slug}`
      : `/categories?category=${item.slug}`;

    return (
      <Link
        to={linkUrl}
        className="group flex flex-col items-center text-center flex-shrink-0"
      >
        {/* Category Image */}
        <div className="relative w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-3xl overflow-hidden bg-muted border-2 border-transparent group-hover:border-primary/50 transition-all duration-300 group-hover:shadow-lg group-hover:scale-105">
          {displayImage ? (
            <img
              src={displayImage}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <Package className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        
        {/* Item Name */}
        <span className="mt-1.5 text-[10px] sm:text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 max-w-[60px] sm:max-w-[70px] font-medium leading-tight">
          {item.name}
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
              {firstRow.map((item) => (
                <CategoryItem key={item.id} item={item} isSubcategory={showSubcategories} />
              ))}
            </div>
            
            {/* Second Row */}
            {secondRow.length > 0 && (
              <div className={`flex gap-4 sm:gap-5 md:gap-6 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {secondRow.map((item) => (
                  <CategoryItem key={item.id} item={item} isSubcategory={showSubcategories} />
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
