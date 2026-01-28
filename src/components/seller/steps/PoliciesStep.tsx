import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSellerProfileTranslations } from '@/lib/seller-profile-translations';

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
  const { isRTL, language } = useLanguage();
  const { t } = useSellerProfileTranslations(language as 'en' | 'fa' | 'ps');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">
          {t('policies', 'title')}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('policies', 'subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="returnPolicy">
            {t('policies', 'returnPolicy')}
          </Label>
          <Textarea
            id="returnPolicy"
            value={data.returnPolicy}
            onChange={(e) => onUpdate({ returnPolicy: e.target.value })}
            placeholder={t('policies', 'returnPolicyPlaceholder')}
            className={cn("min-h-[120px]", isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shippingPolicy">
            {t('policies', 'shippingPolicy')}
          </Label>
          <Textarea
            id="shippingPolicy"
            value={data.shippingPolicy}
            onChange={(e) => onUpdate({ shippingPolicy: e.target.value })}
            placeholder={t('policies', 'shippingPolicyPlaceholder')}
            className={cn("min-h-[120px]", isRTL && "text-right")}
          />
        </div>

        <div className={cn(
          "flex items-center justify-between p-4 rounded-lg border bg-card",
          isRTL && "flex-row-reverse"
        )}>
          <div className={cn(isRTL && "text-right")}>
            <Label htmlFor="storeVisible" className="text-base font-medium">
              {t('policies', 'storeVisibility')}
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              {t('policies', 'storeVisibilityDesc')}
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
            {t('policies', 'policiesNote')}
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {t('buttons', 'previous')}
        </Button>
        <Button type="submit" size="lg">
          {t('buttons', 'nextStep')}
        </Button>
      </div>
    </form>
  );
};
