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
  const { isRTL } = useLanguage();
  const { toast } = useToast();
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
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'لطفاً یک فایل تصویری انتخاب کنید' : 'Please select an image file',
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
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'تصویر آپلود شد' : 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'خطا در آپلود تصویر' : 'Failed to upload image',
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
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'لطفاً تمام فیلدهای الزامی را پر کنید' : 'Please fill all required fields',
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
          {isRTL ? 'اطلاعات فروشگاه' : 'Store Details'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isRTL ? 'اطلاعات فروشگاه یا شرکت خود را وارد کنید' : 'Enter your store or company information'}
        </p>
      </div>

      {/* Banner upload */}
      <div className="space-y-2">
        <Label>{isRTL ? 'بنر فروشگاه' : 'Store Banner'}</Label>
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
                  <span className="text-sm">{isRTL ? 'آپلود بنر' : 'Upload Banner'}</span>
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
          <Label>{isRTL ? 'لوگوی فروشگاه' : 'Store Logo'}</Label>
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
            {isRTL ? 'نام فروشگاه / شرکت' : 'Store / Company Name'} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            value={data.businessName}
            onChange={(e) => onUpdate({ businessName: e.target.value })}
            placeholder={isRTL ? 'نام فروشگاه' : 'Your store name'}
            className={cn(isRTL && "text-right")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessType">
            {isRTL ? 'نوع کسب‌وکار' : 'Business Type'} <span className="text-destructive">*</span>
          </Label>
          <Select value={data.businessType} onValueChange={(val) => onUpdate({ businessType: val })}>
            <SelectTrigger className={cn(isRTL && "text-right")}>
              <SelectValue placeholder={isRTL ? 'انتخاب کنید' : 'Select type'} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">{isRTL ? 'شخصی' : 'Individual'}</SelectItem>
              <SelectItem value="company">{isRTL ? 'شرکتی' : 'Company'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactEmail">{isRTL ? 'ایمیل تماس' : 'Contact Email'}</Label>
          <Input
            id="contactEmail"
            type="email"
            value={data.contactEmail}
            onChange={(e) => onUpdate({ contactEmail: e.target.value })}
            placeholder={isRTL ? 'ایمیل برای تماس' : 'Contact email'}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactPhone">{isRTL ? 'تلفن تماس' : 'Contact Phone'}</Label>
          <Input
            id="contactPhone"
            type="tel"
            value={data.contactPhone}
            onChange={(e) => onUpdate({ contactPhone: e.target.value })}
            placeholder={isRTL ? 'شماره تلفن فروشگاه' : 'Store phone number'}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address">{isRTL ? 'آدرس' : 'Address'}</Label>
          <Input
            id="address"
            value={data.address}
            onChange={(e) => onUpdate({ address: e.target.value })}
            placeholder={isRTL ? 'آدرس فروشگاه' : 'Store address'}
            className={cn(isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="businessDescription">{isRTL ? 'توضیحات کسب‌وکار' : 'Business Description'}</Label>
          <Textarea
            id="businessDescription"
            value={data.businessDescription}
            onChange={(e) => onUpdate({ businessDescription: e.target.value })}
            placeholder={isRTL ? 'توضیح کوتاه درباره فروشگاه' : 'Brief description about your store'}
            className={cn("min-h-[100px]", isRTL && "text-right")}
          />
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
