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
import { useLanguage } from '@/lib/i18n';
import { useHeroBanners, HeroBannerInput } from '@/hooks/useHeroBanners';
import ImageUpload from '@/components/admin/ImageUpload';

const AdminHeroBanners = () => {
  const { direction } = useLanguage();
  const iconMarginClass = direction === 'rtl' ? 'ml-2' : 'mr-2';
  const { heroBanners, loading, createHeroBanner, updateHeroBanner, deleteHeroBanner, toggleHeroBanner } = useHeroBanners(false);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [formData, setFormData] = useState<HeroBannerInput>({
    title: '',
    title_fa: '',
    badge_text: '',
    badge_text_fa: '',
    description: '',
    description_fa: '',
    cta_text: 'Shop Now',
    cta_text_fa: 'خرید کنید',
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
      badge_text: '',
      badge_text_fa: '',
      description: '',
      description_fa: '',
      cta_text: 'Shop Now',
      cta_text_fa: 'خرید کنید',
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
        badge_text: banner.badge_text || '',
        badge_text_fa: banner.badge_text_fa || '',
        description: banner.description || '',
        description_fa: banner.description_fa || '',
        cta_text: banner.cta_text || 'Shop Now',
        cta_text_fa: banner.cta_text_fa || 'خرید کنید',
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
    if (confirm('Are you sure you want to delete this banner?')) {
      await deleteHeroBanner(id);
    }
  };

  return (
    <AdminLayout title="Hero Banners" description="Manage home page hero banners">
      <div className="space-y-6 animate-fade-in">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Hero Banners</CardTitle>
                <CardDescription>Create and manage main hero banners for the home page</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="hover-scale" onClick={() => handleOpenDialog()}>
                    <Plus className={`h-4 w-4 ${iconMarginClass}`} />
                    Add Banner
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingBanner ? 'Edit Hero Banner' : 'Create Hero Banner'}</DialogTitle>
                    <DialogDescription>
                      {editingBanner ? 'Update the hero banner details' : 'Add a new hero banner to the home page'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    {/* English Content */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-sm text-muted-foreground">English Content</h4>
                      <div className="grid gap-2">
                        <Label htmlFor="badge_text">Badge Text</Label>
                        <Input
                          id="badge_text"
                          placeholder="e.g. 50% OFF"
                          value={formData.badge_text || ''}
                          onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          placeholder="e.g. Modern Style Headphones Model"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          placeholder="e.g. Hurry up! Only 100 products at this discounted price."
                          value={formData.description || ''}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cta_text">CTA Button Text</Label>
                        <Input
                          id="cta_text"
                          placeholder="e.g. Shop Now"
                          value={formData.cta_text || ''}
                          onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Persian Content */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Persian Content (فارسی)</h4>
                      <div className="grid gap-2">
                        <Label htmlFor="badge_text_fa">Badge Text (فارسی)</Label>
                        <Input
                          id="badge_text_fa"
                          dir="rtl"
                          placeholder="مثلاً: ۵۰٪ تخفیف"
                          value={formData.badge_text_fa || ''}
                          onChange={(e) => setFormData({ ...formData, badge_text_fa: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="title_fa">Title (فارسی)</Label>
                        <Input
                          id="title_fa"
                          dir="rtl"
                          placeholder="مثلاً: مدل هدفون مدرن استایل"
                          value={formData.title_fa || ''}
                          onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description_fa">Description (فارسی)</Label>
                        <Textarea
                          id="description_fa"
                          dir="rtl"
                          placeholder="مثلاً: عجله کنید! فقط ۱۰۰ محصول با این قیمت تخفیف‌دار."
                          value={formData.description_fa || ''}
                          onChange={(e) => setFormData({ ...formData, description_fa: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cta_text_fa">CTA Button Text (فارسی)</Label>
                        <Input
                          id="cta_text_fa"
                          dir="rtl"
                          placeholder="مثلاً: خرید کنید"
                          value={formData.cta_text_fa || ''}
                          onChange={(e) => setFormData({ ...formData, cta_text_fa: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Link & Images */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Link & Images</h4>
                      <div className="grid gap-2">
                        <Label htmlFor="cta_link">CTA Link</Label>
                        <Input
                          id="cta_link"
                          placeholder="e.g. /products or /categories/electronics"
                          value={formData.cta_link || ''}
                          onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="background_color">Background Color</Label>
                        <div className="flex gap-2">
                          <Input
                            id="background_color"
                            type="color"
                            className="w-14 h-10 p-1 cursor-pointer"
                            value={formData.background_color || '#ffffff'}
                            onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          />
                          <Input
                            placeholder="e.g. #eb1d31 or leave empty"
                            value={formData.background_color || ''}
                            onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Used when no background image is set
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <ImageUpload
                          label="Background Image"
                          value={formData.background_image || ''}
                          onChange={(url) => setFormData({ ...formData, background_image: url })}
                          placeholder="Upload background image"
                          folder="hero-banners"
                        />
                        <ImageUpload
                          label="Icon/Product Image"
                          value={formData.icon_image || ''}
                          onChange={(url) => setFormData({ ...formData, icon_image: url })}
                          placeholder="Upload product image"
                          folder="hero-banners"
                        />
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="space-y-4 border-t pt-4">
                      <h4 className="font-medium text-sm text-muted-foreground">Settings</h4>
                      <div className="grid gap-2">
                        <Label htmlFor="display_order">Display Order</Label>
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
                        <Label>Active</Label>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!formData.title}>
                      {editingBanner ? 'Update' : 'Create'}
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
                <h3 className="mt-4 text-lg font-semibold">No Hero Banners</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first hero banner to display on the home page
                </p>
                <Button className="mt-4 hover-scale" onClick={() => handleOpenDialog()}>
                  <Plus className={`h-4 w-4 ${iconMarginClass}`} />
                  Add First Banner
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Badge</TableHead>
                    <TableHead>CTA</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
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
