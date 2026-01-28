import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, Edit2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSellerProfileTranslations } from '@/lib/seller-profile-translations';

interface ReviewStepProps {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
  storeDetails: {
    businessName: string;
    storeLogo: string;
    storeBanner: string;
    businessDescription: string;
    businessType: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
  };
  policies: {
    returnPolicy: string;
    shippingPolicy: string;
    storeVisible: boolean;
  };
  onEditStep: (step: number) => void;
  onBack: () => void;
  onSubmit: () => Promise<void>;
}

export const ReviewStep = ({ 
  personalInfo, 
  storeDetails, 
  policies, 
  onEditStep, 
  onBack, 
  onSubmit 
}: ReviewStepProps) => {
  const { isRTL, language } = useLanguage();
  const { t } = useSellerProfileTranslations(language as 'en' | 'fa' | 'ps');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  const getBusinessTypeLabel = (type: string) => {
    if (type === 'individual') {
      return t('storeDetails', 'individual');
    }
    return t('storeDetails', 'company');
  };

  const SectionCard = ({ 
    title, 
    step, 
    children 
  }: { 
    title: string; 
    step: number; 
    children: React.ReactNode 
  }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className={cn("flex flex-row items-center justify-between", isRTL && "flex-row-reverse")}>
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEditStep(step)}
          className="gap-2"
        >
          <Edit2 className="w-4 h-4" />
          {t('buttons', 'edit')}
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );

  const InfoRow = ({ label, value }: { label: string; value: string | undefined }) => (
    <div className={cn("py-2 border-b last:border-0", isRTL && "text-right")}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <p className="font-medium mt-0.5">{value || '-'}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">
          {t('review', 'title')}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('review', 'subtitle')}
        </p>
      </div>

      <div className="space-y-4">
        {/* Personal Info */}
        <SectionCard title={t('review', 'personalInformation')} step={1}>
          <div className={cn("flex items-center gap-4 mb-4", isRTL && "flex-row-reverse")}>
            <Avatar className="w-16 h-16">
              <AvatarImage src={personalInfo.avatarUrl} />
              <AvatarFallback className="text-lg bg-primary/10">
                {personalInfo.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className={cn(isRTL && "text-right")}>
              <h3 className="font-semibold text-lg">{personalInfo.fullName}</h3>
              <p className="text-sm text-muted-foreground">{personalInfo.email}</p>
            </div>
          </div>
          <InfoRow label={t('review', 'phoneNumber')} value={personalInfo.phone} />
        </SectionCard>

        {/* Store Details */}
        <SectionCard title={t('review', 'storeDetailsSection')} step={2}>
          {storeDetails.storeBanner && (
            <div className="rounded-lg overflow-hidden mb-4 h-24">
              <img 
                src={storeDetails.storeBanner} 
                alt="Store banner" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={cn("flex items-center gap-4 mb-4", isRTL && "flex-row-reverse")}>
            {storeDetails.storeLogo && (
              <img 
                src={storeDetails.storeLogo} 
                alt="Store logo" 
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div className={cn(isRTL && "text-right")}>
              <h3 className="font-semibold">{storeDetails.businessName}</h3>
              <Badge variant="secondary">
                {getBusinessTypeLabel(storeDetails.businessType)}
              </Badge>
            </div>
          </div>
          <div className="space-y-0">
            <InfoRow label={t('review', 'description')} value={storeDetails.businessDescription} />
            <InfoRow label={t('review', 'contactEmail')} value={storeDetails.contactEmail} />
            <InfoRow label={t('review', 'contactPhone')} value={storeDetails.contactPhone} />
            <InfoRow label={t('review', 'address')} value={storeDetails.address} />
          </div>
        </SectionCard>

        {/* Policies */}
        <SectionCard title={t('review', 'policiesSection')} step={3}>
          <InfoRow label={t('review', 'returnPolicy')} value={policies.returnPolicy} />
          <InfoRow label={t('review', 'shippingPolicy')} value={policies.shippingPolicy} />
          <div className={cn("py-2 flex items-center gap-2", isRTL && "flex-row-reverse text-right")}>
            <span className="text-sm text-muted-foreground">
              {t('review', 'storeVisibility')}
            </span>
            <Badge variant={policies.storeVisible ? "default" : "secondary"}>
              {policies.storeVisible 
                ? t('review', 'visible')
                : t('review', 'hidden')}
            </Badge>
          </div>
        </SectionCard>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className={cn("text-sm", isRTL && "text-right")}>
          {t('review', 'submissionNote')}
        </p>
      </div>

      <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          size="lg" 
          onClick={onBack} 
          disabled={submitting}
          className="w-full sm:w-auto min-h-[44px]"
        >
          {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {t('buttons', 'previous')}
        </Button>
        <Button 
          size="lg" 
          onClick={handleSubmit} 
          disabled={submitting}
          className="w-full sm:w-auto min-h-[44px]"
        >
          {submitting ? (
            <>
              <Loader2 className={cn("w-4 h-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
              {t('buttons', 'submitting')}
            </>
          ) : (
            <>
              <Check className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              {t('buttons', 'submitForApproval')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
