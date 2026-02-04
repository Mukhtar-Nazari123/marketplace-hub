import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { 
  Truck, 
  Zap, 
  Gift, 
  Plus, 
  Trash2, 
  Clock,
  GripVertical,
  Info,
  CheckCircle2
} from 'lucide-react';

export interface DeliveryOptionInput {
  id?: string;
  shipping_type: 'standard' | 'express' | 'free';
  label_en: string;
  label_fa: string;
  label_ps: string;
  price_afn: number;
  delivery_hours: number;
  confidence_percent: number | null;
  is_default: boolean;
  is_active: boolean;
}

interface DeliveryOptionsStepProps {
  options: DeliveryOptionInput[];
  onChange: (options: DeliveryOptionInput[]) => void;
}

const SHIPPING_TYPES = [
  { 
    value: 'standard', 
    icon: Truck, 
    labelEn: 'Standard', 
    labelFa: 'معمولی', 
    labelPs: 'عادي',
    fullLabelEn: 'Standard Shipping',
    fullLabelFa: 'ارسال معمولی',
    fullLabelPs: 'عادي لیږد'
  },
  { 
    value: 'express', 
    icon: Zap, 
    labelEn: 'Express', 
    labelFa: 'فوری', 
    labelPs: 'چټک',
    fullLabelEn: 'Express Shipping',
    fullLabelFa: 'ارسال فوری',
    fullLabelPs: 'چټک لیږد'
  },
  { 
    value: 'free', 
    icon: Gift, 
    labelEn: 'Free', 
    labelFa: 'رایگان', 
    labelPs: 'وړیا',
    fullLabelEn: 'Free Shipping',
    fullLabelFa: 'ارسال رایگان',
    fullLabelPs: 'وړیا لیږد'
  },
];

const getLabelsForType = (type: 'standard' | 'express' | 'free') => {
  const typeInfo = SHIPPING_TYPES.find(t => t.value === type);
  return {
    label_en: typeInfo?.fullLabelEn || 'Standard Shipping',
    label_fa: typeInfo?.fullLabelFa || 'ارسال معمولی',
    label_ps: typeInfo?.fullLabelPs || 'عادي لیږد',
  };
};

const DEFAULT_OPTIONS: DeliveryOptionInput[] = [
  {
    shipping_type: 'standard',
    ...getLabelsForType('standard'),
    price_afn: 100,
    delivery_hours: 72,
    confidence_percent: 85,
    is_default: true,
    is_active: true,
  },
  {
    shipping_type: 'express',
    ...getLabelsForType('express'),
    price_afn: 200,
    delivery_hours: 24,
    confidence_percent: 95,
    is_default: false,
    is_active: true,
  },
];

