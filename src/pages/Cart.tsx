import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { ShoppingCart, Trash2, Plus, Minus, ChevronLeft, ChevronRight, ShoppingBag, Eye } from 'lucide-react';
import { useEffect } from 'react';

interface CartItemProduct {
  id: string;
  name: string;
  price: number;
  images: string[] | null;
  quantity: number;
  slug?: string;
  seller_id?: string;
  delivery_fee?: number;
  metadata?: {
    currency?: string;
    [key: string]: unknown;
  } | null;
}

const Cart = () => {
  const { t, isRTL } = useLanguage();
  const { items, loading, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: '/cart' } });
    } else if (!authLoading && role !== 'buyer') {
      navigate('/');
    }
  }, [user, role, authLoading, navigate]);

  const getCurrencySymbol = (product: CartItemProduct | undefined) => {
    const currency = product?.metadata?.currency || 'AFN';
    if (currency === 'USD') return '$';
    return isRTL ? '؋' : 'AFN';
  };

  // Calculate totals - group by currency and seller
  const itemsWithCurrency = items.map(item => {
    const product = item.product as CartItemProduct | undefined;
    const currency = product?.metadata?.currency || 'AFN';
    return {
      ...item,
      currency,
      currencySymbol: getCurrencySymbol(product),
      itemTotal: (product?.price || 0) * item.quantity,
      sellerId: product?.seller_id || 'unknown',
      deliveryFee: product?.delivery_fee || 0,
    };
  });

  // Group items by seller for breakdown
  const sellerGroups: Record<string, {
    name: string;
    items: typeof itemsWithCurrency;
    productSubtotal: number;
    deliveryFee: number;
    currency: string;
  }> = {};

  itemsWithCurrency.forEach(item => {
    if (!sellerGroups[item.sellerId]) {
      sellerGroups[item.sellerId] = {
        name: isRTL ? 'فروشنده' : 'Seller',
        items: [],
        productSubtotal: 0,
        deliveryFee: item.deliveryFee,
        currency: item.currency,
      };
    }
    sellerGroups[item.sellerId].items.push(item);
    sellerGroups[item.sellerId].productSubtotal += item.itemTotal;
  });

  // Group totals by currency
  const totalsByCurrency: Record<string, number> = {};
  itemsWithCurrency.forEach(item => {
    const key = item.currency;
    totalsByCurrency[key] = (totalsByCurrency[key] || 0) + item.itemTotal;
  });

  // Total delivery fee per currency (sum of unique seller fees)
  const deliveryFeesByCurrency: Record<string, number> = {};
  Object.values(sellerGroups).forEach(({ deliveryFee, currency }) => {
    deliveryFeesByCurrency[currency] = (deliveryFeesByCurrency[currency] || 0) + deliveryFee;
  });

  const primaryCurrency = Object.keys(totalsByCurrency)[0] || 'AFN';
  const subtotal = totalsByCurrency[primaryCurrency] || 0;
  const deliveryTotal = deliveryFeesByCurrency[primaryCurrency] || 0;
  const total = subtotal + deliveryTotal;
  const primarySymbol = primaryCurrency === 'USD' ? '$' : (isRTL ? '؋' : 'AFN ');

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
        <TopBar />
        <Header />
        <Navigation />
        <div className="container mx-auto px-4 py-12 flex justify-center">
          <div className="animate-pulse text-muted-foreground">{texts.loading}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Header />
      <Navigation />

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
              {itemsWithCurrency.map((item) => {
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
                          <p className="text-primary font-bold">
                            {product?.price?.toLocaleString() || 0} {item.currencySymbol}
                          </p>

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

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>{isRTL ? 'خلاصه سفارش' : 'Order Summary'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Show totals per currency if mixed */}
                  {Object.keys(totalsByCurrency).length > 1 ? (
                    <>
                      {Object.entries(totalsByCurrency).map(([currency, amount]) => {
                        const symbol = currency === 'USD' ? '$' : (isRTL ? '؋' : 'AFN ');
                        return (
                          <div key={currency} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {texts.subtotal} ({currency})
                            </span>
                            <span className="font-medium">{amount.toLocaleString()} {symbol}</span>
                          </div>
                        );
                      })}
                      <p className="text-xs text-muted-foreground">
                        {isRTL 
                          ? 'توجه: سبد خرید شامل محصولات با ارز متفاوت است' 
                          : 'Note: Cart contains items in different currencies'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{texts.subtotal}</span>
                        <span className="font-medium">{subtotal.toLocaleString()} {primarySymbol}</span>
                      </div>
                      
                      {/* Delivery fee breakdown per seller */}
                      {Object.entries(sellerGroups).map(([sellerId, group]) => (
                        <div key={sellerId} className="flex justify-between text-sm text-muted-foreground">
                          <span>{texts.shipping} ({group.name})</span>
                          <span>{group.deliveryFee.toLocaleString()} {primarySymbol}</span>
                        </div>
                      ))}
                      
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>{texts.orderTotal}</span>
                        <span className="text-primary">{total.toLocaleString()} {primarySymbol}</span>
                      </div>
                    </>
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