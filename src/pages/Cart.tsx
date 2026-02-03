import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useCurrencyRate } from '@/hooks/useCurrencyRate';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import StickyNavbar from '@/components/layout/StickyNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Trash2, Plus, Minus, ChevronLeft, ChevronRight, ShoppingBag, Eye } from 'lucide-react';
import { useEffect } from 'react';

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
}

const Cart = () => {
  const { t, isRTL, language } = useLanguage();
  const { items, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, role, loading: authLoading } = useAuth();
  const { convertToUSD, rate } = useCurrencyRate();
  const navigate = useNavigate();

  // Trilingual label helper
  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

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

  // Calculate total delivery fees across all sellers (always in AFN)
  const totalDeliveryFeeAFN = (() => {
    const sellerDeliveryFees = new Map<string, number>();
    itemsWithDetails.forEach(item => {
      if (!sellerDeliveryFees.has(item.sellerId)) {
        sellerDeliveryFees.set(item.sellerId, item.deliveryFee);
      }
    });
    return Array.from(sellerDeliveryFees.values()).reduce((sum, fee) => sum + fee, 0);
  })();

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
      <div className="min-h-screen bg-background">
        {/* Auto-hide Sticky Navbar */}
        <StickyNavbar>
          <Header />
          <Navigation />
        </StickyNavbar>
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse text-muted-foreground">{texts.loading}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Auto-hide Sticky Navbar */}
      <StickyNavbar>
        <Header />
        <Navigation />
      </StickyNavbar>

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
          <Card className="text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg text-muted-foreground mb-4">{texts.empty}</p>
              <Button asChild variant="cyan">
                <Link to="/products">{texts.continueShopping}</Link>
              </Button>
            </CardContent>
          </Card>
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

                          {/* Price */}
                          <div className="flex flex-col gap-0.5 mt-1">
                            <div className="flex items-center gap-2 flex-wrap">
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
                          </div>

                          {/* Quantity & Total - Same row on mobile */}
                          <div className="flex items-center justify-between mt-2 gap-2">
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
                            
                            <p className="font-bold text-sm sm:text-base text-foreground whitespace-nowrap">
                              {item.itemTotal.toLocaleString()} {item.currencySymbol}
                            </p>
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
                  
                  {/* Delivery fees - always in AFN */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-primary/10">AFN</Badge>
                      <span className="text-xs text-muted-foreground">
                        {texts.shipping}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{texts.shipping}</span>
                      <span className="font-medium">
                        {totalDeliveryFeeAFN === 0 ? (
                          <Badge variant="outline" className="text-success">{getLabel('Free', 'رایگان', 'وړیا')}</Badge>
                        ) : (
                          `${totalDeliveryFeeAFN.toLocaleString()} ${afnSymbol}`
                        )}
                      </span>
                    </div>
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
      </div>

      <Footer />
    </div>
  );
};

export default Cart;