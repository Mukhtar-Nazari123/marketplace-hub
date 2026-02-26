import { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage, Language } from '@/lib/i18n';
import { useSiteSettings, useUpdateSiteSettings, uploadSiteAsset } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const AdminSettings = () => {
  const { t, language } = useLanguage();
  const lang = language as Language;
  const { settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  // Branding form state
  const [siteNameEn, setSiteNameEn] = useState('');
  const [siteNameFa, setSiteNameFa] = useState('');
  const [siteNamePs, setSiteNamePs] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [footerLogoUrl, setFooterLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [footerLogoUploading, setFooterLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const footerLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with settings
  useEffect(() => {
    if (settings) {
      setSiteNameEn(settings.site_name_en);
      setSiteNameFa(settings.site_name_fa);
      setSiteNamePs(settings.site_name_ps || '');
      setLogoUrl(settings.logo_url || '');
      setFooterLogoUrl(settings.footer_logo_url || '');
      setFaviconUrl(settings.favicon_url || '');
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(getLabel(lang, 'Please select an image file', 'لطفاً یک فایل تصویری انتخاب کنید', 'مهرباني وکړئ د عکس فایل وټاکئ'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(getLabel(lang, 'Image must be less than 5MB', 'حجم تصویر باید کمتر از ۵ مگابایت باشد', 'عکس باید له ۵ میګابایټ څخه کم وي'));
      return;
    }

    setLogoUploading(true);
    try {
      const url = await uploadSiteAsset(file, 'logo');
      setLogoUrl(url);
      toast.success(getLabel(lang, 'Logo uploaded successfully', 'لوگو با موفقیت آپلود شد', 'لوګو په بریالیتوب سره اپلوډ شو'));
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error(getLabel(lang, 'Failed to upload logo', 'خطا در آپلود لوگو', 'د لوګو اپلوډ ناکام شو'));
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleFooterLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(getLabel(lang, 'Please select an image file', 'لطفاً یک فایل تصویری انتخاب کنید', 'مهرباني وکړئ د عکس فایل وټاکئ'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(getLabel(lang, 'Image must be less than 5MB', 'حجم تصویر باید کمتر از ۵ مگابایت باشد', 'عکس باید له ۵ میګابایټ څخه کم وي'));
      return;
    }

    setFooterLogoUploading(true);
    try {
      const url = await uploadSiteAsset(file, 'logo');
      setFooterLogoUrl(url);
      toast.success(getLabel(lang, 'Footer logo uploaded successfully', 'لوگوی فوتر با موفقیت آپلود شد', 'د فوټر لوګو په بریالیتوب سره اپلوډ شو'));
    } catch (error) {
      console.error('Footer logo upload error:', error);
      toast.error(getLabel(lang, 'Failed to upload footer logo', 'خطا در آپلود لوگوی فوتر', 'د فوټر لوګو اپلوډ ناکام شو'));
    } finally {
      setFooterLogoUploading(false);
      if (footerLogoInputRef.current) footerLogoInputRef.current.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(getLabel(lang, 'Please select an image file', 'لطفاً یک فایل تصویری انتخاب کنید', 'مهرباني وکړئ د عکس فایل وټاکئ'));
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error(getLabel(lang, 'Favicon must be less than 1MB', 'حجم فاویکون باید کمتر از ۱ مگابایت باشد', 'فاویکون باید له ۱ میګابایټ څخه کم وي'));
      return;
    }

    setFaviconUploading(true);
    try {
      const url = await uploadSiteAsset(file, 'favicon');
      setFaviconUrl(url);
      toast.success(getLabel(lang, 'Favicon uploaded successfully', 'فاویکون با موفقیت آپلود شد', 'فاویکون په بریالیتوب سره اپلوډ شو'));
    } catch (error) {
      console.error('Favicon upload error:', error);
      toast.error(getLabel(lang, 'Failed to upload favicon', 'خطا در آپلود فاویکون', 'د فاویکون اپلوډ ناکام شو'));
    } finally {
      setFaviconUploading(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

  const handleSaveBranding = async () => {
    if (!siteNameEn.trim() || !siteNameFa.trim()) {
      toast.error(getLabel(lang, 'Site name is required', 'نام سایت الزامی است', 'د سایټ نوم اړین دی'));
      return;
    }

    setSaving(true);
    try {
      await updateSettings.mutateAsync({
        site_name_en: siteNameEn.trim(),
        site_name_fa: siteNameFa.trim(),
        site_name_ps: siteNamePs.trim() || null,
        logo_url: logoUrl || null,
        footer_logo_url: footerLogoUrl || null,
        favicon_url: faviconUrl || null,
      });
      toast.success(getLabel(lang, 'Branding settings saved successfully', 'تنظیمات برند با موفقیت ذخیره شد', 'د برانډ تنظیمات په بریالیتوب سره خوندي شول'));
    } catch (error) {
      console.error('Save branding error:', error);
      toast.error(getLabel(lang, 'Failed to save settings', 'خطا در ذخیره تنظیمات', 'تنظیمات خوندي کول ناکام شول'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout 
      title={getLabel(lang, 'Settings', 'تنظیمات', 'تنظیمات')} 
      description={getLabel(lang, 'Manage site settings and configurations', 'مدیریت تنظیمات و پیکربندی‌های سایت', 'د سایټ تنظیمات او ترتیبات اداره کړئ')}
    >
      <div className="space-y-6 animate-fade-in">
        <Tabs defaultValue="branding" className="space-y-4">
          <TabsList>
            <TabsTrigger value="branding">
              {getLabel(lang, 'Branding', 'برندینگ', 'برانډینګ')}
            </TabsTrigger>
            <TabsTrigger value="general">
              {getLabel(lang, 'General', 'عمومی', 'عمومي')}
            </TabsTrigger>
            <TabsTrigger value="notifications">
              {getLabel(lang, 'Notifications', 'اعلان‌ها', 'خبرتیاوې')}
            </TabsTrigger>
            <TabsTrigger value="security">
              {getLabel(lang, 'Security', 'امنیت', 'امنیت')}
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{getLabel(lang, 'Branding Settings', 'تنظیمات برندینگ', 'د برانډ تنظیمات')}</CardTitle>
                <CardDescription>
                  {getLabel(
                    lang, 
                    'Configure your site name, logo, and favicon', 
                    'نام سایت، لوگو و فاویکون را از اینجا تنظیم کنید',
                    'د سایټ نوم، لوګو او فاویکون له دې ځایه تنظیم کړئ'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Site Name English */}
                    <div className="space-y-2">
                      <Label htmlFor="siteNameEn">
                        {getLabel(lang, 'Site Name (English)', 'نام سایت (انگلیسی)', 'د سایټ نوم (انګلیسي)')}
                      </Label>
                      <Input
                        id="siteNameEn"
                        value={siteNameEn}
                        onChange={(e) => setSiteNameEn(e.target.value)}
                        placeholder="Market"
                        dir="ltr"
                      />
                    </div>

                    {/* Site Name Persian */}
                    <div className="space-y-2">
                      <Label htmlFor="siteNameFa">
                        {getLabel(lang, 'Site Name (Persian)', 'نام سایت (فارسی)', 'د سایټ نوم (فارسي)')}
                      </Label>
                      <Input
                        id="siteNameFa"
                        value={siteNameFa}
                        onChange={(e) => setSiteNameFa(e.target.value)}
                        placeholder="مارکت"
                        dir="rtl"
                      />
                    </div>

                    {/* Site Name Pashto */}
                    <div className="space-y-2">
                      <Label htmlFor="siteNamePs">
                        {getLabel(lang, 'Site Name (Pashto)', 'نام سایت (پشتو)', 'د سایټ نوم (پښتو)')}
                      </Label>
                      <Input
                        id="siteNamePs"
                        value={siteNamePs}
                        onChange={(e) => setSiteNamePs(e.target.value)}
                        placeholder="مارکېټ"
                        dir="rtl"
                      />
                    </div>

                    <Separator />

                    {/* Logo Upload */}
                    <div className="space-y-2">
                      <Label>{getLabel(lang, 'Site Logo', 'لوگوی سایت', 'د سایټ لوګو')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {getLabel(
                          lang, 
                          'Recommended formats: PNG, SVG, WEBP (max 5MB)', 
                          'فرمت‌های پیشنهادی: PNG, SVG, WEBP (حداکثر ۵ مگابایت)',
                          'وړاندیز شوې بڼې: PNG, SVG, WEBP (اعظمي ۵ میګابایټ)'
                        )}
                      </p>
                      
                      {logoUrl ? (
                        <div className="relative group w-48 h-24 rounded-lg overflow-hidden border bg-muted">
                          <img 
                            src={logoUrl} 
                            alt="Site Logo" 
                            className="w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => logoInputRef.current?.click()}
                              disabled={logoUploading}
                            >
                              <Upload className="h-4 w-4 me-1" />
                              {getLabel(lang, 'Replace', 'جایگزین', 'بدلول')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => setLogoUrl('')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => logoInputRef.current?.click()}
                          className="w-48 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                        >
                          {logoUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          ) : (
                            <>
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {getLabel(lang, 'Upload Logo', 'آپلود لوگو', 'لوګو اپلوډ کړئ')}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                    </div>

                    <Separator />

                    {/* Footer Logo Upload */}
                    <div className="space-y-2">
                      <Label>{getLabel(lang, 'Footer Logo', 'لوگوی فوتر', 'د فوټر لوګو')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {getLabel(
                          lang, 
                          'Separate logo for footer. If not set, the main logo will be used.', 
                          'لوگوی جداگانه برای فوتر. اگر تنظیم نشود، لوگوی اصلی استفاده می‌شود.',
                          'د فوټر لپاره جلا لوګو. که تنظیم نشي، اصلي لوګو کارول کیږي.'
                        )}
                      </p>
                      
                      {footerLogoUrl ? (
                        <div className="relative group w-48 h-24 rounded-lg overflow-hidden border bg-muted">
                          <img 
                            src={footerLogoUrl} 
                            alt="Footer Logo" 
                            className="w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => footerLogoInputRef.current?.click()}
                              disabled={footerLogoUploading}
                            >
                              <Upload className="h-4 w-4 me-1" />
                              {getLabel(lang, 'Replace', 'جایگزین', 'بدلول')}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => setFooterLogoUrl('')}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => footerLogoInputRef.current?.click()}
                          className="w-48 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                        >
                          {footerLogoUploading ? (
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          ) : (
                            <>
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {getLabel(lang, 'Upload Footer Logo', 'آپلود لوگوی فوتر', 'د فوټر لوګو اپلوډ کړئ')}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={footerLogoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFooterLogoUpload}
                        className="hidden"
                      />
                    </div>

                    <Separator />

                    {/* Favicon Upload */}
                    <div className="space-y-2">
                      <Label>{getLabel(lang, 'Favicon (Browser Tab Icon)', 'فاویکون (آیکون تب مرورگر)', 'فاویکون (د براوزر ټب آیکون)')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {getLabel(
                          lang, 
                          'Recommended formats: ICO, PNG, SVG (16×16 or 32×32 pixels, max 1MB)', 
                          'فرمت‌های پیشنهادی: ICO, PNG, SVG (۱۶×۱۶ یا ۳۲×۳۲ پیکسل، حداکثر ۱ مگابایت)',
                          'وړاندیز شوې بڼې: ICO, PNG, SVG (۱۶×۱۶ یا ۳۲×۳۲ پکسل، اعظمي ۱ میګابایټ)'
                        )}
                      </p>
                      
                      {faviconUrl ? (
                        <div className="relative group w-16 h-16 rounded-lg overflow-hidden border bg-muted">
                          <img 
                            src={faviconUrl} 
                            alt="Favicon" 
                            className="w-full h-full object-contain p-1"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                            <Button
                              type="button"
                              size="icon"
                              variant="secondary"
                              className="h-6 w-6"
                              onClick={() => faviconInputRef.current?.click()}
                              disabled={faviconUploading}
                            >
                              <Upload className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="h-6 w-6"
                              onClick={() => setFaviconUrl('')}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => faviconInputRef.current?.click()}
                          className="w-16 h-16 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary hover:bg-accent/50 transition-colors"
                        >
                          {faviconUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                          ) : (
                            <>
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">
                                {getLabel(lang, 'Upload', 'آپلود', 'اپلوډ')}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                      <input
                        ref={faviconInputRef}
                        type="file"
                        accept="image/x-icon,image/png,image/svg+xml"
                        onChange={handleFaviconUpload}
                        className="hidden"
                      />
                    </div>

                    <Separator />

                    <Button 
                      className="hover-scale" 
                      onClick={handleSaveBranding}
                      disabled={saving || logoUploading || footerLogoUploading || faviconUploading}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 me-2 animate-spin" />
                          {getLabel(lang, 'Saving...', 'در حال ذخیره...', 'خوندي کېږي...')}
                        </>
                      ) : (
                        getLabel(lang, 'Save Changes', 'ذخیره تغییرات', 'بدلونونه خوندي کړئ')
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{getLabel(lang, 'General Settings', 'تنظیمات عمومی', 'عمومي تنظیمات')}</CardTitle>
                <CardDescription>
                  {getLabel(lang, 'Configure general site settings', 'تنظیمات عمومی سایت را پیکربندی کنید', 'د سایټ عمومي تنظیمات تنظیم کړئ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">{getLabel(lang, 'Site Name', 'نام سایت', 'د سایټ نوم')}</Label>
                  <Input id="siteName" placeholder={getLabel(lang, 'My Store', 'فروشگاه من', 'زما پلورنځی')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteEmail">{getLabel(lang, 'Site Email', 'ایمیل سایت', 'د سایټ بریښنالیک')}</Label>
                  <Input id="siteEmail" type="email" placeholder="admin@store.com" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{getLabel(lang, 'Maintenance Mode', 'حالت تعمیر و نگهداری', 'د ساتنې حالت')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {getLabel(
                        lang,
                        'Enable maintenance mode to temporarily disable the site',
                        'حالت تعمیر را فعال کنید تا سایت موقتاً غیرفعال شود',
                        'د ساتنې حالت فعال کړئ ترڅو سایټ په لنډ مهال کې غیر فعال شي'
                      )}
                    </p>
                  </div>
                  <Switch />
                </div>
                <Button className="hover-scale">{getLabel(lang, 'Save Changes', 'ذخیره تغییرات', 'بدلونونه خوندي کړئ')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{getLabel(lang, 'Notification Settings', 'تنظیمات اعلان‌ها', 'د خبرتیاوو تنظیمات')}</CardTitle>
                <CardDescription>
                  {getLabel(lang, 'Configure notification preferences', 'تنظیمات اعلان‌ها را پیکربندی کنید', 'د خبرتیاوو غوره توبونه تنظیم کړئ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{getLabel(lang, 'New Order Notifications', 'اعلان سفارشات جدید', 'د نویو امرونو خبرتیاوې')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {getLabel(
                        lang,
                        'Receive notifications for new orders',
                        'برای سفارشات جدید اعلان دریافت کنید',
                        'د نویو امرونو لپاره خبرتیاوې ترلاسه کړئ'
                      )}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{getLabel(lang, 'New User Registrations', 'ثبت‌نام کاربران جدید', 'د نویو کاروونکو راجستر')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {getLabel(
                        lang,
                        'Receive notifications for new user registrations',
                        'برای ثبت‌نام کاربران جدید اعلان دریافت کنید',
                        'د نویو کاروونکو راجستر لپاره خبرتیاوې ترلاسه کړئ'
                      )}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{getLabel(lang, 'Seller Verification Requests', 'درخواست‌های تأیید فروشنده', 'د پلورونکي تایید غوښتنې')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {getLabel(
                        lang,
                        'Receive notifications for seller verification requests',
                        'برای درخواست‌های تأیید فروشنده اعلان دریافت کنید',
                        'د پلورونکي تایید غوښتنو لپاره خبرتیاوې ترلاسه کړئ'
                      )}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="hover-scale">{getLabel(lang, 'Save Changes', 'ذخیره تغییرات', 'بدلونونه خوندي کړئ')}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{getLabel(lang, 'Security Settings', 'تنظیمات امنیتی', 'امنیتي تنظیمات')}</CardTitle>
                <CardDescription>
                  {getLabel(lang, 'Configure security settings', 'تنظیمات امنیتی را پیکربندی کنید', 'امنیتي تنظیمات تنظیم کړئ')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{getLabel(lang, 'Two-Factor Authentication', 'احراز هویت دو مرحله‌ای', 'دوه مرحلې تصدیق')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {getLabel(
                        lang,
                        'Require two-factor authentication for admin accounts',
                        'احراز هویت دو مرحله‌ای برای حساب‌های ادمین اجباری شود',
                        'د ادمین حسابونو لپاره دوه مرحلې تصدیق اړین کړئ'
                      )}
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{getLabel(lang, 'Activity Log', 'گزارش فعالیت‌ها', 'د فعالیتونو راپور')}</Label>
                    <p className="text-sm text-muted-foreground">
                      {getLabel(
                        lang,
                        'Keep a log of admin activities',
                        'گزارش فعالیت‌های ادمین را نگه دارید',
                        'د ادمین فعالیتونو راپور وساتئ'
                      )}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="hover-scale">{getLabel(lang, 'Save Changes', 'ذخیره تغییرات', 'بدلونونه خوندي کړئ')}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
