import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { formatCurrency } from '@/lib/currencyFormatter';
import { useCurrencyRate } from '@/hooks/useCurrencyRate';
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
import { getColorByValue } from '@/lib/productColors';

// Trilingual translations
const translations = {
  pageTitle: { en: 'Orders', fa: 'سفارشات', ps: 'امرونه' },
  pageDescription: { en: 'Manage customer orders', fa: 'مدیریت سفارشات مشتریان', ps: 'د پیرودونکو امرونه اداره کړئ' },
  totalOrders: { en: 'Total Orders', fa: 'کل سفارشات', ps: 'ټول امرونه' },
  pending: { en: 'Pending', fa: 'در انتظار', ps: 'تر کتنې لاندې' },
  shipped: { en: 'Shipped', fa: 'ارسال شده', ps: 'لیږل شوی' },
  delivered: { en: 'Delivered', fa: 'تحویل شده', ps: 'تحویل شوی' },
  filterByStatus: { en: 'Filter by status', fa: 'فیلتر وضعیت', ps: 'د حالت فلتر' },
  allOrders: { en: 'All Orders', fa: 'همه سفارشات', ps: 'ټول امرونه' },
  refresh: { en: 'Refresh', fa: 'بروزرسانی', ps: 'تازه کول' },
  noOrdersFound: { en: 'No orders found', fa: 'سفارشی یافت نشد', ps: 'هیڅ امر ونه موندل شو' },
  noOrdersWithStatus: { en: 'No orders with this status', fa: 'سفارشی با این وضعیت وجود ندارد', ps: 'د دې حالت سره هیڅ امر نشته' },
  noOrdersYet: { en: "You haven't received any orders yet", fa: 'هنوز سفارشی دریافت نکرده‌اید', ps: 'تاسو لا تر اوسه هیڅ امر نه دی ترلاسه کړی' },
  orderStatus: { en: 'Order Status', fa: 'وضعیت سفارش', ps: 'د امر حالت' },
  nextStep: { en: 'Next step', fa: 'مرحله بعد', ps: 'راتلونکی ګام' },
  completed: { en: 'Completed', fa: 'تکمیل شده', ps: 'بشپړ شو' },
  rejectOrder: { en: 'Reject Order', fa: 'رد سفارش', ps: 'امر رد کړئ' },
  confirmAndContinue: { en: 'Confirm & Continue', fa: 'تایید و ادامه', ps: 'تایید او ادامه' },
  rejected: { en: 'Rejected', fa: 'رد شده', ps: 'رد شوی' },
  orderRejected: { en: 'This order has been rejected', fa: 'این سفارش رد شده است', ps: 'دا امر رد شوی دی' },
  products: { en: 'Products', fa: 'محصولات', ps: 'محصولات' },
  deliveryFee: { en: 'Delivery fee', fa: 'هزینه ارسال', ps: 'د لیږد فیس' },
  shippingAddress: { en: 'Shipping Address', fa: 'آدرس ارسال', ps: 'د لیږد پته' },
  paymentSummary: { en: 'Payment Summary', fa: 'خلاصه پرداخت', ps: 'د تادیې لنډیز' },
  subtotal: { en: 'Subtotal', fa: 'جمع محصولات', ps: 'فرعي مجموعه' },
  shipping: { en: 'Shipping', fa: 'هزینه ارسال', ps: 'لیږل' },
  total: { en: 'Total', fa: 'مجموع', ps: 'مجموعه' },
  items: { en: 'items', fa: 'محصول', ps: 'توکي' },
  noSKU: { en: 'No SKU', fa: 'بدون SKU', ps: 'SKU نشته' },
  error: { en: 'Error', fa: 'خطا', ps: 'ستونزه' },
  success: { en: 'Success', fa: 'موفق', ps: 'بریالی' },
  failedToFetchOrders: { en: 'Failed to fetch orders', fa: 'خطا در دریافت سفارشات', ps: 'د امرونو راوړلو کې ستونزه' },
  orderStatusUpdated: { en: 'Order status updated successfully', fa: 'وضعیت سفارش بروزرسانی شد', ps: 'د امر حالت په بریالیتوب سره تازه شو' },
  failedToUpdateStatus: { en: 'Failed to update order status', fa: 'خطا در بروزرسانی وضعیت', ps: 'د حالت تازه کولو کې ستونزه' },
  orderRejectedSuccess: { en: 'Order has been rejected', fa: 'سفارش رد شد', ps: 'امر رد شو' },
  failedToReject: { en: 'Failed to reject order', fa: 'خطا در رد سفارش', ps: 'د امر په ردولو کې ستونزه' },
  status: {
    pending: { en: 'Pending', fa: 'در انتظار', ps: 'تر کتنې لاندې' },
    confirmed: { en: 'Confirmed', fa: 'تایید شده', ps: 'تایید شوی' },
    shipped: { en: 'Shipped', fa: 'ارسال شده', ps: 'لیږل شوی' },
    delivered: { en: 'Delivered', fa: 'تحویل شده', ps: 'تحویل شوی' },
    rejected: { en: 'Rejected', fa: 'رد شده', ps: 'رد شوی' },
  }
};

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
  selected_color?: string | null;
  selected_size?: string | null;
  selected_delivery_option_id?: string | null;
  delivery_label?: string | null;
  delivery_price_afn?: number | null;
  delivery_hours?: number | null;
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

