import { useLanguage } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData } from '@/pages/dashboard/AddProduct';
import { CategorySpecificFields } from './CategorySpecificFields';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface BasicInfoStepProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

export const BasicInfoStep = ({ formData, updateFormData }: BasicInfoStepProps) => {
  const { isRTL } = useLanguage();

  const nameValidation = {
    isValid: formData.name.length >= 3,
    message: isRTL ? 'نام محصول باید حداقل ۳ کاراکتر باشد' : 'Product name must be at least 3 characters',
  };

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
          <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
            {isRTL ? 'نام محصول' : 'Product Name'} 
            <span className="text-destructive">*</span>
            {formData.name && (
              nameValidation.isValid ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-warning" />
              )
            )}
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => updateFormData({ name: e.target.value })}
            placeholder={isRTL ? 'مثال: گوشی هوشمند سامسونگ گلکسی' : 'e.g., Samsung Galaxy Smartphone'}
            className={cn(
              isRTL && "text-right",
              formData.name && !nameValidation.isValid && "border-warning focus-visible:ring-warning"
            )}
          />
          {formData.name && !nameValidation.isValid && (
            <p className="text-xs text-warning flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {nameValidation.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Info className="w-3 h-3" />
            {isRTL 
              ? 'نام محصول در صفحه جستجو و نتایج نمایش داده می‌شود'
              : 'Product name appears in search and listing pages'}
          </p>
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
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {isRTL 
                ? 'این توضیح در لیست محصولات نمایش داده می‌شود'
                : 'This description appears in product listings'}
            </p>
            <Badge variant={formData.shortDescription.length > 140 ? 'secondary' : 'outline'} className="text-xs">
              {formData.shortDescription.length}/160
            </Badge>
          </div>
        </div>

        {/* Detailed Description with Rich Text Editor */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            {isRTL ? 'توضیحات کامل' : 'Detailed Description'}
          </Label>
          <RichTextEditor
            value={formData.description}
            onChange={(value) => updateFormData({ description: value })}
            placeholder={isRTL 
              ? 'توضیحات کامل محصول را بنویسید. ویژگی‌ها، مزایا و اطلاعات مهم را ذکر کنید...'
              : 'Write a detailed description of your product. Include features, benefits, and important information...'}
            minRows={6}
            maxLength={5000}
          />
          <p className="text-xs text-muted-foreground">
            {isRTL 
              ? 'از فرمت‌بندی برای خوانایی بهتر استفاده کنید. از عناوین، لیست‌ها و نقل قول پشتیبانی می‌شود.'
              : 'Use formatting for better readability. Supports headings, lists, and quotes.'}
          </p>
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
          <p className="text-xs text-muted-foreground">
            {isRTL 
              ? 'برند محصول به خریداران در تصمیم‌گیری کمک می‌کند'
              : 'Brand helps buyers make informed decisions'}
          </p>
        </div>

        {/* Category-Specific Fields */}
        {formData.categoryId && (
          <div className="pt-6 border-t">
            <h4 className="text-base font-medium mb-4 flex items-center gap-2">
              {isRTL ? 'مشخصات اختصاصی دسته‌بندی' : 'Category-Specific Details'}
              <Badge variant="secondary" className="text-xs font-normal">
                {formData.categoryName}
              </Badge>
            </h4>
            <CategorySpecificFields
              categoryId={formData.categoryId}
              categoryName={formData.categoryName}
              attributes={formData.attributes}
              updateAttributes={(attributes) => updateFormData({ attributes })}
            />
          </div>
        )}
      </div>
    </div>
  );
};
