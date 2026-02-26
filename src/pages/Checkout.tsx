import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useLanguage } from '@/lib/i18n';
import { useCurrencyRate } from '@/hooks/useCurrencyRate';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import PublicLayout from '@/components/layout/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { getColorByValue } from '@/lib/productColors';
import { addHours, format } from 'date-fns';
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
  Calendar,
  Palette,
  Ruler,
  Hash,
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
  selected_color: string | null;
  selected_size: string | null;
  selected_delivery_option_id: string | null;
  product: {
    id: string;
    name: string;
    price_afn: number;
    compare_price_afn?: number | null;
    images: string[] | null;
    seller_id: string;
    delivery_fee: number;
  };
}

interface DeliveryOptionDetails {
  id: string;
  label_en: string;
  label_fa: string | null;
  label_ps: string | null;
  price_afn: number;
  delivery_hours: number;
  shipping_type: string;
}

// Helper to get effective price (lower of price_afn and compare_price_afn)
const getEffectivePrice = (price: number, comparePrice?: number | null): number => {
  if (comparePrice && comparePrice !== price) {
    return Math.min(price, comparePrice);
  }
  return price;
};

interface SellerBreakdown {
  sellerId: string;
  sellerName: string;
  products: {
    name: string;
    quantity: number;
    price: number;
    selectedColor: string | null;
    selectedSize: string | null;
  }[];
  productSubtotal: number;
  deliveryFee: number; // Always in AFN
  sellerTotal: number;
}

interface CurrencyBreakdown {
  currency: string;
  symbol: string;
  sellers: SellerBreakdown[];
  productSubtotal: number;
}

// Total delivery in AFN (separate from product currency)
interface DeliveryBreakdown {
  totalDeliveryAFN: number;
  perItem: {
    productId: string;
    productName: string;
    sellerName: string;
    quantity: number;
    selectedColor: string | null;
    selectedSize: string | null;
    deliveryOption: DeliveryOptionDetails | null;
  }[];
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
  const { t, isRTL, language } = useLanguage();
  const { convertToUSD, rate } = useCurrencyRate();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Trilingual label helper
  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'stripe'>('cash_on_delivery');
  const [stripeLoading, setStripeLoading] = useState(false);

  const [addressForm, setAddressForm] = useState<AddressForm>({
    name: '',
    phone: '',
    city: '',
    fullAddress: '',
  });

  const [sellerPolicies, setSellerPolicies] = useState<SellerPolicy[]>([]);
  const [savedAddresses, setSavedAddresses] = useState<{ id: string; title: string; fullAddress: string; city: string; isDefault: boolean }[]>([]);
  const [deliveryOptionsMap, setDeliveryOptionsMap] = useState<Record<string, DeliveryOptionDetails>>({});
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
        // Load profile with phone and addresses
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone, addresses')
          .eq('user_id', user.id)
          .maybeSingle();

