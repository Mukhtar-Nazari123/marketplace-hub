import { useLanguage } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ProductFormData } from '@/pages/dashboard/AddProduct';
import { CategorySpecificFields } from './CategorySpecificFields';
import { cn } from '@/lib/utils';

interface BasicInfoStepProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

export const BasicInfoStep = ({ formData, updateFormData }: BasicInfoStepProps) => {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {isRTL ? 'اطلاعات پایه محصول' : 'Basic Product Information'}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {isRTL 
            ? 'اطلاعات اصلی محصول را وارد کنید'
            : 'Enter the main details of your product'}
        </p>
      </div>

      <div className="grid gap-6">
        {/* Product Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            {isRTL ? 'نام محصول' : 'Product Name'} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder={isRTL ? 'مثال: گوشی هوشمند سامسونگ گلکسی' : 'e.g., Samsung Galaxy Smartphone'}
            className={cn(isRTL && "text-right")}
          />
          {formData.name && formData.name.length < 3 && (
            <p className="text-xs text-destructive">
              {isRTL ? 'نام محصول باید حداقل ۳ کاراکتر باشد' : 'Product name must be at least 3 characters'}
            </p>
          )}
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <Label htmlFor="shortDescription" className="text-sm font-medium">
            {isRTL ? 'توضیح کوتاه' : 'Short Description'}
          </Label>
          <Input
            id="shortDescription"
            value={formData.shortDescription}
            onChange={(e) => updateFormData({ shortDescription: e.target.value })}
            placeholder={isRTL ? 'یک خط توضیح درباره محصول' : 'A brief one-line description'}
            maxLength={160}
            className={cn(isRTL && "text-right")}
          />
          <p className="text-xs text-muted-foreground">
            {formData.shortDescription.length}/160
          </p>
        </div>

        {/* Detailed Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            {isRTL ? 'توضیحات کامل' : 'Detailed Description'}
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder={isRTL 
              ? 'توضیحات کامل محصول را بنویسید. ویژگی‌ها، مزایا و اطلاعات مهم را ذکر کنید...'
              : 'Write a detailed description of your product. Include features, benefits, and important information...'}
            rows={5}
            className={cn("resize-none", isRTL && "text-right")}
          />
        </div>

        {/* Brand */}
        <div className="space-y-2">
          <Label htmlFor="brand" className="text-sm font-medium">
            {isRTL ? 'برند' : 'Brand'}
          </Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => updateFormData({ brand: e.target.value })}
            placeholder={isRTL ? 'نام برند (در صورت وجود)' : 'Brand name (if applicable)'}
            className={cn(isRTL && "text-right")}
          />
        </div>

        {/* Category-Specific Fields */}
        {formData.categoryId && (
          <div className="pt-6 border-t">
            <h4 className="text-base font-medium mb-4">
              {isRTL ? 'مشخصات اختصاصی دسته‌بندی' : 'Category-Specific Details'}
            </h4>
            <CategorySpecificFields
              categoryId={formData.categoryId}
              attributes={formData.attributes}
              updateAttributes={(attributes) => updateFormData({ attributes })}
            />
          </div>
        )}
      </div>
    </div>
  );
};
