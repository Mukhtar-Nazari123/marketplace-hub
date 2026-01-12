import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, Image, GripVertical } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useHomeBanners, HomeBannerInput } from '@/hooks/useHomeBanners';
import ImageUpload from '@/components/admin/ImageUpload';
import { toast } from 'sonner';

const AdminHomeBanners = () => {
  const { t, direction } = useLanguage();
  const iconMarginClass = direction === 'rtl' ? 'ml-2' : 'mr-2';
  const { banners, loading, createBanner, updateBanner, deleteBanner, toggleActive, refetch } = useHomeBanners({ activeOnly: false });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<string | null>(null);
  const [formData, setFormData] = useState<HomeBannerInput>({
    title_en: '',
    title_fa: '',
    subtitle_en: '',
    subtitle_fa: '',
    button_text_en: 'Shop Now',
    button_text_fa: 'خرید کنید',
    price_text_en: '',
    price_text_fa: '',
    button_url: '',
    background_type: 'color',
    background_color: '#0ea5e9',
    background_image_path: '',
    icon_or_image_path: '',
    is_active: true,
    priority: 0,
  });

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_fa: '',
      subtitle_en: '',
      subtitle_fa: '',
      button_text_en: 'Shop Now',
      button_text_fa: 'خرید کنید',
      price_text_en: '',
      price_text_fa: '',
      button_url: '',
      background_type: 'color',
      background_color: '#0ea5e9',
      background_image_path: '',
      icon_or_image_path: '',
      is_active: true,
      priority: 0,
    });
    setEditingBanner(null);
  };

  const handleEdit = (banner: any) => {
    setFormData({
      title_en: banner.title_en,
      title_fa: banner.title_fa || '',
      subtitle_en: banner.subtitle_en || '',
      subtitle_fa: banner.subtitle_fa || '',
      button_text_en: banner.button_text_en || 'Shop Now',
      button_text_fa: banner.button_text_fa || 'خرید کنید',
      price_text_en: banner.price_text_en || '',
      price_text_fa: banner.price_text_fa || '',
      button_url: banner.button_url || '',
      background_type: banner.background_type,
      background_color: banner.background_color || '#0ea5e9',
      background_image_path: banner.background_image_path || '',
      icon_or_image_path: banner.icon_or_image_path || '',
      is_active: banner.is_active,
      priority: banner.priority,
    });
    setEditingBanner(banner.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBanner) {
        await updateBanner(editingBanner, formData);
        toast.success('Banner updated successfully');
      } else {
        await createBanner(formData);
        toast.success('Banner created successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save banner');
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteBanner(id);
        toast.success('Banner deleted successfully');
      } catch (error) {
        toast.error('Failed to delete banner');
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleActive(id, isActive);
      toast.success(isActive ? 'Banner activated' : 'Banner deactivated');
    } catch (error) {
      toast.error('Failed to update banner status');
    }
  };

  return (
    <AdminLayout title="Home Banners" description="Manage promotional banners displayed on the homepage">
      <div className="space-y-6 animate-fade-in">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Promotional Banners</CardTitle>
                <CardDescription>Create and manage multilingual homepage banners with RTL support</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="hover-scale">
                    <Plus className={`h-4 w-4 ${iconMarginClass}`} />
                    Add Banner
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingBanner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="english" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="english">🟦 English Content</TabsTrigger>
                        <TabsTrigger value="persian">🟩 Persian Content (RTL)</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="english" className="space-y-4 mt-4">
                        <div>
                          <Label>Title (EN) *</Label>
                          <Input
                            value={formData.title_en}
                            onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                            placeholder="Save 20% on millions of apps"
                            required
                          />
                        </div>
                        <div>
                          <Label>Subtitle (EN)</Label>
                          <Input
                            value={formData.subtitle_en || ''}
                            onChange={(e) => setFormData({ ...formData, subtitle_en: e.target.value })}
                            placeholder="Limited offer. Don't miss this amazing deal!"
                          />
                        </div>
                        <div>
                          <Label>Button Text (EN)</Label>
                          <Input
                            value={formData.button_text_en || ''}
                            onChange={(e) => setFormData({ ...formData, button_text_en: e.target.value })}
                            placeholder="Shop Now"
                          />
                        </div>
                        <div>
                          <Label>Price Text (EN)</Label>
                          <Input
                            value={formData.price_text_en || ''}
                            onChange={(e) => setFormData({ ...formData, price_text_en: e.target.value })}
                            placeholder="$140"
                          />
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="persian" className="space-y-4 mt-4">
                        <div dir="rtl">
                          <Label>Title (FA)</Label>
                          <Input
                            value={formData.title_fa || ''}
                            onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })}
                            placeholder="۲۰٪ تخفیف روی میلیون‌ها اپلیکیشن"
                            className="text-right"
                          />
                        </div>
                        <div dir="rtl">
                          <Label>Subtitle (FA)</Label>
                          <Input
                            value={formData.subtitle_fa || ''}
                            onChange={(e) => setFormData({ ...formData, subtitle_fa: e.target.value })}
                            placeholder="پیشنهاد محدود. این فرصت را از دست ندهید!"
                            className="text-right"
                          />
                        </div>
                        <div dir="rtl">
                          <Label>Button Text (FA)</Label>
                          <Input
                            value={formData.button_text_fa || ''}
                            onChange={(e) => setFormData({ ...formData, button_text_fa: e.target.value })}
                            placeholder="خرید کنید"
                            className="text-right"
                          />
                        </div>
                        <div dir="rtl">
                          <Label>Price Text (FA)</Label>
                          <Input
                            value={formData.price_text_fa || ''}
                            onChange={(e) => setFormData({ ...formData, price_text_fa: e.target.value })}
                            placeholder="۱۴۰ دلار"
                            className="text-right"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="border-t pt-4 space-y-4">
                      <h4 className="font-medium">🎨 Design & Behavior</h4>
                      
                      <div>
                        <Label>Button URL</Label>
                        <Input
                          value={formData.button_url || ''}
                          onChange={(e) => setFormData({ ...formData, button_url: e.target.value })}
                          placeholder="/products or https://example.com"
                        />
                      </div>

                      <div>
                        <Label>Background Type</Label>
                        <Select
                          value={formData.background_type}
                          onValueChange={(value) => setFormData({ ...formData, background_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="color">Color</SelectItem>
                            <SelectItem value="image">Image</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {formData.background_type === 'color' && (
                        <div>
                          <Label>Background Color</Label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={formData.background_color || '#0ea5e9'}
                              onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                              className="w-10 h-10 rounded cursor-pointer"
                            />
                            <Input
                              value={formData.background_color || ''}
                              onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                              placeholder="#0ea5e9"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      )}

                      {formData.background_type === 'image' && (
                        <div>
                          <Label>Background Image</Label>
                          <ImageUpload
                            label=""
                            value={formData.background_image_path || ''}
                            onChange={(url) => setFormData({ ...formData, background_image_path: url })}
                            folder="home-banners"
                          />
                        </div>
                      )}

                      <div>
                        <Label>Icon / Image</Label>
                        <ImageUpload
                          label=""
                          value={formData.icon_or_image_path || ''}
                          onChange={(url) => setFormData({ ...formData, icon_or_image_path: url })}
                          folder="home-banners/icons"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Priority</Label>
                          <Input
                            type="number"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="flex items-center gap-2 pt-6">
                          <Switch
                            checked={formData.is_active}
                            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingBanner ? 'Update Banner' : 'Create Banner'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : banners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 animate-pulse">
                  <Image className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Banners Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Create your first promotional banner to display on the homepage
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {banners.map((banner) => (
                  <div
                    key={banner.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{
                          backgroundColor: banner.background_type === 'color' ? banner.background_color || '#0ea5e9' : undefined,
                          backgroundImage: banner.background_type === 'image' && banner.background_image_path ? `url(${banner.background_image_path})` : undefined,
                          backgroundSize: 'cover',
                        }}
                      >
                        {banner.icon_or_image_path && (
                          <img src={banner.icon_or_image_path} alt="" className="w-6 h-6 object-contain" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium">{banner.title_en}</h4>
                        {banner.title_fa && (
                          <p className="text-sm text-muted-foreground" dir="rtl">{banner.title_fa}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Priority: {banner.priority}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={(checked) => handleToggleActive(banner.id, checked)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminHomeBanners;
