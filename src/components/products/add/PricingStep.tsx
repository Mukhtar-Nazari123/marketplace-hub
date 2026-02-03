import { useMemo } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData } from '@/pages/dashboard/AddProduct';
import { cn } from '@/lib/utils';
import { Tag, Package, Banknote, Truck, AlertCircle, CheckCircle2, Info, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { generateSKU } from '@/lib/skuGenerator';

interface PricingStepProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const OTHER_SIZE_KEY = 'other';

export const PricingStep = ({ formData, updateFormData }: PricingStepProps) => {
  const { isRTL } = useLanguage();
  
  // Check if clothing category
  const isClothing = useMemo(() => {
    const clothingKeywords = ['clothing', 'پوشاک', 'fashion', 'apparel'];
    const categoryLower = (formData.categoryName || '').toLowerCase();
    return clothingKeywords.some(k => categoryLower.includes(k));
  }, [formData.categoryName]);

  // Auto-generate SKU
  const generatedSKU = useMemo(() => {
    if (!formData.name || !formData.categoryId) return '';
    return generateSKU(formData.categoryId, formData.categoryName, formData.name);
  }, [formData.categoryId, formData.categoryName, formData.name]);

  const handlePriceChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    updateFormData({ price: numValue });
  };

  const handleDiscountChange = (value: string) => {
    const numValue = value ? parseFloat(value) : null;
    updateFormData({ discountPrice: numValue });
  };

  const handleQuantityChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    updateFormData({ quantity: numValue });
  };

  const handleDeliveryFeeChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    updateFormData({ deliveryFee: numValue });
  };

  const handleStockPerSizeChange = (size: string, value: string) => {
    const numValue = parseInt(value) || 0;
    updateFormData({
      stockPerSize: {
        ...formData.stockPerSize,
        [size]: numValue,
      },
    });
  };

  const calculateDiscount = (price: number, discountPrice: number | null) => {
    if (!discountPrice || discountPrice >= price) return null;
    const discount = ((price - discountPrice) / price) * 100;
    return Math.round(discount);
  };

  const discountPercentage = calculateDiscount(formData.price, formData.discountPrice);
  // Always use AFN as the base currency
  const currencySymbol = '؋';
  const currencyLabel = 'AFN';

  // Validation states
  const priceValid = formData.price > 0;
  const discountValid = !formData.discountPrice || formData.discountPrice < formData.price;
  const stockValid = isClothing 
    ? Object.values(formData.stockPerSize || {}).some(v => (Number(v) || 0) > 0)
    : formData.quantity > 0;

  // Get selected sizes from attributes (from CategorySpecificFields)
  const selectedSizes = useMemo(() => {
    const sizesFromAttributes = formData.attributes?.sizes as string[] || [];
    // Filter to only standard sizes that were selected
    return ALL_SIZES.filter(size => sizesFromAttributes.includes(size));
  }, [formData.attributes?.sizes]);

  // Check if "freesize" or custom size is selected
  const hasCustomSize = useMemo(() => {
    const sizesFromAttributes = formData.attributes?.sizes as string[] || [];
    const hasFreeSizeSelected = sizesFromAttributes.includes('freesize');
    const hasCustomSizeText = !!(formData.attributes?.customSize as string);
    return hasFreeSizeSelected || hasCustomSizeText;
  }, [formData.attributes?.sizes, formData.attributes?.customSize]);

  // Total stock for clothing (including custom sizes)
  const totalClothingStock = Object.values(formData.stockPerSize || {}).reduce(
    (a, b) => a + (Number(b) || 0), 
    0
  );

  // Get custom size stock
  const customSizeStock = formData.stockPerSize?.[OTHER_SIZE_KEY] || 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {isRTL ? 'قیمت و موجودی' : 'Pricing & Inventory'}
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          {isRTL 
            ? 'قیمت و تعداد موجودی محصول را تعیین کنید'
            : 'Set the price and stock quantity for your product'}
        </p>
      </div>

      {/* SKU Display */}
      <Card className="p-4 bg-muted/30">
        <Label className="text-sm font-medium flex items-center gap-2 mb-2">
          <Hash className="w-4 h-4 text-primary" />
          {isRTL ? 'کد محصول (SKU)' : 'Product SKU'}
          <Badge variant="secondary" className="text-xs font-normal">
            {isRTL ? 'خودکار' : 'Auto-generated'}
          </Badge>
        </Label>
        <div className="flex items-center gap-2">
          <code className="text-lg font-mono bg-background px-3 py-1.5 rounded border">
            {generatedSKU || '---'}
          </code>
          {generatedSKU && <CheckCircle2 className="w-4 h-4 text-success" />}
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {isRTL 
            ? 'کد SKU به صورت خودکار از نام محصول و دسته‌بندی ساخته می‌شود'
            : 'SKU is automatically generated from product name and category'}
        </p>
      </Card>

      {/* Prices */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className={cn(
          "p-4 space-y-3",
          !priceValid && formData.price !== 0 && "border-destructive/50"
        )}>
          <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
            <Banknote className="w-4 h-4 text-primary" />
            {isRTL ? 'قیمت' : 'Price'} ({currencyLabel}) 
            <span className="text-destructive">*</span>
            {priceValid && <CheckCircle2 className="w-4 h-4 text-success" />}
          </Label>
          <div className="relative">
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="0.00"
              className={cn(
                "text-lg font-semibold", 
                isRTL ? "text-right pr-16" : "pl-16",
                !priceValid && formData.price !== 0 && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <span className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg",
              isRTL ? "right-3" : "left-3"
            )}>
              {currencySymbol}
            </span>
          </div>
          {!priceValid && (
            <p className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {isRTL ? 'قیمت باید بیشتر از صفر باشد' : 'Price must be greater than 0'}
            </p>
          )}
        </Card>

        <Card className={cn(
          "p-4 space-y-3",
          !discountValid && "border-warning/50"
        )}>
          <Label htmlFor="discountPrice" className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4 text-accent" />
            {isRTL ? 'قیمت با تخفیف' : 'Discount Price'} ({currencyLabel})
            <Badge variant="outline" className="text-xs font-normal">
              {isRTL ? 'اختیاری' : 'Optional'}
            </Badge>
          </Label>
          <div className="relative">
            <Input
              id="discountPrice"
              type="number"
              min="0"
              step="0.01"
              value={formData.discountPrice || ''}
              onChange={(e) => handleDiscountChange(e.target.value)}
              placeholder="0.00"
              className={cn(
                "text-lg", 
                isRTL ? "text-right pr-16" : "pl-16",
                !discountValid && "border-warning focus-visible:ring-warning"
              )}
            />
            <span className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg",
              isRTL ? "right-3" : "left-3"
            )}>
              {currencySymbol}
            </span>
          </div>
          {discountPercentage && discountValid && (
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-success/10 text-success border-success/20">
                {discountPercentage}% {isRTL ? 'تخفیف' : 'OFF'}
              </Badge>
            </div>
          )}
          {!discountValid && (
            <p className="text-xs text-warning flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {isRTL ? 'قیمت تخفیف باید کمتر از قیمت اصلی باشد' : 'Discount price must be less than original price'}
            </p>
          )}
        </Card>
      </div>

      {/* Delivery Fee - Always AFN */}
      <Card className="p-4 space-y-3 border-primary/20 bg-primary/5">
        <Label htmlFor="deliveryFee" className="text-sm font-medium flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          {isRTL ? 'هزینه ارسال' : 'Delivery Fee'} (AFN)
          <Badge variant="secondary" className="text-xs font-normal">
            {isRTL ? 'همیشه افغانی' : 'Always AFN'}
          </Badge>
        </Label>
        <div className="relative">
          <Input
            id="deliveryFee"
            type="number"
            min="0"
            step="1"
            value={formData.deliveryFee || ''}
            onChange={(e) => handleDeliveryFeeChange(e.target.value)}
            placeholder="0"
            className={cn("text-lg font-semibold max-w-xs bg-muted/50", isRTL ? "text-right pr-16" : "pl-16")}
          />
          <span className={cn(
            "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg",
            isRTL ? "right-3" : "left-3"
          )}>
            ؋
          </span>
        </div>
        <p className="text-xs text-muted-foreground flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          {isRTL 
            ? 'هزینه ارسال برای این محصول. خریداران این هزینه را در سبد خرید خواهند دید. برای ارسال رایگان، صفر وارد کنید.' 
            : 'Delivery fee for this product. Buyers will see this fee in their cart. Enter 0 for free delivery.'}
        </p>
      </Card>

      {/* Stock Quantity */}
      {!isClothing ? (
        <Card className={cn(
          "p-4 space-y-3",
          !stockValid && "border-warning/50"
        )}>
          <Label htmlFor="quantity" className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            {isRTL ? 'تعداد موجودی' : 'Stock Quantity'}
            {stockValid && <CheckCircle2 className="w-4 h-4 text-success" />}
          </Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            value={formData.quantity || ''}
            onChange={(e) => handleQuantityChange(e.target.value)}
            placeholder="0"
            className={cn("text-lg max-w-xs", isRTL && "text-right")}
          />
          {!stockValid && (
            <p className="text-xs text-warning flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {isRTL ? 'محصول با موجودی ۰ قابل فروش نیست' : 'Product with 0 stock cannot be sold'}
            </p>
          )}
        </Card>
      ) : (
        /* Stock per Size (for clothing) */
        <Card className={cn(
          "p-4 space-y-4",
          !stockValid && "border-warning/50"
        )}>
          <Label className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            {isRTL ? 'موجودی بر اساس سایز' : 'Stock Per Size'}
            {stockValid && <CheckCircle2 className="w-4 h-4 text-success" />}
          </Label>
          
          {selectedSizes.length > 0 ? (
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {selectedSizes.map((size) => (
                <div key={size} className="space-y-1">
                  <Label htmlFor={`size-${size}`} className="text-xs font-medium text-center block">
                    {size}
                  </Label>
                  <Input
                    id={`size-${size}`}
                    type="number"
                    min="0"
                    value={formData.stockPerSize?.[size] || ''}
                    onChange={(e) => handleStockPerSizeChange(size, e.target.value)}
                    placeholder="0"
                    className="text-center h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {isRTL ? 'ابتدا سایزهای موجود را در مرحله قبل انتخاب کنید' : 'Please select available sizes in the previous step first'}
            </p>
          )}

          {/* Custom/Other Size Stock - only show if freesize or custom size selected */}
          {hasCustomSize && (
            <div className="pt-4 border-t space-y-3">
              <Label className="text-sm font-medium">
                {isRTL ? 'موجودی سایز سفارشی/فری' : 'Custom/Free Size Stock'}
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="custom-size-stock"
                  type="number"
                  min="0"
                  value={formData.stockPerSize?.[OTHER_SIZE_KEY] || ''}
                  onChange={(e) => handleStockPerSizeChange(OTHER_SIZE_KEY, e.target.value)}
                  placeholder="0"
                  className="w-24 text-center h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'عدد برای سایزهای سفارشی (مانند 38، 40، 42)' : 'items for custom sizes (e.g., 38, 40, 42)'}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              {isRTL ? 'موجودی کل:' : 'Total Stock:'}
            </span>
            <Badge variant={totalClothingStock > 0 ? "default" : "secondary"}>
              {totalClothingStock} {isRTL ? 'عدد' : 'items'}
            </Badge>
          </div>

          {!stockValid && (
            <p className="text-xs text-warning flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {isRTL ? 'حداقل یک سایز باید موجودی داشته باشد' : 'At least one size must have stock'}
            </p>
          )}
        </Card>
      )}

      {/* Price Summary */}
      {priceValid && (
        <Card className="p-4 bg-muted/50">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            {isRTL ? 'خلاصه قیمت' : 'Price Summary'}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isRTL ? 'قیمت اصلی' : 'Original Price'}</span>
              <span className={cn(formData.discountPrice && discountValid && "line-through text-muted-foreground")}>
                {currencySymbol} {formData.price.toLocaleString()}
              </span>
            </div>
            {formData.discountPrice && discountValid && (
              <>
                <div className="flex justify-between text-success">
                  <span>{isRTL ? 'قیمت با تخفیف' : 'Sale Price'}</span>
                  <span className="font-semibold">{currencySymbol} {formData.discountPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-accent">
                  <span>{isRTL ? 'صرفه‌جویی خریدار' : 'Buyer Saves'}</span>
                  <span>{currencySymbol} {(formData.price - formData.discountPrice).toLocaleString()} ({discountPercentage}%)</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Truck className="w-3 h-3" />
                {isRTL ? 'هزینه ارسال' : 'Delivery Fee'} (AFN)
              </span>
              <span>
                {formData.deliveryFee === 0 
                  ? <Badge variant="outline" className="text-success">{isRTL ? 'رایگان' : 'Free'}</Badge>
                  : `؋ ${(formData.deliveryFee || 0).toLocaleString()}`
                }
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Package className="w-3 h-3" />
                {isRTL ? 'موجودی' : 'Stock'}
              </span>
              <Badge variant={stockValid ? "default" : "secondary"}>
                {isClothing ? totalClothingStock : formData.quantity} {isRTL ? 'عدد' : 'items'}
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
