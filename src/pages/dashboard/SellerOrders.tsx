import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { formatCurrency } from '@/lib/currencyFormatter';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Package,
  MapPin,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  User,
  DollarSign,
  ShoppingBag,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface ShippingAddress {
  name?: string;
  phone?: string;
  city?: string;
  fullAddress?: string;
}

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
}

interface SellerOrder {
  id: string;
  order_id: string;
  seller_id: string;
  order_number: string;
  status: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
  shipping_address: ShippingAddress | null;
  buyer_name: string | null;
  buyer_phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

// Helper to format SKUs for display
const formatProductSKUs = (items: OrderItem[] | undefined, isRTL: boolean): string => {
  if (!items || items.length === 0) return isRTL ? 'بدون SKU' : 'No SKU';
  
  const skus = items
    .map(item => item.product_sku)
    .filter((sku): sku is string => sku !== null && sku !== undefined && sku.trim() !== '');
  
  if (skus.length === 0) return isRTL ? 'بدون SKU' : 'No SKU';
  if (skus.length === 1) return skus[0];
  if (skus.length === 2) return skus.join(isRTL ? ' ، ' : ', ');
  return `${skus[0]}${isRTL ? ' و ' : ', '}+${skus.length - 1}`;
};

// Helper to calculate totals by currency from order items
const calculateTotalsByCurrency = (items: OrderItem[] | undefined): { usdTotal: number; afnTotal: number } => {
  if (!items || items.length === 0) return { usdTotal: 0, afnTotal: 0 };
  
  let usdTotal = 0;
  let afnTotal = 0;
  
  items.forEach(item => {
    const currency = item.product_currency?.toUpperCase() || 'AFN';
    if (currency === 'USD') {
      usdTotal += item.total_price;
    } else {
      afnTotal += item.total_price;
    }
  });
  
  return { usdTotal, afnTotal };
};

const ORDER_STATUSES = [
  { value: 'pending', label: 'Pending', labelFa: 'در انتظار', color: 'secondary' as const },
  { value: 'confirmed', label: 'Confirmed', labelFa: 'تایید شده', color: 'default' as const },
  { value: 'shipped', label: 'Shipped', labelFa: 'ارسال شده', color: 'default' as const },
  { value: 'delivered', label: 'Delivered', labelFa: 'تحویل شده', color: 'default' as const },
  { value: 'rejected', label: 'Rejected', labelFa: 'رد شده', color: 'destructive' as const },
];

const STATUS_SEQUENCE = ['pending', 'confirmed', 'shipped', 'delivered'];

const canRejectOrder = (status: string): boolean => {
  return status === 'pending';
};

const getNextStatus = (currentStatus: string): string | null => {
  const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus);
  if (currentIndex >= 0 && currentIndex < STATUS_SEQUENCE.length - 1) {
    return STATUS_SEQUENCE[currentIndex + 1];
  }
  return null;
};

const getStatusLabel = (status: string, isRTL: boolean) => {
  const statusConfig = ORDER_STATUSES.find(s => s.value === status);
  return statusConfig ? (isRTL ? statusConfig.labelFa : statusConfig.label) : status;
};

