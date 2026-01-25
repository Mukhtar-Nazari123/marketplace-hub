import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import ImageUpload from '@/components/admin/ImageUpload';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit2, Trash2, FolderTree, Image, ChevronDown, ChevronRight, GripVertical } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  name_fa: string | null;
  slug: string;
  description: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface Subcategory {
  id: string;
  name: string;
  name_fa: string | null;
  slug: string;
  description: string | null;
  image_url: string | null;
  category_id: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const AdminCategories = () => {
  const { t, isRTL } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | Subcategory | null>(null);
  const [isSubcategory, setIsSubcategory] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_fa: '',
    slug: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0,
    category_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsResult, subsResult] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .is('parent_id', null)
          .order('sort_order', { ascending: true }),
        supabase
          .from('subcategories')
          .select('*')
          .order('sort_order', { ascending: true })
      ]);

      if (catsResult.error) throw catsResult.error;
      if (subsResult.error) throw subsResult.error;

      setCategories(catsResult.data || []);
      setSubcategories(subsResult.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error(isRTL ? 'خطا در دریافت دسته‌بندی‌ها' : 'Error fetching categories');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const openCreateDialog = (isSubcat: boolean = false, parentCategoryId: string = '') => {
    setEditingItem(null);
    setIsSubcategory(isSubcat);
    setFormData({
      name: '',
      name_fa: '',
      slug: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: isSubcat 
        ? subcategories.filter(s => s.category_id === parentCategoryId).length 
        : categories.length,
      category_id: parentCategoryId,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: Category | Subcategory, isSubcat: boolean) => {
    setEditingItem(item);
    setIsSubcategory(isSubcat);
    setFormData({
      name: item.name,
      name_fa: item.name_fa || '',
      slug: item.slug,
      description: item.description || '',
      image_url: item.image_url || '',
      is_active: item.is_active,
      sort_order: item.sort_order,
      category_id: isSubcat ? (item as Subcategory).category_id : '',
    });
    setIsDialogOpen(true);
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingItem ? prev.slug : generateSlug(name),
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error(isRTL ? 'نام انگلیسی الزامی است' : 'English name is required');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error(isRTL ? 'اسلاگ الزامی است' : 'Slug is required');
      return;
    }

    if (isSubcategory && !formData.category_id) {
      toast.error(isRTL ? 'انتخاب دسته‌بندی والد الزامی است' : 'Parent category is required');
      return;
    }

    setSaving(true);
    try {
      if (isSubcategory) {
        // Save subcategory
        const data = {
          name: formData.name,
          name_fa: formData.name_fa || null,
          slug: formData.slug,
          description: formData.description || null,
          image_url: formData.image_url || null,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
          category_id: formData.category_id,
        };

        if (editingItem) {
          const { error } = await supabase
            .from('subcategories')
            .update(data)
            .eq('id', editingItem.id);
          if (error) throw error;
          toast.success(isRTL ? 'زیردسته‌بندی به‌روزرسانی شد' : 'Subcategory updated');
        } else {
          const { error } = await supabase
            .from('subcategories')
            .insert([data]);
          if (error) throw error;
          toast.success(isRTL ? 'زیردسته‌بندی ایجاد شد' : 'Subcategory created');
        }
      } else {
        // Save category
        const data = {
          name: formData.name,
          name_fa: formData.name_fa || null,
          slug: formData.slug,
          description: formData.description || null,
          is_active: formData.is_active,
          sort_order: formData.sort_order,
          parent_id: null,
        };

        if (editingItem) {
          const { error } = await supabase
            .from('categories')
            .update(data)
            .eq('id', editingItem.id);
          if (error) throw error;
          toast.success(isRTL ? 'دسته‌بندی به‌روزرسانی شد' : 'Category updated');
        } else {
          const { error } = await supabase
            .from('categories')
            .insert([data]);
          if (error) throw error;
          toast.success(isRTL ? 'دسته‌بندی ایجاد شد' : 'Category created');
        }
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving:', error);
      if (error.code === '23505') {
        toast.error(isRTL ? 'این اسلاگ قبلاً استفاده شده است' : 'This slug is already in use');
      } else {
        toast.error(isRTL ? 'خطا در ذخیره‌سازی' : 'Error saving');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Category | Subcategory, isSubcat: boolean) => {
    if (!isSubcat) {
      // Check if category has subcategories
      const childCount = subcategories.filter(s => s.category_id === item.id).length;
      if (childCount > 0) {
        toast.error(
          isRTL 
            ? `این دسته‌بندی ${childCount} زیردسته دارد. ابتدا آنها را حذف کنید` 
            : `This category has ${childCount} subcategories. Delete them first`
        );
        return;
      }
    }

    try {
      if (isSubcat) {
        const { error } = await supabase
          .from('subcategories')
          .delete()
          .eq('id', item.id);
        if (error) throw error;
        toast.success(isRTL ? 'زیردسته‌بندی حذف شد' : 'Subcategory deleted');
      } else {
        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', item.id);
        if (error) throw error;
        toast.success(isRTL ? 'دسته‌بندی حذف شد' : 'Category deleted');
      }
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast.error(isRTL ? 'خطا در حذف' : 'Error deleting');
    }
  };

  const toggleActive = async (item: Category | Subcategory, isSubcat: boolean) => {
    try {
      if (isSubcat) {
        await supabase
          .from('subcategories')
          .update({ is_active: !item.is_active })
          .eq('id', item.id);
      } else {
        await supabase
          .from('categories')
          .update({ is_active: !item.is_active })
          .eq('id', item.id);
      }
      fetchData();
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const getSubcategoriesForCategory = (categoryId: string) => {
    return subcategories.filter(s => s.category_id === categoryId);
  };

  if (loading) {
    return (
      <AdminLayout 
        title={isRTL ? 'مدیریت دسته‌بندی‌ها' : 'Category Management'} 
        description={isRTL ? 'مدیریت دسته‌بندی‌ها و زیردسته‌بندی‌ها' : 'Manage categories and subcategories'}
      >
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout 
      title={isRTL ? 'مدیریت دسته‌بندی‌ها' : 'Category Management'} 
      description={isRTL ? 'مدیریت دسته‌بندی‌ها و زیردسته‌بندی‌ها' : 'Manage categories and subcategories'}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {categories.length} {isRTL ? 'دسته‌بندی' : 'Categories'}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {subcategories.length} {isRTL ? 'زیردسته‌بندی' : 'Subcategories'}
            </Badge>
          </div>
          <Button onClick={() => openCreateDialog(false)} className="gap-2">
            <Plus className="h-4 w-4" />
            {isRTL ? 'دسته‌بندی جدید' : 'New Category'}
          </Button>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              {isRTL ? 'دسته‌بندی‌ها' : 'Categories'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {isRTL ? 'هنوز دسته‌بندی‌ای وجود ندارد' : 'No categories yet'}
              </div>
            ) : (
              <div className="space-y-2">
                {categories.map((category) => {
                  const subs = getSubcategoriesForCategory(category.id);
                  const isExpanded = expandedCategories.has(category.id);

                  return (
                    <div key={category.id} className="border rounded-lg overflow-hidden">
                      {/* Category Row */}
                      <div className="flex items-center gap-4 p-4 bg-muted/30">
                        <button
                          onClick={() => toggleExpand(category.id)}
                          className="p-1 hover:bg-muted rounded"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{category.name}</span>
                            {category.name_fa && (
                              <span className="text-muted-foreground">({category.name_fa})</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            /{category.slug} • {subs.length} {isRTL ? 'زیردسته' : 'subcategories'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={category.is_active ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => toggleActive(category, false)}
                          >
                            {category.is_active 
                              ? (isRTL ? 'فعال' : 'Active') 
                              : (isRTL ? 'غیرفعال' : 'Inactive')}
                          </Badge>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openCreateDialog(true, category.id)}
                            title={isRTL ? 'افزودن زیردسته' : 'Add subcategory'}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(category, false)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {isRTL ? 'حذف دسته‌بندی' : 'Delete Category'}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {isRTL 
                                    ? 'آیا مطمئن هستید؟ این عمل قابل بازگشت نیست.'
                                    : 'Are you sure? This action cannot be undone.'}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {isRTL ? 'انصراف' : 'Cancel'}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category, false)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  {isRTL ? 'حذف' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>

                      {/* Subcategories */}
                      {isExpanded && subs.length > 0 && (
                        <div className="border-t">
                          {subs.map((sub) => (
                            <div
                              key={sub.id}
                              className={`flex items-center gap-4 p-4 ${isRTL ? 'pr-12' : 'pl-12'} border-b last:border-b-0 hover:bg-muted/20`}
                            >
                              {sub.image_url ? (
                                <img
                                  src={sub.image_url}
                                  alt={sub.name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                                  <Image className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{sub.name}</span>
                                  {sub.name_fa && (
                                    <span className="text-muted-foreground">({sub.name_fa})</span>
                                  )}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  /{sub.slug}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={sub.is_active ? 'default' : 'secondary'}
                                  className="cursor-pointer"
                                  onClick={() => toggleActive(sub, true)}
                                >
                                  {sub.is_active 
                                    ? (isRTL ? 'فعال' : 'Active') 
                                    : (isRTL ? 'غیرفعال' : 'Inactive')}
                                </Badge>
                                
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditDialog(sub, true)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        {isRTL ? 'حذف زیردسته‌بندی' : 'Delete Subcategory'}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {isRTL 
                                          ? 'آیا مطمئن هستید؟ این عمل قابل بازگشت نیست.'
                                          : 'Are you sure? This action cannot be undone.'}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        {isRTL ? 'انصراف' : 'Cancel'}
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(sub, true)}
                                        className="bg-destructive text-destructive-foreground"
                                      >
                                        {isRTL ? 'حذف' : 'Delete'}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {isExpanded && subs.length === 0 && (
                        <div className={`p-4 ${isRTL ? 'pr-12' : 'pl-12'} text-sm text-muted-foreground border-t`}>
                          {isRTL ? 'زیردسته‌ای وجود ندارد' : 'No subcategories'}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem 
                  ? (isSubcategory 
                      ? (isRTL ? 'ویرایش زیردسته‌بندی' : 'Edit Subcategory')
                      : (isRTL ? 'ویرایش دسته‌بندی' : 'Edit Category'))
                  : (isSubcategory 
                      ? (isRTL ? 'زیردسته‌بندی جدید' : 'New Subcategory')
                      : (isRTL ? 'دسته‌بندی جدید' : 'New Category'))}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isSubcategory
                  ? (isRTL ? 'اطلاعات زیردسته‌بندی را وارد کنید' : 'Enter subcategory details')
                  : (isRTL ? 'اطلاعات دسته‌بندی را وارد کنید' : 'Enter category details')}
              </p>
            </DialogHeader>

            <div className="space-y-4">
              {/* Parent Category Select (for subcategories) */}
              {isSubcategory && (
                <div className="space-y-2">
                  <Label>{isRTL ? 'دسته‌بندی والد' : 'Parent Category'} *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isRTL ? 'انتخاب دسته‌بندی' : 'Select category'} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} {cat.name_fa && `(${cat.name_fa})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* English Name */}
              <div className="space-y-2">
                <Label>{isRTL ? 'نام انگلیسی' : 'English Name'} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={isRTL ? 'مثال: Electronics' : 'e.g. Electronics'}
                  dir="ltr"
                />
              </div>

              {/* Persian Name */}
              <div className="space-y-2">
                <Label>{isRTL ? 'نام فارسی' : 'Persian Name'}</Label>
                <Input
                  value={formData.name_fa}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_fa: e.target.value }))}
                  placeholder={isRTL ? 'مثال: الکترونیک' : 'e.g. الکترونیک'}
                  dir="rtl"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label>{isRTL ? 'اسلاگ (URL)' : 'Slug (URL)'} *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                  placeholder="electronics"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'به طور خودکار از نام انگلیسی تولید می‌شود' : 'Auto-generated from English name'}
                </p>
              </div>

              {/* Image Upload (only for subcategories) */}
              {isSubcategory && (
                <ImageUpload
                  label={isRTL ? 'تصویر زیردسته‌بندی' : 'Subcategory Image'}
                  value={formData.image_url}
                  onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                  folder="categories"
                  bucket="site-assets"
                />
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label>{isRTL ? 'توضیحات' : 'Description'}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={isRTL ? 'توضیحات اختیاری...' : 'Optional description...'}
                  rows={3}
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label>{isRTL ? 'ترتیب نمایش' : 'Sort Order'}</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  min={0}
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <Label>{isRTL ? 'فعال' : 'Active'}</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {isRTL ? 'انصراف' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving 
                  ? (isRTL ? 'در حال ذخیره...' : 'Saving...') 
                  : (isRTL ? 'ذخیره' : 'Save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
