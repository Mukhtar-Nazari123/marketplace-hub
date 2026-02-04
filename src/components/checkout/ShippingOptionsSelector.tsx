import { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Zap, Gift, Clock, CheckCircle2, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export interface DeliveryOption {
  id: string;
  shipping_type: string;
  label_en: string;
  label_fa: string | null;
  label_ps: string | null;
  price_afn: number;
  delivery_hours: number;
  confidence_percent: number | null;
  is_default: boolean;
}

interface ShippingOptionsSelectorProps {
  productIds: string[];
  sellerId: string;
  sellerName: string;
  onSelectionChange: (option: DeliveryOption) => void;
  selectedOptionId?: string;
}

const ShippingOptionsSelector = ({
  productIds,
  sellerId,
  sellerName,
  onSelectionChange,
  selectedOptionId,
}: ShippingOptionsSelectorProps) => {
  const { language, isRTL } = useLanguage();
  const [options, setOptions] = useState<DeliveryOption[]>([]);
  const [loading, setLoading] = useState(true);

  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  useEffect(() => {
    const fetchOptions = async () => {
      if (!productIds.length) return;

      try {
        // Fetch delivery options for these products
        const { data, error } = await supabase
          .from('delivery_options')
          .select('*')
          .in('product_id', productIds)
          .eq('is_active', true)
          .order('sort_order');

        if (error) throw error;

        if (data && data.length > 0) {
          // Use actual delivery options from database
          setOptions(data);
          // Auto-select default option
          const defaultOption = data.find(o => o.is_default) || data[0];
          if (defaultOption && !selectedOptionId) {
            onSelectionChange(defaultOption);
          }
        } else {
          // Fallback to legacy single delivery fee from products
          // Create synthetic options from product delivery_fee
          const fallbackOptions: DeliveryOption[] = [
            {
              id: 'standard-fallback',
              shipping_type: 'standard',
              label_en: 'Standard Shipping',
              label_fa: 'ارسال معمولی',
              label_ps: 'عادي لیږد',
              price_afn: 0, // Will be overridden by cart item delivery_fee
              delivery_hours: 72,
              confidence_percent: null,
              is_default: true,
            }
          ];
          setOptions(fallbackOptions);
          onSelectionChange(fallbackOptions[0]);
        }
      } catch (error) {
        console.error('Error fetching delivery options:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [productIds, sellerId]);

  const getShippingIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'express':
        return <Zap className="h-5 w-5 text-warning" />;
      case 'free':
        return <Gift className="h-5 w-5 text-success" />;
      default:
        return <Truck className="h-5 w-5 text-primary" />;
    }
  };

  const getDeliveryTimeLabel = (hours: number) => {
    if (hours <= 24) {
      return getLabel('24 hours', '۲۴ ساعت', '۲۴ ساعته');
    } else if (hours <= 48) {
      return getLabel('48 hours', '۴۸ ساعت', '۴۸ ساعته');
    } else {
      const days = Math.ceil(hours / 24);
      return getLabel(`${days} days`, `${days} روز`, `${days} ورځې`);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) {
      return (
        <span className="text-success font-bold">
          {getLabel('Free', 'رایگان', 'وړیا')}
        </span>
      );
    }
    const symbol = isRTL ? '؋' : 'AFN ';
    return (
      <span className="font-bold text-foreground">
        {symbol}{price.toLocaleString(isRTL ? 'fa-IR' : 'en-US')}
      </span>
    );
  };

  const getOptionLabel = (option: DeliveryOption) => {
    if (language === 'ps' && option.label_ps) return option.label_ps;
    if (language === 'fa' && option.label_fa) return option.label_fa;
    return option.label_en;
  };

  if (loading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-6 bg-muted rounded w-1/3 mb-4" />
        <div className="space-y-3">
          <div className="h-16 bg-muted rounded" />
          <div className="h-16 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (options.length === 0) {
    return null;
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className={cn(
        "flex items-center gap-2 px-4 py-3 bg-muted/50 border-b",
        isRTL && "flex-row-reverse"
      )}>
        <Package className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">
          {getLabel('Ship from', 'ارسال از', 'لیږد له')} {sellerName}
        </span>
        <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
          {getLabel('Delivery Guarantee', 'تضمین تحویل', 'د تحویل تضمین')}
        </Badge>
      </div>

      {/* Options */}
      <div className="p-3 space-y-2">
        {options.map((option) => {
          const isSelected = selectedOptionId === option.id || 
            (!selectedOptionId && option.is_default);
          const isFree = option.price_afn === 0;
          const isExpress = option.shipping_type.toLowerCase() === 'express';

          return (
            <div
              key={option.id}
              onClick={() => onSelectionChange(option)}
              className={cn(
                "relative flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all",
                isSelected 
                  ? "border-primary bg-primary/5 shadow-sm" 
                  : "border-border hover:border-primary/50 hover:bg-muted/30",
                isExpress && !isSelected && "border-warning/30 bg-warning/5",
                isFree && !isSelected && "border-success/30 bg-success/5",
                isRTL && "flex-row-reverse"
              )}
            >
              {/* Radio indicator */}
              <div className={cn(
                "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center",
                isSelected 
                  ? "border-primary bg-primary" 
                  : "border-muted-foreground/40"
              )}>
                {isSelected && (
                  <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
                )}
              </div>

              {/* Icon */}
              <div className="flex-shrink-0">
                {getShippingIcon(option.shipping_type)}
              </div>

              {/* Content */}
              <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
                <div className={cn(
                  "flex items-center gap-2 flex-wrap",
                  isRTL && "flex-row-reverse justify-end"
                )}>
                  <span className="font-semibold text-foreground">
                    {getOptionLabel(option)}
                  </span>
                  {isExpress && (
                    <Badge variant="secondary" className="bg-warning/20 text-warning-foreground text-xs">
                      {getLabel('Fastest', 'سریعترین', 'ترټولو چټک')}
                    </Badge>
                  )}
                </div>
                <div className={cn(
                  "flex items-center gap-2 mt-1 text-sm text-muted-foreground",
                  isRTL && "flex-row-reverse justify-end"
                )}>
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {getLabel('Delivery:', 'تحویل:', 'تحویل:')} {getDeliveryTimeLabel(option.delivery_hours)}
                  </span>
                </div>
                {option.confidence_percent && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {option.confidence_percent}% {getLabel('delivered within this time', 'در این زمان تحویل داده می‌شود', 'پدې وخت کې تحویلیږي')}
                  </p>
                )}
              </div>

              {/* Price */}
              <div className={cn(
                "flex-shrink-0 text-lg",
                isRTL && "text-right"
              )}>
                {formatPrice(option.price_afn)}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ShippingOptionsSelector;