export const DeliveryOptionsStep = ({ options, onChange }: DeliveryOptionsStepProps) => {
  const { isRTL, language } = useLanguage();

  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  const addOption = () => {
    const newOption: DeliveryOptionInput = {
      shipping_type: 'standard',
      ...getLabelsForType('standard'),
      price_afn: 0,
      delivery_hours: 72,
      confidence_percent: null,
      is_default: options.length === 0,
      is_active: true,
    };
    onChange([...options, newOption]);
  };

  const removeOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    // Ensure at least one default
    if (newOptions.length > 0 && !newOptions.some(o => o.is_default)) {
      newOptions[0].is_default = true;
    }
    onChange(newOptions);
  };

  const updateOption = (index: number, updates: Partial<DeliveryOptionInput>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };

    // If setting this as default, unset others
    if (updates.is_default) {
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.is_default = false;
      });
    }

    // If changing shipping type, auto-update labels and handle free price
    if (updates.shipping_type) {
      const labels = getLabelsForType(updates.shipping_type);
      newOptions[index] = { ...newOptions[index], ...labels };
      
      if (updates.shipping_type === 'free') {
        newOptions[index].price_afn = 0;
      }
    }

    onChange(newOptions);
  };

  const initializeDefaults = () => {
    onChange(DEFAULT_OPTIONS);
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = SHIPPING_TYPES.find(t => t.value === type);
    if (!typeInfo) return Truck;
    return typeInfo.icon;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">
          {getLabel('Delivery Options', 'گزینه‌های ارسال', 'د لیږد اختیارونه')}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          {getLabel(
            'Define shipping options for buyers. At least one option is required.',
            'گزینه‌های ارسال را برای خریداران تعیین کنید. حداقل یک گزینه لازم است.',
            'د پیرودونکو لپاره د لیږد اختیارونه تعریف کړئ. لږترلږه یو اختیار اړین دی.'
          )}
        </p>
      </div>

      {options.length === 0 && (
        <Card className="p-6 text-center border-dashed">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="font-medium mb-2">
            {getLabel('No delivery options yet', 'هنوز گزینه ارسالی ندارید', 'تر اوسه د لیږد اختیار نشته')}
          </h4>
          <p className="text-sm text-muted-foreground mb-4">
            {getLabel(
              'Add shipping options or use our recommended defaults',
              'گزینه‌های ارسال اضافه کنید یا از پیش‌فرض‌های پیشنهادی استفاده کنید',
              'د لیږد اختیارونه اضافه کړئ یا زموږ وړاندیز شوي ډیفالټونه وکاروئ'
            )}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={addOption}>
              <Plus className="h-4 w-4 mr-2" />
              {getLabel('Add Custom', 'افزودن سفارشی', 'دودیز اضافه کړئ')}
            </Button>
            <Button onClick={initializeDefaults}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {getLabel('Use Defaults', 'استفاده از پیش‌فرض', 'ډیفالټ وکاروئ')}
            </Button>
          </div>
        </Card>
      )}

      {options.map((option, index) => {
        const IconComponent = getTypeIcon(option.shipping_type);
        
        return (
          <Card key={index} className={cn(
            "p-4 space-y-4",
            option.is_default && "border-primary/50 bg-primary/5"
          )}>
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between gap-4",
              isRTL && "flex-row-reverse"
            )}>
              <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                <IconComponent className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {getLabel('Option', 'گزینه', 'اختیار')} {index + 1}
                </span>
                {option.is_default && (
                  <Badge variant="default" className="text-xs">
                    {getLabel('Default', 'پیش‌فرض', 'ډیفالټ')}
                  </Badge>
                )}
              </div>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Switch
                    checked={option.is_active}
                    onCheckedChange={(checked) => updateOption(index, { is_active: checked })}
                  />
                  <Label className="text-sm text-muted-foreground">
                    {getLabel('Active', 'فعال', 'فعال')}
                  </Label>
                </div>
                {options.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Shipping Type */}
            <div className="grid grid-cols-3 gap-2">
              {SHIPPING_TYPES.map((type) => {
                const TypeIcon = type.icon;
                const isSelected = option.shipping_type === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => updateOption(index, { shipping_type: type.value as any })}
                    className={cn(
                      "flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all",
                      isSelected 
                        ? "border-primary bg-primary/10 text-primary" 
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <TypeIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {getLabel(type.labelEn, type.labelFa, type.labelPs)}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Price and Delivery Time */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className={cn("text-xs flex items-center gap-1", isRTL && "flex-row-reverse")}>
                  <Truck className="h-3 w-3" />
                  {getLabel('Price (AFN)', 'قیمت (افغانی)', 'قیمت (افغانۍ)')}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    value={option.price_afn}
                    onChange={(e) => updateOption(index, { price_afn: parseFloat(e.target.value) || 0 })}
                    disabled={option.shipping_type === 'free'}
                    className={cn(isRTL ? "pr-10" : "pl-10")}
                  />
                  <span className={cn(
                    "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
                    isRTL ? "right-3" : "left-3"
                  )}>
                    ؋
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className={cn("text-xs flex items-center gap-1", isRTL && "flex-row-reverse")}>
                  <Clock className="h-3 w-3" />
                  {getLabel('Delivery Time (hours)', 'زمان تحویل (ساعت)', 'د تحویل وخت (ساعتونه)')}
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={option.delivery_hours}
                  onChange={(e) => updateOption(index, { delivery_hours: parseInt(e.target.value) || 72 })}
                />
              </div>
              <div className="space-y-2">
                <Label className={cn("text-xs flex items-center gap-1", isRTL && "flex-row-reverse")}>
                  <Info className="h-3 w-3" />
                  {getLabel('Confidence %', 'درصد اطمینان', 'د باور سلنه')}
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={option.confidence_percent || ''}
                  onChange={(e) => updateOption(index, { 
                    confidence_percent: e.target.value ? parseInt(e.target.value) : null 
                  })}
                  placeholder={getLabel('Optional', 'اختیاری', 'اختیاري')}
                />
              </div>
            </div>

            {/* Set as Default */}
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <Switch
                checked={option.is_default}
                onCheckedChange={(checked) => {
                  if (checked) {
                    updateOption(index, { is_default: true });
                  }
                }}
              />
              <Label className="text-sm">
                {getLabel('Set as default option', 'به عنوان پیش‌فرض تنظیم کنید', 'د ډیفالټ په توګه تنظیم کړئ')}
              </Label>
            </div>
          </Card>
        );
      })}

      {options.length > 0 && (
        <Button variant="outline" onClick={addOption} className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          {getLabel('Add Another Option', 'افزودن گزینه دیگر', 'بل اختیار اضافه کړئ')}
        </Button>
      )}

      {/* Info */}
      <Card className="p-4 bg-muted/50 border-muted">
        <div className={cn("flex gap-3", isRTL && "flex-row-reverse")}>
          <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">
              {getLabel('Tips for delivery options:', 'نکات برای گزینه‌های ارسال:', 'د لیږد اختیارونو لپاره لارښوونې:')}
            </p>
            <ul className={cn("list-disc space-y-1", isRTL ? "pr-4" : "pl-4")}>
              <li>{getLabel('Offer free shipping to increase conversions', 'ارسال رایگان برای افزایش فروش ارائه دهید', 'د پلور زیاتولو لپاره وړیا لیږد وړاندې کړئ')}</li>
              <li>{getLabel('Express options can command higher fees', 'گزینه‌های فوری می‌توانند هزینه بالاتری داشته باشند', 'چټک اختیارونه لوړ فیسونه غوښتنه کولی شي')}</li>
              <li>{getLabel('Be realistic with delivery times', 'در زمان تحویل واقع‌بین باشید', 'د تحویل وختونو کې واقعیت ساتونکي اوسئ')}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DeliveryOptionsStep;
