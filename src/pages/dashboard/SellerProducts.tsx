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

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  quantity: number;
  images: string[] | null;
  status: string;
  created_at: string;
  metadata: Record<string, unknown> | null;
}

const SellerProducts = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
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
        .from('products')
        .select('id, name, slug, description, price, compare_at_price, quantity, images, status, created_at, metadata')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts((data as unknown as Product[]) || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(isRTL ? 'خطا در دریافت محصولات' : 'Error fetching products');
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
      toast.success(isRTL ? 'محصول حذف شد' : 'Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(isRTL ? 'خطا در حذف محصول' : 'Error deleting product');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; labelFa: string }> = {
      draft: { variant: 'secondary', label: 'Draft', labelFa: 'پیش‌نویس' },
      pending: { variant: 'outline', label: 'Pending', labelFa: 'در انتظار' },
      active: { variant: 'default', label: 'Active', labelFa: 'فعال' },
      rejected: { variant: 'destructive', label: 'Rejected', labelFa: 'رد شده' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge variant={config.variant}>
        {isRTL ? config.labelFa : config.label}
      </Badge>
    );
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(isRTL ? 'fa-IR' : 'en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <DashboardLayout
      title={isRTL ? 'محصولات من' : 'My Products'}
      description={isRTL ? 'مدیریت محصولات فروشگاه' : 'Manage your store products'}
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
              placeholder={isRTL ? 'جستجوی محصولات...' : 'Search products...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(isRTL ? "pr-10" : "pl-10")}
            />
          </div>
          <Button asChild className="gap-2">
            <Link to="/dashboard/seller/products/new">
              <Plus className="h-4 w-4" />
              {isRTL ? 'افزودن محصول' : 'Add Product'}
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
                  {searchQuery
                    ? (isRTL ? 'محصولی یافت نشد' : 'No products found')
                    : (isRTL ? 'هنوز محصولی ندارید' : 'No products yet')
                  }
                </h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {searchQuery
                    ? (isRTL ? 'عبارت جستجو را تغییر دهید' : 'Try a different search term')
                    : (isRTL ? 'اولین محصول خود را اضافه کنید' : 'Add your first product to get started')
                  }
                </p>
              </div>
              {!searchQuery && (
                <Button asChild className="gap-2 mt-2">
                  <Link to="/dashboard/seller/products/new">
                    <Plus className="h-4 w-4" />
                    {isRTL ? 'افزودن محصول' : 'Add Product'}
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
                        <DropdownMenuItem onClick={() => navigate(`/products/${product.slug}`)}>
                          <Eye className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {isRTL ? 'مشاهده' : 'View'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/seller/products/edit/${product.id}`)}>
                          <Edit className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {isRTL ? 'ویرایش' : 'Edit'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setProductToDelete(product);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                          {isRTL ? 'حذف' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-2">
                    {/* Category */}
                    {product.metadata && (product.metadata as Record<string, unknown>).categoryName && (
                      <p className="text-xs text-muted-foreground truncate">
                        {(product.metadata as Record<string, unknown>).categoryName as string}
                        {(product.metadata as Record<string, unknown>).subCategoryName && ` / ${(product.metadata as Record<string, unknown>).subCategoryName}`}
                      </p>
                    )}
                    
                    {/* Product Name */}
                    <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>

                    {/* Price */}
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <span className="font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                      {product.compare_at_price && product.compare_at_price > product.price && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.compare_at_price)}
                        </span>
                      )}
                    </div>

                    {/* Stock */}
                    <p className="text-xs text-muted-foreground">
                      {isRTL ? `موجودی: ${product.quantity}` : `Stock: ${product.quantity}`}
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
                      {isRTL ? 'ویرایش' : 'Edit'}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/products/${product.slug}`)}
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isRTL ? 'حذف محصول' : 'Delete Product'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isRTL
                ? `آیا از حذف "${productToDelete?.name}" اطمینان دارید؟ این عمل قابل بازگشت نیست.`
                : `Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isRTL ? "flex-row-reverse gap-2" : ""}>
            <AlertDialogCancel disabled={isDeleting}>
              {isRTL ? 'انصراف' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (isRTL ? 'در حال حذف...' : 'Deleting...') : (isRTL ? 'حذف' : 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default SellerProducts;
