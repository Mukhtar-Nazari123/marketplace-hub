import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage, Language } from '@/lib/i18n';
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
  name_ps?: string | null;
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
  name_ps?: string | null;
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

const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const AdminCategories = () => {
  const { t, isRTL, language } = useLanguage();
  const lang = language as Language;
  
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
    name_ps: '',
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
      toast.error(getLabel(lang, 'Error fetching categories', 'خطا در دریافت دسته‌بندی‌ها', 'د کټګوریو راوړلو کې تېروتنه'));
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
      name_ps: '',
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
      name_ps: (item as any).name_ps || '',
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
      toast.error(getLabel(lang, 'English name is required', 'نام انگلیسی الزامی است', 'انګلیسي نوم اړین دی'));
      return;
    }

    if (!formData.slug.trim()) {
      toast.error(getLabel(lang, 'Slug is required', 'اسلاگ الزامی است', 'سلګ اړین دی'));
      return;
    }

    if (isSubcategory && !formData.category_id) {
      toast.error(getLabel(lang, 'Parent category is required', 'انتخاب دسته‌بندی والد الزامی است', 'مور کټګوري اړینه ده'));
      return;
    }

    setSaving(true);
    try {
      if (isSubcategory) {
        // Save subcategory
        const data = {
          name: formData.name,
          name_fa: formData.name_fa || null,
          name_ps: formData.name_ps || null,
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
          toast.success(getLabel(lang, 'Subcategory updated', 'زیردسته‌بندی به‌روزرسانی شد', 'فرعي کټګوري تازه شوه'));
        } else {
          const { error } = await supabase
            .from('subcategories')
            .insert([data]);
          if (error) throw error;
          toast.success(getLabel(lang, 'Subcategory created', 'زیردسته‌بندی ایجاد شد', 'فرعي کټګوري جوړه شوه'));
        }
      } else {
        // Save category
        const data = {
          name: formData.name,
          name_fa: formData.name_fa || null,
          name_ps: formData.name_ps || null,
          slug: formData.slug,
          description: formData.description || null,
          image_url: formData.image_url || null,
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
          toast.success(getLabel(lang, 'Category updated', 'دسته‌بندی به‌روزرسانی شد', 'کټګوري تازه شوه'));
        } else {
          const { error } = await supabase
            .from('categories')
            .insert([data]);
          if (error) throw error;
          toast.success(getLabel(lang, 'Category created', 'دسته‌بندی ایجاد شد', 'کټګوري جوړه شوه'));
        }
      }

      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving:', error);
      if (error.code === '23505') {
        toast.error(getLabel(lang, 'This slug is already in use', 'این اسلاگ قبلاً استفاده شده است', 'دا سلګ مخکې کارول شوی'));
      } else {
        toast.error(getLabel(lang, 'Error saving', 'خطا در ذخیره‌سازی', 'د خوندي کولو تېروتنه'));
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Category | Subcategory, isSubcat: boolean) => {
    try {
      if (isSubcat) {
        // Check if subcategory has products
        const { count: productCount, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('subcategory_id', item.id);

        if (countError) throw countError;

        if (productCount && productCount > 0) {
          toast.error(
            getLabel(
              lang,
              `This subcategory has ${productCount} products. Move or delete them first`,
              `این زیردسته‌بندی ${productCount} محصول دارد. ابتدا آنها را حذف یا منتقل کنید`,
              `دا فرعي کټګوري ${productCount} محصولات لري. لومړی یې لېږدئ یا ړنګ کړئ`
            )
          );
          return;
        }

        const { error } = await supabase
          .from('subcategories')
          .delete()
          .eq('id', item.id);
        if (error) throw error;
        toast.success(getLabel(lang, 'Subcategory deleted', 'زیردسته‌بندی حذف شد', 'فرعي کټګوري ړنګه شوه'));
      } else {
        // Check if category has subcategories
        const childCount = subcategories.filter(s => s.category_id === item.id).length;
        if (childCount > 0) {
          toast.error(
            getLabel(
              lang,
              `This category has ${childCount} subcategories. Delete them first`,
              `این دسته‌بندی ${childCount} زیردسته دارد. ابتدا آنها را حذف کنید`,
              `دا کټګوري ${childCount} فرعي کټګوریانې لري. لومړی یې ړنګ کړئ`
            )
          );
          return;
        }

        // Check if category has products
        const { count: productCount, error: countError } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', item.id);

        if (countError) throw countError;

        if (productCount && productCount > 0) {
          toast.error(
            getLabel(
              lang,
              `This category has ${productCount} products. Move or delete them first`,
              `این دسته‌بندی ${productCount} محصول دارد. ابتدا آنها را حذف یا منتقل کنید`,
              `دا کټګوري ${productCount} محصولات لري. لومړی یې لېږدئ یا ړنګ کړئ`
            )
          );
          return;
        }

        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', item.id);
        if (error) throw error;
        toast.success(getLabel(lang, 'Category deleted', 'دسته‌بندی حذف شد', 'کټګوري ړنګه شوه'));
      }
      fetchData();
    } catch (error: any) {
      console.error('Error deleting:', error);
      if (error.code === '23503') {
        toast.error(
          getLabel(
            lang,
            'This item is used by products and cannot be deleted',
            'این آیتم توسط محصولات استفاده می‌شود و قابل حذف نیست',
            'دا توکی د محصولاتو لخوا کارول کېږي او نشي ړنګېدلی'
          )
        );
      } else {
        toast.error(getLabel(lang, 'Error deleting', 'خطا در حذف', 'د ړنګولو تېروتنه'));
      }
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
        title={getLabel(lang, 'Category Management', 'مدیریت دسته‌بندی‌ها', 'د کټګوریو مدیریت')} 
        description={getLabel(lang, 'Manage categories and subcategories', 'مدیریت دسته‌بندی‌ها و زیردسته‌بندی‌ها', 'کټګوریانې او فرعي کټګوریانې اداره کړئ')}
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
      title={getLabel(lang, 'Category Management', 'مدیریت دسته‌بندی‌ها', 'د کټګوریو مدیریت')} 
      description={getLabel(lang, 'Manage categories and subcategories', 'مدیریت دسته‌بندی‌ها و زیردسته‌بندی‌ها', 'کټګوریانې او فرعي کټګوریانې اداره کړئ')}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {categories.length} {getLabel(lang, 'Categories', 'دسته‌بندی', 'کټګوریانې')}
            </Badge>
            <Badge variant="outline" className="text-sm">
              {subcategories.length} {getLabel(lang, 'Subcategories', 'زیردسته‌بندی', 'فرعي کټګوریانې')}
            </Badge>
          </div>
          <Button onClick={() => openCreateDialog(false)} className="gap-2">
            <Plus className="h-4 w-4" />
            {getLabel(lang, 'New Category', 'دسته‌بندی جدید', 'نوې کټګوري')}
          </Button>
        </div>

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              {getLabel(lang, 'Categories', 'دسته‌بندی‌ها', 'کټګوریانې')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {getLabel(lang, 'No categories yet', 'هنوز دسته‌بندی‌ای وجود ندارد', 'تر اوسه هیڅ کټګوري نشته')}
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
                            /{category.slug} • {subs.length} {getLabel(lang, 'subcategories', 'زیردسته', 'فرعي کټګوریانې')}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={category.is_active ? 'default' : 'secondary'}
                            className="cursor-pointer"
                            onClick={() => toggleActive(category, false)}
                          >
                            {category.is_active 
                              ? getLabel(lang, 'Active', 'فعال', 'فعال') 
                              : getLabel(lang, 'Inactive', 'غیرفعال', 'غیرفعال')}
                          </Badge>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openCreateDialog(true, category.id)}
                            title={getLabel(lang, 'Add subcategory', 'افزودن زیردسته', 'فرعي کټګوري اضافه کړئ')}
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
                                  {getLabel(lang, 'Delete Category', 'حذف دسته‌بندی', 'کټګوري ړنګول')}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {getLabel(
                                    lang,
                                    'Are you sure? This action cannot be undone.',
                                    'آیا مطمئن هستید؟ این عمل قابل بازگشت نیست.',
                                    'ایا تاسو ډاډه یاست؟ دا کړنه بیرته نشي کېدلی.'
                                  )}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {getLabel(lang, 'Cancel', 'انصراف', 'لغوه کړئ')}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(category, false)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  {getLabel(lang, 'Delete', 'حذف', 'ړنګول')}
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
                                    ? getLabel(lang, 'Active', 'فعال', 'فعال') 
                                    : getLabel(lang, 'Inactive', 'غیرفعال', 'غیرفعال')}
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
                                        {getLabel(lang, 'Delete Subcategory', 'حذف زیردسته‌بندی', 'فرعي کټګوري ړنګول')}
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        {getLabel(
                                          lang,
                                          'Are you sure? This action cannot be undone.',
                                          'آیا مطمئن هستید؟ این عمل قابل بازگشت نیست.',
                                          'ایا تاسو ډاډه یاست؟ دا کړنه بیرته نشي کېدلی.'
                                        )}
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        {getLabel(lang, 'Cancel', 'انصراف', 'لغوه کړئ')}
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDelete(sub, true)}
                                        className="bg-destructive text-destructive-foreground"
                                      >
                                        {getLabel(lang, 'Delete', 'حذف', 'ړنګول')}
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
                          {getLabel(lang, 'No subcategories', 'زیردسته‌ای وجود ندارد', 'هیڅ فرعي کټګوري نشته')}
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
                      ? getLabel(lang, 'Edit Subcategory', 'ویرایش زیردسته‌بندی', 'فرعي کټګوري سمول')
                      : getLabel(lang, 'Edit Category', 'ویرایش دسته‌بندی', 'کټګوري سمول'))
                  : (isSubcategory 
                      ? getLabel(lang, 'New Subcategory', 'زیردسته‌بندی جدید', 'نوې فرعي کټګوري')
                      : getLabel(lang, 'New Category', 'دسته‌بندی جدید', 'نوې کټګوري'))}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isSubcategory
                  ? getLabel(lang, 'Enter subcategory details', 'اطلاعات زیردسته‌بندی را وارد کنید', 'د فرعي کټګورۍ توضیحات دننه کړئ')
                  : getLabel(lang, 'Enter category details', 'اطلاعات دسته‌بندی را وارد کنید', 'د کټګورۍ توضیحات دننه کړئ')}
              </p>
            </DialogHeader>

            <div className="space-y-4">
              {/* Parent Category Select (for subcategories) */}
              {isSubcategory && (
                <div className="space-y-2">
                  <Label>{getLabel(lang, 'Parent Category', 'دسته‌بندی والد', 'مور کټګوري')} *</Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={getLabel(lang, 'Select category', 'انتخاب دسته‌بندی', 'کټګوري وټاکئ')} />
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
                <Label>{getLabel(lang, 'English Name', 'نام انگلیسی', 'انګلیسي نوم')} *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={getLabel(lang, 'e.g. Electronics', 'مثال: Electronics', 'لکه: Electronics')}
                  dir="ltr"
                />
              </div>

              {/* Persian Name */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Persian Name', 'نام فارسی', 'فارسي نوم')}</Label>
                <Input
                  value={formData.name_fa}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_fa: e.target.value }))}
                  placeholder={getLabel(lang, 'e.g. الکترونیک', 'مثال: الکترونیک', 'لکه: الکترونیک')}
                  dir="rtl"
                />
              </div>

              {/* Pashto Name */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Pashto Name', 'نام پشتو', 'پښتو نوم')}</Label>
                <Input
                  value={formData.name_ps}
                  onChange={(e) => setFormData(prev => ({ ...prev, name_ps: e.target.value }))}
                  placeholder={getLabel(lang, 'e.g. بریښنایي', 'مثال: بریښنایي', 'لکه: بریښنایي')}
                  dir="rtl"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Slug (URL)', 'اسلاگ (URL)', 'سلګ (URL)')} *</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                  placeholder="electronics"
                  dir="ltr"
                />
                <p className="text-xs text-muted-foreground">
                  {getLabel(lang, 'Auto-generated from English name', 'به طور خودکار از نام انگلیسی تولید می‌شود', 'له انګلیسي نوم څخه په اوتومات ډول جوړیږي')}
                </p>
              </div>

              {/* Image Upload */}
              <ImageUpload
                label={isSubcategory 
                  ? getLabel(lang, 'Subcategory Image', 'تصویر زیردسته‌بندی', 'د فرعي کټګورۍ انځور')
                  : getLabel(lang, 'Category Image', 'تصویر دسته‌بندی', 'د کټګورۍ انځور')}
                value={formData.image_url}
                onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                folder="categories"
                bucket="site-assets"
              />

              {/* Description */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Description', 'توضیحات', 'تفصیل')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={getLabel(lang, 'Optional description...', 'توضیحات اختیاری...', 'اختیاري تفصیل...')}
                  rows={3}
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Sort Order', 'ترتیب نمایش', 'د ترتیب شمېره')}</Label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                  min={0}
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between">
                <Label>{getLabel(lang, 'Active', 'فعال', 'فعال')}</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {getLabel(lang, 'Cancel', 'انصراف', 'لغوه کړئ')}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving 
                  ? getLabel(lang, 'Saving...', 'در حال ذخیره...', 'خوندي کول...') 
                  : getLabel(lang, 'Save', 'ذخیره', 'خوندي کړئ')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminCategories;
