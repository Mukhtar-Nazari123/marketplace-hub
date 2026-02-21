import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage, Language } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { OrderItemReview } from "@/components/reviews/OrderItemReview";
import { formatCurrency } from "@/lib/currencyFormatter";
import { useCurrencyRate } from "@/hooks/useCurrencyRate";
import { getLocalizedProductName, LocalizableProduct } from "@/lib/localizedProduct";
import {
  Package,
  MapPin,
  Clock,
  CreditCard,
  Truck,
  RotateCcw,
  ShoppingBag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Store,
} from "lucide-react";
import { format } from "date-fns";
import { getColorByValue } from "@/lib/productColors";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  seller_id: string;
  product_id: string | null;
  product_sku?: string | null;
  product_currency?: string | null;
  selected_color?: string | null;
  selected_size?: string | null;
  selected_delivery_option_id?: string | null;
  delivery_label?: string | null;
  delivery_price_afn?: number | null;
  delivery_hours?: number | null;
  // Localized product fields (fetched from products_with_translations)
  name_en?: string | null;
  name_fa?: string | null;
  name_ps?: string | null;
}

interface SellerPolicy {
  seller_id: string;
  seller_name: string;
  return_policy: string | null;
  shipping_policy: string | null;
}

interface ShippingAddress {
  name: string;
  phone: string;
  city: string;
  fullAddress: string;
}

interface SellerSubOrder {
  id: string;
  order_number: string;
  seller_id: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
  items?: OrderItem[];
}

// Helper to format SKUs for display
const formatProductSKUs = (items: OrderItem[] | undefined, language: string): string => {
  const noSkuText = language === 'ps' ? "SKU نشته" : language === 'fa' ? "بدون SKU" : "No SKU";
  if (!items || items.length === 0) return noSkuText;

  const skus = items
    .map((item) => item.product_sku)
    .filter((sku): sku is string => sku !== null && sku !== undefined && sku.trim() !== "");

  if (skus.length === 0) return noSkuText;
  if (skus.length === 1) return skus[0];
  const separator = language === 'fa' || language === 'ps' ? " ، " : ", ";
  const andText = language === 'ps' ? " او " : language === 'fa' ? " و " : ", ";
  if (skus.length === 2) return skus.join(separator);
  return `${skus[0]}${andText}+${skus.length - 1}`;
};

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal_afn: number;
  delivery_fee_afn: number;
  discount: number;
  tax: number;
  total_afn: number;
  currency: string;
  shipping_address: ShippingAddress | null;
  seller_policies: SellerPolicy[] | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  seller_orders?: SellerSubOrder[];
}

