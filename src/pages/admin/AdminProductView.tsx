import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Package,
  Tag,
  DollarSign,
  Banknote,
  Calendar,
  User,
  Layers,
  Info,
  Image as ImageIcon,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Video,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage, formatDate, formatCurrency } from '@/lib/i18n';
import { Json } from '@/integrations/supabase/types';

interface ProductMetadata {
  shortDescription?: string;
  brand?: string;
  attributes?: Record<string, string | boolean | string[]>;
  videoUrl?: string;
  stockPerSize?: Record<string, number>;
  categoryId?: string;
  categoryName?: string;
  subCategoryId?: string;
  subCategoryName?: string;
  priceUSD?: number;
  discountPriceUSD?: number;
  currency?: 'AFN' | 'USD';
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  quantity: number;
  sku: string | null;
  barcode: string | null;
  status: string;
  seller_id: string;
  category_id: string | null;
  images: string[];
  created_at: string;
  updated_at: string;
  rejection_reason: string | null;
  is_featured: boolean;
  metadata: Json;
}

const AdminProductView = () => {
  const { t, direction } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerName, setSellerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const isRTL = direction === 'rtl';

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct(data);

      // Fetch seller name
      if (data?.seller_id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', data.seller_id)
          .single();

        if (profileData) {
          setSellerName(profileData.full_name);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
      navigate('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast.success(isRTL ? 'محصول حذف شد' : 'Product deleted successfully');
      navigate('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(isRTL ? 'خطا در حذف محصول' : 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleApprove = async () => {
    if (!product) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ status: 'active' })
        .eq('id', product.id);

      if (error) throw error;

      toast.success(isRTL ? 'محصول تأیید شد' : 'Product approved');
      fetchProduct();
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error(isRTL ? 'خطا در تأیید محصول' : 'Failed to approve product');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground gap-1"><CheckCircle className="h-3 w-3" /> Active</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground gap-1"><AlertCircle className="h-3 w-3" /> Pending</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const metadata = product?.metadata as ProductMetadata | null;
  const currency = metadata?.currency || 'AFN';
  const currencySymbol = currency === 'AFN' ? '؋' : '$';
  const CurrencyIcon = currency === 'AFN' ? Banknote : DollarSign;

  if (isLoading) {
    return (
      <AdminLayout title="Product Details" description="Loading...">
        <div className="space-y-6">
          <Skeleton className="h-10 w-40" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <AdminLayout 
      title={isRTL ? 'جزئیات محصول' : 'Product Details'} 
      description={product.name}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header Actions */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/products')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {isRTL ? 'بازگشت' : 'Back to Products'}
          </Button>
          
          <div className="flex gap-2">
            {product.status === 'pending' && (
              <Button 
                onClick={handleApprove}
                className="gap-2 bg-success hover:bg-success/90"
              >
                <CheckCircle className="h-4 w-4" />
                {isRTL ? 'تأیید محصول' : 'Approve Product'}
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  {isRTL ? 'حذف' : 'Delete'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {isRTL ? 'آیا مطمئن هستید؟' : 'Are you sure?'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {isRTL 
                      ? 'این عمل قابل بازگشت نیست. محصول برای همیشه حذف خواهد شد.'
                      : 'This action cannot be undone. This will permanently delete the product.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {isRTL ? 'انصراف' : 'Cancel'}
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting 
                      ? (isRTL ? 'در حال حذف...' : 'Deleting...') 
                      : (isRTL ? 'حذف' : 'Delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                {isRTL ? 'تصاویر محصول' : 'Product Images'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {product.images && product.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image */}
                  <div className="aspect-square rounded-xl overflow-hidden border bg-muted">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Thumbnails */}
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.slice(1, 5).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded-lg overflow-hidden border bg-muted">
                          <img
                            src={img}
                            alt={`${product.name} ${idx + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{isRTL ? 'بدون تصویر' : 'No images'}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Section */}
          {metadata?.videoUrl && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  {isRTL ? 'ویدیوی محصول' : 'Product Video'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-xl overflow-hidden border bg-muted max-w-2xl mx-auto">
                  <video
                    controls
                    className="w-full max-h-[400px] object-contain"
                    poster={product.images?.[0]}
                  >
                    <source src={metadata.videoUrl} type="video/mp4" />
                    {isRTL ? 'مرورگر شما از ویدیو پشتیبانی نمی‌کند.' : 'Your browser does not support the video tag.'}
                  </video>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl">{product.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">SKU: {product.sku || 'N/A'}</p>
                  </div>
                  {getStatusBadge(product.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Section */}
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <CurrencyIcon className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'قیمت' : 'Price'} ({currency})
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">
                        {currencySymbol}{Number(product.price).toLocaleString()}
                      </span>
                      {product.compare_at_price && (
                        <span className="text-lg text-muted-foreground line-through">
                          {currencySymbol}{Number(product.compare_at_price).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {isRTL ? 'موجودی' : 'Stock'}
                    </p>
                    <p className="font-medium">{product.quantity}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {isRTL ? 'دسته‌بندی' : 'Category'}
                    </p>
                    <p className="font-medium">
                      {metadata?.categoryName || 'N/A'}
                      {metadata?.subCategoryName && ` / ${metadata.subCategoryName}`}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {isRTL ? 'برند' : 'Brand'}
                    </p>
                    <p className="font-medium">{metadata?.brand || 'N/A'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {isRTL ? 'فروشنده' : 'Seller'}
                    </p>
                    <p className="font-medium">{sellerName || 'Unknown'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {isRTL ? 'تاریخ ایجاد' : 'Created'}
                    </p>
                    <p className="font-medium">
                      {formatDate(new Date(product.created_at), isRTL ? 'fa' : 'en')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {isRTL ? 'آخرین بروزرسانی' : 'Updated'}
                    </p>
                    <p className="font-medium">
                      {formatDate(new Date(product.updated_at), isRTL ? 'fa' : 'en')}
                    </p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {product.status === 'rejected' && product.rejection_reason && (
                  <>
                    <Separator />
                    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-sm font-medium text-destructive mb-1">
                        {isRTL ? 'دلیل رد:' : 'Rejection Reason:'}
                      </p>
                      <p className="text-sm">{product.rejection_reason}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            {(product.description || metadata?.shortDescription) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    {isRTL ? 'توضیحات' : 'Description'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metadata?.shortDescription && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {isRTL ? 'توضیح کوتاه' : 'Short Description'}
                      </p>
                      <p>{metadata.shortDescription}</p>
                    </div>
                  )}
                  {product.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {isRTL ? 'توضیحات کامل' : 'Full Description'}
                      </p>
                      <p className="whitespace-pre-wrap">{product.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Attributes */}
            {metadata?.attributes && Object.keys(metadata.attributes).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    {isRTL ? 'ویژگی‌ها' : 'Attributes'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(metadata.attributes).map(([key, value]) => (
                      <div key={key} className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-medium">
                          {typeof value === 'boolean' 
                            ? (value ? 'Yes' : 'No')
                            : Array.isArray(value)
                              ? value.join(', ')
                              : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stock per Size */}
            {metadata?.stockPerSize && Object.keys(metadata.stockPerSize).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    {isRTL ? 'موجودی بر اساس سایز' : 'Stock per Size'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(metadata.stockPerSize).map(([size, qty]) => (
                      <div key={size} className="px-4 py-2 bg-muted/50 rounded-lg text-center min-w-[80px]">
                        <p className="text-sm font-bold">{size}</p>
                        <p className="text-xs text-muted-foreground">{qty} units</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProductView;