import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { ProductFormData } from '@/pages/dashboard/AddProduct';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Sparkles, 
  Dumbbell, 
  Baby,
  ChevronRight,
  ChevronLeft,
  Folder
} from 'lucide-react';

interface CategoryStepProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

interface Category {
  id: string;
  name: string;
  name_fa: string | null;
  slug: string;
}

interface Subcategory {
  id: string;
  name: string;
  name_fa: string | null;
  slug: string;
  category_id: string;
}

// Icon mapping based on category slug
const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'electronics': Smartphone,
  'clothing': Shirt,
  'home-living': Home,
  'beauty-personal-care': Sparkles,
  'sports-outdoor': Dumbbell,
  'baby-kids': Baby,
};

export const CategoryStep = ({ formData, updateFormData }: CategoryStepProps) => {
  const { isRTL } = useLanguage();
  const [showSubCategories, setShowSubCategories] = useState(!!formData.categoryId);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, name_fa, slug')
        .eq('is_active', true)
        .is('parent_id', null)
        .order('sort_order');

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  // Fetch subcategories when category is selected
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!formData.categoryId) {
        setSubcategories([]);
        return;
      }

      const { data, error } = await supabase
        .from('subcategories')
        .select('id, name, name_fa, slug, category_id')
        .eq('category_id', formData.categoryId)
        .eq('is_active', true)
        .order('sort_order');

      if (!error && data) {
        setSubcategories(data);
      }
    };

    fetchSubcategories();
  }, [formData.categoryId]);

  const selectedCategory = categories.find(c => c.id === formData.categoryId);

  const handleCategorySelect = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    updateFormData({
      categoryId,
      categoryName: category ? (isRTL && category.name_fa ? category.name_fa : category.name) : '',
      subCategoryId: '',
      subCategoryName: '',
      attributes: {},
    });
    setShowSubCategories(true);
  };

  const handleSubCategorySelect = (subCategoryId: string) => {
    const subCategory = subcategories.find(s => s.id === subCategoryId);
    updateFormData({
      subCategoryId,
      subCategoryName: subCategory ? (isRTL && subCategory.name_fa ? subCategory.name_fa : subCategory.name) : '',
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-6" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {isRTL ? 'دسته‌بندی محصول را انتخاب کنید' : 'Select Product Category'}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {isRTL 
            ? 'دسته‌بندی مناسب به خریداران کمک می‌کند محصول شما را پیدا کنند'
            : 'Choosing the right category helps buyers find your product'}
        </p>
      </div>

      {/* Main Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => {
          const Icon = CATEGORY_ICONS[category.slug] || Folder;
          const isSelected = formData.categoryId === category.id;
          
          return (
            <Card
              key={category.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:border-primary/50",
                isSelected && "border-primary bg-primary/5 ring-2 ring-primary/20"
              )}
              onClick={() => handleCategorySelect(category.id)}
            >
              <CardContent className="p-3 sm:p-4 flex items-center gap-2 sm:gap-3">
                <div className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors shrink-0",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-xs sm:text-sm line-clamp-2",
                    isSelected && "text-primary"
                  )}>
                    {isRTL && category.name_fa ? category.name_fa : category.name}
                  </p>
                </div>
                {isRTL ? (
                  <ChevronLeft className={cn("w-4 h-4 text-muted-foreground shrink-0 hidden sm:block", isSelected && "text-primary")} />
                ) : (
                  <ChevronRight className={cn("w-4 h-4 text-muted-foreground shrink-0 hidden sm:block", isSelected && "text-primary")} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sub Categories */}
      {showSubCategories && selectedCategory && subcategories.length > 0 && (
        <div className="pt-6 border-t animate-fade-in">
          <Label className="text-base font-medium mb-4 block">
            {isRTL ? 'زیر دسته‌بندی' : 'Sub Category'}
          </Label>
          
          <RadioGroup
            value={formData.subCategoryId}
            onValueChange={handleSubCategorySelect}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {subcategories.map((subCategory) => (
              <Label
                key={subCategory.id}
                htmlFor={subCategory.id}
                className={cn(
                  "flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all",
                  "hover:border-primary/50",
                  formData.subCategoryId === subCategory.id && "border-primary bg-primary/5"
                )}
              >
                <RadioGroupItem value={subCategory.id} id={subCategory.id} />
                <span className="text-sm">
                  {isRTL && subCategory.name_fa ? subCategory.name_fa : subCategory.name}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
};
