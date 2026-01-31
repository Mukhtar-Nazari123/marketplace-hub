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
  const { t, isRTL } = useLanguage();
  const { items, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, role, loading: authLoading } = useAuth();
  const { convertToUSD, rate } = useCurrencyRate();
  const navigate = useNavigate();

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
    title: isRTL ? 'سبد خرید' : 'Shopping Cart',
    empty: isRTL ? 'سبد خرید شما خالی است' : 'Your cart is empty',
    continueShopping: isRTL ? 'ادامه خرید' : 'Continue Shopping',
    product: isRTL ? 'محصول' : 'Product',
    price: isRTL ? 'قیمت' : 'Price',
    quantity: isRTL ? 'تعداد' : 'Quantity',
    total: isRTL ? 'جمع' : 'Total',
    subtotal: isRTL ? 'جمع جزئی' : 'Subtotal',
    shipping: isRTL ? 'هزینه ارسال' : 'Delivery Fee',
    orderTotal: isRTL ? 'جمع کل' : 'Order Total',
    checkout: isRTL ? 'تکمیل خرید' : 'Checkout',
    clearCart: isRTL ? 'پاک کردن سبد' : 'Clear Cart',
    loading: isRTL ? 'در حال بارگذاری...' : 'Loading...',
    outOfStock: isRTL ? 'ناموجود' : 'Out of Stock',
    viewDetails: isRTL ? 'مشاهده جزئیات' : 'View Details',
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
              ({items.length} {isRTL ? 'محصول' : 'items'})
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
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <Link 
                          to={`/products/${productSlug}`}
                          className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                          {product?.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ShoppingBag size={32} />
                            </div>
                          )}
                        </Link>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <Link 
                            to={`/products/${productSlug}`}
                            className="font-medium text-foreground line-clamp-2 mb-1 hover:text-primary transition-colors"
                          >
                            {product?.name || 'Product'}
                          </Link>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-primary font-bold">
                              {item.effectivePrice?.toLocaleString() || 0} {item.currencySymbol}
                            </p>
                            {item.hasDiscount && item.originalPrice && (
                              <p className="text-muted-foreground text-sm line-through">
                                {item.originalPrice.toLocaleString()} {item.currencySymbol}
                              </p>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {item.currency}
                            </Badge>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (val >= 1) updateQuantity(item.product_id, val);
                              }}
                              className="w-16 h-8 text-center"
                              min={1}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                              disabled={product?.quantity !== undefined && item.quantity >= product.quantity}
                            >
                              <Plus size={14} />
                            </Button>
                          </div>

                          {product?.quantity !== undefined && item.quantity >= product.quantity && (
                            <p className="text-xs text-destructive mt-1">
                              {isRTL ? 'حداکثر موجودی' : 'Max stock reached'}
                            </p>
                          )}
                        </div>

                        {/* Item Total & Actions */}
                        <div className="flex flex-col items-end justify-between">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-primary hover:text-primary hover:bg-primary/10"
                              onClick={() => navigate(`/products/${productSlug}`)}
                              title={texts.viewDetails}
                            >
                              <Eye size={18} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromCart(item.product_id)}
                            >
                              <Trash2 size={18} />
                            </Button>
                          </div>
                          <p className="font-bold text-foreground">
                            {item.itemTotal.toLocaleString()} {item.currencySymbol}
                          </p>
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
                  <CardTitle>{isRTL ? 'خلاصه سفارش' : 'Order Summary'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Product totals per currency */}
                  {currencyTotals.map((currencyData) => (
                    <div key={currencyData.currency} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{currencyData.currency}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {isRTL ? 'محصولات' : 'Products'}
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
                          <Badge variant="outline" className="text-success">{isRTL ? 'رایگان' : 'Free'}</Badge>
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
                      {isRTL 
                        ? 'توجه: سبد خرید شامل محصولات با ارز متفاوت است' 
                        : 'Note: Cart contains items in different currencies'}
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