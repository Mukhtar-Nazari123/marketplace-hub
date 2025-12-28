import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import TopBar from '@/components/layout/TopBar';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Loader2,
  MapPin,
  Package,
  CreditCard,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Truck,
  RotateCcw,
  ShoppingBag,
  Banknote,
  Clock,
} from 'lucide-react';

interface AddressForm {
  name: string;
  phone: string;
  city: string;
  fullAddress: string;
}

interface SellerPolicy {
  sellerId: string;
  sellerName: string;
  returnPolicy: string | null;
  shippingPolicy: string | null;
}

interface CartItemWithDetails {
  id: string;
  product_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[] | null;
    seller_id: string;
    delivery_fee: number;
  };
}

const STEPS = [
  { id: 1, key: 'address', icon: MapPin },
  { id: 2, key: 'orderSummary', icon: Package },
  { id: 3, key: 'payment', icon: CreditCard },
  { id: 4, key: 'confirm', icon: CheckCircle },
];

const Checkout = () => {
  const { user, role, loading: authLoading } = useAuth();
  const { items: cartItems, clearCart, loading: cartLoading } = useCart();
  const { t, isRTL } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [addressForm, setAddressForm] = useState<AddressForm>({
    name: '',
    phone: '',
    city: '',
    fullAddress: '',
  });

  const [sellerPolicies, setSellerPolicies] = useState<SellerPolicy[]>([]);

  // Redirect checks
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/login');
      } else if (role && role !== 'buyer') {
        navigate('/');
      }
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0 && !authLoading && user) {
      navigate('/cart');
    }
  }, [cartItems, cartLoading, authLoading, user, navigate]);

  // Load profile data and seller policies
  useEffect(() => {
    const loadData = async () => {
      if (!user || cartItems.length === 0) return;

      try {
        // Load profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile) {
          setAddressForm((prev) => ({
            ...prev,
            name: profile.full_name || '',
          }));
        }

        // Get unique seller IDs from cart
        const sellerIds = [...new Set(cartItems.map((item) => item.product?.seller_id).filter(Boolean))] as string[];

        if (sellerIds.length > 0) {
          const { data: sellers } = await supabase
            .from('seller_verifications')
            .select('seller_id, business_name, return_policy, shipping_policy')
            .in('seller_id', sellerIds);

          if (sellers) {
            setSellerPolicies(
              sellers.map((s) => ({
                sellerId: s.seller_id,
                sellerName: s.business_name || 'Unknown Seller',
                returnPolicy: s.return_policy,
                shippingPolicy: s.shipping_policy,
              }))
            );
          }
        }
      } catch (error) {
        console.error('Error loading checkout data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!cartLoading && cartItems.length > 0) {
      loadData();
    } else if (!cartLoading) {
      setLoading(false);
    }
  }, [user, cartItems, cartLoading]);

  // Calculate totals
  const { subtotal, deliveryFees, total, sellerDeliveryBreakdown } = useMemo(() => {
    const itemsSubtotal = cartItems.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    // Calculate delivery fee per seller (charge once per seller)
    const sellerFees: Record<string, { fee: number; name: string }> = {};
    cartItems.forEach((item) => {
      const sellerId = item.product?.seller_id;
      const fee = item.product?.delivery_fee || 0;
      if (sellerId && !sellerFees[sellerId]) {
        const policy = sellerPolicies.find((p) => p.sellerId === sellerId);
        sellerFees[sellerId] = { fee, name: policy?.sellerName || 'Seller' };
      }
    });

    const totalDeliveryFees = Object.values(sellerFees).reduce((sum, s) => sum + s.fee, 0);

    return {
      subtotal: itemsSubtotal,
      deliveryFees: totalDeliveryFees,
      total: itemsSubtotal + totalDeliveryFees,
      sellerDeliveryBreakdown: Object.entries(sellerFees).map(([id, data]) => ({
        sellerId: id,
        sellerName: data.name,
        fee: data.fee,
      })),
    };
  }, [cartItems, sellerPolicies]);

  const validateAddress = () => {
    return addressForm.name && addressForm.phone && addressForm.city && addressForm.fullAddress;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateAddress()) {
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: t.checkout.errors.fillAllFields,
        variant: 'destructive',
      });
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    if (!user) return;

    setPlacingOrder(true);
    try {
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      // Prepare seller policies snapshot
      const policiesSnapshot = sellerPolicies.map((p) => ({
        seller_id: p.sellerId,
        seller_name: p.sellerName,
        return_policy: p.returnPolicy,
        shipping_policy: p.shippingPolicy,
      }));

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'pending',
          payment_method: 'cash_on_delivery',
          subtotal,
          shipping_cost: deliveryFees,
          discount: 0,
          tax: 0,
          total,
          shipping_address: { ...addressForm } as unknown as Json,
          billing_address: { ...addressForm } as unknown as Json,
          seller_policies: [...policiesSnapshot] as unknown as Json,
        }])
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product?.name || 'Product',
        product_image: item.product?.images?.[0] || null,
        quantity: item.quantity,
        unit_price: item.product?.price || 0,
        total_price: (item.product?.price || 0) * item.quantity,
        seller_id: item.product?.seller_id,
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await clearCart();

      toast({
        title: t.checkout.confirm.orderSuccess,
        description: t.checkout.confirm.orderSuccessDesc,
      });

      navigate('/dashboard/buyer/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: t.checkout.errors.orderFailed,
        variant: 'destructive',
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  if (authLoading || cartLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const ChevronBackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className={cn('min-h-screen flex flex-col bg-background', isRTL && 'rtl')}>
      <TopBar />
      <Header />
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <h1 className="text-2xl font-bold mb-8">{t.checkout.title}</h1>

          {/* Stepper */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className={cn('flex items-center justify-between', isRTL && 'flex-row-reverse')}>
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  const stepLabel = t.checkout.steps[step.key as keyof typeof t.checkout.steps];

                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all',
                            isActive && 'border-primary bg-primary text-primary-foreground',
                            isCompleted && 'border-primary bg-primary text-primary-foreground',
                            !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
                          )}
                        >
                          {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                        </div>
                        <span
                          className={cn(
                            'text-xs mt-2 text-center',
                            isActive && 'text-primary font-medium',
                            isCompleted && 'text-primary',
                            !isActive && !isCompleted && 'text-muted-foreground'
                          )}
                        >
                          {stepLabel}
                        </span>
                      </div>
                      {index < STEPS.length - 1 && (
                        <div
                          className={cn(
                            'w-12 sm:w-24 h-0.5 mx-2',
                            currentStep > step.id ? 'bg-primary' : 'bg-muted-foreground/30'
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step Content */}
          <Card>
            <CardContent className="pt-6">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      {t.checkout.address.title}
                    </CardTitle>
                  </CardHeader>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t.checkout.address.name} *</Label>
                      <Input
                        id="name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t.checkout.address.phone} *</Label>
                      <Input
                        id="phone"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="+93 7XX XXX XXX"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t.checkout.address.city} *</Label>
                      <Input
                        id="city"
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="fullAddress">{t.checkout.address.fullAddress} *</Label>
                      <Input
                        id="fullAddress"
                        value={addressForm.fullAddress}
                        onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                        dir={isRTL ? 'rtl' : 'ltr'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Order Summary */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      {t.checkout.orderSummary.title}
                    </CardTitle>
                  </CardHeader>

                  {/* Products */}
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {item.product?.images?.[0] ? (
                            <img
                              src={item.product.images[0]}
                              alt={item.product?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{item.product?.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {t.checkout.orderSummary.quantity}: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${(item.product?.price || 0) * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t.checkout.orderSummary.subtotal}</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {sellerDeliveryBreakdown.map((seller) => (
                      <div key={seller.sellerId} className="flex justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {t.checkout.orderSummary.deliveryFee} ({seller.sellerName})
                        </span>
                        <span>${seller.fee.toFixed(2)}</span>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>{t.checkout.orderSummary.total}</span>
                      <span className="text-primary">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Seller Policies */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      {t.checkout.orderSummary.sellerPolicies}
                    </h3>
                    {sellerPolicies.map((policy) => (
                      <div key={policy.sellerId} className="p-4 border rounded-lg space-y-3">
                        <Badge variant="secondary">{policy.sellerName}</Badge>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {t.checkout.orderSummary.returnPolicy}
                            </p>
                            <p className="text-sm mt-1">
                              {policy.returnPolicy || t.checkout.orderSummary.noPolicyProvided}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {t.checkout.orderSummary.shippingPolicy}
                            </p>
                            <p className="text-sm mt-1">
                              {policy.shippingPolicy || t.checkout.orderSummary.noPolicyProvided}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      {t.checkout.payment.title}
                    </CardTitle>
                  </CardHeader>

                  {/* Cash on Delivery */}
                  <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Banknote className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium">{t.checkout.payment.cashOnDelivery}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t.checkout.payment.cashOnDeliveryDesc}
                        </p>
                      </div>
                      <div className={cn('flex-shrink-0', isRTL ? 'mr-auto' : 'ml-auto')}>
                        <CheckCircle className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Online Payment Coming Soon */}
                  <div className="p-4 border rounded-lg bg-muted/30 opacity-60">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <Clock className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h4 className="font-medium text-muted-foreground">
                          {t.checkout.payment.onlinePaymentSoon}
                        </h4>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Confirm */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      {t.checkout.confirm.title}
                    </CardTitle>
                  </CardHeader>

                  <div className="p-6 border rounded-lg bg-muted/30 space-y-4">
                    <p className="text-center text-muted-foreground">{t.checkout.confirm.reviewOrder}</p>

                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.checkout.address.name}:</span>
                        <span className="font-medium">{addressForm.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.checkout.address.phone}:</span>
                        <span className="font-medium">{addressForm.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.checkout.address.city}:</span>
                        <span className="font-medium">{addressForm.city}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.checkout.address.fullAddress}:</span>
                        <span className="font-medium">{addressForm.fullAddress}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.checkout.payment.title}:</span>
                        <span className="font-medium">{t.checkout.payment.cashOnDelivery}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.checkout.orderSummary.subtotal}:</span>
                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.checkout.orderSummary.deliveryFee}:</span>
                        <span className="font-medium">${deliveryFees.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>{t.checkout.orderSummary.total}:</span>
                        <span className="text-primary">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handlePlaceOrder}
                    disabled={placingOrder}
                    className="w-full h-12 text-lg"
                    size="lg"
                  >
                    {placingOrder ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        {t.checkout.confirm.processing}
                      </>
                    ) : (
                      t.checkout.confirm.placeOrder
                    )}
                  </Button>
                </div>
              )}

              {/* Navigation Buttons */}
              {currentStep < 4 && (
                <div className={cn('flex justify-between mt-8', isRTL && 'flex-row-reverse')}>
                  {currentStep > 1 ? (
                    <Button variant="outline" onClick={handleBack}>
                      <ChevronBackIcon className="w-4 h-4 mr-1" />
                      {t.checkout.navigation.previous}
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={() => navigate('/cart')}>
                      <ChevronBackIcon className="w-4 h-4 mr-1" />
                      {t.checkout.navigation.backToCart}
                    </Button>
                  )}
                  <Button onClick={handleNext}>
                    {t.checkout.navigation.next}
                    <ChevronIcon className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