const BuyerOrders = () => {
  const { isRTL, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { convertToUSD, rate } = useCurrencyRate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper for trilingual support
  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  // Localized texts
  const texts = {
    title: getLabel('My Orders', 'سفارشات من', 'زما امرونه'),
    description: getLabel('Track your orders and purchase history', 'پیگیری سفارشات و سابقه خرید', 'خپل امرونه او پیرود تاریخچه تعقیب کړئ'),
    noOrders: getLabel('No orders yet', 'هنوز سفارشی ندارید', 'تر اوسه هیڅ امر نشته'),
    noOrdersDesc: getLabel('Your orders will appear here once you make your first purchase.', 'با خرید اولین محصول، سفارشات شما در اینجا نمایش داده می‌شود.', 'ستاسو امرونه به دلته ښکاره شي کله چې تاسو خپل لومړی پیرود وکړئ.'),
    browseProducts: getLabel('Browse Products', 'مشاهده محصولات', 'محصولات وګورئ'),
    totalOrders: getLabel('Total Orders', 'کل سفارشات', 'ټول امرونه'),
    inProgress: getLabel('In Progress', 'در حال پردازش', 'روان'),
    delivered: getLabel('Delivered', 'تحویل شده', 'تحویل شوی'),
    items: getLabel('items', 'محصول', 'توکي'),
    sellers: getLabel('sellers', 'فروشنده', 'پلورونکي'),
    seller: getLabel('Seller', 'فروشنده', 'پلورونکی'),
    noSku: getLabel('No SKU', 'بدون SKU', 'SKU نشته'),
    product: getLabel('product', 'محصول', 'محصول'),
    products: getLabel('Products', 'محصولات', 'محصولات'),
    shippingAddress: getLabel('Shipping Address', 'آدرس ارسال', 'د لیږلو پته'),
    paymentSummary: getLabel('Payment Summary', 'خلاصه پرداخت', 'د تادیې لنډیز'),
    subtotal: getLabel('Subtotal', 'جمع محصولات', 'فرعي مجموعه'),
    shipping: getLabel('Shipping', 'ارسال', 'لیږل'),
    discount: getLabel('Discount', 'تخفیف', 'تخفیف'),
    total: getLabel('Total', 'مجموع', 'مجموعه'),
    payment: getLabel('Payment', 'روش پرداخت', 'تادیه'),
    cashOnDelivery: getLabel('Cash on Delivery', 'پرداخت در محل', 'په تحویلي تادیه'),
    delivery: getLabel('Delivery', 'هزینه ارسال', 'رسول'),
    rejected: getLabel('Rejected', 'رد شده', 'رد شوی'),
    rejectedMessage: getLabel('This order has been rejected by the seller', 'این سفارش توسط فروشنده رد شده است', 'دا امر د پلورونکي لخوا رد شوی'),
    orderStatusBySeller: getLabel('Order Status by Seller', 'وضعیت سفارش به تفکیک فروشنده', 'د پلورونکي په اساس د امر حالت'),
    sellerPolicies: getLabel('Seller Policies', 'سیاست‌های فروشنده', 'د پلورونکي پالیسۍ'),
    returnPolicy: getLabel('Return Policy', 'سیاست بازگشت', 'د بیرته ورکولو پالیسي'),
    shippingPolicy: getLabel('Shipping Policy', 'سیاست ارسال', 'د لیږلو پالیسي'),
    notProvided: getLabel('Not provided', 'ارائه نشده', 'نه دی ورکړل شوی'),
  };
  const t = texts;

  // Helper to get localized product name for order items
  const getItemDisplayName = (item: OrderItem): string => {
    // If we have localized fields, use the localization helper
    if (item.name_en || item.name_fa || item.name_ps) {
      return getLocalizedProductName(item as LocalizableProduct, language as Language) || item.product_name;
    }
    // Fallback to stored product_name
    return item.product_name;
  };

  const fetchOrders = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products:product_id (sku)
          )
        `,
        )
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Get all unique product IDs to fetch translations
      const allProductIds = (data || [])
        .flatMap((order) => order.order_items || [])
        .map((item: any) => item.product_id)
        .filter((id: string | null): id is string => id !== null);
      
      const uniqueProductIds = [...new Set(allProductIds)];
      
      // Fetch product translations for all products
      let productTranslations: Record<string, { name_en: string | null; name_fa: string | null; name_ps: string | null }> = {};
      if (uniqueProductIds.length > 0) {
        const { data: productsData } = await supabase
          .from("products_with_translations")
          .select("id, name_en, name_fa, name_ps")
          .in("id", uniqueProductIds);
        
        if (productsData) {
          productTranslations = productsData.reduce((acc, p) => {
            if (p.id) {
              acc[p.id] = { name_en: p.name_en, name_fa: p.name_fa, name_ps: p.name_ps };
            }
            return acc;
          }, {} as Record<string, { name_en: string | null; name_fa: string | null; name_ps: string | null }>);
        }
      }

      // Get product IDs that don't have delivery_label (legacy orders)
      const legacyProductIds = (data || [])
        .flatMap((order) => order.order_items || [])
        .filter((item: any) => !item.delivery_label && item.product_id)
        .map((item: any) => item.product_id);

      // Fetch default delivery options for legacy products
      let deliveryOptionsMap: Record<string, any> = {};
      if (legacyProductIds.length > 0) {
        const { data: deliveryOptions } = await supabase
          .from("delivery_options")
          .select("product_id, label_en, label_fa, label_ps, price_afn, delivery_hours")
          .in("product_id", [...new Set(legacyProductIds)])
          .eq("is_default", true)
          .eq("is_active", true);

        if (deliveryOptions) {
          deliveryOptionsMap = deliveryOptions.reduce((acc: any, opt: any) => {
            acc[opt.product_id] = opt;
            return acc;
          }, {});
        }
      }

      // Fetch seller sub-orders for each order
      const ordersWithSellerOrders = await Promise.all(
        (data || []).map(async (order) => {
          const { data: sellerOrders } = await supabase.from("seller_orders").select("*").eq("order_id", order.id);

          // Map order items to include product_sku, localized names, and fallback delivery info
          const orderItemsWithSku = (order.order_items || []).map((item: any) => {
            const translations = item.product_id ? productTranslations[item.product_id] : null;
            const legacyDelivery = item.product_id ? deliveryOptionsMap[item.product_id] : null;
            const deliveryLabel = item.delivery_label || (legacyDelivery ? 
              (language === 'ps' ? legacyDelivery.label_ps : language === 'fa' ? legacyDelivery.label_fa : legacyDelivery.label_en) || legacyDelivery.label_en
              : null);
            
            return {
              ...item,
              product_sku: item.products?.sku || null,
              product_currency: order.currency,
              name_en: translations?.name_en || null,
              name_fa: translations?.name_fa || null,
              name_ps: translations?.name_ps || null,
              delivery_label: deliveryLabel,
              delivery_price_afn: item.delivery_price_afn || (legacyDelivery?.price_afn ?? null),
              delivery_hours: item.delivery_hours || (legacyDelivery?.delivery_hours ?? null),
            };
          });

          // Group items by seller for seller sub-orders
          const sellerOrdersWithItems = (sellerOrders || []).map((so: any) => ({
            ...so,
            items: orderItemsWithSku.filter((item: OrderItem) => item.seller_id === so.seller_id),
          }));

          return {
            ...order,
            shipping_address: order.shipping_address as unknown as ShippingAddress | null,
            seller_policies: order.seller_policies as unknown as SellerPolicy[] | null,
            order_items: orderItemsWithSku as OrderItem[],
            seller_orders: sellerOrdersWithItems,
          };
        }),
      );

      setOrders(ordersWithSellerOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user, language]);

  // Separate effect for real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("buyer-seller-orders-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seller_orders",
        },
        (payload) => {
          console.log("Real-time update received:", payload);
          // Update the local state when a seller order status changes
          if (payload.eventType === "UPDATE") {
            const updatedOrder = payload.new as any;
            setOrders((prevOrders) =>
              prevOrders.map((order) => ({
                ...order,
                seller_orders: order.seller_orders?.map((so) =>
                  so.id === updatedOrder.id ? { ...so, status: updatedOrder.status } : so,
                ),
              })),
            );
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant: "default" | "secondary" | "destructive" | "outline";
        icon: typeof CheckCircle;
        label: string;
        labelFa: string;
        labelPs: string;
      }
    > = {
      pending: { variant: "secondary", icon: Clock, label: "Pending", labelFa: "در انتظار", labelPs: "انتظار کې" },
      confirmed: { variant: "default", icon: CheckCircle, label: "Confirmed", labelFa: "تایید شده", labelPs: "تایید شوی" },
      processing: { variant: "default", icon: Package, label: "Processing", labelFa: "در حال پردازش", labelPs: "پروسس کې" },
      shipped: { variant: "default", icon: Truck, label: "Shipped", labelFa: "ارسال شده", labelPs: "لیږل شوی" },
      delivered: { variant: "default", icon: CheckCircle, label: "Delivered", labelFa: "تحویل داده شده", labelPs: "تحویل شوی" },
      cancelled: { variant: "destructive", icon: XCircle, label: "Cancelled", labelFa: "لغو شده", labelPs: "لغوه شوی" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejected", labelFa: "رد شده", labelPs: "رد شوی" },
    };

    const config = statusConfig[status] || {
      variant: "outline" as const,
      icon: AlertCircle,
      label: status,
      labelFa: status,
      labelPs: status,
    };
    const Icon = config.icon;
    const labelToShow = language === 'ps' ? config.labelPs : language === 'fa' ? config.labelFa : config.label;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {labelToShow}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; label: string; labelFa: string; labelPs: string }> =
      {
        pending: { variant: "secondary", label: "Pending", labelFa: "در انتظار پرداخت", labelPs: "تادیه انتظار کې" },
        paid: { variant: "default", label: "Paid", labelFa: "پرداخت شده", labelPs: "تادیه شوی" },
        failed: { variant: "destructive", label: "Failed", labelFa: "ناموفق", labelPs: "ناکام" },
      };

    const statusConfig = config[status] || { variant: "secondary" as const, label: status, labelFa: status, labelPs: status };
    const labelToShow = language === 'ps' ? statusConfig.labelPs : language === 'fa' ? statusConfig.labelFa : statusConfig.label;

    return <Badge variant={statusConfig.variant}>{labelToShow}</Badge>;
  };

  const getSellerName = (sellerId: string, sellerPolicies: SellerPolicy[] | null) => {
    const policy = sellerPolicies?.find((p) => p.seller_id === sellerId);
    return policy?.seller_name || t.seller;
  };

  // Group order items by seller
  const groupItemsBySeller = (items: OrderItem[], sellerPolicies: SellerPolicy[] | null) => {
    const groups = new Map<string, { sellerName: string; items: OrderItem[] }>();

    items.forEach((item) => {
      if (!groups.has(item.seller_id)) {
        groups.set(item.seller_id, {
          sellerName: getSellerName(item.seller_id, sellerPolicies),
          items: [],
        });
      }
      groups.get(item.seller_id)!.items.push(item);
    });

    return Array.from(groups.entries());
  };

  if (loading) {
    return (
      <DashboardLayout
        title={t.title}
        description={t.description}
        allowedRoles={["buyer"]}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (orders.length === 0) {
    return (
      <DashboardLayout
        title={t.title}
        description={t.description}
        allowedRoles={["buyer"]}
      >
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{t.noOrders}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {t.noOrdersDesc}
            </p>
            <Button onClick={() => navigate("/products")}>
              {t.browseProducts}
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t.title}
      description={t.description}
      allowedRoles={["buyer"]}
    >
      <div className="space-y-4 sm:space-y-6">
        {/* Orders Summary - responsive grid */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{orders.length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">
                    {orders.filter((o) => o.status === "pending" || o.status === "processing").length}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4 sm:pt-6">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold">{orders.filter((o) => o.status === "delivered").length}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{t.delivered}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List - Mobile Accordion Layout */}
        <Accordion type="single" collapsible className="space-y-3 sm:hidden">
          {orders.map((order) => {
            const sellerGroups = groupItemsBySeller(order.order_items, order.seller_policies);
            return (
              <AccordionItem
                key={order.id}
                value={order.id}
                className="border rounded-lg bg-card overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex flex-col w-full text-left gap-2">
                    {/* Order Header */}
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="space-y-1 min-w-0">
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded block w-fit">
                          {order.order_number}
                        </span>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3 shrink-0" />
                          {format(new Date(order.created_at), "PP")}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment_status)}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-sm text-muted-foreground">
                        {order.order_items.length} {t.items}
                        {sellerGroups.length > 1 && (
                          <span className="text-xs ml-1">
                            ({sellerGroups.length} {t.sellers})
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-primary">
                        {formatCurrency(order.total_afn, 'AFN', isRTL)}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4 pt-2">
                    {/* Seller Sub-Orders Status */}
                    {order.seller_orders && order.seller_orders.length > 0 && (
                      <div className="space-y-3">
                        {order.seller_orders.map((sellerOrder) => {
                          const statusSteps = ["pending", "confirmed", "shipped", "delivered"];
                          const isRejected = sellerOrder.status === "rejected";
                          const currentIndex = isRejected ? -1 : statusSteps.indexOf(sellerOrder.status);
                          
                          if (isRejected) {
                            return (
                              <div key={sellerOrder.id} className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                                <XCircle className="w-5 h-5 text-destructive shrink-0" />
                                <span className="text-sm text-destructive font-medium">
                                  {t.rejected}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <div key={sellerOrder.id} className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px]">
                                  {formatProductSKUs(sellerOrder.items, language)}
                                </span>
                              </div>
                              {/* Horizontal Timeline */}
                              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                                {statusSteps.map((step, index) => {
                                  const isCompleted = currentIndex >= index;
                                  const isCurrent = sellerOrder.status === step;
                                  const icons: Record<string, typeof CheckCircle> = {
                                    pending: Clock,
                                    confirmed: CheckCircle,
                                    shipped: Truck,
                                    delivered: CheckCircle,
                                  };
                                  const Icon = icons[step];
                                  const labels: Record<string, { en: string; fa: string; ps: string }> = {
                                    pending: { en: "Pending", fa: "در انتظار", ps: "انتظار کې" },
                                    confirmed: { en: "Confirmed", fa: "تایید", ps: "تایید شوی" },
                                    shipped: { en: "Shipped", fa: "ارسال", ps: "لیږل شوی" },
                                    delivered: { en: "Done", fa: "تحویل", ps: "تحویل شوی" },
                                  };
                                  const labelToShow = language === 'ps' ? labels[step].ps : language === 'fa' ? labels[step].fa : labels[step].en;

                                  return (
                                    <div key={step} className="flex items-center">
                                      <div className="flex flex-col items-center">
                                        <div
                                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                                            isCompleted
                                              ? "bg-primary text-primary-foreground"
                                              : "bg-muted text-muted-foreground"
                                          } ${isCurrent ? "ring-2 ring-primary/30" : ""}`}
                                        >
                                          <Icon className="w-3 h-3" />
                                        </div>
                                        <span className={`text-[9px] mt-0.5 ${isCompleted ? "text-primary" : "text-muted-foreground"}`}>
                                          {labelToShow}
                                        </span>
                                      </div>
                                      {index < statusSteps.length - 1 && (
                                        <div className={`w-4 h-0.5 mx-0.5 ${currentIndex > index ? "bg-primary" : "bg-muted"}`} />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <Separator />

                    {/* Products List */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                          <Package className="w-4 h-4" />
                          {t.products}
                      </h4>
                      {sellerGroups.map(([sellerId, group]) => {
                        const sellerOrder = order.seller_orders?.find((so) => so.seller_id === sellerId);
                        return (
                          <div key={sellerId} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Store className="w-3 h-3 text-muted-foreground" />
                                <span className="font-medium text-xs">{group.sellerName}</span>
                              </div>
                              {sellerOrder && getStatusBadge(sellerOrder.status)}
                            </div>
                            {group.items.map((item) => {
                              const colorDef = item.selected_color ? getColorByValue(item.selected_color) : null;
                              const colorName = colorDef ? (isRTL ? colorDef.nameFa : colorDef.name) : '';
                              return (
                              <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                  {item.product_image ? (
                                    <img src={item.product_image} alt={getItemDisplayName(item)} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-medium text-xs">{getItemDisplayName(item)}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {item.quantity} {getLabel('pcs', 'عدد', 'ټوټه')}
                                    </span>
                                    {/* Color indicator */}
                                    {colorDef && (
                                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <span>•</span>
                                        <span className="lowercase">{colorName}</span>
                                        <span
                                          className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                                          style={{
                                            background: colorDef.hex.startsWith('linear') ? colorDef.hex : colorDef.hex,
                                            backgroundColor: colorDef.hex.startsWith('linear') ? undefined : colorDef.hex,
                                          }}
                                        />
                                      </span>
                                    )}
                                    {/* Size indicator */}
                                    {item.selected_size && (
                                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <span>•</span>
                                        {getLabel('size', 'سایز', 'اندازه')}({item.selected_size})
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-muted-foreground">
                                    {formatCurrency(item.unit_price, item.product_currency || 'AFN', isRTL)}
                                  </p>
                                </div>
                                <div className="text-right space-y-1">
                                  {/* Show delivery option per item */}
                                  {item.delivery_label && (
                                    <p className="text-xs text-muted-foreground">
                                      <Truck className="inline-block w-3 h-3 me-1" />
                                      {item.delivery_label}{' '}
                                      <span className="font-medium text-foreground">
                                        {item.delivery_price_afn === 0 
                                          ? getLabel('Free', 'رایگان', 'وړیا')
                                          : formatCurrency(item.delivery_price_afn || 0, 'AFN', isRTL)}
                                      </span>
                                    </p>
                                  )}
                                  <p className="font-semibold text-xs">
                                    {formatCurrency(item.total_price, item.product_currency || 'AFN', isRTL)}
                                  </p>
                                </div>
                              </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    {/* Shipping Address */}
                    {order.shipping_address && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4" />
                          {t.shippingAddress}
                        </h4>
                        <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1">
                          <p className="font-medium">{order.shipping_address.name}</p>
                          <p className="text-muted-foreground">{order.shipping_address.phone}</p>
                          <p className="text-muted-foreground">
                            {order.shipping_address.city}, {order.shipping_address.fullAddress}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Payment Summary */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4" />
                        {t.paymentSummary}
                      </h4>
                      <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">{t.subtotal}</span>
                          <span>
                            {formatCurrency(order.subtotal_afn, "AFN", isRTL)}
                          </span>
                        </div>
                        {(() => {
                          // Calculate total shipping from order items (fallback to order.delivery_fee_afn for legacy)
                          const totalShippingFromItems = (order.order_items || []).reduce(
                            (sum, item) => sum + (item.delivery_price_afn || 0), 0
                          );
                          const shippingFee = totalShippingFromItems > 0 ? totalShippingFromItems : order.delivery_fee_afn;
                          return (
                            <div className="flex justify-between">
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                {t.shipping}
                              </span>
                              <span>{formatCurrency(shippingFee, "AFN", isRTL)}</span>
                            </div>
                          );
                        })()}
                        {order.discount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>{t.discount}</span>
                            <span>-{formatCurrency(order.discount, "AFN", isRTL)}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex flex-col">
                          <div className="flex justify-between font-bold text-sm">
                            <span>{t.total}</span>
                            <span className="text-primary">
                              {formatCurrency(order.total_afn, "AFN", isRTL)}
                            </span>
                          </div>
                          {rate && order.total_afn > 0 && (
                            <div className="flex justify-end">
                              <span className="text-[10px] text-muted-foreground">
                                ≈ ${convertToUSD(order.total_afn).toFixed(2)} USD
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground pt-1">
                          <span>{t.payment}</span>
                          <span>
                            {order.payment_method === "cash_on_delivery"
                              ? t.cashOnDelivery
                              : order.payment_method}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        {/* Desktop Accordion Layout */}
        <Accordion type="single" collapsible className="space-y-4 hidden sm:block">
          {orders.map((order) => {
            const sellerGroups = groupItemsBySeller(order.order_items, order.seller_policies);

            return (
              <AccordionItem
                key={order.id}
                value={order.id}
                className="border rounded-lg px-0 bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-4 md:px-6 py-4 hover:no-underline">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 w-full text-left">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 md:gap-3 mb-2 flex-wrap">
                        <span className="font-mono text-xs md:text-sm bg-muted px-2 py-1 rounded">{order.order_number}</span>
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment_status)}
                        {sellerGroups.length > 1 && (
                          <Badge variant="outline" className="gap-1 text-xs">
                            <Store className="w-3 h-3" />
                            {sellerGroups.length} {t.sellers}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(order.created_at), "PPP")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-base md:text-lg font-bold text-primary">
                        {formatCurrency(order.total_afn, 'AFN', isRTL)}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {order.order_items.length} {t.items}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Seller Sub-Orders Status with Progress */}
                    {order.seller_orders && order.seller_orders.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Store className="w-4 h-4" />
                          {t.orderStatusBySeller}
                        </h4>
                        <div className="space-y-4">
                          {order.seller_orders.map((sellerOrder) => {
                            const statusSteps = ["pending", "confirmed", "shipped", "delivered"];
                            const isRejected = sellerOrder.status === "rejected";
                            const currentIndex = isRejected ? -1 : statusSteps.indexOf(sellerOrder.status);
                            const statusLabels: Record<string, { en: string; fa: string; ps: string }> = {
                              pending: { en: "Pending", fa: "در انتظار", ps: "انتظار کې" },
                              confirmed: { en: "Confirmed", fa: "تایید شده", ps: "تایید شوی" },
                              shipped: { en: "Shipped", fa: "ارسال شده", ps: "لیږل شوی" },
                              delivered: { en: "Delivered", fa: "تحویل شده", ps: "تحویل شوی" },
                              rejected: { en: "Rejected", fa: "رد شده", ps: "رد شوی" },
                            };

                            return (
                              <Card key={sellerOrder.id} className="bg-muted/30 border-primary/10">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-4">
                                  <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                                    {formatProductSKUs(sellerOrder.items, language)}
                                  </span>
                                    <div className="flex items-center gap-2">
                                      {getStatusBadge(sellerOrder.status)}
                                      <span className="font-semibold">
                                        {formatCurrency(sellerOrder.total, sellerOrder.currency, isRTL)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Progress Steps */}
                                  {isRejected ? (
                                    <div className="flex items-center justify-center gap-2 py-4">
                                      <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                                        <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
                                          <XCircle className="w-5 h-5 text-destructive-foreground" />
                                        </div>
                                        <div>
                                          <p className="font-medium text-destructive">
                                            {isRTL ? "رد شده" : "Rejected"}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {isRTL
                                              ? "این سفارش توسط فروشنده رد شده است"
                                              : "This order has been rejected by the seller"}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="relative flex items-center justify-between pt-2">
                                      {/* Progress Line Background */}
                                      <div className="absolute top-5 start-0 end-0 h-0.5 bg-muted" />

                                      {/* Progress Line Fill */}
                                      <div
                                        className="absolute top-5 start-0 h-0.5 bg-primary transition-all duration-500"
                                        style={{
                                          width: `${(currentIndex / (statusSteps.length - 1)) * 100}%`,
                                        }}
                                      />

                                      {/* Steps */}
                                      {statusSteps.map((step, index) => {
                                        const isCompleted = currentIndex >= index;
                                        const isCurrent = sellerOrder.status === step;
                                        const icons: Record<string, typeof CheckCircle> = {
                                          pending: Clock,
                                          confirmed: CheckCircle,
                                          shipped: Truck,
                                          delivered: CheckCircle,
                                        };
                                        const Icon = icons[step] || Clock;

                                        return (
                                          <div key={step} className="relative flex flex-col items-center z-10">
                                            <div
                                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                                isCompleted
                                                  ? "bg-primary text-primary-foreground border-primary"
                                                  : "bg-background text-muted-foreground border-muted"
                                              } ${isCurrent ? "ring-2 ring-primary/20 scale-110" : ""}`}
                                            >
                                              <Icon className="w-4 h-4" />
                                            </div>
                                            <span
                                              className={`mt-1.5 text-[10px] font-medium text-center transition-colors ${
                                                isCompleted ? "text-primary" : "text-muted-foreground"
                                              }`}
                                            >
                                              {language === 'ps' ? statusLabels[step]?.ps : language === 'fa' ? statusLabels[step]?.fa : statusLabels[step]?.en}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Order Items Grouped by Seller */}
                    <div className="space-y-4 md:space-y-6">
                      <h4 className="font-semibold flex items-center gap-2 text-sm md:text-base">
                        <Package className="w-4 h-4" />
                        {t.products}
                      </h4>

                      {sellerGroups.map(([sellerId, group]) => {
                        const sellerOrder = order.seller_orders?.find((so) => so.seller_id === sellerId);

                        return (
                          <div key={sellerId} className="space-y-2 md:space-y-3">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium text-sm md:text-base">{group.sellerName}</span>
                              </div>
                              {sellerOrder && getStatusBadge(sellerOrder.status)}
                            </div>
                            <div className="space-y-2 md:pl-6">
                              {group.items.map((item) => {
                                const colorDef = item.selected_color ? getColorByValue(item.selected_color) : null;
                                const colorName = colorDef ? (isRTL ? colorDef.nameFa : colorDef.name) : '';
                                return (
                                <div key={item.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                  {/* Product Image */}
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                      {item.product_image ? (
                                        <img
                                          src={item.product_image}
                                          alt={getItemDisplayName(item)}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <Package className="w-5 h-5 text-muted-foreground" />
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-medium truncate text-sm">{getItemDisplayName(item)}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {item.quantity} {getLabel('pcs', 'عدد', 'ټوټه')}
                                        </span>
                                        {/* Color indicator */}
                                        {colorDef && (
                                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <span>•</span>
                                            <span className="lowercase">{colorName}</span>
                                            <span
                                              className="w-3.5 h-3.5 rounded-full border border-border flex-shrink-0"
                                              style={{
                                                background: colorDef.hex.startsWith('linear') ? colorDef.hex : colorDef.hex,
                                                backgroundColor: colorDef.hex.startsWith('linear') ? undefined : colorDef.hex,
                                              }}
                                            />
                                          </span>
                                        )}
                                        {/* Size indicator */}
                                        {item.selected_size && (
                                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <span>•</span>
                                            {getLabel('size', 'سایز', 'اندازه')}({item.selected_size})
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {formatCurrency(item.unit_price, item.product_currency || 'AFN', isRTL)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Actions & Price */}
                                  <div className="flex items-center justify-between sm:justify-end gap-3 mt-2 sm:mt-0">
                                    {item.product_id && (
                                      <OrderItemReview
                                        orderId={order.id}
                                        productId={item.product_id}
                                        productName={getItemDisplayName(item)}
                                        productImage={item.product_image}
                                        orderStatus={order.status}
                                      />
                                    )}
                                    <div className="text-right">
                                      {/* Show delivery option per item if available */}
                                      {item.delivery_label ? (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mb-0.5">
                                          <Truck className="w-3 h-3" />
                                          <span className="hidden sm:inline">{item.delivery_label}</span>
                                          <span className="font-medium text-foreground">
                                            {item.delivery_price_afn === 0 
                                              ? getLabel('Free', 'رایگان', 'وړیا')
                                              : formatCurrency(item.delivery_price_afn || 0, 'AFN', isRTL)}
                                          </span>
                                        </p>
                                      ) : (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mb-0.5">
                                          <Truck className="w-3 h-3" />
                                          <span className="hidden sm:inline">{t.delivery}</span>
                                          <span className="font-medium text-foreground">
                                            {formatCurrency(sellerOrder?.delivery_fee || 0, 'AFN', isRTL)}
                                          </span>
                                        </p>
                                      )}
                                      <p className="font-semibold text-sm">
                                        {formatCurrency(item.total_price, item.product_currency || 'AFN', isRTL)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    {/* Order Summary - Responsive Grid */}
                    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                      {/* Shipping Address */}
                      {order.shipping_address && (
                        <div className="space-y-2 md:space-y-3">
                          <h4 className="font-semibold flex items-center gap-2 text-sm md:text-base">
                            <MapPin className="w-4 h-4" />
                            {t.shippingAddress}
                          </h4>
                          <div className="p-3 md:p-4 bg-muted/50 rounded-lg text-sm space-y-1">
                            <p className="font-medium">{order.shipping_address.name}</p>
                            <p className="text-muted-foreground text-xs md:text-sm">{order.shipping_address.phone}</p>
                            <p className="text-muted-foreground text-xs md:text-sm">
                              {order.shipping_address.city}, {order.shipping_address.fullAddress}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Payment Summary */}
                      <div className="space-y-2 md:space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-sm md:text-base">
                          <CreditCard className="w-4 h-4" />
                          {t.paymentSummary}
                        </h4>
                        <div className="p-3 md:p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                          <div className="flex justify-between text-xs md:text-sm">
                            <span className="text-muted-foreground">{t.subtotal}</span>
                            <span>
                              {formatCurrency(order.subtotal_afn, "AFN", isRTL)}
                            </span>
                          </div>
                          {(() => {
                            // Calculate total shipping from order items (fallback to order.delivery_fee_afn for legacy)
                            const totalShippingFromItems = (order.order_items || []).reduce(
                              (sum, item) => sum + (item.delivery_price_afn || 0), 0
                            );
                            const shippingFee = totalShippingFromItems > 0 ? totalShippingFromItems : order.delivery_fee_afn;
                            return (
                              <div className="flex justify-between text-xs md:text-sm">
                                <span className="text-muted-foreground flex items-center gap-1">
                                  <Truck className="w-3 h-3" />
                                  {t.shipping}
                                </span>
                                <span>{formatCurrency(shippingFee, "AFN", isRTL)}</span>
                              </div>
                            );
                          })()}
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600 text-xs md:text-sm">
                              <span>{t.discount}</span>
                              <span>-{formatCurrency(order.discount, "AFN", isRTL)}</span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex flex-col">
                            <div className="flex justify-between font-bold text-sm md:text-base">
                              <span>{t.total}</span>
                              <span className="text-primary">
                                {formatCurrency(order.total_afn, "AFN", isRTL)}
                              </span>
                            </div>
                            {rate && order.total_afn > 0 && (
                              <div className="flex justify-end">
                                <span className="text-xs text-muted-foreground">
                                  ≈ ${convertToUSD(order.total_afn).toFixed(2)} USD
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground pt-2">
                            <span>{t.payment}</span>
                            <span>
                              {order.payment_method === "cash_on_delivery"
                                ? t.cashOnDelivery
                                : order.payment_method}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Seller Policies */}
                    {order.seller_policies && order.seller_policies.length > 0 && (
                      <>
                        <Separator />
                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" />
                            {t.sellerPolicies}
                          </h4>
                          {order.seller_policies.map((policy, idx) => (
                            <div key={idx} className="p-4 border rounded-lg space-y-3">
                              <Badge variant="secondary">{policy.seller_name}</Badge>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
                                    <RotateCcw className="w-3 h-3" />
                                    {t.returnPolicy}
                                  </p>
                                  <p className="text-sm p-2 bg-muted/50 rounded">
                                    {policy.return_policy || t.notProvided}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
                                    <Truck className="w-3 h-3" />
                                    {t.shippingPolicy}
                                  </p>
                                  <p className="text-sm p-2 bg-muted/50 rounded">
                                    {policy.shipping_policy || t.notProvided}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </DashboardLayout>
  );
};

export default BuyerOrders;
