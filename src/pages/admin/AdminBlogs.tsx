import { useState, useEffect, useMemo } from 'react';
import { useLanguage, Language } from '@/lib/i18n';
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
import ImageUpload from '@/components/admin/ImageUpload';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Star } from 'lucide-react';

// Trilingual helper
const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

interface BlogCategory {
  id: string;
  name: string;
  name_fa: string | null;
  name_ps?: string | null;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

interface Blog {
  id: string;
  title: string;
  title_fa: string | null;
  title_ps?: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_fa: string | null;
  excerpt_ps?: string | null;
  content: string | null;
  content_fa: string | null;
  content_ps?: string | null;
  cover_image_url: string | null;
  author_name: string;
  author_name_fa: string | null;
  author_name_ps?: string | null;
  category_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  views_count: number;
  meta_title: string | null;
  meta_title_fa: string | null;
  meta_title_ps?: string | null;
  meta_description: string | null;
  meta_description_fa: string | null;
  meta_description_ps?: string | null;
  tags: string[];
  tags_fa: string[];
  tags_ps?: string[];
  published_at: string | null;
  created_at: string;
}

const AdminBlogs = () => {
  const { language, isRTL } = useLanguage();
  const lang = language as Language;
  
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
    title_ps: '',
    slug: '',
    excerpt: '',
    excerpt_fa: '',
    excerpt_ps: '',
    content: '',
    content_fa: '',
    content_ps: '',
    cover_image_url: '',
    author_name: 'Admin',
    author_name_fa: '',
    author_name_ps: '',
    category_id: '',
    is_published: false,
    is_featured: false,
    meta_title: '',
    meta_title_fa: '',
    meta_title_ps: '',
    meta_description: '',
    meta_description_fa: '',
    meta_description_ps: '',
    tags: '',
    tags_fa: '',
    tags_ps: '',
  });

  // Category form state
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    name_fa: '',
    name_ps: '',
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
      toast.error(getLabel(lang, 'Failed to load data', 'خطا در بارگذاری داده‌ها', 'د معلوماتو لوډ کولو کې تېروتنه'));
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
      title_ps: '',
      slug: '',
      excerpt: '',
      excerpt_fa: '',
      excerpt_ps: '',
      content: '',
      content_fa: '',
      content_ps: '',
      cover_image_url: '',
      author_name: 'Admin',
      author_name_fa: '',
      author_name_ps: '',
      category_id: '',
      is_published: false,
      is_featured: false,
      meta_title: '',
      meta_title_fa: '',
      meta_title_ps: '',
      meta_description: '',
      meta_description_fa: '',
      meta_description_ps: '',
      tags: '',
      tags_fa: '',
      tags_ps: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      title_fa: blog.title_fa || '',
      title_ps: blog.title_ps || '',
      slug: blog.slug,
      excerpt: blog.excerpt || '',
      excerpt_fa: blog.excerpt_fa || '',
      excerpt_ps: blog.excerpt_ps || '',
      content: blog.content || '',
      content_fa: blog.content_fa || '',
      content_ps: blog.content_ps || '',
      cover_image_url: blog.cover_image_url || '',
      author_name: blog.author_name,
      author_name_fa: blog.author_name_fa || '',
      author_name_ps: blog.author_name_ps || '',
      category_id: blog.category_id || '',
      is_published: blog.is_published,
      is_featured: blog.is_featured,
      meta_title: blog.meta_title || '',
      meta_title_fa: blog.meta_title_fa || '',
      meta_title_ps: blog.meta_title_ps || '',
      meta_description: blog.meta_description || '',
      meta_description_fa: blog.meta_description_fa || '',
      meta_description_ps: blog.meta_description_ps || '',
      tags: blog.tags?.join(', ') || '',
      tags_fa: blog.tags_fa?.join(', ') || '',
      tags_ps: blog.tags_ps?.join(', ') || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast.error(getLabel(lang, 'Title and slug are required', 'عنوان و شناسه الزامی است', 'سرلیک او سلګ اړین دي'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        title_fa: formData.title_fa || null,
        title_ps: formData.title_ps || null,
        slug: formData.slug,
        excerpt: formData.excerpt || null,
        excerpt_fa: formData.excerpt_fa || null,
        excerpt_ps: formData.excerpt_ps || null,
        content: formData.content || null,
        content_fa: formData.content_fa || null,
        content_ps: formData.content_ps || null,
        cover_image_url: formData.cover_image_url || null,
        author_name: formData.author_name,
        author_name_fa: formData.author_name_fa || null,
        author_name_ps: formData.author_name_ps || null,
        category_id: formData.category_id || null,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        meta_title: formData.meta_title || null,
        meta_title_fa: formData.meta_title_fa || null,
        meta_title_ps: formData.meta_title_ps || null,
        meta_description: formData.meta_description || null,
        meta_description_fa: formData.meta_description_fa || null,
        meta_description_ps: formData.meta_description_ps || null,
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        tags_fa: formData.tags_fa ? formData.tags_fa.split(',').map(t => t.trim()).filter(Boolean) : [],
        tags_ps: formData.tags_ps ? formData.tags_ps.split(',').map(t => t.trim()).filter(Boolean) : [],
        published_at: formData.is_published ? new Date().toISOString() : null,
      };

      if (editingBlog) {
        const { error } = await supabase.from('blogs').update(payload).eq('id', editingBlog.id);
        if (error) throw error;
        toast.success(getLabel(lang, 'Blog updated successfully', 'مقاله به‌روزرسانی شد', 'مقاله په بریالیتوب سره تازه شوه'));
      } else {
        const { error } = await supabase.from('blogs').insert([payload]);
        if (error) throw error;
        toast.success(getLabel(lang, 'Blog created successfully', 'مقاله ایجاد شد', 'مقاله په بریالیتوب سره جوړه شوه'));
      }

      setDialogOpen(false);
      fetchData();
    } catch (error: any) {
      console.error('Error saving blog:', error);
      toast.error(error.message || getLabel(lang, 'Failed to save', 'خطا در ذخیره', 'د خوندي کولو کې تېروتنه'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBlog) return;

    try {
      const { error } = await supabase.from('blogs').delete().eq('id', deletingBlog.id);
      if (error) throw error;
      toast.success(getLabel(lang, 'Blog deleted successfully', 'مقاله حذف شد', 'مقاله په بریالیتوب سره ړنګه شوه'));
      setDeleteDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast.error(getLabel(lang, 'Failed to delete', 'خطا در حذف', 'د ړنګولو کې تېروتنه'));
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
      toast.success(
        blog.is_published 
          ? getLabel(lang, 'Blog unpublished', 'مقاله پنهان شد', 'مقاله پټه شوه')
          : getLabel(lang, 'Blog published', 'مقاله منتشر شد', 'مقاله خپره شوه')
      );
      fetchData();
    } catch (error) {
      console.error('Error toggling publish:', error);
    }
  };

  const handleAddCategory = async () => {
    if (!categoryForm.name.trim() || !categoryForm.slug.trim()) {
      toast.error(getLabel(lang, 'Name and slug are required', 'نام و شناسه الزامی است', 'نوم او سلګ اړین دي'));
      return;
    }

    try {
      const { error } = await supabase.from('blog_categories').insert([{
        name: categoryForm.name,
        name_fa: categoryForm.name_fa || null,
        name_ps: categoryForm.name_ps || null,
        slug: categoryForm.slug,
      }]);
      
      if (error) throw error;
      toast.success(getLabel(lang, 'Category created', 'دسته‌بندی ایجاد شد', 'کټګوري جوړه شوه'));
      setCategoryDialogOpen(false);
      setCategoryForm({ name: '', name_fa: '', name_ps: '', slug: '' });
      fetchData();
    } catch (error: any) {
      console.error('Error adding category:', error);
      toast.error(error.message || getLabel(lang, 'Failed', 'خطا', 'تېروتنه'));
    }
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return '-';
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return '-';
    if (lang === 'ps' && cat.name_ps) return cat.name_ps;
    if (lang === 'fa' && cat.name_fa) return cat.name_fa;
    return cat.name;
  };

  const getBlogTitle = (blog: Blog) => {
    if (lang === 'ps' && blog.title_ps) return blog.title_ps;
    if (lang === 'fa' && blog.title_fa) return blog.title_fa;
    return blog.title;
  };

  const formatDate = (date: string) => {
    const locale = lang === 'ps' ? 'fa-IR' : lang === 'fa' ? 'fa-IR' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const formatNumber = (num: number) => {
    if (lang === 'ps' || lang === 'fa') return num.toLocaleString('fa-IR');
    return num.toString();
  };

  return (
    <AdminLayout title={getLabel(lang, 'Blog Management', 'مدیریت وبلاگ', 'د بلاګ مدیریت')}>
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {getLabel(lang, 'Blog Management', 'مدیریت وبلاگ', 'د بلاګ مدیریت')}
            </h1>
            <p className="text-muted-foreground">
              {getLabel(lang, 'Manage articles and categories', 'مدیریت مقالات و دسته‌بندی‌ها', 'د مقالو او کټګوریو مدیریت')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
              <Plus size={16} className="me-2" />
              {getLabel(lang, 'New Category', 'دسته‌بندی جدید', 'نوې کټګوري')}
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus size={16} className="me-2" />
              {getLabel(lang, 'New Article', 'مقاله جدید', 'نوې مقاله')}
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} size={18} />
          <Input
            placeholder={getLabel(lang, 'Search...', 'جستجو...', 'لټون...')}
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
                <TableHead>{getLabel(lang, 'Title', 'عنوان', 'سرلیک')}</TableHead>
                <TableHead>{getLabel(lang, 'Category', 'دسته‌بندی', 'کټګوري')}</TableHead>
                <TableHead>{getLabel(lang, 'Status', 'وضعیت', 'حالت')}</TableHead>
                <TableHead>{getLabel(lang, 'Views', 'بازدید', 'لیدنې')}</TableHead>
                <TableHead>{getLabel(lang, 'Date', 'تاریخ', 'نېټه')}</TableHead>
                <TableHead className="text-right">{getLabel(lang, 'Actions', 'عملیات', 'عملیات')}</TableHead>
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
                    {getLabel(lang, 'No articles found', 'مقاله‌ای یافت نشد', 'هیڅ مقاله ونه موندل شوه')}
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
                          <p className="font-medium">{getBlogTitle(blog)}</p>
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
                          ? getLabel(lang, 'Published', 'منتشر شده', 'خپره شوې')
                          : getLabel(lang, 'Draft', 'پیش‌نویس', 'مسوده')
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>{formatNumber(blog.views_count)}</TableCell>
                    <TableCell>{formatDate(blog.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => togglePublish(blog)}
                          title={blog.is_published 
                            ? getLabel(lang, 'Unpublish', 'پنهان کردن', 'پټول')
                            : getLabel(lang, 'Publish', 'انتشار', 'خپرول')
                          }
                        >
                          {blog.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(blog)}
                          title={getLabel(lang, 'Edit', 'ویرایش', 'سمول')}
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
                          title={getLabel(lang, 'Delete', 'حذف', 'ړنګول')}
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
                  ? getLabel(lang, 'Edit Article', 'ویرایش مقاله', 'مقاله سمول')
                  : getLabel(lang, 'New Article', 'مقاله جدید', 'نوې مقاله')
                }
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Title EN */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Title (English)', 'عنوان (انگلیسی)', 'سرلیک (انګلیسي)')}</Label>
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
                <Label>{getLabel(lang, 'Title (Persian)', 'عنوان (فارسی)', 'سرلیک (فارسي)')}</Label>
                <Input
                  value={formData.title_fa}
                  onChange={(e) => setFormData({ ...formData, title_fa: e.target.value })}
                  dir="rtl"
                />
              </div>

              {/* Title PS */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Title (Pashto)', 'عنوان (پشتو)', 'سرلیک (پښتو)')}</Label>
                <Input
                  value={formData.title_ps}
                  onChange={(e) => setFormData({ ...formData, title_ps: e.target.value })}
                  dir="rtl"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Slug', 'شناسه', 'سلګ')}</Label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Category', 'دسته‌بندی', 'کټګوري')}</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(val) => setFormData({ ...formData, category_id: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={getLabel(lang, 'Select', 'انتخاب کنید', 'غوره کړئ')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {getCategoryName(cat.id)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cover Image */}
              <div className="space-y-2 md:col-span-2">
                <ImageUpload
                  label={getLabel(lang, 'Cover Image', 'تصویر کاور', 'پوښ انځور')}
                  value={formData.cover_image_url}
                  onChange={(url) => setFormData({ ...formData, cover_image_url: url })}
                  placeholder={getLabel(lang, 'Click to upload image', 'کلیک کنید برای آپلود تصویر', 'د انځور د اپلوډ لپاره کلیک وکړئ')}
                  folder="blog-covers"
                  bucket="site-assets"
                />
              </div>

              {/* Excerpt EN */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Excerpt (English)', 'خلاصه (انگلیسی)', 'لنډیز (انګلیسي)')}</Label>
                <Textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  rows={3}
                />
              </div>

              {/* Excerpt FA */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Excerpt (Persian)', 'خلاصه (فارسی)', 'لنډیز (فارسي)')}</Label>
                <Textarea
                  value={formData.excerpt_fa}
                  onChange={(e) => setFormData({ ...formData, excerpt_fa: e.target.value })}
                  rows={3}
                  dir="rtl"
                />
              </div>

              {/* Excerpt PS */}
              <div className="space-y-2 md:col-span-2">
                <Label>{getLabel(lang, 'Excerpt (Pashto)', 'خلاصه (پشتو)', 'لنډیز (پښتو)')}</Label>
                <Textarea
                  value={formData.excerpt_ps}
                  onChange={(e) => setFormData({ ...formData, excerpt_ps: e.target.value })}
                  rows={3}
                  dir="rtl"
                />
              </div>

              {/* Content EN */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Content (English)', 'محتوا (انگلیسی)', 'منځپانګه (انګلیسي)')}</Label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={8}
                  placeholder="HTML content..."
                />
              </div>

              {/* Content FA */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Content (Persian)', 'محتوا (فارسی)', 'منځپانګه (فارسي)')}</Label>
                <Textarea
                  value={formData.content_fa}
                  onChange={(e) => setFormData({ ...formData, content_fa: e.target.value })}
                  rows={8}
                  dir="rtl"
                  placeholder="HTML content..."
                />
              </div>

              {/* Content PS */}
              <div className="space-y-2 md:col-span-2">
                <Label>{getLabel(lang, 'Content (Pashto)', 'محتوا (پشتو)', 'منځپانګه (پښتو)')}</Label>
                <Textarea
                  value={formData.content_ps}
                  onChange={(e) => setFormData({ ...formData, content_ps: e.target.value })}
                  rows={8}
                  dir="rtl"
                  placeholder="HTML content..."
                />
              </div>

              {/* Author EN */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Author (English)', 'نویسنده (انگلیسی)', 'لیکوال (انګلیسي)')}</Label>
                <Input
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                />
              </div>

              {/* Author FA */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Author (Persian)', 'نویسنده (فارسی)', 'لیکوال (فارسي)')}</Label>
                <Input
                  value={formData.author_name_fa}
                  onChange={(e) => setFormData({ ...formData, author_name_fa: e.target.value })}
                  dir="rtl"
                />
              </div>

              {/* Author PS */}
              <div className="space-y-2 md:col-span-2">
                <Label>{getLabel(lang, 'Author (Pashto)', 'نویسنده (پشتو)', 'لیکوال (پښتو)')}</Label>
                <Input
                  value={formData.author_name_ps}
                  onChange={(e) => setFormData({ ...formData, author_name_ps: e.target.value })}
                  dir="rtl"
                />
              </div>

              {/* Tags EN */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Tags (English)', 'برچسب‌ها (انگلیسی)', 'ټاګونه (انګلیسي)')}</Label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              {/* Tags FA */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Tags (Persian)', 'برچسب‌ها (فارسی)', 'ټاګونه (فارسي)')}</Label>
                <Input
                  value={formData.tags_fa}
                  onChange={(e) => setFormData({ ...formData, tags_fa: e.target.value })}
                  dir="rtl"
                  placeholder="برچسب۱، برچسب۲"
                />
              </div>

              {/* Tags PS */}
              <div className="space-y-2 md:col-span-2">
                <Label>{getLabel(lang, 'Tags (Pashto)', 'برچسب‌ها (پشتو)', 'ټاګونه (پښتو)')}</Label>
                <Input
                  value={formData.tags_ps}
                  onChange={(e) => setFormData({ ...formData, tags_ps: e.target.value })}
                  dir="rtl"
                  placeholder="ټاګ۱، ټاګ۲"
                />
              </div>

              {/* SEO */}
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Meta Title (EN)', 'عنوان متا (انگلیسی)', 'میټا سرلیک (انګلیسي)')}</Label>
                <Input
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>{getLabel(lang, 'Meta Title (FA)', 'عنوان متا (فارسی)', 'میټا سرلیک (فارسي)')}</Label>
                <Input
                  value={formData.meta_title_fa}
                  onChange={(e) => setFormData({ ...formData, meta_title_fa: e.target.value })}
                  dir="rtl"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{getLabel(lang, 'Meta Title (PS)', 'عنوان متا (پشتو)', 'میټا سرلیک (پښتو)')}</Label>
                <Input
                  value={formData.meta_title_ps}
                  onChange={(e) => setFormData({ ...formData, meta_title_ps: e.target.value })}
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label>{getLabel(lang, 'Meta Description (EN)', 'توضیحات متا (انگلیسی)', 'میټا تشریح (انګلیسي)')}</Label>
                <Textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label>{getLabel(lang, 'Meta Description (FA)', 'توضیحات متا (فارسی)', 'میټا تشریح (فارسي)')}</Label>
                <Textarea
                  value={formData.meta_description_fa}
                  onChange={(e) => setFormData({ ...formData, meta_description_fa: e.target.value })}
                  rows={2}
                  dir="rtl"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{getLabel(lang, 'Meta Description (PS)', 'توضیحات متا (پشتو)', 'میټا تشریح (پښتو)')}</Label>
                <Textarea
                  value={formData.meta_description_ps}
                  onChange={(e) => setFormData({ ...formData, meta_description_ps: e.target.value })}
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
                  <Label>{getLabel(lang, 'Published', 'منتشر شود', 'خپره شوې')}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(val) => setFormData({ ...formData, is_featured: val })}
                  />
                  <Label>{getLabel(lang, 'Featured', 'ویژه', 'ځانګړې')}</Label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {getLabel(lang, 'Cancel', 'انصراف', 'لغوه کول')}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving 
                  ? getLabel(lang, 'Saving...', 'در حال ذخیره...', 'خوندي کیږي...')
                  : getLabel(lang, 'Save', 'ذخیره', 'خوندي کړئ')
                }
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Category Dialog */}
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{getLabel(lang, 'New Category', 'دسته‌بندی جدید', 'نوې کټګوري')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Name (English)', 'نام (انگلیسی)', 'نوم (انګلیسي)')}</Label>
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
                <Label>{getLabel(lang, 'Name (Persian)', 'نام (فارسی)', 'نوم (فارسي)')}</Label>
                <Input
                  value={categoryForm.name_fa}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_fa: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Name (Pashto)', 'نام (پشتو)', 'نوم (پښتو)')}</Label>
                <Input
                  value={categoryForm.name_ps}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_ps: e.target.value })}
                  dir="rtl"
                />
              </div>
              <div className="space-y-2">
                <Label>{getLabel(lang, 'Slug', 'شناسه', 'سلګ')}</Label>
                <Input
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCategoryDialogOpen(false)}>
                {getLabel(lang, 'Cancel', 'انصراف', 'لغوه کول')}
              </Button>
              <Button onClick={handleAddCategory}>
                {getLabel(lang, 'Create', 'ایجاد', 'جوړول')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{getLabel(lang, 'Delete Article', 'حذف مقاله', 'مقاله ړنګول')}</DialogTitle>
            </DialogHeader>
            <p className="py-4 text-muted-foreground">
              {getLabel(
                lang,
                `Are you sure you want to delete "${deletingBlog?.title}"?`,
                `آیا از حذف "${deletingBlog?.title}" مطمئن هستید؟`,
                `ایا تاسو ډاډه یاست چې "${deletingBlog?.title}" ړنګه کړئ؟`
              )}
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                {getLabel(lang, 'Cancel', 'انصراف', 'لغوه کول')}
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                {getLabel(lang, 'Delete', 'حذف', 'ړنګول')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminBlogs;