        if (profile) {
          const addresses = (profile.addresses as unknown as { id: string; title: string; fullAddress: string; city: string; isDefault: boolean }[]) || [];
          setSavedAddresses(addresses);
          
          // Find default address or first address
          const defaultAddress = addresses.find(a => a.isDefault) || addresses[0];
          
          setAddressForm((prev) => ({
            ...prev,
            name: profile.full_name || '',
            phone: profile.phone || '',
            city: defaultAddress?.city || '',
            fullAddress: defaultAddress?.fullAddress || '',
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

        // Fetch delivery options for cart items
        const deliveryOptionIds = cartItems
          .map((item) => item.selected_delivery_option_id)
          .filter(Boolean) as string[];

        if (deliveryOptionIds.length > 0) {
          const { data: deliveryOptions } = await supabase
            .from('delivery_options')
            .select('id, label_en, label_fa, label_ps, price_afn, delivery_hours, shipping_type')
            .in('id', deliveryOptionIds);

          if (deliveryOptions) {
            const optionsMap: Record<string, DeliveryOptionDetails> = {};
            deliveryOptions.forEach((opt) => {
              optionsMap[opt.id] = opt;
            });
            setDeliveryOptionsMap(optionsMap);
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

  // Currency symbol helper
  const getCurrencySymbol = (curr: string) => {
    if (curr === 'USD') return '$';
    return isRTL ? '؋' : 'AFN ';
  };

  // AFN symbol for delivery (always AFN)
  const afnSymbol = isRTL ? '؋' : 'AFN ';

  // Calculate totals grouped by currency, then by seller within each currency
  // Delivery fees are always in AFN and tracked separately
  const { currencyBreakdowns, deliveryBreakdown } = useMemo((): { currencyBreakdowns: CurrencyBreakdown[]; deliveryBreakdown: DeliveryBreakdown } => {
    // All products are now in AFN
    const itemsByCurrency: Record<string, typeof cartItems> = { 'AFN': [] };
    
    cartItems.forEach((item) => {
      itemsByCurrency['AFN'].push(item);
    });

    // Track delivery per item (using selected delivery options)
    const perItem: DeliveryBreakdown['perItem'] = [];

    // For each currency, group by seller
    const breakdowns = Object.entries(itemsByCurrency).map(([currency, currencyItems]) => {
      const sellerGroups: Record<string, {
        items: typeof currencyItems;
        policy: SellerPolicy | undefined;
      }> = {};

      currencyItems.forEach((item) => {
        const sellerId = item.product?.seller_id || 'unknown';
        if (!sellerGroups[sellerId]) {
          sellerGroups[sellerId] = {
            items: [],
            policy: sellerPolicies.find((p) => p.sellerId === sellerId),
          };
        }
        sellerGroups[sellerId].items.push(item);

        // Track delivery option per item
        const deliveryOption = item.selected_delivery_option_id 
          ? deliveryOptionsMap[item.selected_delivery_option_id] || null
          : null;
        const sellerName = sellerGroups[sellerId].policy?.sellerName || getLabel('Seller', 'فروشنده', 'پلورونکی');
        
        perItem.push({
          productId: item.product_id,
          productName: item.product?.name || 'Product',
          sellerName,
          quantity: item.quantity,
          selectedColor: item.selected_color,
          selectedSize: item.selected_size,
          deliveryOption,
        });
      });

      // Calculate breakdown per seller
      const sellers: SellerBreakdown[] = Object.entries(sellerGroups).map(([sellerId, group]) => {
        const products = group.items.map((item) => {
          const effectivePrice = getEffectivePrice(item.product?.price_afn || 0, item.product?.compare_price_afn);
          return {
            name: item.product?.name || 'Product',
            quantity: item.quantity,
            price: effectivePrice * item.quantity,
            selectedColor: item.selected_color || null,
            selectedSize: item.selected_size || null,
          };
        });

        const productSubtotal = products.reduce((sum, p) => sum + p.price, 0);
        
        // Get delivery fee from selected delivery options for this seller's items
        let deliveryFee = 0;
        group.items.forEach((item) => {
          if (item.selected_delivery_option_id && deliveryOptionsMap[item.selected_delivery_option_id]) {
            deliveryFee += deliveryOptionsMap[item.selected_delivery_option_id].price_afn;
          }
        });

        return {
          sellerId,
          sellerName: group.policy?.sellerName || getLabel('Seller', 'فروشنده', 'پلورونکی'),
          products,
          productSubtotal,
          deliveryFee, // in AFN
          sellerTotal: productSubtotal, // Only product total in this currency
        };
      });

      const productSubtotal = sellers.reduce((sum, s) => sum + s.productSubtotal, 0);

      return {
        currency,
        symbol: getCurrencySymbol(currency),
        sellers,
        productSubtotal,
      };
    });

    // Calculate total delivery in AFN from selected options
    const totalDeliveryAFN = perItem.reduce((sum, item) => sum + (item.deliveryOption?.price_afn || 0), 0);

    return {
      currencyBreakdowns: breakdowns,
      deliveryBreakdown: { totalDeliveryAFN, perItem },
    };
  }, [cartItems, sellerPolicies, isRTL, deliveryOptionsMap]);

  const validateAddress = () => {
    return addressForm.name && addressForm.phone && addressForm.city && addressForm.fullAddress;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateAddress()) {
      toast({
        title: getLabel('Error', 'خطا', 'تېروتنه'),
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

  const handleStripePayment = async () => {
    if (!user) return;
    setStripeLoading(true);
    try {
      const afnBreakdown = currencyBreakdowns.find(cb => cb.currency === 'AFN');
      const subtotalAFN = afnBreakdown?.productSubtotal || 0;
      const deliveryFeeAFN = deliveryBreakdown.totalDeliveryAFN;
      const totalAFN = subtotalAFN + deliveryFeeAFN;

      const items = cartItems.map((item) => {
        const effectivePrice = getEffectivePrice(item.product?.price_afn || 0, item.product?.compare_price_afn);
        return {
          name: item.product?.name || 'Product',
          quantity: item.quantity,
          priceAFN: effectivePrice,
          image: item.product?.images?.[0] || undefined,
          color: item.selected_color || undefined,
          size: item.selected_size || undefined,
        };
      });

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          items,
          addressForm,
          totalAFN,
          subtotalAFN,
          deliveryFeeAFN,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Error creating Stripe session:', error);
      toast({
        title: getLabel('Error', 'خطا', 'تېروتنه'),
        description: getLabel(
          'Failed to initialize online payment. Please try again.',
          'خطا در شروع پرداخت آنلاین. لطفاً دوباره تلاش کنید.',
          'د آنلاین تادیه پیل کولو کې تېروتنه. مهرباني وکړئ بیا هڅه وکړئ.'
        ),
        variant: 'destructive',
      });
    } finally {
      setStripeLoading(false);
    }
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

      // Calculate totals by currency
      const usdBreakdown = currencyBreakdowns.find(cb => cb.currency === 'USD');
      const afnBreakdown = currencyBreakdowns.find(cb => cb.currency === 'AFN');
      
      const subtotalUSD = usdBreakdown?.productSubtotal || 0;
      const subtotalAFN = afnBreakdown?.productSubtotal || 0;
      const deliveryFeeAFN = deliveryBreakdown.totalDeliveryAFN;
      
      // USD total = subtotal only (no delivery)
      // AFN total = subtotal + delivery
      const totalUSD = subtotalUSD;
      const totalAFN = subtotalAFN + deliveryFeeAFN;

      // Create main order with multi-currency fields
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          buyer_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          payment_status: 'pending',
          payment_method: paymentMethod === 'stripe' ? 'stripe' : 'cash_on_delivery',
          currency: 'AFN', // Always AFN
          subtotal_afn: subtotalAFN,
          delivery_fee_afn: deliveryFeeAFN,
          total_afn: totalAFN,
          discount: 0,
          tax: 0,
          settlement_currency: subtotalUSD > 0 && subtotalAFN > 0 ? 'AFN' : (subtotalUSD > 0 ? 'USD' : 'AFN'),
          shipping_address: { ...addressForm } as unknown as Json,
          billing_address: { ...addressForm } as unknown as Json,
          seller_policies: [...policiesSnapshot] as unknown as Json,
        }])
        .select('id')
        .single();

      if (orderError) throw orderError;

      // Create order items with variant and delivery selections
      const orderItems = cartItems.map((item) => {
        const effectivePrice = getEffectivePrice(item.product?.price_afn || 0, item.product?.compare_price_afn);
        const deliveryOption = item.selected_delivery_option_id 
          ? deliveryOptionsMap[item.selected_delivery_option_id] 
          : null;
        
        // Get localized delivery label
        const getDeliveryLabel = (opt: DeliveryOptionDetails | null) => {
          if (!opt) return null;
          if (language === 'ps' && opt.label_ps) return opt.label_ps;
          if (language === 'fa' && opt.label_fa) return opt.label_fa;
          return opt.label_en;
        };
        
        return {
          order_id: order.id,
          product_id: item.product_id,
          product_name: item.product?.name || 'Product',
          product_image: item.product?.images?.[0] || null,
          quantity: item.quantity,
          unit_price: effectivePrice,
          total_price: effectivePrice * item.quantity,
          seller_id: item.product?.seller_id,
          selected_color: item.selected_color || null,
          selected_size: item.selected_size || null,
          selected_delivery_option_id: item.selected_delivery_option_id || null,
          delivery_label: getDeliveryLabel(deliveryOption),
          delivery_price_afn: deliveryOption?.price_afn || 0,
          delivery_hours: deliveryOption?.delivery_hours || null,
        };
      });

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);

      if (itemsError) throw itemsError;

      // Create seller sub-orders for each seller in the cart
      // Group items by seller and currency
      const sellerOrdersMap = new Map<string, {
        sellerId: string;
        sellerName: string;
        currency: string;
        subtotal: number;
        deliveryFee: number;
        items: typeof cartItems;
      }>();

      cartItems.forEach((item) => {
        if (!item.product) return;
        const sellerId = item.product.seller_id;
        const currency = 'AFN';
        const key = `${sellerId}-${currency}`;

        if (!sellerOrdersMap.has(key)) {
          const sellerPolicy = sellerPolicies.find(p => p.sellerId === sellerId);
          sellerOrdersMap.set(key, {
            sellerId,
            sellerName: sellerPolicy?.sellerName || 'Seller',
            currency,
            subtotal: 0,
            deliveryFee: 0,
            items: [],
          });
        }

        const sellerOrder = sellerOrdersMap.get(key)!;
        const effectivePrice = getEffectivePrice(item.product.price_afn, item.product.compare_price_afn);
        sellerOrder.subtotal += effectivePrice * item.quantity;
        sellerOrder.deliveryFee = Math.max(sellerOrder.deliveryFee, item.product.delivery_fee || 0);
        sellerOrder.items.push(item);
      });

      // Insert seller orders (note: delivery_fee is always stored/displayed in AFN)
      const sellerOrdersToInsert = Array.from(sellerOrdersMap.values()).map((so, index) => ({
        order_id: order.id,
        seller_id: so.sellerId,
        order_number: `${orderNumber}-S${index + 1}`,
        status: 'pending',
        subtotal: so.subtotal,
        delivery_fee: so.deliveryFee,
        total: so.subtotal + so.deliveryFee,
        currency: so.currency, // Product currency (AFN/USD)
        shipping_address: { ...addressForm } as unknown as Json,
        buyer_name: addressForm.name,
        buyer_phone: addressForm.phone,
      }));


      if (sellerOrdersToInsert.length > 0) {
        console.log('Inserting seller orders:', JSON.stringify(sellerOrdersToInsert));
        const { error: sellerOrdersError } = await supabase
          .from('seller_orders')
          .insert(sellerOrdersToInsert);

        if (sellerOrdersError) {
          console.error('Error creating seller orders:', sellerOrdersError);
          // Throw the error so we can debug - seller orders are critical
          throw new Error(`Failed to create seller orders: ${sellerOrdersError.message}`);
        }
      } else {
        console.warn('No seller orders to insert - cartItems may have empty product data');
      }

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
        title: getLabel('Error', 'خطا', 'تېروتنه'),
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
    <PublicLayout showFooter={true}>
      <div className={cn(isRTL && 'rtl')}>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Title */}
          <h1 className="text-2xl font-bold mb-8">{t.checkout.title}</h1>

          {/* Stepper */}
          <Card className="mb-8 overflow-hidden">
            <CardContent className="pt-6 px-3 sm:px-6">
              <div className={cn('flex items-center', isRTL && 'flex-row-reverse')}>
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = currentStep > step.id;
                  const stepLabel = t.checkout.steps[step.key as keyof typeof t.checkout.steps];

                  return (
                    <div key={step.id} className={cn(
                      "flex items-center",
                      index < STEPS.length - 1 ? "flex-1" : ""
                    )}>
                      {/* Step circle and label */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div
                          className={cn(
                            'w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all',
                            isActive && 'border-primary bg-primary text-primary-foreground',
                            isCompleted && 'border-primary bg-primary text-primary-foreground',
                            !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
                          )}
                        >
                          {isCompleted ? <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <Icon className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </div>
                        <span
                          className={cn(
                            'text-[10px] sm:text-xs mt-1 sm:mt-2 text-center whitespace-nowrap',
                            isActive && 'text-primary font-medium',
                            isCompleted && 'text-primary',
                            !isActive && !isCompleted && 'text-muted-foreground'
                          )}
                        >
                          {stepLabel}
                        </span>
                      </div>
                      {/* Connector line */}
                      {index < STEPS.length - 1 && (
                        <div
                          className={cn(
                            'flex-1 h-0.5 mx-2 sm:mx-3 mb-5',
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

                  {/* Products grouped by currency, then by seller */}
                  {currencyBreakdowns.map((currencyData) => (
                    <div key={currencyData.currency} className="space-y-4">
                      {/* Currency Header */}
                      <div className="flex items-center gap-2 bg-muted/50 p-3 rounded-lg">
                        <Badge variant="outline" className="text-base font-semibold">
                          {currencyData.currency}
                        </Badge>
                        <span className="text-muted-foreground text-sm">
                          {getLabel('Products', 'محصولات', 'محصولات')}
                        </span>
                      </div>

                      {/* Sellers within this currency */}
                      <div className="space-y-4 pl-2">
                        {currencyData.sellers.map((seller) => (
                          <div key={seller.sellerId} className="border rounded-lg p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-sm">
                                {seller.sellerName}
                              </Badge>
                            </div>

                            {/* Seller's Products */}
                            <div className="space-y-3">
                              {seller.products.map((product, idx) => {
                                const colorDef = product.selectedColor ? getColorByValue(product.selectedColor) : null;
                                const colorName = colorDef ? (isRTL ? colorDef.nameFa : colorDef.name) : '';
                                return (
                                  <div key={idx} className="flex items-center justify-between text-sm gap-2">
                                    <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                                      <span className="text-muted-foreground">
                                        {product.name} × {product.quantity} {getLabel('pcs', 'عدد', 'ټوټه')}
                                      </span>
                                      {/* Color indicator */}
                                      {colorDef && (
                                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                          <span className="text-muted-foreground">•</span>
                                          <span className="lowercase">{colorName}</span>
                                          <span
                                            className="w-4 h-4 rounded-full border border-border flex-shrink-0"
                                            style={{
                                              background: colorDef.hex.startsWith('linear') ? colorDef.hex : colorDef.hex,
                                              backgroundColor: colorDef.hex.startsWith('linear') ? undefined : colorDef.hex,
                                            }}
                                          />
                                        </span>
                                      )}
                                      {/* Size indicator */}
                                      {product.selectedSize && (
                                        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                                          <span className="text-muted-foreground">•</span>
                                          {getLabel('size', 'سایز', 'اندازه')}({product.selectedSize})
                                        </span>
                                      )}
                                    </div>
                                    <span className="flex-shrink-0">{product.price.toLocaleString()} {currencyData.symbol}</span>
                                  </div>
                                );
                              })}
                            </div>

                            <Separator />

                            {/* Seller Subtotals */}
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between font-medium">
                                <span>{getLabel('Products Subtotal', 'جمع محصولات', 'د محصولاتو مجموعه')}</span>
                                <span>{seller.productSubtotal.toLocaleString()} {currencyData.symbol}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Currency Total */}
                      <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                        <div className="flex justify-between font-bold text-lg">
                          <span>{getLabel('Products Total', 'جمع محصولات', 'د محصولاتو مجموعه')} ({currencyData.currency})</span>
                          <div className="text-right">
                            <span className="text-primary">{currencyData.productSubtotal.toLocaleString()} {currencyData.symbol}</span>
                            {rate && currencyData.currency === 'AFN' && (
                              <p className="text-sm font-normal text-muted-foreground">
                                ≈ ${convertToUSD(currencyData.productSubtotal).toFixed(2)} USD
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {currencyBreakdowns.length > 1 && <Separator className="my-6" />}
                    </div>
                  ))}

                  {/* Delivery Fees Section - Always AFN */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 bg-primary/10 p-3 rounded-lg">
                      <Badge variant="outline" className="text-base font-semibold bg-primary/20">
                        AFN
                      </Badge>
                      <span className="text-muted-foreground text-sm flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        {getLabel('Delivery Fees', 'هزینه ارسال', 'د لیږد فیس')}
                      </span>
                    </div>

                    <div className="border rounded-lg p-4 space-y-3">
                      {deliveryBreakdown.perItem.map((item) => {
                        const option = item.deliveryOption;
                        const now = new Date();
                        const startDate = format(now, 'MMM d');
                        const endDate = option ? format(addHours(now, option.delivery_hours), 'MMM d, yyyy') : '';
                        
                        const formatHours = (hours: number) => {
                          if (hours < 24) return `${hours}h`;
                          const days = Math.floor(hours / 24);
                          const remaining = hours % 24;
                          return remaining === 0 ? `${days}d` : `${days}d ${remaining}h`;
                        };

                        const getDeliveryLabel = (opt: DeliveryOptionDetails) => {
                          if (language === 'ps' && opt.label_ps) return opt.label_ps;
                          if (language === 'fa' && opt.label_fa) return opt.label_fa;
                          return opt.label_en;
                        };

                        return (
                          <div key={item.productId} className="space-y-1.5">
                            {/* Delivery option details */}
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">{item.productName}</span>
                              <span>
                                {!option ? (
                                  <Badge variant="outline" className="text-muted-foreground">{getLabel('Not selected', 'انتخاب نشده', 'نه دی ټاکل شوی')}</Badge>
                                ) : option.price_afn === 0 ? (
                                  <Badge variant="outline" className="text-success">{getLabel('Free', 'رایگان', 'وړیا')}</Badge>
                                ) : (
                                  `${option.price_afn.toLocaleString()} ${afnSymbol}`
                                )}
                              </span>
                            </div>
                            {option && (
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">
                                <span className="font-medium text-foreground">{getDeliveryLabel(option)}</span>
                                <span className="text-muted-foreground">•</span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {startDate} → {endDate}
                                </span>
                                <span className="text-muted-foreground">•</span>
                                <span>{formatHours(option.delivery_hours)}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>{getLabel('Total Delivery', 'جمع هزینه ارسال', 'د لیږد ټوله')}</span>
                        <div className="text-right">
                          <span className="text-primary">
                            {deliveryBreakdown.totalDeliveryAFN === 0 ? (
                              <Badge variant="outline" className="text-success">{getLabel('Free', 'رایگان', 'وړیا')}</Badge>
                            ) : (
                              `${deliveryBreakdown.totalDeliveryAFN.toLocaleString()} ${afnSymbol}`
                            )}
                          </span>
                          {rate && deliveryBreakdown.totalDeliveryAFN > 0 && (
                            <p className="text-sm font-normal text-muted-foreground">
                              ≈ ${convertToUSD(deliveryBreakdown.totalDeliveryAFN).toFixed(2)} USD
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {currencyBreakdowns.length > 1 && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        {getLabel(
                          'Note: Your order contains products in different currencies. Amounts are calculated separately.',
                          'توجه: سفارش شما شامل محصولات با ارز متفاوت است. مبالغ به صورت جداگانه محاسبه شده‌اند.',
                          'یادونه: ستاسو سفارش مختلفې اسعارو کې محصولات لري. مبالغ جلا محاسبه شوي.'
                        )}
                      </p>
                    </div>
                  )}

                  <Separator />

                  {/* Seller Policies */}
                  {sellerPolicies.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" />
                        {t.checkout.orderSummary.sellerPolicies}
                      </h3>
                      {sellerPolicies.map((policy) => (
                        <div key={policy.sellerId} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                          <Badge variant="secondary" className="text-sm">{policy.sellerName}</Badge>
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <RotateCcw className="w-3 h-3" />
                                {t.checkout.orderSummary.returnPolicy}
                              </div>
                              <p className="text-sm p-3 bg-background rounded-md border">
                                {policy.returnPolicy || t.checkout.orderSummary.noPolicyProvided}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Truck className="w-3 h-3" />
                                {t.checkout.orderSummary.shippingPolicy}
                              </div>
                              <p className="text-sm p-3 bg-background rounded-md border">
                                {policy.shippingPolicy || t.checkout.orderSummary.noPolicyProvided}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={cn(
                      'w-full p-4 border-2 rounded-lg text-left transition-all',
                      paymentMethod === 'cash_on_delivery'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Banknote className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{t.checkout.payment.cashOnDelivery}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {t.checkout.payment.cashOnDeliveryDesc}
                        </p>
                      </div>
                      <div className={cn('flex-shrink-0', isRTL ? 'mr-auto' : 'ml-auto')}>
                        {paymentMethod === 'cash_on_delivery' && (
                          <CheckCircle className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Stripe Online Payment */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('stripe')}
                    className={cn(
                      'w-full p-4 border-2 rounded-lg text-left transition-all',
                      paymentMethod === 'stripe'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium flex items-center gap-2">
                          {getLabel('Pay Online', 'پرداخت آنلاین', 'آنلاین تادیه')}
                          <Badge variant="secondary" className="text-[10px]">Stripe</Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {getLabel(
                            'Pay securely with credit/debit card via Stripe',
                            'پرداخت امن با کارت اعتباری/نقدی از طریق Stripe',
                            'د Stripe له لارې د کریډیټ/ډیبیټ کارت سره خوندي تادیه'
                          )}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Visa</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Mastercard</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">Amex</span>
                        </div>
                      </div>
                      <div className={cn('flex-shrink-0', isRTL ? 'mr-auto' : 'ml-auto')}>
                        {paymentMethod === 'stripe' && (
                          <CheckCircle className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    </div>
                  </button>
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
                        <span className="font-medium">
                          {paymentMethod === 'stripe' 
                            ? getLabel('Online Payment (Stripe)', 'پرداخت آنلاین (Stripe)', 'آنلاین تادیه (Stripe)')
                            : t.checkout.payment.cashOnDelivery
                          }
                        </span>
                      </div>
                      {/* Show totals per currency */}
                      {currencyBreakdowns.map((cb) => (
                        <div key={cb.currency} className="flex justify-between">
                          <span className="text-muted-foreground">{getLabel('Products', 'محصولات', 'محصولات')} ({cb.currency}):</span>
                          <span className="font-medium">{cb.productSubtotal.toLocaleString()} {cb.symbol}</span>
                        </div>
                      ))}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">{t.checkout.orderSummary.deliveryFee} (AFN):</span>
                        <span className="font-medium">
                          {deliveryBreakdown.totalDeliveryAFN === 0 
                            ? getLabel('Free', 'رایگان', 'وړیا')
                            : `${deliveryBreakdown.totalDeliveryAFN.toLocaleString()} ${afnSymbol}`
                          }
                        </span>
                      </div>
                      <Separator />
                      {/* Grand Total (Products + Delivery) */}
                      {(() => {
                        const afnBreakdown = currencyBreakdowns.find(cb => cb.currency === 'AFN');
                        const grandTotalAFN = (afnBreakdown?.productSubtotal || 0) + deliveryBreakdown.totalDeliveryAFN;
                        return (
                          <div className="space-y-1">
                            <div className="flex justify-between text-lg font-bold">
                              <span>{getLabel('Total', 'جمع کل', 'مجموعه')} (AFN):</span>
                              <span className="text-primary">{grandTotalAFN.toLocaleString()} {afnSymbol}</span>
                            </div>
                            {rate && (
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span></span>
                                <span>≈ ${convertToUSD(grandTotalAFN).toFixed(2)} USD</span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {paymentMethod === 'stripe' ? (
                    <Button
                      onClick={handleStripePayment}
                      disabled={stripeLoading}
                      className="w-full h-12 text-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                      size="lg"
                    >
                      {stripeLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          {getLabel('Redirecting to Stripe...', 'در حال انتقال به Stripe...', 'Stripe ته لیږدول...')}
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          {getLabel('Pay with Stripe', 'پرداخت با Stripe', 'د Stripe سره تادیه')}
                        </>
                      )}
                    </Button>
                  ) : (
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
                  )}
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
      </div>
    </PublicLayout>
  );
};

export default Checkout;
