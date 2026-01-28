import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImagePlus, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useSellerProfileTranslations } from '@/lib/seller-profile-translations';

interface StoreDetailsStepProps {
  data: {
    businessName: string;
    storeLogo: string;
    storeBanner: string;
    businessDescription: string;
    businessType: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
  };
  onUpdate: (data: Partial<StoreDetailsStepProps['data']>) => void;
  onNext: () => void;
  onBack: () => void;
}

export const StoreDetailsStep = ({ data, onUpdate, onNext, onBack }: StoreDetailsStepProps) => {
  const { user } = useAuth();
  const { isRTL, language } = useLanguage();
  const { toast } = useToast();
  const { t } = useSellerProfileTranslations(language as 'en' | 'fa' | 'ps');
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const handleImageUpload = async (
    file: File, 
    type: 'logo' | 'banner',
    setUploading: (val: boolean) => void
  ) => {
    if (!user) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: t('toasts', 'error'),
        description: t('toasts', 'selectImageFile'),
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${type}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('seller-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('seller-assets')
        .getPublicUrl(filePath);

      if (type === 'logo') {
        onUpdate({ storeLogo: urlData.publicUrl });
      } else {
        onUpdate({ storeBanner: urlData.publicUrl });
      }

      toast({
        title: t('toasts', 'success'),
        description: t('toasts', 'imageUploadSuccess')
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: t('toasts', 'error'),
        description: t('toasts', 'imageUploadError'),
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.businessName || !data.businessType) {
      toast({
        title: t('toasts', 'error'),
        description: t('toasts', 'fillRequiredFields'),
        variant: 'destructive'
      });
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold">
          {t('storeDetails', 'title')}
        </h2>
        <p className="text-muted-foreground mt-2">
          {t('storeDetails', 'subtitle')}
        </p>
      </div>

      {/* Banner upload */}
      <div className="space-y-2">
        <Label>{t('storeDetails', 'storeBanner')}</Label>
        <div
          onClick={() => bannerInputRef.current?.click()}
          className={cn(
            "relative h-32 md:h-40 rounded-lg border-2 border-dashed cursor-pointer",
            "flex items-center justify-center overflow-hidden",
            "hover:border-primary/50 transition-colors",
            data.storeBanner ? "border-transparent" : "border-muted-foreground/25"
          )}
        >
          {data.storeBanner ? (
            <img 
              src={data.storeBanner} 
              alt="Store banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-muted-foreground">
              {uploadingBanner ? (
                <Loader2 className="w-8 h-8 mx-auto animate-spin" />
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                  <span className="text-sm">{t('storeDetails', 'uploadBanner')}</span>
                </>
              )}
            </div>
          )}
        </div>
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner', setUploadingBanner)}
          className="hidden"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Logo upload */}
        <div className="space-y-2">
          <Label>{t('storeDetails', 'storeLogo')}</Label>
          <div
            onClick={() => logoInputRef.current?.click()}
            className={cn(
              "relative w-24 h-24 rounded-lg border-2 border-dashed cursor-pointer",
              "flex items-center justify-center overflow-hidden",
              "hover:border-primary/50 transition-colors",
              data.storeLogo ? "border-transparent" : "border-muted-foreground/25"
            )}
          >
            {data.storeLogo ? (
              <img 
                src={data.storeLogo} 
                alt="Store logo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center text-muted-foreground">
                {uploadingLogo ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <ImagePlus className="w-6 h-6" />
                )}
              </div>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo', setUploadingLogo)}
            className="hidden"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessName">
            {t('storeDetails', 'storeName')} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            value={data.businessName}
            onChange={(e) => onUpdate({ businessName: e.target.value })}
            placeholder={t('storeDetails', 'storeNamePlaceholder')}
            className={cn(isRTL && "text-right")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessType">
            {t('storeDetails', 'businessType')} <span className="text-destructive">*</span>
          </Label>
          <Select value={data.businessType} onValueChange={(val) => onUpdate({ businessType: val })}>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={t('storeDetails', 'selectType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">{t('storeDetails', 'individual')}</SelectItem>
              <SelectItem value="company">{t('storeDetails', 'company')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">{t('storeDetails', 'contactEmail')}</Label>
          <Input
            id="contactEmail"
            type="email"
            value={data.contactEmail}
            onChange={(e) => onUpdate({ contactEmail: e.target.value })}
            placeholder={t('storeDetails', 'contactEmailPlaceholder')}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">{t('storeDetails', 'contactPhone')}</Label>
          <Input
            id="contactPhone"
            type="tel"
            value={data.contactPhone}
            onChange={(e) => onUpdate({ contactPhone: e.target.value })}
            placeholder={t('storeDetails', 'contactPhonePlaceholder')}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">{t('storeDetails', 'address')}</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            placeholder={t('storeDetails', 'addressPlaceholder')}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="businessDescription">{t('storeDetails', 'businessDescription')}</Label>
          <Textarea
            id="businessDescription"
            value={data.businessDescription}
            onChange={(e) => onUpdate({ businessDescription: e.target.value })}
            placeholder={t('storeDetails', 'businessDescriptionPlaceholder')}
            className={cn("min-h-[100px]", isRTL && "text-right")}
          />
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
