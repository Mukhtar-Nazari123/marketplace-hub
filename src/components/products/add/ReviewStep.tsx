import { useLanguage } from '@/lib/i18n';
import { ProductFormData } from '@/pages/dashboard/AddProduct';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Tag, 
  Package,
  Folder,
  FileText,
  Video
} from 'lucide-react';

interface ReviewStepProps {
  formData: ProductFormData;
}

export const ReviewStep = ({ formData }: ReviewStepProps) => {
  const { isRTL } = useLanguage();

  const allImages = [...formData.imageUrls];
  const hasImages = allImages.length > 0 || formData.images.length > 0;
  const hasVideo = formData.video || formData.videoUrl;
  const totalImages = formData.imageUrls.length + formData.images.length;

  const validationChecks = [
    { 
      label: isRTL ? 'دسته‌بندی انتخاب شده' : 'Category selected', 
      valid: !!formData.categoryId 
    },
    { 
      label: isRTL ? 'نام محصول وارد شده' : 'Product name entered', 
      valid: formData.name.length >= 3 
    },
    { 
      label: isRTL ? 'حداقل یک تصویر' : 'At least one image', 
      valid: hasImages 
    },
    { 
      label: isRTL ? 'قیمت تعیین شده' : 'Price set', 
      valid: formData.price > 0 
    },
  ];

  const allValid = validationChecks.every(c => c.valid);

  // Create preview URLs for new images
  const imagePreviews = formData.images.map(file => URL.createObjectURL(file));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {isRTL ? 'بررسی و ارسال' : 'Review & Submit'}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {isRTL 
            ? 'اطلاعات محصول را قبل از ارسال بررسی کنید'
            : 'Review your product information before submitting'}
        </p>
      </div>

      {/* Validation Status */}
      <Card className={cn(
        "border-2",
        allValid ? "border-success/50 bg-success/5" : "border-warning/50 bg-warning/5"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {allValid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className="text-success">
                  {isRTL ? 'آماده ارسال' : 'Ready to Submit'}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-warning" />
                <span className="text-warning">
                  {isRTL ? 'برخی اطلاعات ناقص است' : 'Some information is missing'}
                </span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {validationChecks.map((check, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {check.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                )}
                <span className={check.valid ? "text-foreground" : "text-muted-foreground"}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Product Preview */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Images Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-primary" />
              {isRTL ? 'تصاویر' : 'Images'} ({totalImages})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasImages ? (
              <div className="grid grid-cols-3 gap-2">
                {[...formData.imageUrls, ...imagePreviews].slice(0, 6).map((src, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img
                      src={src}
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                {totalImages > 6 && (
                  <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-sm text-muted-foreground">+{totalImages - 6}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'تصویری انتخاب نشده' : 'No images selected'}
              </p>
            )}
            
            {hasVideo && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Video className="w-4 h-4" />
                {isRTL ? 'ویدیو اضافه شده' : 'Video added'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Basic Info Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              {isRTL ? 'اطلاعات پایه' : 'Basic Info'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                {isRTL ? 'نام محصول' : 'Product Name'}
              </p>
              <p className="font-medium">{formData.name || '-'}</p>
            </div>
            
            {formData.shortDescription && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {isRTL ? 'توضیح کوتاه' : 'Short Description'}
                </p>
                <p className="text-sm">{formData.shortDescription}</p>
              </div>
            )}

            {formData.brand && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  {isRTL ? 'برند' : 'Brand'}
                </p>
                <p className="text-sm">{formData.brand}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Folder className="w-4 h-4 text-primary" />
              {isRTL ? 'دسته‌بندی' : 'Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {formData.categoryName && (
                <Badge variant="secondary">
                  {formData.categoryName}
                </Badge>
              )}
              {formData.subCategoryName && (
                <Badge variant="outline">
                  {formData.subCategoryName}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Preview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Tag className="w-4 h-4 text-primary" />
              {isRTL ? 'قیمت و موجودی' : 'Price & Stock'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-baseline gap-2">
              {formData.discountPrice && formData.discountPrice < formData.price ? (
                <>
                  <span className="text-xl font-bold text-primary">
                    {formData.currency} {formData.discountPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formData.currency} {formData.price.toLocaleString()}
                  </span>
                </>
              ) : (
                <span className="text-xl font-bold">
                  {formData.currency} {formData.price.toLocaleString()}
                </span>
              )}
            </div>

            {(formData.priceUSD > 0 || formData.discountPriceUSD) && (
              <div className="flex items-baseline gap-2 text-sm text-muted-foreground">
                {formData.discountPriceUSD && formData.discountPriceUSD < formData.priceUSD ? (
                  <>
                    <span>USD {formData.discountPriceUSD.toLocaleString()}</span>
                    <span className="line-through">USD {formData.priceUSD.toLocaleString()}</span>
                  </>
                ) : formData.priceUSD > 0 ? (
                  <span>USD {formData.priceUSD.toLocaleString()}</span>
                ) : null}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                {formData.categoryId === 'clothing' 
                  ? `${Object.values(formData.stockPerSize || {}).reduce((a, b) => a + (Number(b) || 0), 0)} ${isRTL ? 'عدد در انبار' : 'in stock'}`
                  : `${formData.quantity} ${isRTL ? 'عدد در انبار' : 'in stock'}`}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category-Specific Attributes */}
      {Object.keys(formData.attributes).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {isRTL ? 'مشخصات اختصاصی' : 'Specific Attributes'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(formData.attributes).map(([key, value]) => {
                if (!value) return null;
                return (
                  <div key={key} className="text-sm">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}:
                    </span>{' '}
                    <span className="font-medium">
                      {typeof value === 'boolean' ? (isRTL ? 'بله' : 'Yes') : String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description Preview */}
      {formData.description && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              {isRTL ? 'توضیحات کامل' : 'Full Description'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {formData.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
