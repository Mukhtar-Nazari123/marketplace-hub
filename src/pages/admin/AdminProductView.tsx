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
import { useLanguage, formatDate, type Language } from '@/lib/i18n';
import { formatCurrency } from '@/lib/currencyFormatter';

// Trilingual helper function
const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};
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
  price_afn: number;
  compare_price_afn: number | null;
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
  delivery_fee: number;
  metadata: Json;
}

const AdminProductView = () => {
  const { t, direction, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [sellerName, setSellerName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const isRTL = direction === 'rtl';
  const lang = language;

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products_with_translations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setProduct({ ...data, name: data.name || 'Untitled', description: data.description || '' } as any);

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
      toast.error(getLabel(lang, 'Failed to load product', 'خطا در بارگذاری محصول', 'د محصول پورته کولو کې تېروتنه'));
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

      toast.success(getLabel(lang, 'Product deleted successfully', 'محصول حذف شد', 'محصول په بریالیتوب سره حذف شو'));
      navigate('/admin/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(getLabel(lang, 'Failed to delete product', 'خطا در حذف محصول', 'د محصول حذف کولو کې تېروتنه'));
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

      toast.success(getLabel(lang, 'Product approved', 'محصول تأیید شد', 'محصول تایید شو'));
      fetchProduct();
    } catch (error) {
      console.error('Error approving product:', error);
      toast.error(getLabel(lang, 'Failed to approve product', 'خطا در تأیید محصول', 'د محصول تاییدولو کې تېروتنه'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success text-success-foreground gap-1"><CheckCircle className="h-3 w-3" /> {getLabel(lang, 'Active', 'فعال', 'فعال')}</Badge>;
      case 'pending':
        return <Badge className="bg-warning text-warning-foreground gap-1"><AlertCircle className="h-3 w-3" /> {getLabel(lang, 'Pending', 'در انتظار', 'انتظار کې')}</Badge>;
      case 'rejected':
        return <Badge className="bg-destructive text-destructive-foreground gap-1"><XCircle className="h-3 w-3" /> {getLabel(lang, 'Rejected', 'رد شده', 'رد شوی')}</Badge>;
      case 'draft':
        return <Badge variant="secondary">{getLabel(lang, 'Draft', 'پیش‌نویس', 'مسوده')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const metadata = product?.metadata as ProductMetadata | null;
  const currency = 'AFN';
  const CurrencyIcon = Banknote;
  const videoUrl = metadata?.videoUrl;
  const productImages = product?.images || [];
  
  // Build gallery items: video first (if exists), then images
  type GalleryItem = { type: 'video'; url: string } | { type: 'image'; url: string };
  const galleryItems: GalleryItem[] = [];
  if (videoUrl) {
    galleryItems.push({ type: 'video', url: videoUrl });
  }
  productImages.forEach((img) => {
    galleryItems.push({ type: 'image', url: img });
  });
  
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  if (isLoading) {
    return (
      <AdminLayout 
        title={getLabel(lang, 'Product Details', 'جزئیات محصول', 'د محصول تفصیلات')} 
        description={getLabel(lang, 'Loading...', 'در حال بارگذاری...', 'پورته کېږي...')}
      >
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
      title={getLabel(lang, 'Product Details', 'جزئیات محصول', 'د محصول تفصیلات')} 
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
            {getLabel(lang, 'Back to Products', 'بازگشت به محصولات', 'محصولاتو ته بېرته')}
          </Button>
          
          <div className="flex gap-2">
            {product.status === 'pending' && (
              <Button 
                onClick={handleApprove}
                className="gap-2 bg-success hover:bg-success/90"
              >
                <CheckCircle className="h-4 w-4" />
                {getLabel(lang, 'Approve Product', 'تأیید محصول', 'محصول تایید کړئ')}
              </Button>
            )}
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="h-4 w-4" />
                  {getLabel(lang, 'Delete', 'حذف', 'حذف')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {getLabel(lang, 'Are you sure?', 'آیا مطمئن هستید؟', 'ایا تاسو ډاډه یاست؟')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {getLabel(lang, 
                      'This action cannot be undone. This will permanently delete the product.',
                      'این عمل قابل بازگشت نیست. محصول برای همیشه حذف خواهد شد.',
                      'دا عمل نشي بېرته کېدای. محصول به تل لپاره حذف شي.'
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>
                    {getLabel(lang, 'Cancel', 'انصراف', 'لغوه')}
                  </AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {isDeleting 
                      ? getLabel(lang, 'Deleting...', 'در حال حذف...', 'حذفېږي...') 
                      : getLabel(lang, 'Delete', 'حذف', 'حذف')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Images/Video Gallery Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-primary" />
                {getLabel(lang, 'Product Media', 'رسانه محصول', 'د محصول رسنۍ')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {galleryItems.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Display */}
                  <div className="aspect-square rounded-xl overflow-hidden border bg-muted">
                    {galleryItems[selectedMediaIndex]?.type === 'video' ? (
                      <video
                        controls
                        autoPlay
                        className="w-full h-full object-contain bg-black"
                        poster={productImages[0]}
                      >
                        <source src={galleryItems[selectedMediaIndex].url} type="video/mp4" />
                        {getLabel(lang, 'Your browser does not support the video tag.', 'مرورگر شما از ویدیو پشتیبانی نمی‌کند.', 'ستاسو براوزر د ویډیو ټګ نه ملاتړ نه کوي.')}
                      </video>
                    ) : (
                      <img
                        src={galleryItems[selectedMediaIndex]?.url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  {/* Thumbnails */}
                  {galleryItems.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {galleryItems.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedMediaIndex(idx)}
                          className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all relative ${
                            selectedMediaIndex === idx ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-muted-foreground/50'
                          }`}
                        >
                          {item.type === 'video' ? (
                            <>
                              <img 
                                src={productImages[0] || '/placeholder.svg'} 
                                alt="" 
                                className="w-full h-full object-cover opacity-70" 
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                <Play className="h-5 w-5 text-white fill-white" />
                              </div>
                            </>
                          ) : (
                            <img
                              src={item.url}
                              alt={`${product.name} ${idx}`}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-square rounded-xl border-2 border-dashed flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{getLabel(lang, 'No images', 'بدون تصویر', 'انځورونه نشته')}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

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
                {/* Pricing Section - Modern Design */}
                <div className="p-5 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 rounded-xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-3">
                    <CurrencyIcon className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-foreground">
                      {getLabel(lang, 'Pricing', 'قیمت‌گذاری', 'قیمت ټاکل')}
                    </span>
                  </div>
                  
                  {/* Price Display */}
                  <div
                    className={`flex items-baseline gap-3 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}
                  >
                    {product.compare_price_afn !== null && product.compare_price_afn !== product.price_afn ? (
                      <>
                        <span className="text-lg text-muted-foreground line-through">
                          {formatCurrency(
                            Math.max(product.compare_price_afn, product.price_afn),
                            currency,
                            isRTL
                          )}
                        </span>
                        <span className="text-2xl font-bold text-orange">
                          {formatCurrency(
                            Math.min(product.compare_price_afn, product.price_afn),
                            currency,
                            isRTL
                          )}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-success/10 text-success text-xs px-2 py-0.5"
                        >
                          {Math.round(
                            (Math.abs(product.compare_price_afn - product.price_afn) /
                              Math.max(product.compare_price_afn, product.price_afn)) *
                              100
                          )}% {getLabel(lang, 'OFF', 'تخفیف', 'تخفیف')}
                        </Badge>
                      </>
                    ) : (
                      <span className="text-2xl font-bold">
                        {formatCurrency(product.price_afn, currency, isRTL)}
                      </span>
                    )}
                  </div>

                  {/* Delivery Fee - Always in AFN */}
                  {(product as any)?.delivery_fee !== undefined && (product as any).delivery_fee > 0 && (
                    <div className="mt-3 pt-3 border-t border-primary/10">
                      <span className="text-sm text-muted-foreground">
                        {getLabel(lang, 'Delivery Fee:', 'هزینه ارسال:', 'د لیږد فیس:')}
                      </span>
                      <span className="font-bold text-foreground ms-2">
                        {formatCurrency((product as any).delivery_fee, 'AFN', isRTL)}
                      </span>
                    </div>
                  )}

                  {/* Primary Currency */}
                  <div className="mt-2 text-xs text-muted-foreground">
                    {getLabel(lang, 'Primary currency:', 'ارز اصلی:', 'اصلي اسعار:')} {currency}
                  </div>
                </div>

                {/* Stock & SKU Grid - Modern Design */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {getLabel(lang, 'Stock', 'موجودی', 'ذخیره')}
                      </span>
                    </div>
                    <p className="text-2xl font-bold">{product.quantity}</p>
                  </div>
                  
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-muted-foreground font-mono text-lg">#</span>
                      <span className="text-sm text-muted-foreground">
                        {getLabel(lang, 'SKU', 'کد محصول', 'د محصول کوډ')}
                      </span>
                    </div>
                    <p className="text-lg font-mono font-semibold">{product.sku || 'N/A'}</p>
                  </div>
                </div>

                <Separator />

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Layers className="h-3 w-3" />
                      {getLabel(lang, 'Category', 'دسته‌بندی', 'کټګوري')}
                    </p>
                    <p className="font-medium">
                      {metadata?.categoryName || 'N/A'}
                      {metadata?.subCategoryName && ` / ${metadata.subCategoryName}`}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {getLabel(lang, 'Brand', 'برند', 'برانډ')}
                    </p>
                    <p className="font-medium">{metadata?.brand || 'N/A'}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {getLabel(lang, 'Seller', 'فروشنده', 'پلورونکی')}
                    </p>
                    <p className="font-medium">{sellerName || getLabel(lang, 'Unknown', 'ناشناخته', 'نامعلوم')}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {getLabel(lang, 'Created', 'تاریخ ایجاد', 'جوړ شو')}
                    </p>
                    <p className="font-medium">
                      {formatDate(new Date(product.created_at), lang)}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {getLabel(lang, 'Updated', 'آخرین بروزرسانی', 'تازه شو')}
                    </p>
                    <p className="font-medium">
                      {formatDate(new Date(product.updated_at), lang)}
                    </p>
                  </div>
                </div>

                {/* Rejection Reason */}
                {product.status === 'rejected' && product.rejection_reason && (
                  <>
                    <Separator />
                    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <p className="text-sm font-medium text-destructive mb-1">
                        {getLabel(lang, 'Rejection Reason:', 'دلیل رد:', 'د رد دلیل:')}
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
                  {getLabel(lang, 'Description', 'توضیحات', 'توضیحات')}
                </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {metadata?.shortDescription && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {getLabel(lang, 'Short Description', 'توضیح کوتاه', 'لنډ توضیحات')}
                      </p>
                      <p>{metadata.shortDescription}</p>
                    </div>
                  )}
                  {product.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {getLabel(lang, 'Full Description', 'توضیحات کامل', 'بشپړ توضیحات')}
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
                  {getLabel(lang, 'Attributes', 'ویژگی‌ها', 'ځانګړتیاوې')}
                </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Sort attributes: boolean (warranty) first, then others */}
                    {Object.entries(metadata.attributes)
                      .sort(([, a], [, b]) => {
                        // Boolean values (like warranty) come first
                        const aIsBoolean = typeof a === 'boolean';
                        const bIsBoolean = typeof b === 'boolean';
                        if (aIsBoolean && !bIsBoolean) return -1;
                        if (!aIsBoolean && bIsBoolean) return 1;
                        return 0;
                      })
                      .map(([key, value]) => (
                        <div key={key} className="p-3 bg-muted/50 rounded-lg">
                          <p className="text-xs text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="font-medium">
                            {typeof value === 'boolean' 
                              ? (value ? getLabel(lang, 'Yes', 'بله', 'هو') : getLabel(lang, 'No', 'خیر', 'نه'))
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
                  {getLabel(lang, 'Stock per Size', 'موجودی بر اساس سایز', 'د سایز له مخې ذخیره')}
                </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(metadata.stockPerSize).map(([size, qty]) => (
                      <div key={size} className="px-4 py-2 bg-muted/50 rounded-lg text-center min-w-[80px]">
                        <p className="text-sm font-bold">{size}</p>
                        <p className="text-xs text-muted-foreground">{qty} {getLabel(lang, 'units', 'عدد', 'واحد')}</p>
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