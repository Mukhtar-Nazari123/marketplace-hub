import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface PersonalInfoStepProps {
  data: {
    fullName: string;
    email: string;
    phone: string;
    avatarUrl: string;
  };
  onUpdate: (data: Partial<PersonalInfoStepProps['data']>) => void;
  onNext: () => void;
}

export const PersonalInfoStep = ({ data, onUpdate, onNext }: PersonalInfoStepProps) => {
  const { user } = useAuth();
  const { isRTL } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('seller-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('seller-assets')
        .getPublicUrl(filePath);

      onUpdate({ avatarUrl: urlData.publicUrl });
      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'تصویر آپلود شد' : 'Image uploaded successfully'
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
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
    if (!data.fullName || !data.phone) {
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
          {isRTL ? 'اطلاعات شخصی' : 'Personal Information'}
        </h2>
        <p className="text-muted-foreground mt-2">
          {isRTL ? 'اطلاعات پایه خود را وارد کنید' : 'Enter your basic information'}
        </p>
      </div>

      {/* Avatar upload */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
            <AvatarImage src={data.avatarUrl} />
            <AvatarFallback className="text-2xl bg-primary/10">
              {data.fullName?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "absolute bottom-0 bg-primary text-primary-foreground p-2 rounded-full shadow-lg",
              "hover:bg-primary/90 transition-colors",
              isRTL ? "left-0" : "right-0"
            )}
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {isRTL ? 'تصویر پروفایل (اختیاری)' : 'Profile photo (optional)'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">
            {isRTL ? 'نام کامل' : 'Full Name'} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="fullName"
            value={data.fullName}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
            placeholder={isRTL ? 'نام و نام خانوادگی' : 'Your full name'}
            className={cn(isRTL && "text-right")}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            {isRTL ? 'ایمیل' : 'Email'}
          </Label>
          <Input
            id="email"
            type="email"
            value={data.email}
            disabled
            className={cn("bg-muted", isRTL && "text-right")}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="phone">
            {isRTL ? 'شماره تلفن' : 'Phone Number'} <span className="text-destructive">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onUpdate({ phone: e.target.value })}
            placeholder={isRTL ? 'شماره تلفن همراه' : 'Your phone number'}
            className={cn(isRTL && "text-right")}
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" size="lg">
          {isRTL ? 'مرحله بعد' : 'Next Step'}
        </Button>
      </div>
    </form>
  );
};
