import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Package, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  ImageOff,
  Search
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currencyFormatter';

// Trilingual translations for Seller Products page
const translations = {
  pageTitle: { en: 'My Products', fa: 'محصولات من', ps: 'زما محصولات' },
  pageDescription: { en: 'Manage your store products', fa: 'مدیریت محصولات فروشگاه', ps: 'د خپل پلورنځي محصولات اداره کړئ' },
  searchPlaceholder: { en: 'Search products...', fa: 'جستجوی محصولات...', ps: 'محصولات ولټوئ...' },
  addProduct: { en: 'Add Product', fa: 'افزودن محصول', ps: 'محصول اضافه کړئ' },
  noProductsFound: { en: 'No products found', fa: 'محصولی یافت نشد', ps: 'هیڅ محصول ونه موندل شو' },
  noProductsYet: { en: 'No products yet', fa: 'هنوز محصولی ندارید', ps: 'تاسو لا تر اوسه محصول نلرئ' },
  tryDifferentSearch: { en: 'Try a different search term', fa: 'عبارت جستجو را تغییر دهید', ps: 'بله لټون عبارت وازمایئ' },
  addFirstProduct: { en: 'Add your first product to get started', fa: 'اولین محصول خود را اضافه کنید', ps: 'د پیل لپاره خپل لومړی محصول اضافه کړئ' },
  view: { en: 'View', fa: 'مشاهده', ps: 'کتل' },
  edit: { en: 'Edit', fa: 'ویرایش', ps: 'سمون' },
  delete: { en: 'Delete', fa: 'حذف', ps: 'ړنګول' },
  stock: { en: 'Stock', fa: 'موجودی', ps: 'زیرمه' },
  deleteProduct: { en: 'Delete Product', fa: 'حذف محصول', ps: 'محصول ړنګ کړئ' },
  deleteConfirmation: { 
    en: (name: string) => `Are you sure you want to delete "${name}"? This action cannot be undone.`,
    fa: (name: string) => `آیا از حذف "${name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`,
    ps: (name: string) => `ایا تاسو ډاډه یاست چې "${name}" ړنګ کړئ؟ دا عمل نشي بیرته راګرځیدلی.`
  },
  cancel: { en: 'Cancel', fa: 'انصراف', ps: 'لغوه کړئ' },
  deleting: { en: 'Deleting...', fa: 'در حال حذف...', ps: 'ړنګول کیږي...' },
  productDeleted: { en: 'Product deleted', fa: 'محصول حذف شد', ps: 'محصول ړنګ شو' },
  errorFetchingProducts: { en: 'Error fetching products', fa: 'خطا در دریافت محصولات', ps: 'د محصولاتو په راوړلو کې ستونزه' },
  errorDeletingProduct: { en: 'Error deleting product', fa: 'خطا در حذف محصول', ps: 'د محصول په ړنګولو کې ستونزه' },
  status: {
    draft: { en: 'Draft', fa: 'پیش‌نویس', ps: 'مسوده' },
    pending: { en: 'Pending', fa: 'در انتظار', ps: 'تر کتنې لاندې' },
    active: { en: 'Active', fa: 'فعال', ps: 'فعال' },
    rejected: { en: 'Rejected', fa: 'رد شده', ps: 'رد شوی' },
  }
};

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_afn: number;
  compare_price_afn: number | null;
  quantity: number;
  images: string[] | null;
  status: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
  category_id: string | null;
  subcategory_id: string | null;
  categories: { name: string; name_fa: string | null; name_ps: string | null } | null;
  subcategories: { name: string; name_fa: string | null; name_ps: string | null } | null;
}

