import { useLanguage } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData, CurrencyType } from '@/pages/dashboard/AddProduct';
import { cn } from '@/lib/utils';
import { DollarSign, Tag, Package, Banknote, Truck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  const handleCurrencyChange = (currency: string) => {
    updateFormData({ currency: currency as CurrencyType });
  };

  const calculateDiscount = (price: number, discountPrice: number | null) => {
    if (!discountPrice || discountPrice >= price) return null;
    const discount = ((price - discountPrice) / price) * 100;
    return Math.round(discount);
  };

  const discountPercentage = calculateDiscount(formData.price, formData.discountPrice);
  const currencySymbol = formData.currency === 'AFN' ? '؋' : '$';
  const currencyLabel = formData.currency;

  // Currency icon component
  const CurrencyIcon = formData.currency === 'AFN' ? Banknote : DollarSign;

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

      {/* Currency Selector */}
      <Card className="p-4">
        <Label className="text-sm font-medium mb-3 block">
          {isRTL ? 'واحد پول' : 'Currency'}
        </Label>
        <Tabs value={formData.currency} onValueChange={handleCurrencyChange}>
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="AFN" className="gap-2">
              <Banknote className="h-4 w-4" />
              AFN (افغانی)
            </TabsTrigger>
            <TabsTrigger value="USD" className="gap-2">
              <DollarSign className="h-4 w-4" />
              USD (Dollar)
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground mt-2">
          {isRTL ? 'واحد پول را برای قیمت‌گذاری محصول انتخاب کنید' : 'Select the currency for product pricing'}
        </p>
      </Card>

      {/* Prices */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <Label htmlFor="price" className="text-sm font-medium flex items-center gap-2">
            <CurrencyIcon className={cn("w-4 h-4", formData.currency === 'AFN' ? 'text-primary' : 'text-green-600')} />
            {isRTL ? 'قیمت' : 'Price'} ({currencyLabel}) <span className="text-destructive">*</span>
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
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg",
              isRTL ? "right-3" : "left-3"
            )}>
              {currencySymbol}
            </span>
          </div>
          {formData.price <= 0 && (
            <p className="text-xs text-destructive">
              {isRTL ? 'قیمت باید بیشتر از صفر باشد' : 'Price must be greater than 0'}
            </p>
          )}
        </Card>

        <Card className="p-4 space-y-3">
          <Label htmlFor="discountPrice" className="text-sm font-medium flex items-center gap-2">
            <Tag className={cn("w-4 h-4", formData.currency === 'AFN' ? 'text-accent' : 'text-green-600')} />
            {isRTL ? 'قیمت با تخفیف' : 'Discount Price'} ({currencyLabel})
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
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg",
              isRTL ? "right-3" : "left-3"
            )}>
              {currencySymbol}
            </span>
          </div>
          {discountPercentage && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">
                {discountPercentage}% {isRTL ? 'تخفیف' : 'OFF'}
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* Delivery Fee */}
      <Card className="p-4 space-y-3 border-primary/20 bg-primary/5">
        <Label htmlFor="deliveryFee" className="text-sm font-medium flex items-center gap-2">
          <Truck className="w-4 h-4 text-primary" />
          {isRTL ? 'هزینه ارسال' : 'Delivery Fee'} ({currencyLabel}) <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="deliveryFee"
            type="number"
            min="0"
            step="0.01"
            value={formData.deliveryFee || ''}
            onChange={(e) => handleDeliveryFeeChange(e.target.value)}
            placeholder="0.00"
            className={cn("text-lg font-semibold", isRTL ? "text-right pr-16" : "pl-16")}
          />
          <span className={cn(
            "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg",
            isRTL ? "right-3" : "left-3"
          )}>
            {currencySymbol}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {isRTL 
            ? 'هزینه ارسال برای این محصول. خریداران این هزینه را در سبد خرید خواهند دید.' 
            : 'Delivery fee for this product. Buyers will see this fee in their cart.'}
        </p>
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
            className={cn("text-lg max-w-xs", isRTL && "text-right")}
          />
          {formData.quantity <= 0 && (
            <p className="text-xs text-warning">
              {isRTL ? 'محصول با موجودی ۰ قابل فروش نیست' : 'Product with 0 stock cannot be sold'}
            </p>
          )}
        </Card>
      )}

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
                {currencySymbol} {formData.price.toLocaleString()}
              </span>
            </div>
            {formData.discountPrice && formData.discountPrice < formData.price && (
              <>
                <div className="flex justify-between text-success">
                  <span>{isRTL ? 'قیمت با تخفیف' : 'Sale Price'}</span>
                  <span className="font-semibold">{currencySymbol} {formData.discountPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-accent">
                  <span>{isRTL ? 'صرفه‌جویی' : 'You Save'}</span>
                  <span>{currencySymbol} {(formData.price - formData.discountPrice).toLocaleString()} ({discountPercentage}%)</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-muted-foreground flex items-center gap-1">
                <Truck className="w-3 h-3" />
                {isRTL ? 'هزینه ارسال' : 'Delivery Fee'}
              </span>
              <span>{currencySymbol} {(formData.deliveryFee || 0).toLocaleString()}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};