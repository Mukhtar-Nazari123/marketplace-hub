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
import { ShoppingCart, Trash2, Plus, Minus, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { useEffect } from 'react';

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

  const subtotal = items.reduce((sum, item) => {
    return sum + (item.product?.price || 0) * item.quantity;
  }, 0);

  const shippingCost = subtotal > 0 ? 50 : 0;
  const total = subtotal + shippingCost;

  const texts = {
    title: isRTL ? 'سبد خرید' : 'Shopping Cart',
    empty: isRTL ? 'سبد خرید شما خالی است' : 'Your cart is empty',
    continueShopping: isRTL ? 'ادامه خرید' : 'Continue Shopping',
    product: isRTL ? 'محصول' : 'Product',
    price: isRTL ? 'قیمت' : 'Price',
    quantity: isRTL ? 'تعداد' : 'Quantity',
    total: isRTL ? 'جمع' : 'Total',
    subtotal: isRTL ? 'جمع جزئی' : 'Subtotal',
    shipping: isRTL ? 'هزینه ارسال' : 'Shipping',
    orderTotal: isRTL ? 'جمع کل' : 'Order Total',
    checkout: isRTL ? 'تکمیل خرید' : 'Checkout',
    clearCart: isRTL ? 'پاک کردن سبد' : 'Clear Cart',
    currency: isRTL ? 'افغانی' : 'AFN',
    loading: isRTL ? 'در حال بارگذاری...' : 'Loading...',
    outOfStock: isRTL ? 'ناموجود' : 'Out of Stock',
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
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ShoppingBag size={32} />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground line-clamp-2 mb-1">
                          {item.product?.name || 'Product'}
                        </h3>
                        <p className="text-primary font-bold">
                          {item.product?.price?.toLocaleString() || 0} {texts.currency}
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
                            disabled={item.product?.quantity !== undefined && item.quantity >= item.product.quantity}
                          >
                            <Plus size={14} />
                          </Button>
                        </div>

                        {item.product?.quantity !== undefined && item.quantity >= item.product.quantity && (
                          <p className="text-xs text-destructive mt-1">
                            {isRTL ? 'حداکثر موجودی' : 'Max stock reached'}
                          </p>
                        )}
                      </div>

                      {/* Item Total & Remove */}
                      <div className="flex flex-col items-end justify-between">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeFromCart(item.product_id)}
                        >
                          <Trash2 size={18} />
                        </Button>
                        <p className="font-bold text-foreground">
                          {((item.product?.price || 0) * item.quantity).toLocaleString()} {texts.currency}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" onClick={clearCart} className="gap-2">
                <Trash2 size={16} />
                {texts.clearCart}
              </Button>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>{isRTL ? 'خلاصه سفارش' : 'Order Summary'}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{texts.subtotal}</span>
                    <span className="font-medium">{subtotal.toLocaleString()} {texts.currency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{texts.shipping}</span>
                    <span className="font-medium">{shippingCost.toLocaleString()} {texts.currency}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>{texts.orderTotal}</span>
                    <span className="text-primary">{total.toLocaleString()} {texts.currency}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="cyan" size="lg">
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