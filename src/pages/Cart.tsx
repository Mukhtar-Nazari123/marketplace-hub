import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCurrencyRate } from '@/hooks/useCurrencyRate';
import PublicLayout from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2, Plus, Minus, ChevronLeft, ChevronRight, ShoppingBag, Eye, Truck, Calendar } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { addHours, format } from 'date-fns';
import CartRecommendations from '@/components/cart/CartRecommendations';
import CartItemVariantSelector from '@/components/cart/CartItemVariantSelector';

interface CartItemProduct {
  id: string;
  name: string;
  price_afn: number;
  compare_price_afn: number | null;
  images: string[] | null;
  quantity: number;
  slug?: string;
  seller_id?: string;
  delivery_fee?: number;
  metadata?: {
    stockPerSize?: Record<string, number>;
    [key: string]: unknown;
  } | null;
}

interface DeliveryOptionData {
  id: string;
  label_en: string;
  label_fa: string | null;
  label_ps: string | null;
  price_afn: number;
  delivery_hours: number;
  product_id: string;
}

const Cart = () => {
  const { t, isRTL, language } = useLanguage();
  const { items, loading, removeFromCart, updateQuantity, updateVariants, updateDeliveryOption, clearCart } = useCart();
  const { user, role, loading: authLoading } = useAuth();
  const { convertToUSD, rate } = useCurrencyRate();
  const navigate = useNavigate();
  const [deliveryOptionsMap, setDeliveryOptionsMap] = useState<Record<string, DeliveryOptionData>>({});

  // Trilingual label helper
  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  const getDeliveryLabel = (option: DeliveryOptionData) => {
    if (language === 'ps' && option.label_ps) return option.label_ps;
    if (language === 'fa' && option.label_fa) return option.label_fa;
    return option.label_en;
  };

  // Fetch delivery options for selected items
  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      const optionIds = items
        .map(item => item.selected_delivery_option_id)
        .filter(Boolean) as string[];
      
      if (optionIds.length === 0) return;

      const { data } = await supabase
        .from('delivery_options')
        .select('id, label_en, label_fa, label_ps, price_afn, delivery_hours, product_id')
        .in('id', optionIds);

      if (data) {
        const map: Record<string, DeliveryOptionData> = {};
        data.forEach(opt => { map[opt.id] = opt; });
        setDeliveryOptionsMap(map);
      }
    };

    fetchDeliveryOptions();
  }, [items]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/cart' } });
    } else if (!authLoading && role !== 'buyer') {
      navigate('/');
    }
  }, [user, role, authLoading, navigate]);

  const getCurrencySymbol = () => {
    return isRTL ? '؋' : 'AFN ';
  };

  // AFN symbol for delivery (always AFN)
  const afnSymbol = isRTL ? '؋' : 'AFN ';

  // All prices are now in AFN - group by seller
  const itemsWithDetails = items.map(item => {
    const product = item.product as CartItemProduct | undefined;
    const currency = 'AFN';
    
    const priceValue = product?.price_afn || 0;
    const comparePrice = product?.compare_price_afn || null;
    const hasDiscount = comparePrice && comparePrice !== priceValue;
    const effectivePrice = hasDiscount ? Math.min(priceValue, comparePrice) : priceValue;
    const originalPrice = hasDiscount ? Math.max(priceValue, comparePrice) : null;
    
    return {
      ...item,
      currency,
      currencySymbol: getCurrencySymbol(),
      originalPrice,
      effectivePrice,
      itemTotal: effectivePrice * item.quantity,
      sellerId: product?.seller_id || 'unknown',
      deliveryFee: product?.delivery_fee || 0,
      hasDiscount,
    };
  });

  // Group items by currency
  const itemsByCurrency: Record<string, typeof itemsWithDetails> = {};
  itemsWithDetails.forEach(item => {
    if (!itemsByCurrency[item.currency]) {
      itemsByCurrency[item.currency] = [];
    }
    itemsByCurrency[item.currency].push(item);
  });

  // Calculate totals per currency (grouped by seller within each currency)
  // Delivery fees are always in AFN and calculated separately
  const currencyTotals = Object.entries(itemsByCurrency).map(([currency, currencyItems]) => {
    // Group by seller within this currency
    const sellerGroups: Record<string, {
      items: typeof currencyItems;
      productSubtotal: number;
      deliveryFee: number; // in AFN
    }> = {};

    currencyItems.forEach(item => {
      if (!sellerGroups[item.sellerId]) {
        sellerGroups[item.sellerId] = {
          items: [],
          productSubtotal: 0,
          deliveryFee: item.deliveryFee, // AFN
        };
      }
      sellerGroups[item.sellerId].items.push(item);
      sellerGroups[item.sellerId].productSubtotal += item.itemTotal;
    });

    const productSubtotal = currencyItems.reduce((sum, item) => sum + item.itemTotal, 0);

    return {
      currency,
      symbol: getCurrencySymbol(),
      productSubtotal,
      sellerGroups,
    };
  });

  // Calculate total delivery fees from selected delivery options (always in AFN)
  const selectedDeliveryDetails = useMemo(() => {
    const details: Array<{
      productId: string;
      productName: string;
      option: DeliveryOptionData;
    }> = [];
    
    items.forEach(item => {
      if (item.selected_delivery_option_id && deliveryOptionsMap[item.selected_delivery_option_id]) {
        details.push({
          productId: item.product_id,
          productName: item.product?.name || 'Product',
          option: deliveryOptionsMap[item.selected_delivery_option_id],
        });
      }
    });
    
    return details;
  }, [items, deliveryOptionsMap]);

  const totalDeliveryFeeAFN = useMemo(() => {
    return selectedDeliveryDetails.reduce((sum, d) => sum + d.option.price_afn, 0);
  }, [selectedDeliveryDetails]);

  // Helper to format hours
  const formatHours = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) return `${days}d`;
    return `${days}d ${remainingHours}h`;
  };

  // Helper to get delivery end date
  const getDeliveryEndDate = (hours: number) => {
    return format(addHours(new Date(), hours), 'MMM d, yyyy');
  };

  const texts = {
    title: getLabel('Shopping Cart', 'سبد خرید', 'د پېرود کارټ'),
    empty: getLabel('Your cart is empty', 'سبد خرید شما خالی است', 'ستاسو کارټ خالي دی'),
    continueShopping: getLabel('Continue Shopping', 'ادامه خرید', 'پېرود ته دوام ورکړئ'),
    product: getLabel('Product', 'محصول', 'محصول'),
    price: getLabel('Price', 'قیمت', 'بیه'),
    quantity: getLabel('Quantity', 'تعداد', 'مقدار'),
    total: getLabel('Total', 'جمع', 'مجموعه'),
    subtotal: getLabel('Subtotal', 'جمع جزئی', 'فرعي مجموعه'),
    shipping: getLabel('Delivery Fee', 'هزینه ارسال', 'د لیږد فیس'),
    orderTotal: getLabel('Order Total', 'جمع کل', 'د سفارش مجموعه'),
    checkout: getLabel('Checkout', 'تکمیل خرید', 'تادیه'),
    clearCart: getLabel('Clear Cart', 'پاک کردن سبد', 'کارټ پاک کړئ'),
    loading: getLabel('Loading...', 'در حال بارگذاری...', 'لوډ کیږي...'),
    outOfStock: getLabel('Out of Stock', 'ناموجود', 'شتون نلري'),
    viewDetails: getLabel('View Details', 'مشاهده جزئیات', 'توضیحات وګورئ'),
  };

  if (authLoading || loading) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse text-muted-foreground">{texts.loading}</div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              {t.pages.home}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <span className="text-primary">{texts.title}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          {texts.title}
          {items.length > 0 && (
            <span className="text-muted-foreground font-normal text-lg">
              ({items.length} {getLabel('items', 'محصول', 'توکي')})
            </span>
          )}
        </h1>

        {items.length === 0 ? (
          <>
            <Card className="text-center py-12">
              <CardContent>
                <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground mb-4">{texts.empty}</p>
                <Button asChild variant="cyan">
                  <Link to="/products">{texts.continueShopping}</Link>
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {itemsWithDetails.map((item) => {
                const product = item.product as CartItemProduct | undefined;
                const productSlug = product?.slug || product?.id || item.product_id;
                
                return (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex gap-3 sm:gap-4">
                        {/* Product Image */}
                        <Link 
                          to={`/products/${productSlug}`}
                          className="w-20 h-20 sm:w-24 sm:h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                          {product?.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ShoppingBag size={24} />
                            </div>
                          )}
                        </Link>

                        {/* Product Details - Full width on mobile */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <Link 
                              to={`/products/${productSlug}`}
                              className="font-medium text-sm sm:text-base text-foreground line-clamp-2 hover:text-primary transition-colors"
                            >
                              {product?.name || 'Product'}
                            </Link>
                            
                            {/* Action buttons - inline on mobile */}
                            <div className="flex gap-0.5 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 text-primary hover:text-primary hover:bg-primary/10"
                                onClick={() => navigate(`/products/${productSlug}`)}
                                title={texts.viewDetails}
                              >
                                <Eye size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeFromCart(item.product_id)}
                              >
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          </div>

                          {/* Variant Selectors (Color/Size) */}
                          <CartItemVariantSelector
                            productId={item.product_id}
                            selectedColor={item.selected_color}
                            selectedSize={item.selected_size}
                            selectedDeliveryOptionId={item.selected_delivery_option_id}
                            onColorChange={(color) => updateVariants(item.product_id, color, item.selected_size)}
                            onSizeChange={(size) => updateVariants(item.product_id, item.selected_color, size)}
                            onDeliveryOptionChange={(optionId) => updateDeliveryOption(item.product_id, optionId)}
                          />

                          {/* Price, Quantity & Total - right-aligned block */}
                          <div className="flex items-end sm:items-center justify-between mt-2 gap-2">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={12} />
                              </Button>
                              <Input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value);
                                  if (val >= 1) updateQuantity(item.product_id, val);
                                }}
                                className="w-12 sm:w-16 h-7 sm:h-8 text-center text-sm"
                                min={1}
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-7 w-7 sm:h-8 sm:w-8"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                disabled={product?.quantity !== undefined && item.quantity >= product.quantity}
                              >
                                <Plus size={12} />
                              </Button>
                            </div>

                            {/* Price & Total - stacked on right */}
                            <div className="flex flex-col items-end gap-0.5">
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                <p className="text-primary font-bold text-sm sm:text-base">
                                  {item.effectivePrice?.toLocaleString() || 0} {item.currencySymbol}
                                </p>
                                {item.hasDiscount && item.originalPrice && (
                                  <p className="text-muted-foreground text-xs line-through">
                                    {item.originalPrice.toLocaleString()} {item.currencySymbol}
                                  </p>
                                )}
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {item.currency}
                                </Badge>
                              </div>
                              {rate && (
                                <p className="text-[10px] sm:text-xs text-muted-foreground">
                                  ≈ ${convertToUSD(item.effectivePrice || 0).toFixed(2)} USD
                                </p>
                              )}
                              <p className="font-bold text-sm sm:text-base text-foreground whitespace-nowrap">
                                {item.itemTotal.toLocaleString()} {item.currencySymbol}
                              </p>
                            </div>
                          </div>

                          {product?.quantity !== undefined && item.quantity >= product.quantity && (
                            <p className="text-[10px] sm:text-xs text-destructive mt-1">
                              {getLabel('Max stock reached', 'حداکثر موجودی', 'اعظمي ذخیره ترلاسه شوه')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearCart} className="gap-2">
                  <Trash2 size={16} />
                  {texts.clearCart}
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/products">{texts.continueShopping}</Link>
                </Button>
              </div>
            </div>

            {/* Order Summary - Separate totals per currency */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>{getLabel('Order Summary', 'خلاصه سفارش', 'د سفارش لنډیز')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product totals per currency */}
                  {currencyTotals.map((currencyData) => (
                    <div key={currencyData.currency} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{currencyData.currency}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {getLabel('Products', 'محصولات', 'محصولات')}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{texts.subtotal}</span>
                        <span className="font-medium">
                          {currencyData.productSubtotal.toLocaleString()} {currencyData.symbol}
                        </span>
                      </div>
                      
                      {currencyTotals.length > 1 && <Separator />}
                    </div>
                  ))}
                  
                  {/* Delivery Options - with dates and details */}
                  <div className="space-y-3 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">
                        {getLabel('Delivery', 'ارسال', 'لیږد')}
                      </span>
                    </div>
                    
                    {selectedDeliveryDetails.length > 0 ? (
                      <div className="space-y-2">
                        {selectedDeliveryDetails.map((detail) => (
                          <div key={detail.productId} className="bg-muted/50 rounded-md p-2.5 space-y-1.5">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs text-muted-foreground line-clamp-1 flex-1">
                                {detail.productName}
                              </span>
                              <span className="text-xs font-medium text-primary whitespace-nowrap">
                                {detail.option.price_afn === 0 
                                  ? getLabel('Free', 'رایگان', 'وړیا')
                                  : `${detail.option.price_afn.toLocaleString()} ${afnSymbol}`
                                }
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-medium">{getDeliveryLabel(detail.option)}</span>
                              <span className="text-muted-foreground">•</span>
                              <span className="text-muted-foreground">{formatHours(detail.option.delivery_hours)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{format(new Date(), 'MMM d')}</span>
                              <span>→</span>
                              <span className="font-medium text-foreground">{getDeliveryEndDate(detail.option.delivery_hours)}</span>
                            </div>
                          </div>
                        ))}
                        
                        {/* Total delivery fee */}
                        <div className="flex justify-between text-sm pt-1">
                          <span className="text-muted-foreground">{getLabel('Total Delivery', 'مجموع ارسال', 'ټول لیږد')}</span>
                          <span className="font-medium">
                            {totalDeliveryFeeAFN === 0 ? (
                              <Badge variant="outline" className="text-success">{getLabel('Free', 'رایگان', 'وړیا')}</Badge>
                            ) : (
                              `${totalDeliveryFeeAFN.toLocaleString()} ${afnSymbol}`
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        {getLabel('Select delivery options for each item', 'گزینه‌های ارسال را برای هر محصول انتخاب کنید', 'د هر توکي لپاره د لیږد اختیارونه غوره کړئ')}
                      </p>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Order totals */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{texts.orderTotal}</p>
                    {currencyTotals.map((currencyData) => {
                      const totalWithDelivery = currencyData.productSubtotal + (currencyData.currency === 'AFN' ? totalDeliveryFeeAFN : 0);
                      const usdEquivalent = rate ? convertToUSD(totalWithDelivery) : null;
                      
                      return (
                        <div key={currencyData.currency} className="space-y-1">
                          <div className="flex justify-between font-bold">
                            <span>{currencyData.currency}</span>
                            <span className="text-primary">
                              {totalWithDelivery.toLocaleString()} {currencyData.symbol}
                            </span>
                          </div>
                          {usdEquivalent !== null && (
                            <div className="flex justify-end">
                              <span className="text-sm text-muted-foreground">
                                ≈ ${usdEquivalent.toFixed(2)} USD
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {totalDeliveryFeeAFN > 0 && currencyTotals.every(c => c.currency !== 'AFN') && (
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>+ {texts.shipping}</span>
                        <span>{totalDeliveryFeeAFN.toLocaleString()} {afnSymbol}</span>
                      </div>
                    )}
                  </div>
                  
                  {currencyTotals.length > 1 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      {getLabel(
                        'Note: Cart contains items in different currencies',
                        'توجه: سبد خرید شامل محصولات با ارز متفاوت است',
                        'یادونه: کارټ مختلفې اسعارو کې توکي لري'
                      )}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="cyan" size="lg" onClick={() => navigate('/checkout')}>
                    {texts.checkout}
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {/* Product Recommendations Section */}
        <CartRecommendations excludeProductIds={items.map(item => item.product_id)} />
      </div>
    </PublicLayout>
  );
};

export default Cart;