import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';

interface BlogCategory {
  id: string;
  name: string;
  name_fa: string | null;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

interface Blog {
  id: string;
  title: string;
  title_fa: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_fa: string | null;
  content: string | null;
  content_fa: string | null;
  cover_image_url: string | null;
  author_name: string;
  author_name_fa: string | null;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  views_count: number;
  meta_title: string | null;
  meta_title_fa: string | null;
  meta_description: string | null;
  meta_description_fa: string | null;
  tags: string[];
  tags_fa: string[];
  published_at: string | null;
  created_at: string;
}

const AdminBlogs = () => {
  const { t, isRTL } = useLanguage();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [deletingBlog, setDeletingBlog] = useState<Blog | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    title_fa: '',
    slug: '',
    excerpt: '',
    excerpt_fa: '',
    content: '',
    content_fa: '',
    cover_image_url: '',
    author_name: 'Admin',
    author_name_fa: '',
    category_id: '',
    is_published: false,
    is_featured: false,
    meta_title: '',
    meta_title_fa: '',
    meta_description: '',
    meta_description_fa: '',
    tags: '',
    tags_fa: '',
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    name_fa: '',
    slug: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [blogsRes, categoriesRes] = await Promise.all([
        supabase.from('blogs').select('*').order('created_at', { ascending: false }),
        supabase.from('blog_categories').select('*').order('sort_order'),
      ]);

      if (blogsRes.error) throw blogsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;

      setBlogs(blogsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error(isRTL ? 'خطا در بارگذاری داده‌ها' : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredBlogs = useMemo(() => {
    if (!searchQuery.trim()) return blogs;
    const query = searchQuery.toLowerCase();
    return blogs.filter(
      b =>
        b.title.toLowerCase().includes(query) ||
        b.title_fa?.toLowerCase().includes(query) ||
        b.slug.toLowerCase().includes(query)
    );
  }, [blogs, searchQuery]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const openCreateDialog = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      title_fa: '',
      slug: '',
      excerpt: '',
      excerpt_fa: '',
      content: '',
      content_fa: '',
      cover_image_url: '',
      author_name: 'Admin',
      author_name_fa: '',
      category_id: '',
      is_published: false,
      is_featured: false,
      meta_title: '',
      meta_title_fa: '',
      meta_description: '',
      meta_description_fa: '',
      tags: '',
      tags_fa: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      title_fa: blog.title_fa || '',
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      excerpt_fa: blog.excerpt_fa || '',
      content: blog.content || '',
      content_fa: blog.content_fa || '',
      cover_image_url: blog.cover_image_url || '',
      author_name: blog.author_name,
      author_name_fa: blog.author_name_fa || '',
      category_id: blog.category_id || '',
      is_published: blog.is_published,
      is_featured: blog.is_featured,
      meta_title: blog.meta_title || '',
      meta_title_fa: blog.meta_title_fa || '',
      meta_description: blog.meta_description || '',
      meta_description_fa: blog.meta_description_fa || '',
      tags: blog.tags?.join(', ') || '',
      tags_fa: blog.tags_fa?.join(', ') || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error(isRTL ? 'عنوان و شناسه الزامی است' : 'Title and slug are required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        title_fa: formData.title_fa || null,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        excerpt_fa: formData.excerpt_fa || null,
        content: formData.content || null,
        content_fa: formData.content_fa || null,
        cover_image_url: formData.cover_image_url || null,
        author_name: formData.author_name,
        author_name_fa: formData.author_name_fa || null,
        category_id: formData.category_id || null,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        meta_title: formData.meta_title || null,
        meta_title_fa: formData.meta_title_fa || null,
        meta_description: formData.meta_description || null,
        meta_description_fa: formData.meta_description_fa || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        tags_fa: formData.tags_fa ? formData.tags_fa.split(',').map(t => t.trim()).filter(Boolean) : [],
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (editingBlog) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', editingBlog.id);
        if (error) throw error;
        toast.success(isRTL ? 'مقاله به‌روزرسانی شد' : 'Blog updated successfully');
      } else {
        const { error } = await supabase.from('blogs').insert([payload]);
        if (error) throw error;
        toast.success(isRTL ? 'مقاله ایجاد شد' : 'Blog created successfully');
      }

      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving blog:', error);
      toast.error(error.message || (isRTL ? 'خطا در ذخیره' : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBlog) return;

    try {
      const { error } = await supabase.from('blogs').delete().eq('id', deletingBlog.id);
      if (error) throw error;
      toast.success(isRTL ? 'مقاله حذف شد' : 'Blog deleted successfully');
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error(isRTL ? 'خطا در حذف' : 'Failed to delete');
    }
  };

  const togglePublish = async (blog: Blog) => {
    try {
      const { error } = await supabase
        .from('blogs')
        .update({ 
          is_published: !blog.is_published,
          published_at: !blog.is_published ? new Date().toISOString() : null,
        })
        .eq('id', blog.id);
      
      if (error) throw error;
      toast.success(isRTL 
        ? (blog.is_published ? 'مقاله پنهان شد' : 'مقاله منتشر شد')
        : (blog.is_published ? 'Blog unpublished' : 'Blog published')
      );
      fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) {
      toast.error(isRTL ? 'نام و شناسه الزامی است' : 'Name and slug are required');
      return;
    }

    try {
      const { error } = await supabase.from('blog_categories').insert([{
        name: categoryForm.name,
        name_fa: categoryForm.name_fa || null,
        slug: categoryForm.slug,
      }]);
      
      if (error) throw error;
      toast.success(isRTL ? 'دسته‌بندی ایجاد شد' : 'Category created');
      setCategoryDialogOpen(false);
      setCategoryForm({ name: '', name_fa: '', slug: '' });
      fetchData();
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.message || (isRTL ? 'خطا' : 'Failed'));
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-';
    const cat = categories.find(c => c.id === categoryId);
    return cat ? (isRTL && cat.name_fa ? cat.name_fa : cat.name) : '-';
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat(isRTL ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  return (
    <AdminLayout title={isRTL ? 'مدیریت وبلاگ' : 'Blog Management'}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isRTL ? 'مدیریت وبلاگ' : 'Blog Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'مدیریت مقالات و دسته‌بندی‌ها' : 'Manage articles and categories'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
              <Plus size={16} className="me-2" />
              {isRTL ? 'دسته‌بندی جدید' : 'New Category'}
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus size={16} className="me-2" />
              {isRTL ? 'مقاله جدید' : 'New Article'}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} size={18} />
          <Input
            placeholder={isRTL ? 'جستجو...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? 'pr-10' : 'pl-10'}
          />
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isRTL ? 'عنوان' : 'Title'}</TableHead>
                <TableHead>{isRTL ? 'دسته‌بندی' : 'Category'}</TableHead>
                <TableHead>{isRTL ? 'وضعیت' : 'Status'}</TableHead>
                <TableHead>{isRTL ? 'بازدید' : 'Views'}</TableHead>
                <TableHead>{isRTL ? 'تاریخ' : 'Date'}</TableHead>
                <TableHead className="text-right">{isRTL ? 'عملیات' : 'Actions'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  </TableRow>
                ))
              ) : filteredBlogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    {isRTL ? 'مقاله‌ای یافت نشد' : 'No articles found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBlogs.map((blog) => (
                  <TableRow key={blog.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {blog.cover_image_url && (
                          <img
                            src={blog.cover_image_url}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{isRTL && blog.title_fa ? blog.title_fa : blog.title}</p>
                          <p className="text-xs text-muted-foreground">/{blog.slug}</p>
                        </div>
                        {blog.is_featured && (
                          <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getCategoryName(blog.category_id)}</TableCell>
                    <TableCell>
                      <Badge variant={blog.is_published ? 'default' : 'secondary'}>
                        {blog.is_published 
                          ? (isRTL ? 'منتشر شده' : 'Published')
                          : (isRTL ? 'پیش‌نویس' : 'Draft')
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {isRTL ? blog.views_count.toLocaleString('fa-IR') : blog.views_count}
                    </TableCell>
                    <TableCell>{formatDate(blog.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublish(blog)}
                          title={blog.is_published ? 'Unpublish' : 'Publish'}
                        >
                          {blog.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(blog)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setDeletingBlog(blog);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Blog Edit/Create Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBlog 
                  ? (isRTL ? 'ویرایش مقاله' : 'Edit Article')
                  : (isRTL ? 'مقاله جدید' : 'New Article')
                }
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Title EN */}
              <div className="space-y-2">
                <Label>{isRTL ? 'عنوان (انگلیسی)' : 'Title (English)'}</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => {
                    setFormData({ 
                      ...formData, 
                      title: e.target.value,
                      slug: formData.slug || generateSlug(e.target.value),
                    });
                  }}
                />
              </div>

              {/* Title FA */}
              <div className="space-y-2">
                <Label>{isRTL ? 'عنوان (فارسی)' : 'Title (Persian)'}</Label>
                <Input
                  value={formData.title_fa}
                  onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })}
                  dir="rtl"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>{isRTL ? 'دسته‌بندی' : 'Category'}</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={isRTL ? 'انتخاب کنید' : 'Select'} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {isRTL && cat.name_fa ? cat.name_fa : cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cover Image */}
              <div className="space-y-2 md:col-span-2">
                <Label>{isRTL ? 'تصویر کاور' : 'Cover Image URL'}</Label>
                <Input
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {/* Excerpt EN */}
              <div className="space-y-2">
                <Label>{isRTL ? 'خلاصه (انگلیسی)' : 'Excerpt (English)'}</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Excerpt FA */}
              <div className="space-y-2">
                <Label>{isRTL ? 'خلاصه (فارسی)' : 'Excerpt (Persian)'}</Label>
                <Textarea
                  value={formData.excerpt_fa}
                  onChange={(e) => setFormData({ ...formData, excerpt_fa: e.target.value })}
                  rows={3}
                  dir="rtl"
                />
              </div>

              {/* Content EN */}
              <div className="space-y-2">
                <Label>{isRTL ? 'محتوا (انگلیسی)' : 'Content (English)'}</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  placeholder="HTML content..."
                />
              </div>

              {/* Content FA */}
              <div className="space-y-2">
                <Label>{isRTL ? 'محتوا (فارسی)' : 'Content (Persian)'}</Label>
                <Textarea
                  value={formData.content_fa}
                  onChange={(e) => setFormData({ ...formData, content_fa: e.target.value })}
                  rows={8}
                  dir="rtl"
                  placeholder="HTML content..."
                />
              </div>

              {/* Author */}
              <div className="space-y-2">
                <Label>{isRTL ? 'نویسنده (انگلیسی)' : 'Author (English)'}</Label>
                <Input
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'نویسنده (فارسی)' : 'Author (Persian)'}</Label>
                <Input
                  value={formData.author_name_fa}
                  onChange={(e) => setFormData({ ...formData, author_name_fa: e.target.value })}
                  dir="rtl"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>{isRTL ? 'برچسب‌ها (انگلیسی)' : 'Tags (English)'}</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div className="space-y-2">
                <Label>{isRTL ? 'برچسب‌ها (فارسی)' : 'Tags (Persian)'}</Label>
                <Input
                  value={formData.tags_fa}
                  onChange={(e) => setFormData({ ...formData, tags_fa: e.target.value })}
                  dir="rtl"
                  placeholder="برچسب۱، برچسب۲"
                />
              </div>

              {/* SEO */}
              <div className="space-y-2">
                <Label>Meta Title (EN)</Label>
                <Input
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Title (FA)</Label>
                <Input
                  value={formData.meta_title_fa}
                  onChange={(e) => setFormData({ ...formData, meta_title_fa: e.target.value })}
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Description (EN)</Label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>Meta Description (FA)</Label>
                <Textarea
                  value={formData.meta_description_fa}
                  onChange={(e) => setFormData({ ...formData, meta_description_fa: e.target.value })}
                  rows={2}
                  dir="rtl"
                />
              </div>

              {/* Toggles */}
              <div className="md:col-span-2 flex flex-wrap gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(val) => setFormData({ ...formData, is_published: val })}
                  />
                  <Label>{isRTL ? 'منتشر شود' : 'Published'}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(val) => setFormData({ ...formData, is_featured: val })}
                  />
                  <Label>{isRTL ? 'ویژه' : 'Featured'}</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {isRTL ? 'انصراف' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving 
                  ? (isRTL ? 'در حال ذخیره...' : 'Saving...')
                  : (isRTL ? 'ذخیره' : 'Save')
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'دسته‌بندی جدید' : 'New Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{isRTL ? 'نام (انگلیسی)' : 'Name (English)'}</Label>
                <Input
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ 
                    ...categoryForm, 
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>{isRTL ? 'نام (فارسی)' : 'Name (Persian)'}</Label>
                <Input
                  value={categoryForm.name_fa}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_fa: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                {isRTL ? 'انصراف' : 'Cancel'}
              </Button>
              <Button onClick={handleAddCategory}>
                {isRTL ? 'ایجاد' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isRTL ? 'حذف مقاله' : 'Delete Article'}</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">
              {isRTL 
                ? `آیا از حذف "${deletingBlog?.title}" مطمئن هستید؟`
                : `Are you sure you want to delete "${deletingBlog?.title}"?`
              }
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {isRTL ? 'انصراف' : 'Cancel'}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {isRTL ? 'حذف' : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminBlogs;
