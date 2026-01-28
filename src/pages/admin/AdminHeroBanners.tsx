import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Monitor } from 'lucide-react';
import { useLanguage, type Language } from '@/lib/i18n';
import { useHeroBanners, HeroBannerInput } from '@/hooks/useHeroBanners';
import ImageUpload from '@/components/admin/ImageUpload';

// Trilingual helper
const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const AdminHeroBanners = () => {
  const { direction, language } = useLanguage();
  const lang = language as Language;
  const isRTL = direction === 'rtl';
  const iconMarginClass = isRTL ? 'ml-2' : 'mr-2';
  const { heroBanners, loading, createHeroBanner, updateHeroBanner, deleteHeroBanner, toggleHeroBanner } = useHeroBanners(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [formData, setFormData] = useState<HeroBannerInput>({
    title: '',
    title_fa: '',
    title_ps: '',
    badge_text: '',
    badge_text_fa: '',
    badge_text_ps: '',
    description: '',
    description_fa: '',
    description_ps: '',
    cta_text: 'Shop Now',
    cta_text_fa: 'خرید کنید',
    cta_text_ps: 'اوس پیرود وکړئ',
    cta_link: '',
    background_image: '',
    background_color: '',
    icon_image: '',
    is_active: true,
    display_order: 0,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      title_fa: '',
      title_ps: '',
      badge_text: '',
      badge_text_fa: '',
      badge_text_ps: '',
      description: '',
      description_fa: '',
      description_ps: '',
      cta_text: 'Shop Now',
      cta_text_fa: 'خرید کنید',
      cta_text_ps: 'اوس پیرود وکړئ',
      cta_link: '',
      background_image: '',
      background_color: '',
      icon_image: '',
      is_active: true,
      display_order: 0,
    });
    setEditingBanner(null);
  };

  const handleOpenDialog = (banner?: typeof heroBanners[0]) => {
    if (banner) {
      setEditingBanner(banner.id);
      setFormData({
        title: banner.title,
        title_fa: banner.title_fa || '',
        title_ps: (banner as any).title_ps || '',
        badge_text: banner.badge_text || '',
        badge_text_fa: banner.badge_text_fa || '',
        badge_text_ps: (banner as any).badge_text_ps || '',
        description: banner.description || '',
        description_fa: banner.description_fa || '',
        description_ps: (banner as any).description_ps || '',
        cta_text: banner.cta_text || 'Shop Now',
        cta_text_fa: banner.cta_text_fa || 'خرید کنید',
        cta_text_ps: (banner as any).cta_text_ps || 'اوس پیرود وکړئ',
        cta_link: banner.cta_link || '',
        background_image: banner.background_image || '',
        background_color: banner.background_color || '',
        icon_image: banner.icon_image || '',
        is_active: banner.is_active,
        display_order: banner.display_order,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingBanner) {
        await updateHeroBanner(editingBanner, formData);
      } else {
        await createHeroBanner(formData);
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (id: string) => {
    const confirmMessage = getLabel(lang, 
      'Are you sure you want to delete this banner?', 
      'آیا مطمئن هستید که می‌خواهید این بنر را حذف کنید؟',
      'ایا تاسو ډاډه یاست چې دا بینر حذف کړئ؟'
    );
    if (confirm(confirmMessage)) {
      await deleteHeroBanner(id);
    }
  };

  return (
    <AdminLayout 
      title={getLabel(lang, 'Hero Banners', 'بنرهای اصلی', 'اصلي بینرونه')} 
      description={getLabel(lang, 'Manage home page hero banners', 'مدیریت بنرهای صفحه اصلی', 'د کور پاڼې اصلي بینرونه اداره کړئ')}
    >
      <div className="space-y-6 animate-fade-in">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{getLabel(lang, 'Hero Banners', 'بنرهای اصلی', 'اصلي بینرونه')}</CardTitle>
                <CardDescription>
                  {getLabel(lang, 'Create and manage main hero banners for the home page', 'ایجاد و مدیریت بنرهای اصلی صفحه اول', 'د کور پاڼې لپاره اصلي بینرونه جوړ او اداره کړئ')}
                </CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="hover-scale" onClick={() => handleOpenDialog()}>
                    <Plus className={`h-4 w-4 ${iconMarginClass}`} />
                    {getLabel(lang, 'Add Banner', 'افزودن بنر', 'بینر اضافه کړئ')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingBanner 
                        ? getLabel(lang, 'Edit Hero Banner', 'ویرایش بنر', 'بینر سمول') 
                        : getLabel(lang, 'Create Hero Banner', 'ایجاد بنر', 'بینر جوړول')}
                    </DialogTitle>
                    <DialogDescription>
                      {editingBanner 
                        ? getLabel(lang, 'Update the hero banner details', 'جزئیات بنر را به‌روزرسانی کنید', 'د بینر جزئیات تازه کړئ') 
                        : getLabel(lang, 'Add a new hero banner to the home page', 'یک بنر جدید به صفحه اصلی اضافه کنید', 'کور پاڼې ته نوی بینر اضافه کړئ')}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    {/* English Content */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        {getLabel(lang, 'English Content', 'محتوای انگلیسی', 'انګلیسي منځپانګه')}
                      </h4>
                      <div className="grid gap-2">
                        <Label htmlFor="badge_text">{getLabel(lang, 'Badge Text', 'متن نشان', 'د بیج متن')}</Label>
                        <Input
                          id="badge_text"
                          placeholder={getLabel(lang, 'e.g. 50% OFF', 'مثلاً: ۵۰٪ تخفیف', 'لکه ۵۰٪ تخفیف')}
                          value={formData.badge_text || ''}
                          onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title">{getLabel(lang, 'Title *', 'عنوان *', 'سرلیک *')}</Label>
                        <Input
                          id="title"
                          placeholder={getLabel(lang, 'e.g. Modern Style Headphones Model', 'مثلاً: مدل هدفون مدرن استایل', 'لکه عصري سټایل هیډفون ماډل')}
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">{getLabel(lang, 'Description', 'توضیحات', 'توضیحات')}</Label>
                        <Textarea
                          id="description"
                          placeholder={getLabel(lang, 'e.g. Hurry up! Only 100 products at this discounted price.', 'مثلاً: عجله کنید! فقط ۱۰۰ محصول با این قیمت تخفیف‌دار.', 'لکه چټک شئ! یوازې ۱۰۰ محصولات په دې تخفیف بیه.')}
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cta_text">{getLabel(lang, 'CTA Button Text', 'متن دکمه', 'د تڼۍ متن')}</Label>
                        <Input
                          id="cta_text"
                          placeholder={getLabel(lang, 'e.g. Shop Now', 'مثلاً: خرید کنید', 'لکه اوس پیرود وکړئ')}
                          value={formData.cta_text || ''}
                          onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Persian Content */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        {getLabel(lang, 'Persian Content (فارسی)', 'محتوای فارسی', 'فارسي منځپانګه')}
                      </h4>
                      <div className="grid gap-2">
                        <Label htmlFor="badge_text_fa">{getLabel(lang, 'Badge Text (فارسی)', 'متن نشان (فارسی)', 'د بیج متن (فارسي)')}</Label>
                        <Input
                          id="badge_text_fa"
                          dir="rtl"
                          placeholder="مثلاً: ۵۰٪ تخفیف"
                          value={formData.badge_text_fa || ''}
                          onChange={(e) => setFormData({ ...formData, badge_text_fa: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title_fa">{getLabel(lang, 'Title (فارسی)', 'عنوان (فارسی)', 'سرلیک (فارسي)')}</Label>
                        <Input
                          id="title_fa"
                          dir="rtl"
                          placeholder="مثلاً: مدل هدفون مدرن استایل"
                          value={formData.title_fa || ''}
                          onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description_fa">{getLabel(lang, 'Description (فارسی)', 'توضیحات (فارسی)', 'توضیحات (فارسي)')}</Label>
                        <Textarea
                          id="description_fa"
                          dir="rtl"
                          placeholder="مثلاً: عجله کنید! فقط ۱۰۰ محصول با این قیمت تخفیف‌دار."
                          value={formData.description_fa || ''}
                          onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cta_text_fa">{getLabel(lang, 'CTA Button Text (فارسی)', 'متن دکمه (فارسی)', 'د تڼۍ متن (فارسي)')}</Label>
                        <Input
                          id="cta_text_fa"
                          dir="rtl"
                          placeholder="مثلاً: خرید کنید"
                          value={formData.cta_text_fa || ''}
                          onChange={(e) => setFormData({ ...formData, cta_text_fa: e.target.value })}
                        />
                    </div>

                    {/* Pashto Content */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        {getLabel(lang, 'Pashto Content (پښتو)', 'محتوای پشتو', 'پښتو منځپانګه')}
                      </h4>
                      <div className="grid gap-2">
                        <Label htmlFor="badge_text_ps">{getLabel(lang, 'Badge Text (پښتو)', 'متن نشان (پشتو)', 'د بیج متن (پښتو)')}</Label>
                        <Input
                          id="badge_text_ps"
                          dir="rtl"
                          placeholder="لکه: ۵۰٪ تخفیف"
                          value={formData.badge_text_ps || ''}
                          onChange={(e) => setFormData({ ...formData, badge_text_ps: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title_ps">{getLabel(lang, 'Title (پښتو)', 'عنوان (پشتو)', 'سرلیک (پښتو)')}</Label>
                        <Input
                          id="title_ps"
                          dir="rtl"
                          placeholder="لکه: عصري سټایل هیډفون ماډل"
                          value={formData.title_ps || ''}
                          onChange={(e) => setFormData({ ...formData, title_ps: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description_ps">{getLabel(lang, 'Description (پښتو)', 'توضیحات (پشتو)', 'توضیحات (پښتو)')}</Label>
                        <Textarea
                          id="description_ps"
                          dir="rtl"
                          placeholder="لکه: چټک شئ! یوازې ۱۰۰ محصولات په دې تخفیف بیه."
                          value={formData.description_ps || ''}
                          onChange={(e) => setFormData({ ...formData, description_ps: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cta_text_ps">{getLabel(lang, 'CTA Button Text (پښتو)', 'متن دکمه (پشتو)', 'د تڼۍ متن (پښتو)')}</Label>
                        <Input
                          id="cta_text_ps"
                          dir="rtl"
                          placeholder="لکه: اوس پیرود وکړئ"
                          value={formData.cta_text_ps || ''}
                          onChange={(e) => setFormData({ ...formData, cta_text_ps: e.target.value })}
                        />
                      </div>
                    </div>
                    </div>

                    {/* Link & Images */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        {getLabel(lang, 'Link & Images', 'لینک و تصاویر', 'لینک او انځورونه')}
                      </h4>
                      <div className="grid gap-2">
                        <Label htmlFor="cta_link">{getLabel(lang, 'CTA Link', 'لینک دکمه', 'د تڼۍ لینک')}</Label>
                        <Input
                          id="cta_link"
                          placeholder={getLabel(lang, 'e.g. /products or /categories/electronics', 'مثلاً: /products یا /categories/electronics', 'لکه /products یا /categories/electronics')}
                          value={formData.cta_link || ''}
                          onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="background_color">{getLabel(lang, 'Background Color', 'رنگ پس‌زمینه', 'د شالید رنګ')}</Label>
                        <div className="flex gap-2">
                          <Input
                            id="background_color"
                            type="color"
                            className="w-14 h-10 p-1 cursor-pointer"
                            value={formData.background_color || '#ffffff'}
                            onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          />
                          <Input
                            placeholder={getLabel(lang, 'e.g. #eb1d31 or leave empty', 'مثلاً: #eb1d31 یا خالی بگذارید', 'لکه #eb1d31 یا خالي پریږدئ')}
                            value={formData.background_color || ''}
                            onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {getLabel(lang, 'Used when no background image is set', 'زمانی استفاده می‌شود که تصویر پس‌زمینه تنظیم نشده باشد', 'کله چې د شالید انځور نه وي ترتیب شوی کارول کیږي')}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <ImageUpload
                          label={getLabel(lang, 'Background Image', 'تصویر پس‌زمینه', 'د شالید انځور')}
                          value={formData.background_image || ''}
                          onChange={(url) => setFormData({ ...formData, background_image: url })}
                          placeholder={getLabel(lang, 'Upload background image', 'آپلود تصویر پس‌زمینه', 'د شالید انځور پورته کړئ')}
                          folder="hero-banners"
                        />
                        <ImageUpload
                          label={getLabel(lang, 'Icon/Product Image', 'تصویر آیکون/محصول', 'د آیکون/محصول انځور')}
                          value={formData.icon_image || ''}
                          onChange={(url) => setFormData({ ...formData, icon_image: url })}
                          placeholder={getLabel(lang, 'Upload product image', 'آپلود تصویر محصول', 'د محصول انځور پورته کړئ')}
                          folder="hero-banners"
                        />
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-sm text-muted-foreground">
                        {getLabel(lang, 'Settings', 'تنظیمات', 'ترتیبات')}
                      </h4>
                      <div className="grid gap-2">
                        <Label htmlFor="display_order">{getLabel(lang, 'Display Order', 'ترتیب نمایش', 'د ښودلو ترتیب')}</Label>
                        <Input
                          id="display_order"
                          type="number"
                          value={formData.display_order}
                          onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={formData.is_active}
                          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        />
                        <Label>{getLabel(lang, 'Active', 'فعال', 'فعال')}</Label>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      {getLabel(lang, 'Cancel', 'انصراف', 'لغوه کول')}
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.title}>
                      {editingBanner 
                        ? getLabel(lang, 'Update', 'به‌روزرسانی', 'تازه کول') 
                        : getLabel(lang, 'Create', 'ایجاد', 'جوړول')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : heroBanners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 animate-pulse">
                  <Monitor className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {getLabel(lang, 'No Hero Banners', 'بنری وجود ندارد', 'هیڅ بینر نشته')}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {getLabel(lang, 'Create your first hero banner to display on the home page', 'اولین بنر خود را برای نمایش در صفحه اصلی ایجاد کنید', 'د کور پاڼې لپاره خپل لومړی بینر جوړ کړئ')}
                </p>
                <Button className="mt-4 hover-scale" onClick={() => handleOpenDialog()}>
                  <Plus className={`h-4 w-4 ${iconMarginClass}`} />
                  {getLabel(lang, 'Add First Banner', 'افزودن اولین بنر', 'لومړی بینر اضافه کړئ')}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{getLabel(lang, 'Order', 'ترتیب', 'ترتیب')}</TableHead>
                    <TableHead>{getLabel(lang, 'Title', 'عنوان', 'سرلیک')}</TableHead>
                    <TableHead>{getLabel(lang, 'Badge', 'نشان', 'بیج')}</TableHead>
                    <TableHead>{getLabel(lang, 'CTA', 'دکمه', 'تڼۍ')}</TableHead>
                    <TableHead>{getLabel(lang, 'Status', 'وضعیت', 'حالت')}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>
                      {getLabel(lang, 'Actions', 'عملیات', 'عملیات')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {heroBanners.map((banner) => (
                    <TableRow key={banner.id}>
                      <TableCell className="font-medium">{banner.display_order}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{banner.title}</p>
                          {banner.title_fa && (
                            <p className="text-sm text-muted-foreground" dir="rtl">{banner.title_fa}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {banner.badge_text && <Badge variant="secondary">{banner.badge_text}</Badge>}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{banner.cta_text}</span>
                        {banner.cta_link && (
                          <p className="text-xs text-muted-foreground">{banner.cta_link}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={banner.is_active}
                          onCheckedChange={(checked) => toggleHeroBanner(banner.id, checked)}
                        />
                      </TableCell>
                      <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                        <div className={`flex gap-2 ${isRTL ? 'justify-start' : 'justify-end'}`}>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(banner)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminHeroBanners;
