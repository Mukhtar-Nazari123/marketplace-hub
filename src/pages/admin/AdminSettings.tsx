import { useState, useRef, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/i18n';
import { useSiteSettings, useUpdateSiteSettings, uploadSiteAsset } from '@/hooks/useSiteSettings';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

const AdminSettings = () => {
  const { t, language } = useLanguage();
  const { settings, isLoading } = useSiteSettings();
  const updateSettings = useUpdateSiteSettings();

  // Branding form state
  const [siteNameEn, setSiteNameEn] = useState('');
  const [siteNameFa, setSiteNameFa] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [logoUploading, setLogoUploading] = useState(false);
  const [faviconUploading, setFaviconUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  // Initialize form with settings
  useEffect(() => {
    if (settings) {
      setSiteNameEn(settings.site_name_en);
      setSiteNameFa(settings.site_name_fa);
      setLogoUrl(settings.logo_url || '');
      setFaviconUrl(settings.favicon_url || '');
    }
  }, [settings]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'fa' ? 'لطفاً یک فایل تصویری انتخاب کنید' : 'Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'fa' ? 'حجم تصویر باید کمتر از ۵ مگابایت باشد' : 'Image must be less than 5MB');
      return;
    }

    setLogoUploading(true);
    try {
      const url = await uploadSiteAsset(file, 'logo');
      setLogoUrl(url);
      toast.success(language === 'fa' ? 'لوگو با موفقیت آپلود شد' : 'Logo uploaded successfully');
    } catch (error) {
      console.error('Logo upload error:', error);
      toast.error(language === 'fa' ? 'خطا در آپلود لوگو' : 'Failed to upload logo');
    } finally {
      setLogoUploading(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(language === 'fa' ? 'لطفاً یک فایل تصویری انتخاب کنید' : 'Please select an image file');
      return;
    }

    if (file.size > 1 * 1024 * 1024) {
      toast.error(language === 'fa' ? 'حجم فاویکون باید کمتر از ۱ مگابایت باشد' : 'Favicon must be less than 1MB');
      return;
    }

    setFaviconUploading(true);
    try {
      const url = await uploadSiteAsset(file, 'favicon');
      setFaviconUrl(url);
      toast.success(language === 'fa' ? 'فاویکون با موفقیت آپلود شد' : 'Favicon uploaded successfully');
    } catch (error) {
      console.error('Favicon upload error:', error);
      toast.error(language === 'fa' ? 'خطا در آپلود فاویکون' : 'Failed to upload favicon');
    } finally {
      setFaviconUploading(false);
      if (faviconInputRef.current) faviconInputRef.current.value = '';
    }
  };

  const handleSaveBranding = async () => {
    if (!siteNameEn.trim() || !siteNameFa.trim()) {
      toast.error(language === 'fa' ? 'نام سایت الزامی است' : 'Site name is required');
      return;
    }

    setSaving(true);
    try {
      await updateSettings.mutateAsync({
        site_name_en: siteNameEn.trim(),
        site_name_fa: siteNameFa.trim(),
        logo_url: logoUrl || null,
        favicon_url: faviconUrl || null,
      });
      toast.success(language === 'fa' ? 'تنظیمات برند با موفقیت ذخیره شد' : 'Branding settings saved successfully');
    } catch (error) {
      console.error('Save branding error:', error);
      toast.error(language === 'fa' ? 'خطا در ذخیره تنظیمات' : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout title={t.admin.settings.title} description={t.admin.settings.description}>
      <div className="space-y-6 animate-fade-in">
        <Tabs defaultValue="branding" className="space-y-4">
          <TabsList>
            <TabsTrigger value="branding">
              {language === 'fa' ? 'برندینگ' : 'Branding'}
            </TabsTrigger>
            <TabsTrigger value="general">{t.admin.settings.tabs.general}</TabsTrigger>
            <TabsTrigger value="notifications">{t.admin.settings.tabs.notifications}</TabsTrigger>
            <TabsTrigger value="security">{t.admin.settings.tabs.security}</TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{language === 'fa' ? 'تنظیمات برندینگ' : 'Branding Settings'}</CardTitle>
                <CardDescription>
                  {language === 'fa' 
                    ? 'نام سایت، لوگو و فاویکون را از اینجا تنظیم کنید' 
                    : 'Configure your site name, logo, and favicon'}
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
                        {language === 'fa' ? 'نام سایت (انگلیسی)' : 'Site Name (English)'}
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
                        {language === 'fa' ? 'نام سایت (فارسی)' : 'Site Name (Persian)'}
                      </Label>
                      <Input
                        id="siteNameFa"
                        value={siteNameFa}
                        onChange={(e) => setSiteNameFa(e.target.value)}
                        placeholder="مارکت"
                        dir="rtl"
                      />
                    </div>

                    <Separator />

                    {/* Logo Upload */}
                    <div className="space-y-2">
                      <Label>{language === 'fa' ? 'لوگوی سایت' : 'Site Logo'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fa' 
                          ? 'فرمت‌های پیشنهادی: PNG, SVG, WEBP (حداکثر ۵ مگابایت)' 
                          : 'Recommended formats: PNG, SVG, WEBP (max 5MB)'}
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
                              {language === 'fa' ? 'جایگزین' : 'Replace'}
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
                                {language === 'fa' ? 'آپلود لوگو' : 'Upload Logo'}
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

                    {/* Favicon Upload */}
                    <div className="space-y-2">
                      <Label>{language === 'fa' ? 'فاویکون (آیکون تب مرورگر)' : 'Favicon (Browser Tab Icon)'}</Label>
                      <p className="text-sm text-muted-foreground">
                        {language === 'fa' 
                          ? 'فرمت‌های پیشنهادی: ICO, PNG, SVG (۱۶×۱۶ یا ۳۲×۳۲ پیکسل، حداکثر ۱ مگابایت)' 
                          : 'Recommended formats: ICO, PNG, SVG (16×16 or 32×32 pixels, max 1MB)'}
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
                                {language === 'fa' ? 'آپلود' : 'Upload'}
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
                      disabled={saving || logoUploading || faviconUploading}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 me-2 animate-spin" />
                          {language === 'fa' ? 'در حال ذخیره...' : 'Saving...'}
                        </>
                      ) : (
                        t.admin.settings.saveChanges
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
                <CardTitle>{t.admin.settings.general.title}</CardTitle>
                <CardDescription>{t.admin.settings.general.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">{t.admin.settings.general.siteName}</Label>
                  <Input id="siteName" placeholder={t.admin.settings.general.siteNamePlaceholder} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteEmail">{t.admin.settings.general.siteEmail}</Label>
                  <Input id="siteEmail" type="email" placeholder="admin@store.com" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.general.maintenanceMode}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.general.maintenanceDescription}
                    </p>
                  </div>
                  <Switch />
                </div>
                <Button className="hover-scale">{t.admin.settings.saveChanges}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{t.admin.settings.notifications.title}</CardTitle>
                <CardDescription>{t.admin.settings.notifications.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.notifications.newOrders}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.notifications.newOrdersDescription}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.notifications.newRegistrations}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.notifications.newRegistrationsDescription}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.notifications.verificationRequests}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.notifications.verificationRequestsDescription}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="hover-scale">{t.admin.settings.saveChanges}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{t.admin.settings.security.title}</CardTitle>
                <CardDescription>{t.admin.settings.security.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.security.twoFactor}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.security.twoFactorDescription}
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.security.activityLog}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.security.activityLogDescription}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="hover-scale">{t.admin.settings.saveChanges}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
