import { useLanguage } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData } from '@/pages/dashboard/AddProduct';
import { cn } from '@/lib/utils';
import { DollarSign, Tag, Package, Hash } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface PricingStepProps {
  formData: ProductFormData;
  updateFormData: (updates: Partial<ProductFormData>) => void;
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const PricingStep = ({ formData, updateFormData }: PricingStepProps) => {
  const { isRTL } = useLanguage();
  const isClothing = formData.categoryId === 'clothing';

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

  const handleStockPerSizeChange = (size: string, value: string) => {
    const numValue = parseInt(value) || 0;
    updateFormData({
      stockPerSize: {
        ...formData.stockPerSize,
        [size]: numValue,
      },
    });
  };

  const calculateDiscount = () => {
    if (!formData.discountPrice || formData.discountPrice >= formData.price) return null;
    const discount = ((formData.price - formData.discountPrice) / formData.price) * 100;
    return Math.round(discount);
  };

  const discountPercentage = calculateDiscount();

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

      <div className="grid gap-6 md:grid-cols-2">
        {/* Price */}
        <Card className="p-4 space-y-3">
          <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            {isRTL ? 'قیمت' : 'Price'} <span className="text-destructive">*</span>
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
              className={cn("text-lg font-semibold", isRTL ? "text-right pr-16" : "pl-16")}
            />
            <span className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium",
              isRTL ? "right-3" : "left-3"
            )}>
              AFN
            </span>
          </div>
          {formData.price <= 0 && (
            <p className="text-xs text-destructive">
              {isRTL ? 'قیمت باید بیشتر از صفر باشد' : 'Price must be greater than 0'}
            </p>
          )}
        </Card>

        {/* Discount Price */}
        <Card className="p-4 space-y-3">
          <Label htmlFor="discountPrice" className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4 text-accent" />
            {isRTL ? 'قیمت با تخفیف' : 'Discount Price'}
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
              className={cn("text-lg", isRTL ? "text-right pr-16" : "pl-16")}
            />
            <span className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium",
              isRTL ? "right-3" : "left-3"
            )}>
              AFN
            </span>
          </div>
          {discountPercentage && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">
                {discountPercentage}% {isRTL ? 'تخفیف' : 'OFF'}
              </span>
            </div>
          )}
          {formData.discountPrice && formData.discountPrice >= formData.price && (
            <p className="text-xs text-destructive">
              {isRTL ? 'قیمت تخفیف باید کمتر از قیمت اصلی باشد' : 'Discount price must be less than original price'}
            </p>
          )}
        </Card>

        {/* Stock Quantity */}
        {!isClothing && (
          <Card className="p-4 space-y-3">
            <Label htmlFor="quantity" className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              {isRTL ? 'تعداد موجودی' : 'Stock Quantity'}
            </Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              value={formData.quantity || ''}
              onChange={(e) => handleQuantityChange(e.target.value)}
              placeholder="0"
              className={cn("text-lg", isRTL && "text-right")}
            />
            {formData.quantity <= 0 && (
              <p className="text-xs text-warning">
                {isRTL ? 'محصول با موجودی ۰ قابل فروش نیست' : 'Product with 0 stock cannot be sold'}
              </p>
            )}
          </Card>
        )}

        {/* SKU */}
        <Card className="p-4 space-y-3">
          <Label htmlFor="sku" className="text-sm font-medium flex items-center gap-2">
            <Hash className="w-4 h-4 text-muted-foreground" />
            {isRTL ? 'کد محصول (SKU)' : 'SKU (Stock Keeping Unit)'}
          </Label>
          <Input
            id="sku"
            value={formData.sku}
            onChange={(e) => updateFormData({ sku: e.target.value })}
            placeholder={isRTL ? 'اختیاری' : 'Optional'}
            className={cn(isRTL && "text-right")}
          />
          <p className="text-xs text-muted-foreground">
            {isRTL ? 'کد یکتا برای مدیریت انبار' : 'Unique code for inventory management'}
          </p>
        </Card>
      </div>

      {/* Stock per Size (for clothing) */}
      {isClothing && (
        <Card className="p-4 space-y-4">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            {isRTL ? 'موجودی بر اساس سایز' : 'Stock Per Size'}
          </Label>
          
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {SIZES.map((size) => (
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
                  className="text-center"
                />
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            {isRTL 
              ? `موجودی کل: ${Object.values(formData.stockPerSize || {}).reduce((a, b) => a + (Number(b) || 0), 0)}`
              : `Total stock: ${Object.values(formData.stockPerSize || {}).reduce((a, b) => a + (Number(b) || 0), 0)}`}
          </p>
        </Card>
      )}

      {/* Price Summary */}
      {formData.price > 0 && (
        <Card className="p-4 bg-muted/50">
          <h4 className="text-sm font-medium mb-3">
            {isRTL ? 'خلاصه قیمت' : 'Price Summary'}
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{isRTL ? 'قیمت اصلی' : 'Original Price'}</span>
              <span className={cn(formData.discountPrice && "line-through text-muted-foreground")}>
                AFN {formData.price.toLocaleString()}
              </span>
            </div>
            {formData.discountPrice && formData.discountPrice < formData.price && (
              <>
                <div className="flex justify-between text-success">
                  <span>{isRTL ? 'قیمت با تخفیف' : 'Sale Price'}</span>
                  <span className="font-semibold">AFN {formData.discountPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-accent">
                  <span>{isRTL ? 'صرفه‌جویی' : 'You Save'}</span>
                  <span>AFN {(formData.price - formData.discountPrice).toLocaleString()} ({discountPercentage}%)</span>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
