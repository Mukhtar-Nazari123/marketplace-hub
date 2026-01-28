import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage, Language } from '@/lib/i18n';
import { useContactSettings, useUpdateContactSettings } from '@/hooks/useContactSettings';
import { toast } from '@/hooks/use-toast';
import { Loader2, Save, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const AdminContactSettings = () => {
  const { language } = useLanguage();
  const lang = language as Language;
  const { settings, isLoading } = useContactSettings();
  const updateSettings = useUpdateContactSettings();

  const [formData, setFormData] = useState({
    address_en: '',
    address_fa: '',
    address_ps: '',
    phone: '',
    support_email: '',
    working_hours_en: '',
    working_hours_fa: '',
    working_hours_ps: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        address_en: settings.address_en || '',
        address_fa: settings.address_fa || '',
        address_ps: settings.address_ps || '',
        phone: settings.phone || '',
        support_email: settings.support_email || '',
        working_hours_en: settings.working_hours_en || '',
        working_hours_fa: settings.working_hours_fa || '',
        working_hours_ps: settings.working_hours_ps || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateSettings.mutateAsync(formData);
      toast({
        title: getLabel(lang, 'Success!', 'موفق!', 'بریالی!'),
        description: getLabel(
          lang,
          'Contact settings updated successfully.',
          'تنظیمات تماس با موفقیت به‌روزرسانی شد.',
          'د اړیکې تنظیمات په بریالیتوب سره تازه شول.'
        ),
      });
    } catch (error) {
      console.error('Error updating contact settings:', error);
      toast({
        title: getLabel(lang, 'Error', 'خطا', 'تېروتنه'),
        description: getLabel(
          lang,
          'Failed to update settings.',
          'به‌روزرسانی تنظیمات ناموفق بود.',
          'تنظیمات تازه کول ناکام شول.'
        ),
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout
        title={getLabel(lang, 'Contact Settings', 'تنظیمات تماس', 'د اړیکې تنظیمات')}
        description={getLabel(lang, 'Manage site contact information', 'مدیریت اطلاعات تماس سایت', 'د سایټ اړیکې معلومات اداره کړئ')}
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
      title={getLabel(lang, 'Contact Settings', 'تنظیمات تماس', 'د اړیکې تنظیمات')}
      description={getLabel(lang, 'Manage site contact information', 'مدیریت اطلاعات تماس سایت', 'د سایټ اړیکې معلومات اداره کړئ')}
    >
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
        {/* Address Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle>{getLabel(lang, 'Address', 'آدرس', 'پته')}</CardTitle>
            </div>
            <CardDescription>
              {getLabel(
                lang,
                'Physical store address in all languages',
                'آدرس فیزیکی فروشگاه به همه زبان‌ها',
                'د پلورنځي فزیکي پته په ټولو ژبو کې'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{getLabel(lang, 'Address (English)', 'آدرس (انگلیسی)', 'پته (انګلیسي)')}</Label>
              <Textarea
                value={formData.address_en}
                onChange={(e) => setFormData({ ...formData, address_en: e.target.value })}
                placeholder="Kabul, Afghanistan"
                dir="ltr"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{getLabel(lang, 'Address (Persian)', 'آدرس (فارسی)', 'پته (فارسي)')}</Label>
              <Textarea
                value={formData.address_fa}
                onChange={(e) => setFormData({ ...formData, address_fa: e.target.value })}
                placeholder="کابل، افغانستان"
                dir="rtl"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{getLabel(lang, 'Address (Pashto)', 'آدرس (پشتو)', 'پته (پښتو)')}</Label>
              <Textarea
                value={formData.address_ps}
                onChange={(e) => setFormData({ ...formData, address_ps: e.target.value })}
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
              <CardTitle>{getLabel(lang, 'Contact Info', 'اطلاعات تماس', 'د اړیکې معلومات')}</CardTitle>
            </div>
            <CardDescription>
              {getLabel(lang, 'Phone number and support email', 'شماره تلفن و ایمیل پشتیبانی', 'تلیفون شمېره او ملاتړ بریښنالیک')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {getLabel(lang, 'Phone Number', 'شماره تلفن', 'تلیفون شمېره')}
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
                {getLabel(lang, 'Support Email', 'ایمیل پشتیبانی', 'ملاتړ بریښنالیک')}
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
              <CardTitle>{getLabel(lang, 'Working Hours', 'ساعات کاری', 'د کار ساعتونه')}</CardTitle>
            </div>
            <CardDescription>
              {getLabel(lang, 'Working hours in all languages', 'ساعات کاری به همه زبان‌ها', 'د کار ساعتونه په ټولو ژبو کې')}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>{getLabel(lang, 'Working Hours (English)', 'ساعات کاری (انگلیسی)', 'د کار ساعتونه (انګلیسي)')}</Label>
              <Textarea
                value={formData.working_hours_en}
                onChange={(e) => setFormData({ ...formData, working_hours_en: e.target.value })}
                placeholder="Saturday - Thursday: 9:00 AM - 6:00 PM"
                dir="ltr"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{getLabel(lang, 'Working Hours (Persian)', 'ساعات کاری (فارسی)', 'د کار ساعتونه (فارسي)')}</Label>
              <Textarea
                value={formData.working_hours_fa}
                onChange={(e) => setFormData({ ...formData, working_hours_fa: e.target.value })}
                placeholder="شنبه - پنجشنبه: ۹:۰۰ صبح - ۶:۰۰ عصر"
                dir="rtl"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>{getLabel(lang, 'Working Hours (Pashto)', 'ساعات کاری (پشتو)', 'د کار ساعتونه (پښتو)')}</Label>
              <Textarea
                value={formData.working_hours_ps}
                onChange={(e) => setFormData({ ...formData, working_hours_ps: e.target.value })}
                placeholder="شنبه - پنجشنبه: ۹:۰۰ سهار - ۶:۰۰ ماښام"
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
            {getLabel(lang, 'Save Changes', 'ذخیره تغییرات', 'بدلونونه خوندي کړئ')}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default AdminContactSettings;
