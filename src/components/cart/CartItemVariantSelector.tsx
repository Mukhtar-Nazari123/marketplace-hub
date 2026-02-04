import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PRODUCT_COLORS, getLocalizedColorName, getColorByValue } from '@/lib/productColors';
import { Truck } from 'lucide-react';

interface DeliveryOption {
  id: string;
  label_en: string;
  label_fa: string | null;
  label_ps: string | null;
  price_afn: number;
  delivery_hours: number;
  shipping_type: string;
}

interface CartItemVariantSelectorProps {
  productId: string;
  selectedColor: string | null;
  selectedSize: string | null;
  selectedDeliveryOptionId: string | null;
  onColorChange: (color: string | null) => void;
  onSizeChange: (size: string | null) => void;
  onDeliveryOptionChange: (optionId: string | null) => void;
}

interface ProductVariants {
  colors: string[];
  sizes: string[];
  deliveryOptions: DeliveryOption[];
}

const CartItemVariantSelector = ({
  productId,
  selectedColor,
  selectedSize,
  selectedDeliveryOptionId,
  onColorChange,
  onSizeChange,
  onDeliveryOptionChange,
}: CartItemVariantSelectorProps) => {
  const { language, isRTL } = useLanguage();
  const [variants, setVariants] = useState<ProductVariants>({ colors: [], sizes: [], deliveryOptions: [] });
  const [loading, setLoading] = useState(true);

  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  const getDeliveryLabel = (option: DeliveryOption) => {
    if (language === 'ps' && option.label_ps) return option.label_ps;
    if (language === 'fa' && option.label_fa) return option.label_fa;
    return option.label_en;
  };

  useEffect(() => {
    const fetchVariants = async () => {
      setLoading(true);
      try {
        // Fetch available colors from product_media
        const { data: colorMedia } = await supabase
          .from('product_media')
          .select('color_value')
          .eq('product_id', productId)
          .not('color_value', 'is', null);

        const colors = [...new Set(colorMedia?.map(m => m.color_value).filter(Boolean) || [])] as string[];

        // Fetch product metadata for sizes
        const { data: product } = await supabase
          .from('products')
          .select('metadata')
          .eq('id', productId)
          .maybeSingle();

        const stockPerSize = (product?.metadata as any)?.stockPerSize || {};
        const sizes = Object.keys(stockPerSize).filter(size => Number(stockPerSize[size]) > 0);

        // Fetch delivery options
        const { data: deliveryOptions } = await supabase
          .from('delivery_options')
          .select('id, label_en, label_fa, label_ps, price_afn, delivery_hours, shipping_type')
          .eq('product_id', productId)
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        setVariants({ 
          colors, 
          sizes, 
          deliveryOptions: deliveryOptions || [] 
        });

        // Auto-select first available variant if not already selected
        if (colors.length > 0 && !selectedColor) {
          onColorChange(colors[0]);
        }
        if (sizes.length > 0 && !selectedSize) {
          onSizeChange(sizes[0]);
        }
        // Auto-select default or first delivery option
        if (deliveryOptions && deliveryOptions.length > 0 && !selectedDeliveryOptionId) {
          onDeliveryOptionChange(deliveryOptions[0].id);
        }
      } catch (error) {
        console.error('Error fetching variants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [productId]);

  if (loading) {
    return null;
  }

  const hasColors = variants.colors.length > 0;
  const hasSizes = variants.sizes.length > 0;
  const hasDeliveryOptions = variants.deliveryOptions.length > 0;

  if (!hasColors && !hasSizes && !hasDeliveryOptions) {
    return null;
  }

  const selectedDeliveryOption = variants.deliveryOptions.find(o => o.id === selectedDeliveryOptionId);
  const afnSymbol = isRTL ? '؋' : 'AFN ';

  return (
    <div className="flex flex-wrap gap-3 mt-2 items-center">
      {/* Color Selector */}
      {hasColors && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            {getLabel('Color:', 'رنگ:', 'رنګ:')}
          </Label>
          <Select
            value={selectedColor || undefined}
            onValueChange={(val) => onColorChange(val)}
          >
            <SelectTrigger className="h-7 w-[120px] text-xs">
              <SelectValue placeholder={getLabel('Select', 'انتخاب', 'وټاکئ')} />
            </SelectTrigger>
            <SelectContent>
              {variants.colors.map((colorValue) => {
                const colorDef = getColorByValue(colorValue);
                return (
                  <SelectItem key={colorValue} value={colorValue} className="text-xs">
                    <div className="flex items-center gap-2">
                      {colorDef && (
                        <span
                          className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                          style={{
                            background: colorDef.hex.startsWith('linear') ? colorDef.hex : colorDef.hex,
                            backgroundColor: colorDef.hex.startsWith('linear') ? undefined : colorDef.hex,
                          }}
                        />
                      )}
                      <span>{getLocalizedColorName(colorValue, isRTL)}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Size Selector */}
      {hasSizes && (
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            {getLabel('Size:', 'سایز:', 'اندازه:')}
          </Label>
          <Select
            value={selectedSize || undefined}
            onValueChange={(val) => onSizeChange(val)}
          >
            <SelectTrigger className="h-7 w-[80px] text-xs">
              <SelectValue placeholder={getLabel('Select', 'انتخاب', 'وټاکئ')} />
            </SelectTrigger>
            <SelectContent>
              {variants.sizes.map((size) => (
                <SelectItem key={size} value={size} className="text-xs">
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Delivery Option Selector */}
      {hasDeliveryOptions && (
        <div className="flex items-center gap-2">
          <Truck className="h-3.5 w-3.5 text-muted-foreground" />
          <Label className="text-xs text-muted-foreground whitespace-nowrap">
            {getLabel('Delivery:', 'ارسال:', 'لیږد:')}
          </Label>
          <Select
            value={selectedDeliveryOptionId || undefined}
            onValueChange={(val) => onDeliveryOptionChange(val)}
          >
            <SelectTrigger className="h-7 w-[160px] text-xs">
              <SelectValue placeholder={getLabel('Select', 'انتخاب', 'وټاکئ')} />
            </SelectTrigger>
            <SelectContent>
              {variants.deliveryOptions.map((option) => (
                <SelectItem key={option.id} value={option.id} className="text-xs">
                  <div className="flex items-center gap-1.5">
                    <span>{getDeliveryLabel(option)}</span>
                    <span className="text-muted-foreground">
                      {option.price_afn === 0 
                        ? `(${getLabel('Free', 'رایگان', 'وړیا')})` 
                        : `(${option.price_afn} ${afnSymbol})`
                      }
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default CartItemVariantSelector;