const SellerOrders = () => {
  const { isRTL, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { convertToUSD, rate } = useCurrencyRate();
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<SellerOrder | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<{ orderId: string; action: 'confirm' | 'reject' } | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const lang = language as 'en' | 'fa' | 'ps';

  // Translation helper
  const t = (key: keyof typeof translations) => {
    const value = translations[key];
    if (typeof value === 'object' && 'en' in value && 'fa' in value && 'ps' in value) {
      return (value as Record<string, string>)[lang] || (value as Record<string, string>).en;
    }
    return key;
  };

  // Get status label with trilingual support
  const getStatusLabel = (status: string) => {
    const statusKey = status as keyof typeof translations.status;
    if (translations.status[statusKey]) {
      return translations.status[statusKey][lang] || translations.status[statusKey].en;
    }
    return status;
  };

  // Helper to format SKUs for display
  const formatProductSKUs = (items: OrderItem[] | undefined): string => {
    if (!items || items.length === 0) return t('noSKU');
    
    const skus = items
      .map(item => item.product_sku)
      .filter((sku): sku is string => sku !== null && sku !== undefined && sku.trim() !== '');
    
    if (skus.length === 0) return t('noSKU');
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
    { value: 'pending', color: 'secondary' as const },
    { value: 'confirmed', color: 'default' as const },
    { value: 'shipped', color: 'default' as const },
    { value: 'delivered', color: 'default' as const },
    { value: 'rejected', color: 'destructive' as const },
  ];

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
          const { data: items, error: itemsError } = await supabase
            .from('order_items')
            .select(`
              *,
              products:product_id (sku)
            `)
            .eq('order_id', order.order_id)
            .eq('seller_id', user.id);

          if (itemsError) {
            console.error('Error fetching order items:', itemsError);
          }

          // Get product IDs that don't have delivery_label (legacy orders)
          const legacyProductIds = (items || [])
            .filter((item: any) => !item.delivery_label && item.product_id)
            .map((item: any) => item.product_id);

          // Fetch default delivery options for legacy products
          let deliveryOptionsMap: Record<string, any> = {};
          if (legacyProductIds.length > 0) {
            const { data: deliveryOptions } = await supabase
              .from('delivery_options')
              .select('product_id, label_en, label_fa, label_ps, price_afn, delivery_hours')
              .in('product_id', legacyProductIds)
              .eq('is_default', true)
              .eq('is_active', true);

            if (deliveryOptions) {
              deliveryOptionsMap = deliveryOptions.reduce((acc: any, opt: any) => {
                acc[opt.product_id] = opt;
                return acc;
              }, {});
            }
          }

          // Map items to include product_sku and fallback delivery info
          const itemsWithSku = (items || []).map((item: any) => {
            const legacyDelivery = item.product_id ? deliveryOptionsMap[item.product_id] : null;
            const deliveryLabel = item.delivery_label || (legacyDelivery ? 
              (lang === 'ps' ? legacyDelivery.label_ps : lang === 'fa' ? legacyDelivery.label_fa : legacyDelivery.label_en) || legacyDelivery.label_en
              : null);
            
            return {
              ...item,
              product_sku: item.products?.sku || null,
              product_currency: order.currency,
              delivery_label: deliveryLabel,
              delivery_price_afn: item.delivery_price_afn || (legacyDelivery?.price_afn ?? null),
              delivery_hours: item.delivery_hours || (legacyDelivery?.delivery_hours ?? null),
            };
          });

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
        title: t('error'),
        description: t('failedToFetchOrders'),
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
        title: t('success'),
        description: t('orderStatusUpdated'),
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: t('error'),
        description: t('failedToUpdateStatus'),
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
        title: t('success'),
        description: t('orderRejectedSuccess'),
      });
    } catch (error) {
      console.error('Error rejecting order:', error);
      toast({
        title: t('error'),
        description: t('failedToReject'),
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
        {getStatusLabel(status)}
      </Badge>
    );
  };

  const filteredOrders = filterStatus === 'all'
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  if (loading) {
    return (
      <DashboardLayout
        title={t('pageTitle')}
        description={t('pageDescription')}
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
      title={t('pageTitle')}
      description={t('pageDescription')}
      allowedRoles={['seller']}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-3 md:pt-6 md:px-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 md:w-6 md:h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold">{orders.length}</p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {t('totalOrders')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="p-3 md:pt-6 md:px-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold">
                    {orders.filter((o) => o.status === 'pending').length}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {t('pending')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-3 md:pt-6 md:px-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Truck className="w-4 h-4 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold">
                    {orders.filter((o) => o.status === 'shipped').length}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {t('shipped')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-3 md:pt-6 md:px-6">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 md:w-6 md:h-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-lg md:text-2xl font-bold">
                    {orders.filter((o) => o.status === 'delivered').length}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground truncate">
                    {t('delivered')}
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
                    <SelectValue placeholder={t('filterByStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('allOrders')}</SelectItem>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {getStatusLabel(status.value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" onClick={fetchOrders} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                {t('refresh')}
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
                {t('noOrdersFound')}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {filterStatus !== 'all' ? t('noOrdersWithStatus') : t('noOrdersYet')}
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
                          {formatProductSKUs(order.order_items)}
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
                        {order.order_items?.length || 0} {t('items')}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-6 pb-6">
                  <div className="space-y-6">
                    {/* Status Update */}
                    <Card className="bg-muted/30 border-primary/10">
                      <CardContent className="pt-4 sm:pt-6">
                        <div className="space-y-4">
                          <div className="flex flex-col gap-3 sm:gap-4">
                            <div>
                              <h4 className="font-medium mb-1 text-sm sm:text-base">
                                {t('orderStatus')}
                              </h4>
                              <p className="text-xs sm:text-sm text-muted-foreground">
                                {t('nextStep')}: {' '}
                                <span className="font-medium text-primary">
                                  {getNextStatus(order.status)
                                    ? getStatusLabel(getNextStatus(order.status)!)
                                    : t('completed')}
                                </span>
                              </p>
                            </div>
                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                              {canRejectOrder(order.status) && (
                                <Button
                                  variant="destructive"
                                  onClick={() => handleRejectOrder(order.id)}
                                  disabled={updatingStatus?.orderId === order.id}
                                  className="gap-2 w-full sm:w-auto min-h-[44px]"
                                  size="sm"
                                >
                                  {updatingStatus?.orderId === order.id && updatingStatus?.action === 'reject' ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <XCircle className="w-4 h-4" />
                                  )}
                                  {t('rejectOrder')}
                                </Button>
                              )}
                              {getNextStatus(order.status) && order.status !== 'rejected' && (
                                <Button
                                  onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                                  disabled={updatingStatus?.orderId === order.id}
                                  className="gap-2 w-full sm:w-auto min-h-[44px]"
                                  size="sm"
                                >
                                  {updatingStatus?.orderId === order.id && updatingStatus?.action === 'confirm' ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="w-4 h-4" />
                                  )}
                                  {t('confirmAndContinue')}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {/* Progress Steps */}
                          <div className="pt-2 sm:pt-4 overflow-x-auto pb-2">
                            {order.status === 'rejected' ? (
                              <div className="flex items-center justify-center gap-2 py-2 sm:py-4">
                                <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-destructive flex items-center justify-center flex-shrink-0">
                                    <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-destructive-foreground" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-destructive text-sm sm:text-base">
                                      {t('rejected')}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {t('orderRejected')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="relative flex items-center justify-between min-w-[280px]">
                                <div className="absolute top-4 sm:top-5 start-0 end-0 h-0.5 bg-muted" />
                                <div
                                  className="absolute top-4 sm:top-5 start-0 h-0.5 bg-primary transition-all duration-500"
                                  style={{
                                    width: `${(STATUS_SEQUENCE.indexOf(order.status) / (STATUS_SEQUENCE.length - 1)) * 100}%`,
                                  }}
                                />

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
                                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                                          isCompleted
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-background text-muted-foreground border-muted'
                                        } ${isCurrent ? 'ring-2 sm:ring-4 ring-primary/20 scale-105 sm:scale-110' : ''}`}
                                      >
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                                      </div>
                                      <span
                                        className={`mt-1 sm:mt-2 text-[10px] sm:text-xs font-medium text-center transition-colors whitespace-nowrap ${
                                          isCompleted ? 'text-primary' : 'text-muted-foreground'
                                        }`}
                                      >
                                        {getStatusLabel(step.value)}
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
                          {t('products')}
                        </h4>
                        <div className="space-y-3">
                          {order.order_items.map((item) => {
                            const colorDef = item.selected_color ? getColorByValue(item.selected_color) : null;
                            const colorName = colorDef ? (isRTL ? colorDef.nameFa : colorDef.name) : '';
                            const lang = language as 'en' | 'fa' | 'ps';
                            const getLabel = (en: string, fa: string, ps: string) => {
                              if (lang === 'ps') return ps;
                              if (lang === 'fa') return fa;
                              return en;
                            };
                            return (
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
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-medium truncate">{item.product_name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    × {item.quantity} {getLabel('pcs', 'عدد', 'ټوټه')}
                                  </span>
                                  {/* Color indicator */}
                                  {colorDef && (
                                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
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
                                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                                      <span>•</span>
                                      {getLabel('size', 'سایز', 'اندازه')}({item.selected_size})
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(item.unit_price, item.product_currency || order.currency, isRTL)}
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
                                        ? getLabel(getLabel('Free', 'رایگان', 'وړیا'), getLabel('Free', 'رایگان', 'وړیا'), getLabel('Free', 'رایگان', 'وړیا'))
                                        : formatCurrency(item.delivery_price_afn || 0, 'AFN', isRTL)}
                                    </span>
                                  </p>
                                )}
                                {!item.delivery_label && (
                                  <p className="text-xs text-muted-foreground">
                                    {t('deliveryFee')}{' '}
                                    <span className="font-medium text-foreground">
                                      {formatCurrency(order.delivery_fee, 'AFN', isRTL)}
                                    </span>
                                  </p>
                                )}
                                <p className="font-semibold">
                                  {formatCurrency(item.total_price, item.product_currency || order.currency, isRTL)}
                                </p>
                              </div>
                            </div>
                            );
                          })}
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
                            {t('shippingAddress')}
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
                          {t('paymentSummary')}
                        </h4>
                        <div className="p-4 bg-muted/50 rounded-lg text-sm space-y-2">
                        {(() => {
                            const { usdTotal, afnTotal } = calculateTotalsByCurrency(order.order_items);
                            // Calculate total shipping from order items (fallback to order.delivery_fee for legacy)
                            const totalShippingFromItems = (order.order_items || []).reduce(
                              (sum, item) => sum + (item.delivery_price_afn || 0), 0
                            );
                            const shippingFee = totalShippingFromItems > 0 ? totalShippingFromItems : order.delivery_fee;
                            const totalAfnWithDelivery = afnTotal + shippingFee;
                            const hasMixedCurrency = usdTotal > 0 && afnTotal >= 0;
                            
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">
                                    {t('subtotal')}
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
                                    {t('shipping')}
                                  </span>
                                  <span>
                                    {formatCurrency(shippingFee, 'AFN', isRTL)}
                                  </span>
                                </div>
                                <Separator />
                                <div className="flex flex-col">
                                  <div className="flex justify-between font-bold text-base">
                                    <span>{t('total')}</span>
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
                                  {rate && totalAfnWithDelivery > 0 && (
                                    <div className="flex justify-end">
                                      <span className="text-xs text-muted-foreground">
                                        ≈ ${convertToUSD(totalAfnWithDelivery).toFixed(2)} USD
                                      </span>
                                    </div>
                                  )}
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
