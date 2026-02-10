import { useState, useEffect, useMemo } from 'react';
import { ProductSpecsDisplay } from '@/components/products/ProductSpecsDisplay';
import { getQuantityUnitFromAttributes, getUnitLabel } from '@/lib/quantityUnits';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { getCategoryName } from '@/lib/localizedContent';
import { getLocalizedProductName, getLocalizedProductDescription, getLocalizedShortDescription } from '@/lib/localizedProduct';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useProductRating, useProductRatings } from '@/hooks/useProductRatings';
import { useCurrencyRate } from '@/hooks/useCurrencyRate';
import PublicLayout from '@/components/layout/PublicLayout';
import ProductCard from '@/components/home/ProductCard';
import ProductColorSwatches from '@/components/products/ProductColorSwatches';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { ProductReviews } from '@/components/reviews/ProductReviews';
import CompactRating from '@/components/ui/CompactRating';
import {
  Heart,
  ShoppingCart,
  Share2,
  Truck,
  Shield,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Check,
  Package,
  Store,
  Calendar,
  Tag,
  Play,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  name_en?: string | null;
  name_fa?: string | null;
  name_ps?: string | null;
  slug: string;
  description: string | null;
  description_en?: string | null;
  description_fa?: string | null;
  description_ps?: string | null;
  short_description_en?: string | null;
  short_description_fa?: string | null;
  short_description_ps?: string | null;
  price_afn: number;
  compare_price_afn: number | null;
  images: string[] | null;
  category_id: string | null;
  seller_id: string;
  status: string;
  quantity: number;
  sku: string | null;
  is_featured: boolean;
  created_at: string;
  delivery_fee: number;
  metadata: {
    brand?: string;
    shortDescription?: string;
    specifications?: Record<string, string>;
    stockPerSize?: Record<string, number>;
    videoUrl?: string;
    [key: string]: unknown;
  } | null;
  category?: {
    id: string;
    name: string;
    name_fa?: string | null;
    name_ps?: string | null;
    slug: string;
  } | null;
  seller?: {
    business_name: string | null;
    store_logo: string | null;
  } | null;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language, isRTL } = useLanguage();
  const { user, role } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Note: route param name is ":id" but it can contain either a UUID or a slug.
  const productIdOrSlug = id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [colorMedia, setColorMedia] = useState<{ color_value: string; url: string }[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [productAttributes, setProductAttributes] = useState<{ attribute_key: string; attribute_value: string; language_code: string | null }[]>([]);

  // Fetch product rating
  const { averageRating, reviewCount, refetch: refetchRating } = useProductRating(product?.id || '');
  
  // Currency conversion
  const { convertToUSD, rate } = useCurrencyRate();
  
  // Fetch related products ratings
  const relatedProductIds = useMemo(() => relatedProducts.map(p => p.id), [relatedProducts]);
  const { getRating: getRelatedRating } = useProductRatings(relatedProductIds);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productIdOrSlug) {
        setProduct(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Check if URL param is a UUID (product ID) or an actual slug
        const isUUID =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
            productIdOrSlug
          );

        let query = supabase
          .from('products_with_translations')
          .select(
            `
            *,
            category:categories(id, name, name_fa, slug)
          `
          )
          .eq('status', 'active');

        query = isUUID ? query.eq('id', productIdOrSlug) : query.eq('slug', productIdOrSlug);

        const { data, error } = await query.maybeSingle();

        if (error) throw error;
        if (!data) {
          setProduct(null);
          return;
        }

        // Seller verification data is protected by RLS; for buyers/anon this will safely return null.
        const { data: seller } = await supabase
          .from('seller_verifications')
          .select('business_name, store_logo')
          .eq('seller_id', data.seller_id)
          .maybeSingle();

        setProduct({ ...(data as any), seller: seller ?? null } as Product);

        // Fetch color-specific media
        const { data: colorMediaData } = await supabase
          .from('product_media')
          .select('color_value, url')
          .eq('product_id', data.id)
          .not('color_value', 'is', null)
          .order('sort_order');
        
        if (colorMediaData && colorMediaData.length > 0) {
          setColorMedia(colorMediaData.filter(m => m.color_value) as { color_value: string; url: string }[]);
        } else {
          setColorMedia([]);
        }
        setSelectedColor(null);

        // Fetch product attributes from normalized table
        const { data: attrsData } = await supabase
          .from('product_attributes')
          .select('attribute_key, attribute_value, language_code')
          .eq('product_id', data.id)
          .order('sort_order');
        setProductAttributes(attrsData || []);

        // Fetch related products
        if (data.category_id) {
          const { data: related } = await supabase
            .from('products_with_translations')
            .select(`
              *,
              category:categories(id, name, name_fa, slug)
            `)
            .eq('status', 'active')
            .eq('category_id', data.category_id)
            .neq('id', data.id)
            .limit(4);

          setRelatedProducts((related || []) as Product[]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productIdOrSlug, language]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${productIdOrSlug}` } });
      return;
    }
    if (role !== 'buyer') {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'فقط خریداران می‌توانند خرید کنند' : 'Only buyers can add to cart',
        variant: 'destructive',
      });
      return;
    }
    await addToCart(product!.id, quantity);
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${productIdOrSlug}` } });
      return;
    }
    if (role !== 'buyer') {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'فقط خریداران می‌توانند به لیست علاقه‌مندی اضافه کنند' : 'Only buyers can add to wishlist',
        variant: 'destructive',
      });
      return;
    }
    await toggleWishlist(product!.id);
  };

  const getCurrencySymbol = () => {
    return isRTL ? '؋' : 'AFN';
  };

  const getProductCurrency = () => {
    return 'AFN';
  };

  const getDiscount = () => {
    if (!product?.compare_price_afn || product.compare_price_afn <= product.price_afn) return 0;
    return Math.round(((product.compare_price_afn - product.price_afn) / product.compare_price_afn) * 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(isRTL ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!product) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{t.common.pageNotFound}</h1>
            <Link to="/">
              <Button variant="cyan">{t.common.backToHome}</Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const productImages = product.images?.length ? product.images : ['/placeholder.svg'];
  const videoUrl = product.metadata?.videoUrl;
  
  // Build gallery items: video first (if exists), then general images, then color images
  type GalleryItem = { type: 'video'; url: string } | { type: 'image'; url: string; colorValue?: string };
  const galleryItems: GalleryItem[] = [];
  if (videoUrl) {
    galleryItems.push({ type: 'video', url: videoUrl });
  }
  productImages.forEach((img) => {
    galleryItems.push({ type: 'image', url: img });
  });
  // Add color-specific images (avoid duplicates if already in general images)
  const generalImageUrls = new Set(productImages);
  colorMedia.forEach((cm) => {
    if (!generalImageUrls.has(cm.url)) {
      galleryItems.push({ type: 'image', url: cm.url, colorValue: cm.color_value });
    }
  });

  // Handle color swatch selection - find the color-specific image and update gallery
  const handleColorSelect = (colorValue: string) => {
    if (selectedColor === colorValue) {
      // Deselect and return to first general image
      setSelectedColor(null);
      setSelectedImage(0);
      return;
    }
    
    setSelectedColor(colorValue);
    
    // Find the color-specific image URL
    const colorItem = colorMedia.find(m => m.color_value === colorValue);
    if (colorItem) {
      // Find the index of this color image in the gallery
      const colorImageIndex = galleryItems.findIndex(
        item => item.type === 'image' && item.url === colorItem.url
      );
      if (colorImageIndex !== -1) {
        setSelectedImage(colorImageIndex);
      }
    }
  };
  
  const discount = getDiscount();
  const currencySymbol = getCurrencySymbol();
  const isNew = new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  // Localized content - resolved based on active language
  const localizedName = getLocalizedProductName(product, language);
  const localizedDescription = getLocalizedProductDescription(product, language);
  const localizedShortDescription = getLocalizedShortDescription(product, language) || product.metadata?.shortDescription || '';
  
  // Check if product has attributes from the normalized table
  const hasProductAttributes = productAttributes.length > 0;
  
  const stockPerSize = product.metadata?.stockPerSize || {};

  return (
    <PublicLayout>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm flex-wrap">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              {t.pages.home}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <Link to="/products" className="text-muted-foreground hover:text-primary">
              {t.pages.products}
            </Link>
            {product.category && (
              <>
                {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                <Link 
                  to={`/products?category=${product.category.slug}`} 
                  className="text-muted-foreground hover:text-primary"
                >
                  {getCategoryName(product.category, language)}
                </Link>
              </>
            )}
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <span className="text-primary">{localizedName}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Image/Video Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border">
              {galleryItems[selectedImage]?.type === 'video' ? (
                <video
                  controls
                  autoPlay
                  className="w-full h-full object-contain bg-black"
                  poster={productImages[0]}
                >
                  <source src={galleryItems[selectedImage].url} type="video/mp4" />
                  {isRTL ? 'مرورگر شما از ویدیو پشتیبانی نمی‌کند.' : 'Your browser does not support the video tag.'}
                </video>
              ) : (
                <img
                  src={galleryItems[selectedImage]?.url || productImages[0]}
                  alt={localizedName}
                  className="w-full h-full object-cover"
                />
              )}
              {discount > 0 && (
                <Badge variant="destructive" className="absolute top-4 left-4 text-lg px-3 py-1">
                  -{discount}%
                </Badge>
              )}
              {isNew && (
                <Badge className="absolute top-4 right-4 bg-green-500 text-white">
                  {isRTL ? 'جدید' : 'NEW'}
                </Badge>
              )}
              {product.is_featured && (
                <Badge className="absolute top-14 right-4 bg-orange-500 text-white">
                  {isRTL ? 'پرفروش' : 'HOT'}
                </Badge>
              )}
            </div>
            {galleryItems.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {galleryItems.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors relative ${
                      selectedImage === idx ? 'border-primary' : 'border-border'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <>
                        <img 
                          src={productImages[0]} 
                          alt="" 
                          className="w-full h-full object-cover opacity-70" 
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-6 w-6 text-white fill-white" />
                        </div>
                      </>
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
            
            {/* Color Swatches */}
            <ProductColorSwatches 
              colorMedia={colorMedia}
              selectedColor={selectedColor}
              onColorSelect={handleColorSelect}
            />
            
            {/* Size Stock (if available) - placed under colors */}
            {Object.keys(stockPerSize).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">{isRTL ? 'موجودی سایزها' : 'Size Availability'}</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stockPerSize).map(([size, stock]) => (
                    <Badge
                      key={size}
                      variant={Number(stock) > 0 ? 'outline' : 'secondary'}
                      className={Number(stock) > 0 ? 'border-primary' : 'opacity-50'}
                    >
                      {size}: {stock}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {localizedName}
            </h1>

            {/* Brand & Model - from product_attributes */}
            {(() => {
              const brandAttr = productAttributes.find(a => a.attribute_key === 'brand');
              const modelAttr = productAttributes.find(a => a.attribute_key === 'model');
              const brand = brandAttr?.attribute_value || product.metadata?.brand;
              const model = modelAttr?.attribute_value;
              if (!brand && !model) return null;
              return (
                <div className="flex flex-wrap items-center gap-3">
                  {brand && (
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
                      <Tag className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">{isRTL ? 'برند:' : 'Brand:'}</span>
                      <span className="font-semibold text-foreground">{String(brand)}</span>
                    </div>
                  )}
                  {model && (
                    <div className="flex items-center gap-2 bg-muted border border-border rounded-lg px-4 py-2">
                      <span className="text-sm text-muted-foreground">{isRTL ? 'مدل:' : 'Model:'}</span>
                      <span className="font-semibold text-foreground">{String(model)}</span>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Short Description */}
            {localizedShortDescription && (
              <p className="text-muted-foreground text-lg">
                {localizedShortDescription}
              </p>
            )}

            {/* Rating & Net Weight */}
            <div className="flex items-center gap-3 flex-wrap">
              <CompactRating rating={averageRating} reviewCount={reviewCount} size="md" />
              {(() => {
                const netWeightAttr = productAttributes.find(a => a.attribute_key === 'netWeight' && (a.language_code === language || a.language_code === null || a.language_code === 'en'));
                const weightUnitAttr = productAttributes.find(a => a.attribute_key === 'weightUnit' && (a.language_code === language || a.language_code === null || a.language_code === 'en'));
                const netWeight = netWeightAttr?.attribute_value;
                const weightUnit = weightUnitAttr?.attribute_value;
                if (!netWeight) return null;
                const unitLabel = weightUnit ? getUnitLabel(weightUnit, language as 'en' | 'fa' | 'ps') : '';
                return (
                  <span className="text-sm text-muted-foreground border border-border rounded-md px-2 py-0.5 flex items-center gap-1">
                    <Package className="w-3.5 h-3.5" />
                    {netWeight} {unitLabel}
                  </span>
                );
              })()}
            </div>

            {/* Price */}
            <div className="flex flex-col gap-2">
              {(() => {
                const currentPrice = product.price_afn;
                const comparePrice = product.compare_price_afn;
                const hasDiscount = comparePrice && comparePrice !== currentPrice;
                const originalPrice = hasDiscount ? Math.max(currentPrice, comparePrice) : null;
                const discountedPrice = hasDiscount ? Math.min(currentPrice, comparePrice) : currentPrice;
                const discountPercent = originalPrice ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0;
                const usdPrice = rate ? convertToUSD(discountedPrice) : null;
                
                return (
                  <>
                    <div className="flex items-center gap-4 flex-wrap">
                      {originalPrice && (
                        <span className="text-xl text-muted-foreground line-through">
                          {originalPrice.toLocaleString()} {getProductCurrency()}
                        </span>
                      )}
                      <span className="text-3xl font-bold text-primary">
                        {discountedPrice.toLocaleString()} {getProductCurrency()}
                      </span>
                      <Badge variant="outline" className="text-sm">
                        {getProductCurrency()}
                      </Badge>
                      {discountPercent > 0 && (
                        <Badge variant="destructive" className="text-sm">
                          {isRTL ? `${discountPercent}% تخفیف` : `${discountPercent}% OFF`}
                        </Badge>
                      )}
                    </div>
                    {/* USD Equivalent */}
                    {usdPrice !== null && (
                      <span className="text-sm text-muted-foreground">
                        ≈ ${usdPrice.toFixed(2)} USD
                      </span>
                    )}
                  </>
                );
              })()}
            </div>


            {/* Availability */}
            <div className="flex items-center gap-4 flex-wrap">
              {(() => {
                // Calculate total stock including size-based stock
                const sizeStockTotal = Object.values(stockPerSize).reduce((sum, v) => sum + Number(v), 0);
                const totalStock = product.quantity + sizeStockTotal;
                
                if (totalStock > 0) {
                  const qUnit = getUnitLabel(getQuantityUnitFromAttributes(productAttributes), language as 'en' | 'fa' | 'ps');
                  return (
                    <div className="flex items-center gap-2 text-green-600">
                      <Check size={20} />
                      <span className="font-medium">
                        {isRTL ? `موجود (${totalStock} ${qUnit})` : `In Stock (${totalStock} ${qUnit})`}
                      </span>
                    </div>
                  );
                }
                return (
                  <div className="flex items-center gap-2 text-destructive">
                    <Package size={20} />
                    <span className="font-medium">
                      {isRTL ? 'ناموجود' : 'Out of Stock'}
                    </span>
                  </div>
                );
              })()}
              {product.sku && (
                <span className="text-muted-foreground text-sm">
                  SKU: {product.sku}
                </span>
              )}
            </div>


            {/* Category & Brand */}
            <div className="flex flex-wrap gap-4 text-sm">
              {product.category && (
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{isRTL ? 'دسته‌بندی:' : 'Category:'}</span>
                  <Link 
                    to={`/products?category=${product.category.slug}`}
                    className="text-primary hover:underline"
                  >
                    {getCategoryName(product.category, language)}
                  </Link>
                </div>
              )}
              {product.metadata?.brand && (
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-muted-foreground" />
                  <span className="text-muted-foreground">{isRTL ? 'برند:' : 'Brand:'}</span>
                  <span className="font-medium">{product.metadata.brand}</span>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            {(product.quantity > 0 || Object.values(stockPerSize).some(v => Number(v) > 0)) && (
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    className="p-3 hover:bg-muted transition-colors"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <Minus size={18} />
                  </button>
                  <span className="px-6 font-medium">{quantity}</span>
                  <button
                    className="p-3 hover:bg-muted transition-colors"
                    onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))}
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <Button 
                  variant="cyan" 
                  size="lg" 
                  className="flex-1 gap-2"
                  onClick={handleAddToCart}
                  disabled={isInCart(product.id)}
                >
                  <ShoppingCart size={20} />
                  {isInCart(product.id) 
                    ? (isRTL ? 'در سبد خرید' : 'In Cart') 
                    : (isRTL ? 'افزودن به سبد' : 'Add to Cart')
                  }
                </Button>
                <Button 
                  variant={isInWishlist(product.id) ? 'default' : 'outline'} 
                  size="lg"
                  onClick={handleToggleWishlist}
                  className={isInWishlist(product.id) ? 'bg-red-500 hover:bg-red-600' : ''}
                >
                  <Heart size={20} fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 size={20} />
                </Button>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="text-primary" size={20} />
                <span>{isRTL ? 'ارسال رایگان' : 'Free Shipping'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="text-primary" size={20} />
                <span>{isRTL ? 'پرداخت امن' : 'Secure Payment'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <RotateCcw className="text-primary" size={20} />
                <span>{isRTL ? 'بازگشت آسان' : 'Easy Returns'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="text-primary" size={20} />
                <span>{isRTL ? 'ضمانت اصالت' : 'Guaranteed'}</span>
              </div>
            </div>

            {/* Seller Info */}
            {product.seller?.business_name && (
              <div className={`p-4 bg-muted/50 rounded-xl border border-border ${isRTL ? 'text-right' : 'text-left'}`}>
                <h4 className="font-medium mb-3">{isRTL ? 'اطلاعات فروشنده' : 'Seller Information'}</h4>
                <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {product.seller.store_logo ? (
                    <img
                      src={product.seller.store_logo}
                      alt={product.seller.business_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Store className="text-primary" size={24} />
                    </div>
                  )}
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="font-medium">{product.seller.business_name}</p>
                    <p className={`text-sm text-muted-foreground flex items-center gap-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Calendar size={14} />
                      {isRTL ? 'عضویت:' : 'Member since'} {formatDate(product.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs - default to specifications if no description but specs exist */}
        <Tabs 
          defaultValue={
            !localizedDescription && hasProductAttributes
              ? "specifications"
              : "description"
          } 
          className="mb-12"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          <TabsList className={`w-full flex border-b rounded-none bg-transparent h-auto p-0 flex-wrap ${isRTL ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
            <TabsTrigger
              value="description"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {isRTL ? 'توضیحات' : 'Description'}
            </TabsTrigger>
            {hasProductAttributes && (
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                {isRTL ? 'مشخصات' : 'Specifications'}
              </TabsTrigger>
            )}
            <TabsTrigger
              value="reviews"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              {isRTL ? 'نظرات' : 'Reviews'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className={`pt-6 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              {localizedDescription ? (
                <p className="leading-relaxed whitespace-pre-wrap">{localizedDescription}</p>
              ) : (
                <p className="italic">{isRTL ? 'توضیحاتی وارد نشده است' : 'No description available'}</p>
              )}
            </div>
          </TabsContent>

          {hasProductAttributes && (
            <TabsContent value="specifications" className="pt-6">
              <ProductSpecsDisplay metadata={product.metadata} attributes={productAttributes} />
            </TabsContent>
          )}

          <TabsContent value="reviews" className="pt-6">
            <ProductReviews productId={product.id} />
          </TabsContent>
        </Tabs>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              {isRTL ? 'محصولات مرتبط' : 'Related Products'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
              {relatedProducts.map((p, index) => {
                const pCurrency = 'AFN' as const;
                const hasDiscount = p.compare_price_afn && p.compare_price_afn !== p.price_afn;
                let originalPrice: number | undefined;
                let currentPrice = p.price_afn;
                let discountPercent: number | undefined;

                if (hasDiscount) {
                  if (p.compare_price_afn! > p.price_afn) {
                    originalPrice = p.compare_price_afn!;
                    currentPrice = p.price_afn;
                  } else {
                    originalPrice = p.price_afn;
                    currentPrice = p.compare_price_afn!;
                  }
                  discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
                }

                const pIsNew = new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const { averageRating: pRating, reviewCount: pReviews } = getRelatedRating(p.id);

                return (
                  <div
                    key={p.id}
                    className="opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${Math.min(index, 5) * 50}ms`, animationFillMode: 'forwards' }}
                  >
                    <ProductCard
                      id={p.id}
                      name={getLocalizedProductName(p, language)}
                      price={currentPrice}
                      originalPrice={originalPrice}
                      rating={pRating}
                      reviews={pReviews}
                      isNew={pIsNew}
                      isHot={p.is_featured}
                      discount={discountPercent}
                      image={p.images?.[0]}
                      currency={pCurrency}
                    />
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </PublicLayout>
  );
};

export default ProductDetail;