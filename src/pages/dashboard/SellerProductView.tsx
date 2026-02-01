import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/currencyFormatter';
import { ProductContentDisplay } from '@/components/products/ProductContentDisplay';
import { ProductSpecsDisplay } from '@/components/products/ProductSpecsDisplay';
import { 
  getLocalizedProductName, 
  getLocalizedProductDescription, 
  getLocalizedShortDescription 
} from '@/lib/localizedProduct';
import {
  ArrowLeft,
  ArrowRight,
  Edit,
  Package,
  Tag,
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  DollarSign,
  Hash,
  Calendar,
  Eye,
  ChevronLeft,
  ChevronRight,
  Settings,
} from 'lucide-react';

interface ProductAttribute {
  attribute_key: string;
  attribute_value: string;
  language_code: string | null;
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
  images: string[] | null;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown> | null;
  delivery_fee: number;
  // Translation fields
  name_en: string | null;
  name_fa: string | null;
  name_ps: string | null;
  description_en: string | null;
  description_fa: string | null;
  description_ps: string | null;
  short_description_en: string | null;
  short_description_fa: string | null;
  short_description_ps: string | null;
}

const SellerProductView = () => {
  const { id } = useParams<{ id: string }>();
  const { isRTL, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [attributes, setAttributes] = useState<ProductAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (id && user) {
      fetchProduct();
    }
  }, [id, user, language]);

  const fetchProduct = async () => {
    try {
      // Fetch product and attributes in parallel
      const [productResult, attributesResult] = await Promise.all([
        supabase
          .from('products_with_translations')
          .select('*')
          .eq('id', id)
          .eq('seller_id', user?.id)
          .single(),
        supabase
          .from('product_attributes')
          .select('attribute_key, attribute_value, language_code')
          .eq('product_id', id!)
          .order('sort_order')
      ]);

      if (productResult.error) throw productResult.error;

      if (!productResult.data) {
        toast.error(isRTL ? 'محصول یافت نشد' : 'Product not found');
        navigate('/dashboard/seller/products');
        return;
      }

      setProduct(productResult.data as unknown as Product);
      setAttributes(attributesResult.data || []);
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(isRTL ? 'خطا در دریافت محصول' : 'Error fetching product');
      navigate('/dashboard/seller/products');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; labelFa: string }> = {
      draft: { variant: 'secondary', label: 'Draft', labelFa: 'پیش‌نویس' },
      pending: { variant: 'outline', label: 'Pending Review', labelFa: 'در انتظار بررسی' },
      active: { variant: 'default', label: 'Active', labelFa: 'فعال' },
      rejected: { variant: 'destructive', label: 'Rejected', labelFa: 'رد شده' },
    };

    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Badge variant={config.variant} className="text-sm">
        {isRTL ? config.labelFa : config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const metadata = product?.metadata || {};
  const productImages = product?.images || [];
  const videoUrl = metadata.videoUrl as string | undefined;

  // Build gallery items: video first (if exists), then images
  type GalleryItem = { type: 'video'; url: string } | { type: 'image'; url: string };
  const galleryItems: GalleryItem[] = [];
  if (videoUrl) {
    galleryItems.push({ type: 'video', url: videoUrl });
  }
  productImages.forEach((img) => {
    galleryItems.push({ type: 'image', url: img });
  });

  const nextImage = () => {
    if (galleryItems.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length);
    }
  };

  const prevImage = () => {
    if (galleryItems.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title={isRTL ? 'مشاهده محصول' : 'View Product'}
        description=""
        allowedRoles={['seller']}
      >
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) return null;

  return (
    <DashboardLayout
      title={isRTL ? 'مشاهده محصول' : 'View Product'}
      description=""
      allowedRoles={['seller']}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className={cn(
          "flex flex-col sm:flex-row gap-4 justify-between",
          isRTL && "sm:flex-row-reverse"
        )}>
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/seller/products')}
            className="gap-2 w-fit"
          >
            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isRTL ? 'بازگشت به محصولات' : 'Back to Products'}
          </Button>
          <Button
            onClick={() => navigate(`/dashboard/seller/products/edit/${product.id}`)}
            className="gap-2 w-fit"
          >
            <Edit className="h-4 w-4" />
            {isRTL ? 'ویرایش محصول' : 'Edit Product'}
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image/Video Gallery */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {galleryItems.length > 0 ? (
                  <>
                    {galleryItems[currentImageIndex]?.type === 'video' ? (
                      <video
                        controls
                        autoPlay
                        className="w-full h-full object-contain bg-black"
                        poster={productImages[0]}
                      >
                        <source src={galleryItems[currentImageIndex].url} type="video/mp4" />
                        {isRTL ? 'مرورگر شما از ویدیو پشتیبانی نمی‌کند.' : 'Your browser does not support the video tag.'}
                      </video>
                    ) : (
                      <img
                        src={galleryItems[currentImageIndex]?.url || '/placeholder.svg'}
                        alt={getLocalizedProductName(product, language)}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {galleryItems.length > 1 && (
                      <>
                        <Button
                          variant="secondary"
                          size="icon"
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 rounded-full shadow-lg",
                            isRTL ? "right-3" : "left-3"
                          )}
                          onClick={prevImage}
                        >
                          {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className={cn(
                            "absolute top-1/2 -translate-y-1/2 rounded-full shadow-lg",
                            isRTL ? "left-3" : "right-3"
                          )}
                          onClick={nextImage}
                        >
                          {isRTL ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                        </Button>
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm">
                          {currentImageIndex + 1} / {galleryItems.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnails */}
            {galleryItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {galleryItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all relative",
                      currentImageIndex === index
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-transparent hover:border-muted-foreground/30"
                    )}
                  >
                    {item.type === 'video' ? (
                      <>
                        <img 
                          src={productImages[0] || '/placeholder.svg'} 
                          alt="" 
                          className="w-full h-full object-cover opacity-70" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Video className="h-6 w-6 text-white" />
                        </div>
                      </>
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Technical Specifications & Brand - under media */}
            <ProductSpecsDisplay metadata={product.metadata} attributes={attributes} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title & Status */}
            <div>
              <div className="flex items-start gap-3 flex-wrap mb-3">
                {getStatusBadge(product.status)}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{getLocalizedProductName(product, language)}</h1>
              {getLocalizedShortDescription(product, language) && (
                <p className="text-muted-foreground">{getLocalizedShortDescription(product, language)}</p>
              )}
            </div>

            <Separator />

            {/* Pricing */}
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardHeader className="p-0 pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  {isRTL ? 'قیمت' : 'Pricing'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-3">
                {/* Primary Price in AFN */}
                <div className={cn("flex items-baseline gap-3 flex-wrap", isRTL && "flex-row-reverse")}>
                  {product.compare_price_afn && product.compare_price_afn !== product.price_afn ? (
                    <>
                      {/* Original price (the higher one) lined through */}
                      <span className="text-lg text-muted-foreground line-through">
                        {formatCurrency(Math.max(product.compare_price_afn, product.price_afn), 'AFN', isRTL)}
                      </span>
                      {/* Discounted price (the lower one) bold in orange */}
                      <span className="text-2xl font-bold text-orange">
                        {formatCurrency(Math.min(product.compare_price_afn, product.price_afn), 'AFN', isRTL)}
                      </span>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        {Math.round((Math.abs(product.compare_price_afn - product.price_afn) / Math.max(product.compare_price_afn, product.price_afn)) * 100)}% {isRTL ? 'تخفیف' : 'OFF'}
                      </Badge>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">
                      {formatCurrency(product.price_afn, 'AFN', isRTL)}
                    </span>
                  )}
                </div>

                <Separator className="my-2" />

                {/* Delivery Fee */}
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'هزینه ارسال:' : 'Delivery Fee:'}
                  </span>
                  <span className="font-semibold">
                    {product.delivery_fee > 0 
                      ? formatCurrency(product.delivery_fee, 'AFN', isRTL)
                      : (isRTL ? 'رایگان' : 'Free')
                    }
                  </span>
                </div>

                <div className="text-xs text-muted-foreground">
                  {isRTL ? 'واحد پول اصلی:' : 'Primary currency:'} AFN
                </div>
              </CardContent>
            </Card>

            {/* Stock & SKU */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'موجودی' : 'Stock'}
                  </span>
                </div>
                <p className={cn(
                  "text-2xl font-bold",
                  product.quantity <= 0 && "text-destructive"
                )}>
                  {product.quantity}
                </p>
              </Card>

              {product.sku && (
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">SKU</span>
                  </div>
                  <p className="text-sm font-mono font-semibold">{product.sku}</p>
                </Card>
              )}
            </div>

            {/* Category */}
            {(metadata.categoryName || metadata.subCategoryName) && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Folder className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'دسته‌بندی' : 'Category'}
                  </span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {metadata.categoryName && (
                    <Badge variant="secondary">{metadata.categoryName as string}</Badge>
                  )}
                  {metadata.subCategoryName && (
                    <Badge variant="outline">{metadata.subCategoryName as string}</Badge>
                  )}
                </div>
              </Card>
            )}

            {/* Brand */}
            {metadata.brand && (
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'برند' : 'Brand'}
                  </span>
                </div>
                <p className="font-semibold">{metadata.brand as string}</p>
              </Card>
            )}

            {/* Dates */}
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'تاریخ‌ها' : 'Dates'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">{isRTL ? 'ایجاد شده' : 'Created'}</p>
                  <p className="font-medium">{formatDate(product.created_at)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{isRTL ? 'بروزرسانی' : 'Updated'}</p>
                  <p className="font-medium">{formatDate(product.updated_at)}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Product Content & Translations */}
        <ProductContentDisplay product={product} attributes={attributes} />

        {/* Actions */}
        <div className={cn(
          "flex gap-4 pt-4",
          isRTL && "flex-row-reverse"
        )}>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/seller/products')}
            className="gap-2"
          >
            {isRTL ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isRTL ? 'بازگشت' : 'Back'}
          </Button>
          <Button
            onClick={() => navigate(`/dashboard/seller/products/edit/${product.id}`)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            {isRTL ? 'ویرایش' : 'Edit'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => window.open(`/products/${product.slug}`, '_blank')}
            className="gap-2"
          >
            <Eye className="h-4 w-4" />
            {isRTL ? 'مشاهده در فروشگاه' : 'View in Store'}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerProductView;
