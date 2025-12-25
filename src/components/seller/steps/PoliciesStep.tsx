import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PoliciesStepProps {
  data: {
    returnPolicy: string;
    shippingPolicy: string;
    storeVisible: boolean;
  };
  onUpdate: (data: Partial<PoliciesStepProps['data']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const PoliciesStep = ({ data, onUpdate, onNext, onBack }: PoliciesStepProps) => {
  const { isRTL } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">
          {isRTL ? 'سیاست‌ها و تنظیمات' : 'Policies & Settings'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isRTL ? 'سیاست‌های فروشگاه خود را تعریف کنید' : 'Define your store policies'}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="returnPolicy">
            {isRTL ? 'سیاست بازگشت کالا' : 'Return & Refund Policy'}
          </Label>
          <Textarea
            id="returnPolicy"
            value={data.returnPolicy}
            onChange={(e) => onUpdate({ returnPolicy: e.target.value })}
            placeholder={isRTL 
              ? 'شرایط و ضوابط بازگشت کالا را توضیح دهید...' 
              : 'Describe your return and refund conditions...'}
            className={cn("min-h-[120px]", isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingPolicy">
            {isRTL ? 'سیاست ارسال' : 'Shipping Policy'}
          </Label>
          <Textarea
            id="shippingPolicy"
            value={data.shippingPolicy}
            onChange={(e) => onUpdate({ shippingPolicy: e.target.value })}
            placeholder={isRTL 
              ? 'نحوه ارسال سفارشات، زمان تحویل و هزینه‌ها را توضیح دهید...' 
              : 'Describe shipping methods, delivery times, and costs...'}
            className={cn("min-h-[120px]", isRTL && "text-right")}
          />
        </div>

        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg border bg-card",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn(isRTL && "text-right")}>
            <Label htmlFor="storeVisible" className="text-base font-medium">
              {isRTL ? 'نمایش فروشگاه' : 'Store Visibility'}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL 
                ? 'آیا فروشگاه شما برای مشتریان قابل مشاهده باشد؟' 
                : 'Should your store be visible to customers?'}
            </p>
          </div>
          <Switch
            id="storeVisible"
            checked={data.storeVisible}
            onCheckedChange={(checked) => onUpdate({ storeVisible: checked })}
          />
        </div>

        <div className="p-4 rounded-lg bg-muted/50 border">
          <p className="text-sm text-muted-foreground">
            {isRTL 
              ? '💡 می‌توانید این سیاست‌ها را بعداً در تنظیمات فروشگاه ویرایش کنید.' 
              : '💡 You can edit these policies later in your store settings.'}
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {isRTL ? 'مرحله قبل' : 'Previous'}
        </Button>
        <Button type="submit" size="lg">
          {isRTL ? 'مرحله بعد' : 'Next Step'}
        </Button>
      </div>
    </form>
  );
};