const SellerOrders = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<{ orderId: string; action: 'confirm' | 'reject' } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const fetchOrders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seller_orders')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data
      const transformedOrders = (data || []).map((order) => ({
        ...order,
        shipping_address: order.shipping_address as unknown as ShippingAddress | null,
      }));

      // Fetch order items for each order with product SKUs
      const ordersWithItems = await Promise.all(
        transformedOrders.map(async (order) => {
          const { data: items } = await supabase
            .from('order_items')
            .select(`
              *,
              products:product_id (sku, currency)
            `)
            .eq('order_id', order.order_id)
            .eq('seller_id', user.id);

          // Map items to include product_sku and product_currency
          const itemsWithSku = (items || []).map((item: any) => ({
            ...item,
            product_sku: item.products?.sku || null,
            product_currency: item.products?.currency || order.currency,
          }));

          return {
            ...order,
            order_items: itemsWithSku,
          };
        })
      );

      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'خطا در دریافت سفارشات' : 'Failed to fetch orders',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    setUpdatingStatus({ orderId, action: 'confirm' });
    try {
      const { error } = await supabase
        .from('seller_orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'وضعیت سفارش بروزرسانی شد' : 'Order status updated successfully',
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'خطا در بروزرسانی وضعیت' : 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    setUpdatingStatus({ orderId, action: 'reject' });
    try {
      const { error } = await supabase
        .from('seller_orders')
        .update({ status: 'rejected' })
        .eq('id', orderId);

      if (error) throw error;

      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: 'rejected' } : order
        )
      );

      toast({
        title: isRTL ? 'موفق' : 'Success',
        description: isRTL ? 'سفارش رد شد' : 'Order has been rejected',
      });
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: isRTL ? 'خطا' : 'Error',
        description: isRTL ? 'خطا در رد سفارش' : 'Failed to reject order',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const config = ORDER_STATUSES.find((s) => s.value === status) || ORDER_STATUSES[0];
    const icons: Record<string, typeof CheckCircle> = {
      pending: Clock,
      confirmed: CheckCircle,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: XCircle,
      rejected: XCircle,
    };
    const Icon = icons[status] || AlertCircle;

    return (
      <Badge variant={config.color} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {isRTL ? config.labelFa : config.label}
      </Badge>
    );
  };


  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  if (loading) {
    return (
      <DashboardLayout
        title={isRTL ? 'سفارشات' : 'Orders'}
        description={isRTL ? 'مدیریت سفارشات مشتریان' : 'Manage customer orders'}
        allowedRoles={['seller']}
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isRTL ? 'سفارشات' : 'Orders'}
      description={isRTL ? 'مدیریت سفارشات مشتریان' : 'Manage customer orders'}
      allowedRoles={['seller']}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{orders.length}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'کل سفارشات' : 'Total Orders'}
                  </p>
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
                    {orders.filter((o) => o.status === 'pending').length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'در انتظار' : 'Pending'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => o.status === 'shipped').length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'ارسال شده' : 'Shipped'}
                  </p>
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
                  <p className="text-2xl font-bold">
                    {orders.filter((o) => o.status === 'delivered').length}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'تحویل شده' : 'Delivered'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter & Actions Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={isRTL ? 'فیلتر وضعیت' : 'Filter by status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isRTL ? 'همه سفارشات' : 'All Orders'}</SelectItem>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {isRTL ? status.labelFa : status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={fetchOrders} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                {isRTL ? 'بروزرسانی' : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isRTL ? 'سفارشی یافت نشد' : 'No orders found'}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {filterStatus !== 'all'
                  ? isRTL
                    ? 'سفارشی با این وضعیت وجود ندارد'
                    : 'No orders with this status'
                  : isRTL
                  ? 'هنوز سفارشی دریافت نکرده‌اید'
                  : "You haven't received any orders yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-4">
            {filteredOrders.map((order) => (
              <AccordionItem
                key={order.id}
                value={order.id}
                className="border rounded-lg bg-card shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="px-6 py-4 hover:no-underline">
                  <div className="flex flex-col md:flex-row md:items-center gap-4 w-full text-left">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                          {formatProductSKUs(order.order_items, isRTL)}
                        </span>
                        {getStatusBadge(order.status)}
                        <Badge variant="outline" className="gap-1">
                          <DollarSign className="w-3 h-3" />
                          {order.currency}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(order.created_at), 'PPP')}
                        </span>
                        {order.buyer_name && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {order.buyer_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {(() => {
                          const { usdTotal, afnTotal } = calculateTotalsByCurrency(order.order_items);
                          const totalAfnWithDelivery = afnTotal + order.delivery_fee;
                          
                          if (usdTotal > 0 && totalAfnWithDelivery > 0) {
                            return (
                              <>
                                {formatCurrency(usdTotal, 'USD', isRTL)} +{' '}
                                {formatCurrency(totalAfnWithDelivery, 'AFN', isRTL)}
                              </>
                            );
                          } else if (usdTotal > 0) {
                            return formatCurrency(usdTotal, 'USD', isRTL);
                          } else {
                            return formatCurrency(totalAfnWithDelivery, 'AFN', isRTL);
                          }
                        })()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.order_items?.length || 0} {isRTL ? 'محصول' : 'items'}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Status Update */}
                    <Card className="bg-muted/30 border-primary/10">
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                            <div>
                              <h4 className="font-medium mb-1">
                                {isRTL ? 'وضعیت سفارش' : 'Order Status'}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {isRTL
                                  ? 'مرحله بعد: '
                                  : 'Next step: '}
                                <span className="font-medium text-primary">
                                  {getNextStatus(order.status)
                                    ? getStatusLabel(getNextStatus(order.status)!, isRTL)
                                    : (isRTL ? 'تکمیل شده' : 'Completed')}
                                </span>
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {canRejectOrder(order.status) && (
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRejectOrder(order.id)}
                                  disabled={updatingStatus?.orderId === order.id}
                                  className="gap-2"
                                >
                                  {updatingStatus?.orderId === order.id && updatingStatus?.action === 'reject' ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                  {isRTL ? 'رد سفارش' : 'Reject Order'}
                                </Button>
                              )}
                              {getNextStatus(order.status) && order.status !== 'rejected' && (
                                <Button
                                  onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                                  disabled={updatingStatus?.orderId === order.id}
                                  className="gap-2"
                                >
                                  {updatingStatus?.orderId === order.id && updatingStatus?.action === 'confirm' ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  {isRTL ? 'تایید و ادامه' : 'Confirm & Continue'}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress Steps */}
                          <div className="pt-4">
                            {order.status === 'rejected' ? (
                              <div className="flex items-center justify-center gap-2 py-4">
                                <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                                  <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-destructive-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-destructive">
                                      {isRTL ? 'رد شده' : 'Rejected'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {isRTL ? 'این سفارش رد شده است' : 'This order has been rejected'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                            <div className="relative flex items-center justify-between">
                              {/* Progress Line Background */}
                              <div className="absolute top-5 start-0 end-0 h-0.5 bg-muted" />
                              
                              {/* Progress Line Fill */}
                              <div
                                className="absolute top-5 start-0 h-0.5 bg-primary transition-all duration-500"
                                style={{
                                  width: `${(STATUS_SEQUENCE.indexOf(order.status) / (STATUS_SEQUENCE.length - 1)) * 100}%`,
                                }}
                              />

                              {/* Steps */}
                              {ORDER_STATUSES.filter(s => s.value !== 'rejected').map((step, index) => {
                                const isCompleted = STATUS_SEQUENCE.indexOf(order.status) >= index;
                                const isCurrent = order.status === step.value;
                                const icons: Record<string, typeof CheckCircle> = {
                                  pending: Clock,
                                  confirmed: CheckCircle,
                                  shipped: Truck,
                                  delivered: CheckCircle,
                                };
                                const Icon = icons[step.value] || Clock;

                                return (
                                  <div key={step.value} className="relative flex flex-col items-center z-10">
                                    <div
                                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                        isCompleted
                                          ? 'bg-primary text-primary-foreground border-primary'
                                          : 'bg-background text-muted-foreground border-muted'
                                      } ${isCurrent ? 'ring-4 ring-primary/20 scale-110' : ''}`}
                                    >
                                      <Icon className="w-5 h-5" />
                                    </div>
                                    <span
                                      className={`mt-2 text-xs font-medium text-center transition-colors ${
                                        isCompleted ? 'text-primary' : 'text-muted-foreground'
                                      }`}
                                    >
                                      {isRTL ? step.labelFa : step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Order Items */}
                    {order.order_items && order.order_items.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          {isRTL ? 'محصولات' : 'Products'}
                        </h4>
                        <div className="space-y-3">
                          {order.order_items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                            >
                              <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                {item.product_image ? (
                                  <img
                                    src={item.product_image}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{item.product_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {item.quantity} × {formatCurrency(item.unit_price, item.product_currency || order.currency, isRTL)}
                                </p>
                              </div>
                              <div className="text-right space-y-1">
                                <p className="text-xs text-muted-foreground">
                                  {isRTL ? 'هزینه ارسال' : 'Delivery fee'}{' '}
                                  <span className="font-medium text-foreground">
                                    {formatCurrency(order.delivery_fee, 'AFN', isRTL)}
                                  </span>
                                </p>
                                <p className="font-semibold">
                                  {formatCurrency(item.total_price, item.product_currency || order.currency, isRTL)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Order Summary */}
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* Shipping Address */}
                      {order.shipping_address && (
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {isRTL ? 'آدرس ارسال' : 'Shipping Address'}
                          </h4>
                          <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">
                                {order.buyer_name || order.shipping_address.name}
                              </span>
                            </div>
                            {(order.buyer_phone || order.shipping_address.phone) && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-muted-foreground" />
                                <span>{order.buyer_phone || order.shipping_address.phone}</span>
                              </div>
                            )}
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <span>
                                {order.shipping_address.city}
                                {order.shipping_address.fullAddress && `, ${order.shipping_address.fullAddress}`}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Payment Summary */}
                      <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          {isRTL ? 'خلاصه پرداخت' : 'Payment Summary'}
                        </h4>
                        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                          {(() => {
                            const { usdTotal, afnTotal } = calculateTotalsByCurrency(order.order_items);
                            const totalAfnWithDelivery = afnTotal + order.delivery_fee;
                            const hasMixedCurrency = usdTotal > 0 && afnTotal >= 0;
                            
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    {isRTL ? 'جمع محصولات' : 'Subtotal'}
                                  </span>
                                  <span>
                                    {hasMixedCurrency ? (
                                      <>
                                        {formatCurrency(usdTotal, 'USD', isRTL)} +{' '}
                                        {formatCurrency(afnTotal, 'AFN', isRTL)}
                                      </>
                                    ) : (
                                      formatCurrency(afnTotal, 'AFN', isRTL)
                                    )}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Truck className="w-3 h-3" />
                                    {isRTL ? 'هزینه ارسال' : 'Shipping'}
                                  </span>
                                  <span>
                                    {formatCurrency(order.delivery_fee, 'AFN', isRTL)}
                                  </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-base">
                                  <span>{isRTL ? 'مجموع' : 'Total'}</span>
                                  <span className="text-primary">
                                    {hasMixedCurrency ? (
                                      <>
                                        {formatCurrency(usdTotal, 'USD', isRTL)} +{' '}
                                        {formatCurrency(totalAfnWithDelivery, 'AFN', isRTL)}
                                      </>
                                    ) : (
                                      formatCurrency(totalAfnWithDelivery, 'AFN', isRTL)
                                    )}
                                  </span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SellerOrders;