const SellerProducts = () => {
  const { isRTL, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const lang = language as 'en' | 'fa' | 'ps';
  
  // Translation helper
  const t = (key: keyof typeof translations) => {
    const value = translations[key];
    if (typeof value === 'object' && 'en' in value && 'fa' in value && 'ps' in value) {
      return (value as Record<string, string>)[lang] || (value as Record<string, string>).en;
    }
    return key;
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products_with_translations')
        .select(`
          id, name, slug, description, price_afn, compare_price_afn, quantity, images, status, created_at, metadata, category_id, subcategory_id,
          categories:category_id(name, name_fa, name_ps),
          subcategories:subcategory_id(name, name_fa, name_ps)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data || []).map(p => ({ ...p, name: p.name || 'Untitled' })) as unknown as Product[]);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(t('errorFetchingProducts'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productToDelete.id);

      if (error) throw error;

      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      toast.success(t('productDeleted'));
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(t('errorDeletingProduct'));
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      draft: { variant: 'secondary' },
      pending: { variant: 'outline' },
      active: { variant: 'default' },
      rejected: { variant: 'destructive' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const statusKey = status as keyof typeof translations.status;
    const statusLabel = translations.status[statusKey] 
      ? translations.status[statusKey][lang] || translations.status[statusKey].en
      : status;
    
    return (
      <Badge variant={config.variant}>
        {statusLabel}
      </Badge>
    );
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const getDeleteConfirmationText = () => {
    if (!productToDelete) return '';
    return translations.deleteConfirmation[lang](productToDelete.name);
  };

  return (
    <DashboardLayout
      title={t('pageTitle')}
      description={t('pageDescription')}
      allowedRoles={['seller']}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className={cn(
          "flex flex-col sm:flex-row gap-4 justify-between",
          isRTL && "sm:flex-row-reverse"
        )}>
          <div className="relative flex-1 max-w-md">
            <Search className={cn(
              "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
              isRTL ? "right-3" : "left-3"
            )} />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(isRTL ? "pr-10 text-right" : "pl-10")}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
          </div>
          <Button asChild className="gap-2">
            <Link to="/dashboard/seller/products/new">
              <Plus className="h-4 w-4" />
              {t('addProduct')}
            </Link>
          </Button>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <CardContent className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {searchQuery ? t('noProductsFound') : t('noProductsYet')}
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchQuery ? t('tryDifferentSearch') : t('addFirstProduct')}
                </p>
              </div>
              {!searchQuery && (
                <Button asChild className="gap-2 mt-2">
                  <Link to="/dashboard/seller/products/new">
                    <Plus className="h-4 w-4" />
                    {t('addProduct')}
                  </Link>
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                {/* Product Image */}
                <div className="relative aspect-square bg-muted">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageOff className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className={cn(
                    "absolute top-3",
                    isRTL ? "right-3" : "left-3"
                  )}>
                    {getStatusBadge(product.status)}
                  </div>

                  {/* Actions Dropdown */}
                  <div className={cn(
                    "absolute top-3",
                    isRTL ? "left-3" : "right-3"
                  )}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align={isRTL ? "start" : "end"}>
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/seller/products/view/${product.id}`)}>
                          <Eye className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {t('view')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/seller/products/edit/${product.id}`)}>
                          <Edit className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {t('edit')}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setProductToDelete(product);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {t('delete')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    {/* Category */}
                    {product.categories && (
                      <p className="text-xs text-muted-foreground truncate">
                        {lang === 'fa' ? (product.categories.name_fa || product.categories.name) 
                          : lang === 'ps' ? (product.categories.name_ps || product.categories.name_fa || product.categories.name)
                          : product.categories.name}
                        {product.subcategories && ` / ${
                          lang === 'fa' ? (product.subcategories.name_fa || product.subcategories.name) 
                            : lang === 'ps' ? (product.subcategories.name_ps || product.subcategories.name_fa || product.subcategories.name)
                            : product.subcategories.name
                        }`}
                      </p>
                    )}
                    
                    {/* Product Name */}
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className={cn("flex flex-col gap-1", isRTL && "items-end")}>
                      {product.compare_price_afn && product.compare_price_afn > product.price_afn ? (
                        <>
                          <span className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.compare_price_afn, 'AFN', isRTL)}
                          </span>
                          <span className="font-bold text-orange">
                            {formatCurrency(product.price_afn, 'AFN', isRTL)}
                          </span>
                        </>
                      ) : (
                        <span className="font-bold text-primary">
                          {formatCurrency(product.price_afn, 'AFN', isRTL)}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <p className="text-xs text-muted-foreground">
                      {t('stock')}: {product.quantity}
                    </p>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-0 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/dashboard/seller/products/edit/${product.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                    <span className={cn(isRTL ? "mr-2" : "ml-2")}>
                      {t('edit')}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/dashboard/seller/products/view/${product.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir={isRTL ? 'rtl' : 'ltr'}>
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(isRTL && "text-right")}>
              {t('deleteProduct')}
            </AlertDialogTitle>
            <AlertDialogDescription className={cn(isRTL && "text-right")}>
              {getDeleteConfirmationText()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? "flex-row-reverse gap-2" : ""}>
            <AlertDialogCancel disabled={isDeleting}>
              {t('cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? t('deleting') : t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SellerProducts;
