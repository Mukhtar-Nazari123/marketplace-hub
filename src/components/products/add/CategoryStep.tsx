import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { ProductFormData } from '@/pages/dashboard/AddProduct';
import { 
  Smartphone, 
  Shirt, 
  Home, 
  Sparkles, 
  Dumbbell, 
  Baby,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface CategoryStepProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

export const CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    nameFa: 'الکترونیک',
    icon: Smartphone,
    subCategories: [
      { id: 'phones', name: 'Phones & Tablets', nameFa: 'گوشی و تبلت' },
      { id: 'computers', name: 'Computers & Laptops', nameFa: 'کامپیوتر و لپ‌تاپ' },
      { id: 'accessories', name: 'Accessories', nameFa: 'لوازم جانبی' },
      { id: 'cameras', name: 'Cameras', nameFa: 'دوربین' },
      { id: 'audio', name: 'Audio & Headphones', nameFa: 'صوتی و هدفون' },
    ],
  },
  {
    id: 'clothing',
    name: 'Clothing',
    nameFa: 'پوشاک',
    icon: Shirt,
    subCategories: [
      { id: 'men', name: "Men's Clothing", nameFa: 'لباس مردانه' },
      { id: 'women', name: "Women's Clothing", nameFa: 'لباس زنانه' },
      { id: 'kids', name: "Kids' Clothing", nameFa: 'لباس بچگانه' },
      { id: 'shoes', name: 'Shoes', nameFa: 'کفش' },
      { id: 'accessories', name: 'Fashion Accessories', nameFa: 'اکسسوری' },
    ],
  },
  {
    id: 'home',
    name: 'Home & Living',
    nameFa: 'خانه و زندگی',
    icon: Home,
    subCategories: [
      { id: 'furniture', name: 'Furniture', nameFa: 'مبلمان' },
      { id: 'decor', name: 'Home Decor', nameFa: 'دکوراسیون' },
      { id: 'kitchen', name: 'Kitchen & Dining', nameFa: 'آشپزخانه' },
      { id: 'bedding', name: 'Bedding', nameFa: 'ملحفه و تشک' },
      { id: 'garden', name: 'Garden & Outdoor', nameFa: 'باغ و فضای باز' },
    ],
  },
  {
    id: 'beauty',
    name: 'Beauty & Personal Care',
    nameFa: 'زیبایی و بهداشت',
    icon: Sparkles,
    subCategories: [
      { id: 'skincare', name: 'Skincare', nameFa: 'مراقبت پوست' },
      { id: 'makeup', name: 'Makeup', nameFa: 'آرایش' },
      { id: 'haircare', name: 'Hair Care', nameFa: 'مراقبت مو' },
      { id: 'fragrance', name: 'Fragrance', nameFa: 'عطر' },
      { id: 'personal', name: 'Personal Care', nameFa: 'بهداشت شخصی' },
    ],
  },
  {
    id: 'sports',
    name: 'Sports & Outdoor',
    nameFa: 'ورزش و فضای باز',
    icon: Dumbbell,
    subCategories: [
      { id: 'fitness', name: 'Fitness Equipment', nameFa: 'تجهیزات ورزشی' },
      { id: 'outdoor', name: 'Outdoor Recreation', nameFa: 'تفریحات فضای باز' },
      { id: 'sportswear', name: 'Sportswear', nameFa: 'لباس ورزشی' },
      { id: 'cycling', name: 'Cycling', nameFa: 'دوچرخه‌سواری' },
      { id: 'camping', name: 'Camping & Hiking', nameFa: 'کمپینگ و کوهنوردی' },
    ],
  },
  {
    id: 'baby',
    name: 'Baby & Kids',
    nameFa: 'کودک و نوزاد',
    icon: Baby,
    subCategories: [
      { id: 'toys', name: 'Toys', nameFa: 'اسباب‌بازی' },
      { id: 'feeding', name: 'Feeding', nameFa: 'تغذیه' },
      { id: 'nursery', name: 'Nursery', nameFa: 'اتاق کودک' },
      { id: 'safety', name: 'Baby Safety', nameFa: 'ایمنی کودک' },
      { id: 'strollers', name: 'Strollers & Carriers', nameFa: 'کالسکه و آغوشی' },
    ],
  },
];

export const CategoryStep = ({ formData, updateFormData }: CategoryStepProps) => {
  const { isRTL } = useLanguage();
  const [showSubCategories, setShowSubCategories] = useState(!!formData.categoryId);

  const selectedCategory = CATEGORIES.find(c => c.id === formData.categoryId);

  const handleCategorySelect = (categoryId: string) => {
    const category = CATEGORIES.find(c => c.id === categoryId);
    updateFormData({
      categoryId,
      categoryName: category ? (isRTL ? category.nameFa : category.name) : '',
      subCategoryId: '',
      subCategoryName: '',
      attributes: {}, // Reset attributes when category changes
    });
    setShowSubCategories(true);
  };

  const handleSubCategorySelect = (subCategoryId: string) => {
    const subCategory = selectedCategory?.subCategories.find(s => s.id === subCategoryId);
    updateFormData({
      subCategoryId,
      subCategoryName: subCategory ? (isRTL ? subCategory.nameFa : subCategory.name) : '',
    });
  };

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
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
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
              <CardContent className="p-4 flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "font-medium text-sm truncate",
                    isSelected && "text-primary"
                  )}>
                    {isRTL ? category.nameFa : category.name}
                  </p>
                </div>
                {isRTL ? (
                  <ChevronLeft className={cn("w-4 h-4 text-muted-foreground", isSelected && "text-primary")} />
                ) : (
                  <ChevronRight className={cn("w-4 h-4 text-muted-foreground", isSelected && "text-primary")} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sub Categories */}
      {showSubCategories && selectedCategory && (
        <div className="pt-6 border-t animate-fade-in">
          <Label className="text-base font-medium mb-4 block">
            {isRTL ? 'زیر دسته‌بندی' : 'Sub Category'}
          </Label>
          
          <RadioGroup
            value={formData.subCategoryId}
            onValueChange={handleSubCategorySelect}
            className="grid grid-cols-2 md:grid-cols-3 gap-3"
          >
            {selectedCategory.subCategories.map((subCategory) => (
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
                  {isRTL ? subCategory.nameFa : subCategory.name}
                </span>
              </Label>
            ))}
          </RadioGroup>
        </div>
      )}
    </div>
  );
};
