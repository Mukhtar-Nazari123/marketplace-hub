import { useMemo } from 'react';
import { useLanguage } from '@/lib/i18n';
import { ProductFormData, DeliveryOptionData } from '@/pages/dashboard/AddProduct';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { generateSKU } from '@/lib/skuGenerator';
import { 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Tag, 
  Package,
  Folder,
  FileText,
  Video,
  Truck,
  Eye,
  Edit,
  Hash,
  Star,
  ShoppingCart,
  Zap,
  Gift
} from 'lucide-react';

interface ReviewStepProps {
  formData: ProductFormData;
}

// Trilingual helper
const getLabel = (en: string, fa: string, ps: string, language: string) => {
  if (language === 'ps') return ps;
  if (language === 'fa') return fa;
  return en;
};

export const ReviewStep = ({ formData }: ReviewStepProps) => {
  const { isRTL, language } = useLanguage();

  const pcsLabel = getLabel('pcs', 'عدد', 'عدد', language);
  const allImages = [...formData.imageUrls];
  const hasImages = allImages.length > 0 || formData.images.length > 0;
  const hasVideo = formData.video || formData.videoUrl;
  const totalImages = formData.imageUrls.length + formData.images.length;

  // Generate SKU
  const generatedSKU = useMemo(() => {
    if (!formData.name || !formData.categoryId) return '';
    return generateSKU(formData.categoryId, formData.categoryName, formData.name);
  }, [formData.categoryId, formData.categoryName, formData.name]);

  // Check if clothing category
  const isClothing = useMemo(() => {
    const clothingKeywords = ['clothing', 'پوشاک', 'fashion', 'apparel'];
    const categoryLower = (formData.categoryName || '').toLowerCase();
    return clothingKeywords.some(k => categoryLower.includes(k));
  }, [formData.categoryName]);

  const totalStock = isClothing 
    ? Object.values(formData.stockPerSize || {}).reduce((a, b) => a + (Number(b) || 0), 0)
    : formData.quantity;

  const validationChecks = [
    { 
      label: isRTL ? 'دسته‌بندی انتخاب شده' : 'Category selected', 
      valid: !!formData.categoryId,
      critical: true
    },
    { 
      label: isRTL ? 'نام محصول وارد شده' : 'Product name entered', 
      valid: formData.name.length >= 3,
      critical: true
    },
    { 
      label: isRTL ? 'حداقل یک تصویر' : 'At least one image', 
      valid: hasImages,
      critical: true
    },
    { 
      label: isRTL ? 'قیمت تعیین شده' : 'Price set', 
      valid: formData.price > 0,
      critical: true
    },
    { 
      label: isRTL ? 'موجودی تعیین شده' : 'Stock set', 
      valid: totalStock > 0,
      critical: false
    },
    { 
      label: isRTL ? 'توضیحات محصول' : 'Product description', 
      valid: formData.description.length > 20,
      critical: false
    },
  ];

  const criticalValid = validationChecks.filter(c => c.critical).every(c => c.valid);
  const allValid = validationChecks.every(c => c.valid);

  // Create preview URLs for new images
  const imagePreviews = formData.images.map(file => URL.createObjectURL(file));
  const allPreviewImages = [...formData.imageUrls, ...imagePreviews];

  const currencySymbol = formData.currency === 'AFN' ? '؋' : '$';
  const hasDiscount = formData.discountPrice && formData.discountPrice < formData.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((formData.price - formData.discountPrice!) / formData.price) * 100)
    : 0;

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
        criticalValid 
          ? (allValid ? "border-success/50 bg-success/5" : "border-primary/50 bg-primary/5")
          : "border-destructive/50 bg-destructive/5"
      )}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            {criticalValid ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-success" />
                <span className={allValid ? "text-success" : "text-primary"}>
                  {allValid 
                    ? (isRTL ? 'آماده ارسال' : 'Ready to Submit')
                    : (isRTL ? 'قابل ارسال (پیشنهادات موجود)' : 'Can Submit (Suggestions Available)')}
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-destructive" />
                <span className="text-destructive">
                  {isRTL ? 'اطلاعات ضروری ناقص است' : 'Required information is missing'}
                </span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {validationChecks.map((check, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                {check.valid ? (
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                ) : check.critical ? (
                  <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-warning shrink-0" />
                )}
                <span className={cn(
                  check.valid ? "text-foreground" : "text-muted-foreground",
                  !check.valid && check.critical && "text-destructive"
                )}>
                  {check.label}
                </span>
                {check.critical && !check.valid && (
                  <Badge variant="destructive" className="text-xs">
                    {isRTL ? 'ضروری' : 'Required'}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Tabs */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details" className="gap-2">
            <Edit className="w-4 h-4" />
            {isRTL ? 'جزئیات' : 'Details'}
          </TabsTrigger>
          <TabsTrigger value="preview" className="gap-2">
            <Eye className="w-4 h-4" />
            {isRTL ? 'پیش‌نمایش خریدار' : 'Buyer Preview'}
          </TabsTrigger>
        </TabsList>

        {/* Details Tab */}
        <TabsContent value="details" className="mt-4 space-y-6">
          {/* Product Preview Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Images Preview */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  {isRTL ? 'تصاویر' : 'Images'} 
                  <Badge variant={hasImages ? "default" : "destructive"}>
                    {totalImages}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasImages ? (
                  <div className="grid grid-cols-3 gap-2">
                    {allPreviewImages.slice(0, 6).map((src, index) => (
                      <div key={index} className={cn(
                        "aspect-square rounded-lg overflow-hidden bg-muted relative",
                        index === 0 && "ring-2 ring-primary"
                      )}>
                        <img
                          src={src}
                          alt={`Product ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1">
                            <Badge className="text-xs py-0">
                              <Star className="w-3 h-3 mr-1" />
                              {isRTL ? 'اصلی' : 'Main'}
                            </Badge>
                          </div>
                        )}
                      </div>
                    ))}
                    {totalImages > 6 && (
                      <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                        <span className="text-sm text-muted-foreground">+{totalImages - 6}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {isRTL ? 'تصویری انتخاب نشده' : 'No images selected'}
                  </p>
                )}
                
                {hasVideo && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <Video className="w-4 h-4 text-success" />
                    <CheckCircle2 className="w-3 h-3 text-success" />
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
                  <p className={cn("font-medium", !formData.name && "text-destructive")}>
                    {formData.name || (isRTL ? '(وارد نشده)' : '(Not entered)')}
                  </p>
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

                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {isRTL ? 'کد محصول' : 'SKU'}
                  </p>
                  <code className="text-sm bg-muted px-2 py-0.5 rounded">
                    {generatedSKU || '---'}
                  </code>
                </div>
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
                  {formData.categoryName ? (
                    <Badge variant="secondary">
                      {formData.categoryName}
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      {isRTL ? 'انتخاب نشده' : 'Not selected'}
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
                  {hasDiscount ? (
                    <>
                      <span className="text-xl font-bold text-primary">
                        {currencySymbol} {formData.discountPrice?.toLocaleString()}
                      </span>
                      <span className="text-sm text-muted-foreground line-through">
                        {currencySymbol} {formData.price.toLocaleString()}
                      </span>
                      <Badge variant="default" className="bg-success/10 text-success border-success/20">
                        {discountPercentage}% {isRTL ? 'تخفیف' : 'OFF'}
                      </Badge>
                    </>
                  ) : formData.price > 0 ? (
                    <span className="text-xl font-bold">
                      {currencySymbol} {formData.price.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-destructive">
                      {isRTL ? 'قیمت تعیین نشده' : 'Price not set'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {totalStock > 0 ? (
                      <Badge variant={totalStock > 10 ? "default" : "secondary"}>
                        {totalStock} {isRTL ? 'عدد موجود' : 'in stock'}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        {isRTL ? 'موجود نیست' : 'Out of stock'}
                      </Badge>
                    )}
                  </span>
                </div>

                {/* Delivery Options */}
                <div className="pt-2 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="w-4 h-4 text-primary" />
                    <span>{getLabel('Delivery Options', 'گزینه‌های ارسال', 'د لېږد اختیارونه', language)}:</span>
                  </div>
                  {formData.deliveryOptions && formData.deliveryOptions.length > 0 ? (
                    <div className="space-y-1.5 pl-6">
                      {formData.deliveryOptions.filter(opt => opt.is_active).map((option, idx) => {
                        // Derive label from shipping type
                        const shippingTypeLabels: Record<string, { en: string; fa: string; ps: string }> = {
                          standard: { en: 'Standard Shipping', fa: 'ارسال معمولی', ps: 'عادي لیږد' },
                          express: { en: 'Express Shipping', fa: 'ارسال فوری', ps: 'چټک لیږد' },
                          free: { en: 'Free Shipping', fa: 'ارسال رایگان', ps: 'وړیا لیږد' },
                        };
                        const typeLabel = shippingTypeLabels[option.shipping_type] || shippingTypeLabels.standard;
                        const displayLabel = language === 'ps' ? typeLabel.ps : language === 'fa' ? typeLabel.fa : typeLabel.en;

                        return (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            {option.shipping_type === 'express' && <Zap className="w-3 h-3 text-warning" />}
                            {option.shipping_type === 'free' && <Gift className="w-3 h-3 text-success" />}
                            {option.shipping_type === 'standard' && <Truck className="w-3 h-3 text-muted-foreground" />}
                            <span className="font-medium">{displayLabel}</span>
                            <span className="text-muted-foreground">—</span>
                            {option.price_afn === 0 ? (
                              <Badge variant="outline" className="text-success text-xs py-0">
                                {getLabel('Free', 'رایگان', 'وړیا', language)}
                              </Badge>
                            ) : (
                              <span className="text-primary font-medium">
                                ؋ {option.price_afn.toLocaleString()}
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              ({option.delivery_hours}h)
                            </span>
                            {option.is_default && (
                              <Badge variant="secondary" className="text-xs py-0">
                                {getLabel('Default', 'پیش‌فرض', 'ډیفالټ', language)}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground pl-6">
                      {getLabel('No delivery options defined', 'گزینه ارسال تعریف نشده', 'د لېږد اختیار نه دی ټاکل شوی', language)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category-Specific Attributes */}
          {Object.keys(formData.attributes).length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  {isRTL ? 'مشخصات اختصاصی' : 'Specific Attributes'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(formData.attributes).map(([key, value]) => {
                    if (!value) return null;
                    
                    // Special handling for sizes - show stock per size
                    if (key === 'sizes' && Array.isArray(value)) {
                      const sizesWithStock = value.map((size: string) => {
                        const stock = formData.stockPerSize?.[size] || 0;
                        return `${size}(${stock}${pcsLabel})`;
                      }).join(', ');
                      
                      return (
                        <div key={key} className="text-sm">
                          <span className="text-muted-foreground capitalize">
                            {isRTL ? 'سایزها' : 'Sizes'}:
                          </span>{' '}
                          <span className="font-medium">{sizesWithStock}</span>
                        </div>
                      );
                    }
                    
                    return (
                      <div key={key} className="text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>{' '}
                        <span className="font-medium">
                          {typeof value === 'boolean' 
                            ? (value ? (isRTL ? 'بله' : 'Yes') : (isRTL ? 'خیر' : 'No'))
                            : Array.isArray(value) ? value.join(', ') : String(value)}
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
                <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-6">
                  {formData.description}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Buyer Preview Tab */}
        <TabsContent value="preview" className="mt-4">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Product Images */}
              <div className="bg-muted aspect-square md:aspect-auto relative">
                {allPreviewImages.length > 0 ? (
                  <img
                    src={allPreviewImages[0]}
                    alt={formData.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
                {hasDiscount && (
                  <Badge className="absolute top-4 left-4 bg-destructive">
                    {discountPercentage}% {isRTL ? 'تخفیف' : 'OFF'}
                  </Badge>
                )}
              </div>

              {/* Product Info */}
              <div className="p-6 space-y-4">
                {formData.brand && (
                  <Badge variant="outline" className="text-xs">
                    {formData.brand}
                  </Badge>
                )}
                
                <h2 className="text-2xl font-bold">
                  {formData.name || (isRTL ? 'نام محصول' : 'Product Name')}
                </h2>

                {formData.shortDescription && (
                  <p className="text-muted-foreground">
                    {formData.shortDescription}
                  </p>
                )}

                {/* Category */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Folder className="w-4 h-4" />
                  {formData.categoryName}
                  {formData.subCategoryName && ` / ${formData.subCategoryName}`}
                </div>

                {/* Price */}
                <div className="pt-4 border-t">
                  {hasDiscount ? (
                    <div className="flex items-baseline gap-3">
                      <span className="text-3xl font-bold text-primary">
                        {currencySymbol} {formData.discountPrice?.toLocaleString()}
                      </span>
                      <span className="text-xl text-muted-foreground line-through">
                        {currencySymbol} {formData.price.toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold">
                      {currencySymbol} {formData.price.toLocaleString() || '0'}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="flex items-center gap-2">
                  {totalStock > 0 ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-success" />
                      <span className="text-success font-medium">
                        {isRTL ? 'موجود در انبار' : 'In Stock'}
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-destructive" />
                      <span className="text-destructive font-medium">
                        {isRTL ? 'ناموجود' : 'Out of Stock'}
                      </span>
                    </>
                  )}
                </div>

                {/* Delivery Info */}
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-primary" />
                  {formData.deliveryFee === 0 ? (
                    <span className="text-success font-medium">
                      {isRTL ? 'ارسال رایگان' : 'Free Delivery'}
                    </span>
                  ) : (
                    <span>
                      {isRTL ? 'هزینه ارسال:' : 'Delivery:'} {currencySymbol} {formData.deliveryFee}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button (Preview) */}
                <Button className="w-full gap-2 mt-4" size="lg" disabled>
                  <ShoppingCart className="w-5 h-5" />
                  {isRTL ? 'افزودن به سبد خرید' : 'Add to Cart'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  {isRTL ? 'این پیش‌نمایش است. دکمه در صفحه واقعی فعال خواهد بود.' : 'This is a preview. Button will be active on actual page.'}
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
