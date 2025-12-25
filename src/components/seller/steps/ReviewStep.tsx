import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Check, Edit2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const { isRTL } = useLanguage();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setSubmitting(false);
    }
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
          {isRTL ? 'ویرایش' : 'Edit'}
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
          {isRTL ? 'بررسی و ارسال' : 'Review & Submit'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isRTL ? 'اطلاعات خود را بررسی کنید و برای تأیید ارسال نمایید' : 'Review your information and submit for approval'}
        </p>
      </div>

      <div className="space-y-4">
        {/* Personal Info */}
        <SectionCard title={isRTL ? 'اطلاعات شخصی' : 'Personal Information'} step={1}>
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
          <InfoRow label={isRTL ? 'شماره تلفن' : 'Phone Number'} value={personalInfo.phone} />
        </SectionCard>

        {/* Store Details */}
        <SectionCard title={isRTL ? 'اطلاعات فروشگاه' : 'Store Details'} step={2}>
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
                {storeDetails.businessType === 'individual' 
                  ? (isRTL ? 'شخصی' : 'Individual') 
                  : (isRTL ? 'شرکتی' : 'Company')}
              </Badge>
            </div>
          </div>
          <div className="space-y-0">
            <InfoRow label={isRTL ? 'توضیحات' : 'Description'} value={storeDetails.businessDescription} />
            <InfoRow label={isRTL ? 'ایمیل تماس' : 'Contact Email'} value={storeDetails.contactEmail} />
            <InfoRow label={isRTL ? 'تلفن تماس' : 'Contact Phone'} value={storeDetails.contactPhone} />
            <InfoRow label={isRTL ? 'آدرس' : 'Address'} value={storeDetails.address} />
          </div>
        </SectionCard>

        {/* Policies */}
        <SectionCard title={isRTL ? 'سیاست‌ها و تنظیمات' : 'Policies & Settings'} step={3}>
          <InfoRow label={isRTL ? 'سیاست بازگشت' : 'Return Policy'} value={policies.returnPolicy} />
          <InfoRow label={isRTL ? 'سیاست ارسال' : 'Shipping Policy'} value={policies.shippingPolicy} />
          <div className={cn("py-2 flex items-center gap-2", isRTL && "flex-row-reverse text-right")}>
            <span className="text-sm text-muted-foreground">
              {isRTL ? 'نمایش فروشگاه:' : 'Store Visibility:'}
            </span>
            <Badge variant={policies.storeVisible ? "default" : "secondary"}>
              {policies.storeVisible 
                ? (isRTL ? 'فعال' : 'Visible') 
                : (isRTL ? 'غیرفعال' : 'Hidden')}
            </Badge>
          </div>
        </SectionCard>
      </div>

      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className={cn("text-sm", isRTL && "text-right")}>
          {isRTL 
            ? '🔔 پس از ارسال، درخواست شما توسط تیم پشتیبانی بررسی خواهد شد. نتیجه از طریق ایمیل به شما اطلاع داده می‌شود.' 
            : '🔔 After submission, your request will be reviewed by our team. You will be notified via email about the result.'}
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" size="lg" onClick={onBack} disabled={submitting}>
          {isRTL ? <ArrowRight className="w-4 h-4 ml-2" /> : <ArrowLeft className="w-4 h-4 mr-2" />}
          {isRTL ? 'مرحله قبل' : 'Previous'}
        </Button>
        <Button size="lg" onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className={cn("w-4 h-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? 'در حال ارسال...' : 'Submitting...'}
            </>
          ) : (
            <>
              <Check className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
              {isRTL ? 'ارسال برای تأیید' : 'Submit for Approval'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
