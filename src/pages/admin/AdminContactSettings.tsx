import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/lib/i18n';
import { useContactSettings, useUpdateContactSettings } from '@/hooks/useContactSettings';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminContactSettings = () => {
  const { t, isRTL } = useLanguage();
  const { settings, isLoading } = useContactSettings();
  const updateSettings = useUpdateContactSettings();

  const [formData, setFormData] = useState({
    address_en: '',
    address_fa: '',
    phone: '',
    support_email: '',
    working_hours_en: '',
    working_hours_fa: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        address_en: settings.address_en || '',
        address_fa: settings.address_fa || '',
        phone: settings.phone || '',
        support_email: settings.support_email || '',
        working_hours_en: settings.working_hours_en || '',
        working_hours_fa: settings.working_hours_fa || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSettings.mutateAsync(formData);
      toast({
        title: isRTL ? 'موفق!' : 'Success!',
        description: isRTL ? 'تنظیمات تماس با موفقیت به‌روزرسانی شد.' : 'Contact settings updated successfully.',
      });
    } catch (error) {
      console.error('Error updating contact settings:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'به‌روزرسانی تنظیمات ناموفق بود.' : 'Failed to update settings.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        title={isRTL ? 'تنظیمات تماس' : 'Contact Settings'}
        description={isRTL ? 'مدیریت اطلاعات تماس سایت' : 'Manage site contact information'}
      >
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={isRTL ? 'تنظیمات تماس' : 'Contact Settings'}
      description={isRTL ? 'مدیریت اطلاعات تماس سایت' : 'Manage site contact information'}
    >
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
        {/* Address Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>{isRTL ? 'آدرس' : 'Address'}</CardTitle>
            </div>
            <CardDescription>
              {isRTL ? 'آدرس فیزیکی فروشگاه به دو زبان' : 'Physical store address in both languages'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isRTL ? 'آدرس (انگلیسی)' : 'Address (English)'}</Label>
              <Textarea
                value={formData.address_en}
                onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                placeholder="Kabul, Afghanistan"
                dir="ltr"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'آدرس (فارسی)' : 'Address (Persian)'}</Label>
              <Textarea
                value={formData.address_fa}
                onChange={(e) => setFormData({ ...formData, address_fa: e.target.value })}
                placeholder="کابل، افغانستان"
                dir="rtl"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <CardTitle>{isRTL ? 'اطلاعات تماس' : 'Contact Info'}</CardTitle>
            </div>
            <CardDescription>
              {isRTL ? 'شماره تلفن و ایمیل پشتیبانی' : 'Phone number and support email'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {isRTL ? 'شماره تلفن' : 'Phone Number'}
              </Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+93 70 123 4567"
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {isRTL ? 'ایمیل پشتیبانی' : 'Support Email'}
              </Label>
              <Input
                type="email"
                value={formData.support_email}
                onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                placeholder="support@market.af"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        {/* Working Hours Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <CardTitle>{isRTL ? 'ساعات کاری' : 'Working Hours'}</CardTitle>
            </div>
            <CardDescription>
              {isRTL ? 'ساعات کاری به دو زبان' : 'Working hours in both languages'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{isRTL ? 'ساعات کاری (انگلیسی)' : 'Working Hours (English)'}</Label>
              <Textarea
                value={formData.working_hours_en}
                onChange={(e) => setFormData({ ...formData, working_hours_en: e.target.value })}
                placeholder="Saturday - Thursday: 9:00 AM - 6:00 PM"
                dir="ltr"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'ساعات کاری (فارسی)' : 'Working Hours (Persian)'}</Label>
              <Textarea
                value={formData.working_hours_fa}
                onChange={(e) => setFormData({ ...formData, working_hours_fa: e.target.value })}
                placeholder="شنبه - پنجشنبه: ۹:۰۰ صبح - ۶:۰۰ عصر"
                dir="rtl"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={updateSettings.isPending}
            className="gap-2"
          >
            {updateSettings.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isRTL ? 'ذخیره تغییرات' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminContactSettings;
