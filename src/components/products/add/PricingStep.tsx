import { useLanguage } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProductFormData, CurrencyType } from '@/pages/dashboard/AddProduct';
import { cn } from '@/lib/utils';
import { DollarSign, Tag, Package } from 'lucide-react';
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

  const handlePriceChange = (value: string, currency: CurrencyType) => {
    const numValue = parseFloat(value) || 0;
    if (currency === 'AFN') {
      updateFormData({ price: numValue });
    } else {
      updateFormData({ priceUSD: numValue });
    }
  };

  const handleDiscountChange = (value: string, currency: CurrencyType) => {
    const numValue = value ? parseFloat(value) : null;
    if (currency === 'AFN') {
      updateFormData({ discountPrice: numValue });
    } else {
      updateFormData({ discountPriceUSD: numValue });
    }
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

  const handleCurrencyChange = (currency: string) => {
    updateFormData({ currency: currency as CurrencyType });
  };

  const calculateDiscount = (price: number, discountPrice: number | null) => {
    if (!discountPrice || discountPrice >= price) return null;
    const discount = ((price - discountPrice) / price) * 100;
    return Math.round(discount);
  };

  const discountPercentageAFN = calculateDiscount(formData.price, formData.discountPrice);
  const discountPercentageUSD = calculateDiscount(formData.priceUSD, formData.discountPriceUSD);

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
          {isRTL ? 'واحد پول اصلی' : 'Primary Currency'}
        </Label>
        <Tabs value={formData.currency} onValueChange={handleCurrencyChange}>
          <TabsList className="grid w-full grid-cols-2 max-w-xs">
            <TabsTrigger value="AFN">AFN (Afghani)</TabsTrigger>
            <TabsTrigger value="USD">USD (Dollar)</TabsTrigger>
          </TabsList>
        </Tabs>
        <p className="text-xs text-muted-foreground mt-2">
          {isRTL ? 'می‌توانید قیمت را در هر دو واحد وارد کنید' : 'You can enter prices in both currencies'}
        </p>
      </Card>

      {/* AFN Prices */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <Label htmlFor="price-afn" className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            {isRTL ? 'قیمت (افغانی)' : 'Price (AFN)'} <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="price-afn"
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ''}
              onChange={(e) => handlePriceChange(e.target.value, 'AFN')}
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

        <Card className="p-4 space-y-3">
          <Label htmlFor="discountPrice-afn" className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4 text-accent" />
            {isRTL ? 'قیمت با تخفیف (افغانی)' : 'Discount Price (AFN)'}
          </Label>
          <div className="relative">
            <Input
              id="discountPrice-afn"
              type="number"
              min="0"
              step="0.01"
              value={formData.discountPrice || ''}
              onChange={(e) => handleDiscountChange(e.target.value, 'AFN')}
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
          {discountPercentageAFN && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">
                {discountPercentageAFN}% {isRTL ? 'تخفیف' : 'OFF'}
              </span>
            </div>
          )}
        </Card>
      </div>

      {/* USD Prices */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-4 space-y-3">
          <Label htmlFor="price-usd" className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            {isRTL ? 'قیمت (دالر)' : 'Price (USD)'}
          </Label>
          <div className="relative">
            <Input
              id="price-usd"
              type="number"
              min="0"
              step="0.01"
              value={formData.priceUSD || ''}
              onChange={(e) => handlePriceChange(e.target.value, 'USD')}
              placeholder="0.00"
              className={cn("text-lg font-semibold", isRTL ? "text-right pr-16" : "pl-16")}
            />
            <span className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium",
              isRTL ? "right-3" : "left-3"
            )}>
              USD
            </span>
          </div>
        </Card>

        <Card className="p-4 space-y-3">
          <Label htmlFor="discountPrice-usd" className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4 text-green-600" />
            {isRTL ? 'قیمت با تخفیف (دالر)' : 'Discount Price (USD)'}
          </Label>
          <div className="relative">
            <Input
              id="discountPrice-usd"
              type="number"
              min="0"
              step="0.01"
              value={formData.discountPriceUSD || ''}
              onChange={(e) => handleDiscountChange(e.target.value, 'USD')}
              placeholder="0.00"
              className={cn("text-lg", isRTL ? "text-right pr-16" : "pl-16")}
            />
            <span className={cn(
              "absolute top-1/2 -translate-y-1/2 text-muted-foreground font-medium",
              isRTL ? "right-3" : "left-3"
            )}>
              USD
            </span>
          </div>
          {discountPercentageUSD && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded">
                {discountPercentageUSD}% {isRTL ? 'تخفیف' : 'OFF'}
              </span>
            </div>
          )}
        </Card>
      </div>

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
                  <span>AFN {(formData.price - formData.discountPrice).toLocaleString()} ({discountPercentageAFN}%)</span>
                </div>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
