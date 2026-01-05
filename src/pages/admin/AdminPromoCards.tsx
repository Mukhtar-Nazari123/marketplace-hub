import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, LayoutGrid } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { usePromoCards, type PromoCard } from '@/hooks/usePromoCards';
import { useCategories } from '@/hooks/useCategories';
import { toast } from 'sonner';
import ImageUpload from '@/components/admin/ImageUpload';

const AdminPromoCards = () => {
  const { t, direction, isRTL } = useLanguage();
  const { promoCards, loading, createPromoCard, updatePromoCard, deletePromoCard, toggleActive } = usePromoCards({ activeOnly: false });
  const { categories } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<PromoCard | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    title_fa: '',
    subtitle: '',
    subtitle_fa: '',
    starting_price: 0,
    currency: 'USD',
    badge_text: '',
    badge_text_fa: '',
    badge_variant: 'new',
    color_theme: 'cyan',
    category_id: '',
    link_url: '',
    image_url: '',
    is_active: true,
    sort_order: 0,
  });

  const iconMarginClass = direction === 'rtl' ? 'ml-2' : 'mr-2';

  const resetForm = () => {
    setFormData({
      title: '',
      title_fa: '',
      subtitle: '',
      subtitle_fa: '',
      starting_price: 0,
      currency: 'USD',
      badge_text: '',
      badge_text_fa: '',
      badge_variant: 'new',
      color_theme: 'cyan',
      category_id: '',
      link_url: '',
      image_url: '',
      is_active: true,
      sort_order: promoCards.length + 1,
    });
    setEditingCard(null);
  };

  const handleOpenDialog = (card?: PromoCard) => {
    if (card) {
      setEditingCard(card);
      setFormData({
        title: card.title,
        title_fa: card.title_fa || '',
        subtitle: card.subtitle || '',
        subtitle_fa: card.subtitle_fa || '',
        starting_price: card.starting_price,
        currency: card.currency,
        badge_text: card.badge_text || '',
        badge_text_fa: card.badge_text_fa || '',
        badge_variant: card.badge_variant,
        color_theme: card.color_theme,
        category_id: card.category_id || '',
        link_url: card.link_url || '',
        image_url: card.image_url || '',
        is_active: card.is_active,
        sort_order: card.sort_order,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        category_id: formData.category_id || null,
        title_fa: formData.title_fa || null,
        subtitle: formData.subtitle || null,
        subtitle_fa: formData.subtitle_fa || null,
        badge_text: formData.badge_text || null,
        badge_text_fa: formData.badge_text_fa || null,
        link_url: formData.link_url || null,
        image_url: formData.image_url || null,
        product_id: null,
      };

      if (editingCard) {
        await updatePromoCard(editingCard.id, payload);
        toast.success(isRTL ? 'کارت تبلیغاتی به‌روزرسانی شد' : 'Promo card updated successfully');
      } else {
        await createPromoCard(payload);
        toast.success(isRTL ? 'کارت تبلیغاتی ایجاد شد' : 'Promo card created successfully');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving promo card:', error);
      toast.error(isRTL ? 'خطا در ذخیره کارت' : 'Error saving promo card');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(isRTL ? 'آیا مطمئن هستید؟' : 'Are you sure you want to delete this promo card?')) {
      try {
        await deletePromoCard(id);
        toast.success(isRTL ? 'کارت حذف شد' : 'Promo card deleted');
      } catch (error) {
        console.error('Error deleting promo card:', error);
        toast.error(isRTL ? 'خطا در حذف کارت' : 'Error deleting promo card');
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleActive(id, isActive);
      toast.success(isRTL 
        ? (isActive ? 'کارت فعال شد' : 'کارت غیرفعال شد')
        : (isActive ? 'Promo card activated' : 'Promo card deactivated')
      );
    } catch (error) {
      console.error('Error toggling promo card:', error);
      toast.error(isRTL ? 'خطا' : 'Error updating status');
    }
  };

  return (
    <AdminLayout 
      title={isRTL ? 'کارت‌های تبلیغاتی' : 'Promotional Cards'} 
      description={isRTL ? 'مدیریت کارت‌های تبلیغاتی صفحه اصلی' : 'Manage homepage promotional cards'}
    >
      <div className="space-y-6 animate-fade-in">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{isRTL ? 'کارت‌های تبلیغاتی' : 'Promo Cards'}</CardTitle>
                <CardDescription>
                  {isRTL 
                    ? 'کارت‌هایی که در صفحه اصلی نمایش داده می‌شوند' 
                    : 'Cards displayed on the homepage hero section'}
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="hover-scale" onClick={() => handleOpenDialog()}>
                    <Plus className={`h-4 w-4 ${iconMarginClass}`} />
                    {isRTL ? 'افزودن کارت' : 'Add Card'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCard 
                        ? (isRTL ? 'ویرایش کارت تبلیغاتی' : 'Edit Promo Card')
                        : (isRTL ? 'افزودن کارت تبلیغاتی' : 'Add Promo Card')
                      }
                    </DialogTitle>
                    <DialogDescription>
                      {isRTL ? 'اطلاعات کارت را وارد کنید' : 'Enter the promo card details'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'عنوان (انگلیسی)' : 'Title (English)'}</Label>
                        <Input 
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Top Selling iMAC"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'عنوان (فارسی)' : 'Title (Persian)'}</Label>
                        <Input 
                          value={formData.title_fa}
                          onChange={(e) => setFormData(prev => ({ ...prev, title_fa: e.target.value }))}
                          placeholder="پرفروش‌ترین iMAC"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'زیرعنوان (انگلیسی)' : 'Subtitle (English)'}</Label>
                        <Input 
                          value={formData.subtitle}
                          onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                          placeholder="Latest Generation"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'زیرعنوان (فارسی)' : 'Subtitle (Persian)'}</Label>
                        <Input 
                          value={formData.subtitle_fa}
                          onChange={(e) => setFormData(prev => ({ ...prev, subtitle_fa: e.target.value }))}
                          placeholder="نسل جدید"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'متن نشان (انگلیسی)' : 'Badge Text (English)'}</Label>
                        <Input 
                          value={formData.badge_text}
                          onChange={(e) => setFormData(prev => ({ ...prev, badge_text: e.target.value }))}
                          placeholder="Now Available!"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'متن نشان (فارسی)' : 'Badge Text (Persian)'}</Label>
                        <Input 
                          value={formData.badge_text_fa}
                          onChange={(e) => setFormData(prev => ({ ...prev, badge_text_fa: e.target.value }))}
                          placeholder="اکنون موجود!"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'قیمت شروع' : 'Starting Price'}</Label>
                        <Input 
                          type="number"
                          value={formData.starting_price}
                          onChange={(e) => setFormData(prev => ({ ...prev, starting_price: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'ارز' : 'Currency'}</Label>
                        <Select 
                          value={formData.currency} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="AFN">AFN (؋)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'ترتیب' : 'Sort Order'}</Label>
                        <Input 
                          type="number"
                          value={formData.sort_order}
                          onChange={(e) => setFormData(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'نوع نشان' : 'Badge Variant'}</Label>
                        <Select 
                          value={formData.badge_variant} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, badge_variant: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">{isRTL ? 'جدید' : 'New'}</SelectItem>
                            <SelectItem value="sale">{isRTL ? 'تخفیف' : 'Sale'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'رنگ' : 'Color Theme'}</Label>
                        <Select 
                          value={formData.color_theme} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, color_theme: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cyan">{isRTL ? 'آبی' : 'Cyan'}</SelectItem>
                            <SelectItem value="orange">{isRTL ? 'نارنجی' : 'Orange'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{isRTL ? 'دسته‌بندی (اختیاری)' : 'Category (Optional)'}</Label>
                        <Select 
                          value={formData.category_id} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value === 'none' ? '' : value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={isRTL ? 'انتخاب دسته‌بندی' : 'Select category'} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{isRTL ? 'بدون دسته‌بندی' : 'None'}</SelectItem>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {isRTL ? cat.name_fa || cat.name : cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{isRTL ? 'لینک سفارشی (اختیاری)' : 'Custom Link (Optional)'}</Label>
                        <Input 
                          value={formData.link_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                          placeholder="/products?category=electronics"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <ImageUpload
                        label={isRTL ? 'تصویر پس‌زمینه' : 'Background Image'}
                        value={formData.image_url}
                        onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                        placeholder={isRTL ? 'آپلود تصویر' : 'Upload background image'}
                        folder="promo-cards"
                      />
                    </div>

                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Switch 
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                      />
                      <Label>{isRTL ? 'فعال' : 'Active'}</Label>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      {isRTL ? 'انصراف' : 'Cancel'}
                    </Button>
                    <Button onClick={handleSubmit}>
                      {editingCard 
                        ? (isRTL ? 'به‌روزرسانی' : 'Update')
                        : (isRTL ? 'ایجاد' : 'Create')
                      }
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
            ) : promoCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 animate-pulse">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">
                  {isRTL ? 'کارتی وجود ندارد' : 'No promo cards'}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isRTL ? 'با ایجاد یک کارت جدید شروع کنید' : 'Start by creating a new promo card'}
                </p>
                <Button className="mt-4 hover-scale" onClick={() => handleOpenDialog()}>
                  <Plus className={`h-4 w-4 ${iconMarginClass}`} />
                  {isRTL ? 'ایجاد اولین کارت' : 'Create First Card'}
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{isRTL ? 'عنوان' : 'Title'}</TableHead>
                    <TableHead>{isRTL ? 'قیمت' : 'Price'}</TableHead>
                    <TableHead>{isRTL ? 'رنگ' : 'Color'}</TableHead>
                    <TableHead>{isRTL ? 'وضعیت' : 'Status'}</TableHead>
                    <TableHead className="text-right">{isRTL ? 'اقدامات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCards.map((card) => (
                    <TableRow key={card.id}>
                      <TableCell>
                        {card.sort_order}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{isRTL && card.title_fa ? card.title_fa : card.title}</p>
                          {card.subtitle && (
                            <p className="text-sm text-muted-foreground">
                              {isRTL && card.subtitle_fa ? card.subtitle_fa : card.subtitle}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {card.currency === 'AFN' ? '؋' : '$'}{card.starting_price.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={card.color_theme === 'orange' ? 'border-orange text-orange' : 'border-cyan text-cyan'}
                        >
                          {card.color_theme}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={card.is_active}
                          onCheckedChange={(checked) => handleToggleActive(card.id, checked)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleOpenDialog(card)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(card.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
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

export default AdminPromoCards;
