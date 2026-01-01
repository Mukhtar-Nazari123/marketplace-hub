import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { OrderItemReview } from "@/components/reviews/OrderItemReview";
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
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";

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
const formatProductSKUs = (items: OrderItem[] | undefined, isRTL: boolean): string => {
  if (!items || items.length === 0) return isRTL ? "بدون SKU" : "No SKU";

  const skus = items
    .map((item) => item.product_sku)
    .filter((sku): sku is string => sku !== null && sku !== undefined && sku.trim() !== "");

  if (skus.length === 0) return isRTL ? "بدون SKU" : "No SKU";
  if (skus.length === 1) return skus[0];
  if (skus.length === 2) return skus.join(isRTL ? " ، " : ", ");
  return `${skus[0]}${isRTL ? " و " : ", "}+${skus.length - 1}`;
};

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  tax: number;
  total: number;
  shipping_address: ShippingAddress | null;
  seller_policies: SellerPolicy[] | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  seller_orders?: SellerSubOrder[];
}

const BuyerOrders = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Fetch seller sub-orders for each order
      const ordersWithSellerOrders = await Promise.all(
        (data || []).map(async (order) => {
          const { data: sellerOrders } = await supabase.from("seller_orders").select("*").eq("order_id", order.id);

          // Map order items to include product_sku
          const orderItemsWithSku = (order.order_items || []).map((item: any) => ({
            ...item,
            product_sku: item.products?.sku || null,
          }));

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
  }, [user]);

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
      }
    > = {
      pending: { variant: "secondary", icon: Clock, label: "Pending", labelFa: "در انتظار" },
      confirmed: { variant: "default", icon: CheckCircle, label: "Confirmed", labelFa: "تایید شده" },
      processing: { variant: "default", icon: Package, label: "Processing", labelFa: "در حال پردازش" },
      shipped: { variant: "default", icon: Truck, label: "Shipped", labelFa: "ارسال شده" },
      delivered: { variant: "default", icon: CheckCircle, label: "Delivered", labelFa: "تحویل داده شده" },
      cancelled: { variant: "destructive", icon: XCircle, label: "Cancelled", labelFa: "لغو شده" },
      rejected: { variant: "destructive", icon: XCircle, label: "Rejected", labelFa: "رد شده" },
    };

    const config = statusConfig[status] || {
      variant: "outline" as const,
      icon: AlertCircle,
      label: status,
      labelFa: status,
    };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {isRTL ? config.labelFa : config.label}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive"; label: string; labelFa: string }> =
      {
        pending: { variant: "secondary", label: "Pending", labelFa: "در انتظار پرداخت" },
        paid: { variant: "default", label: "Paid", labelFa: "پرداخت شده" },
        failed: { variant: "destructive", label: "Failed", labelFa: "ناموفق" },
      };

    const statusConfig = config[status] || { variant: "secondary" as const, label: status, labelFa: status };

    return <Badge variant={statusConfig.variant}>{isRTL ? statusConfig.labelFa : statusConfig.label}</Badge>;
  };

  const getCurrencySymbol = (currency: string) => {
    return currency === "USD" ? "$" : "؋";
  };

  const getSellerName = (sellerId: string, sellerPolicies: SellerPolicy[] | null) => {
    const policy = sellerPolicies?.find((p) => p.seller_id === sellerId);
    return policy?.seller_name || (isRTL ? "فروشنده" : "Seller");
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
        title={isRTL ? "سفارشات من" : "My Orders"}
        description={isRTL ? "پیگیری سفارشات و سابقه خرید" : "Track your orders and purchase history"}
        allowedRoles={["buyer"]}
      >
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
        title={isRTL ? "سفارشات من" : "My Orders"}
        description={isRTL ? "پیگیری سفارشات و سابقه خرید" : "Track your orders and purchase history"}
        allowedRoles={["buyer"]}
      >
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">{isRTL ? "هنوز سفارشی ندارید" : "No orders yet"}</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {isRTL
                ? "با خرید اولین محصول، سفارشات شما در اینجا نمایش داده می‌شود."
                : "Your orders will appear here once you make your first purchase."}
            </p>
            <Button onClick={() => (window.location.href = "/products")}>
              {isRTL ? "مشاهده محصولات" : "Browse Products"}
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isRTL ? "سفارشات من" : "My Orders"}
      description={isRTL ? "پیگیری سفارشات و سابقه خرید" : "Track your orders and purchase history"}
      allowedRoles={["buyer"]}
    >
      <div className="space-y-6">
        {/* Orders Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? "کل سفارشات" : "Total Orders"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => o.status === "pending" || o.status === "processing").length}
                  </p>
                  <p className="text-sm text-muted-foreground">{isRTL ? "در حال پردازش" : "In Progress"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.filter((o) => o.status === "delivered").length}</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? "تحویل شده" : "Delivered"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Accordion type="single" collapsible className="space-y-4">
          {orders.map((order) => {
            const sellerGroups = groupItemsBySeller(order.order_items, order.seller_policies);

            return (
              <AccordionItem
                key={order.id}
                value={order.id}
                className="border rounded-lg px-0 bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 w-full text-left">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{order.order_number}</span>
                        {getStatusBadge(order.status)}
                        {getPaymentStatusBadge(order.payment_status)}
                        {sellerGroups.length > 1 && (
                          <Badge variant="outline" className="gap-1">
                            <Store className="w-3 h-3" />
                            {sellerGroups.length} {isRTL ? "فروشنده" : "sellers"}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(order.created_at), "PPP")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {order.total.toLocaleString()}{" "}
                        {order.seller_orders?.[0]?.currency === "USD" ? "$" : isRTL ? "؋" : "AFN"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_items.length} {isRTL ? "محصول" : "items"}
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
                          {isRTL ? "وضعیت سفارش به تفکیک فروشنده" : "Order Status by Seller"}
                        </h4>
                        <div className="space-y-4">
                          {order.seller_orders.map((sellerOrder) => {
                            const statusSteps = ["pending", "confirmed", "shipped", "delivered"];
                            const isRejected = sellerOrder.status === "rejected";
                            const currentIndex = isRejected ? -1 : statusSteps.indexOf(sellerOrder.status);
                            const statusLabels: Record<string, { en: string; fa: string }> = {
                              pending: { en: "Pending", fa: "در انتظار" },
                              confirmed: { en: "Confirmed", fa: "تایید شده" },
                              shipped: { en: "Shipped", fa: "ارسال شده" },
                              delivered: { en: "Delivered", fa: "تحویل شده" },
                              rejected: { en: "Rejected", fa: "رد شده" },
                            };

                            return (
                              <Card key={sellerOrder.id} className="bg-muted/30 border-primary/10">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between mb-4">
                                    <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                                      {formatProductSKUs(sellerOrder.items, isRTL)}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {getStatusBadge(sellerOrder.status)}
                                      <span className="font-semibold">
                                        {getCurrencySymbol(sellerOrder.currency)}
                                        {sellerOrder.total.toLocaleString()}
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
                                              {isRTL ? statusLabels[step]?.fa : statusLabels[step]?.en}
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
                    <div className="space-y-6">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        {isRTL ? "محصولات" : "Products"}
                      </h4>

                      {sellerGroups.map(([sellerId, group]) => {
                        const sellerOrder = order.seller_orders?.find((so) => so.seller_id === sellerId);

                        return (
                          <div key={sellerId} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Store className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium">{group.sellerName}</span>
                              </div>
                              {sellerOrder && getStatusBadge(sellerOrder.status)}
                            </div>
                            <div className="space-y-2 pl-6">
                              {group.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                    {item.product_image ? (
                                      <img
                                        src={item.product_image}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-5 h-5 text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate text-sm">{item.product_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.quantity} × {item.unit_price.toLocaleString()}{" "}
                                      {sellerOrder?.currency === "USD" ? "$" : isRTL ? "؋" : "AFN"}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {item.product_id && (
                                      <OrderItemReview
                                        orderId={order.id}
                                        productId={item.product_id}
                                        productName={item.product_name}
                                        productImage={item.product_image}
                                        orderStatus={order.status}
                                      />
                                    )}
                                    <div className="text-right">
                                      <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mb-1">
                                        <Truck className="w-3 h-3" />
                                        {isRTL ? "هزینه ارسال" : "Delivery fee"}
                                        <span className="font-medium text-foreground">
                                          {sellerOrder?.delivery_fee?.toLocaleString() || 0}{" "}
                                          {sellerOrder?.currency === "USD" ? "$" : isRTL ? "؋" : "AFN"}
                                        </span>
                                      </p>
                                      <p className="font-semibold text-sm">
                                        {item.total_price.toLocaleString()}{" "}
                                        {sellerOrder?.currency === "USD" ? "$" : isRTL ? "؋" : "AFN"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    {/* Order Summary */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Shipping Address */}
                      {order.shipping_address && (
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {isRTL ? "آدرس ارسال" : "Shipping Address"}
                          </h4>
                          <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-1">
                            <p className="font-medium">{order.shipping_address.name}</p>
                            <p className="text-muted-foreground">{order.shipping_address.phone}</p>
                            <p className="text-muted-foreground">
                              {order.shipping_address.city}, {order.shipping_address.fullAddress}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Payment Summary */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {isRTL ? "خلاصه پرداخت" : "Payment Summary"}
                        </h4>
                        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">{isRTL ? "جمع محصولات" : "Subtotal"}</span>
                            <span>
                              {order.subtotal.toLocaleString()} {isRTL ? "؋" : "AFN"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              {isRTL ? "هزینه ارسال" : "Shipping"}
                            </span>
                            <span>
                              {order.shipping_cost.toLocaleString()} {isRTL ? "؋" : "AFN"}
                            </span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>{isRTL ? "تخفیف" : "Discount"}</span>
                              <span>
                                -{order.discount.toLocaleString()} {isRTL ? "؋" : "AFN"}
                              </span>
                            </div>
                          )}
                          <Separator />
                          <div className="flex justify-between font-bold text-base">
                            <span>{isRTL ? "مجموع" : "Total"}</span>
                            <span className="text-primary">
                              {order.total.toLocaleString()} {isRTL ? "؋" : "AFN"}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground pt-2">
                            <span>{isRTL ? "روش پرداخت" : "Payment Method"}</span>
                            <span>
                              {order.payment_method === "cash_on_delivery"
                                ? isRTL
                                  ? "پرداخت در محل"
                                  : "Cash on Delivery"
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
                            {isRTL ? "سیاست‌های فروشنده" : "Seller Policies"}
                          </h4>
                          {order.seller_policies.map((policy, idx) => (
                            <div key={idx} className="p-4 border rounded-lg space-y-3">
                              <Badge variant="secondary">{policy.seller_name}</Badge>
                              <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
                                    <RotateCcw className="w-3 h-3" />
                                    {isRTL ? "سیاست بازگشت" : "Return Policy"}
                                  </p>
                                  <p className="text-sm p-2 bg-muted/50 rounded">
                                    {policy.return_policy || (isRTL ? "ارائه نشده" : "Not provided")}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-1">
                                    <Truck className="w-3 h-3" />
                                    {isRTL ? "سیاست ارسال" : "Shipping Policy"}
                                  </p>
                                  <p className="text-sm p-2 bg-muted/50 rounded">
                                    {policy.shipping_policy || (isRTL ? "ارائه نشده" : "Not provided")}
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
