import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  ArrowLeft,
  ArrowRight,
  Package,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Truck,
  Phone,
  Mail,
  Hash,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage, formatDate, formatCurrency } from '@/lib/i18n';

interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  seller_id: string;
  product?: {
    sku: string | null;
  } | null;
}

interface ShippingAddress {
  fullName?: string;
  phone?: string;
  email?: string;
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  status: string;
  payment_status: string;
  payment_method: string | null;
  subtotal_usd: number;
  subtotal_afn: number;
  delivery_fee_afn: number;
  total_usd: number;
  total_afn: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  currency: string;
  settlement_currency: string;
  notes: string | null;
  shipping_address: ShippingAddress | null;
  billing_address: ShippingAddress | null;
  created_at: string;
  updated_at: string;
  order_items: OrderItem[];
  buyer_profile?: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
}

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, direction } = useLanguage();
  const isRTL = direction === 'rtl';

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      // Fetch order with items
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            product_image,
            unit_price,
            quantity,
            total_price,
            seller_id,
            products:product_id (sku)
          )
        `)
        .eq('id', id)
        .single();

      if (orderError) throw orderError;

      // Fetch buyer profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, email, phone')
        .eq('user_id', orderData.buyer_id)
        .single();

      // Process order items
      const processedItems = (orderData.order_items || []).map((item: any) => ({
        ...item,
        product: item.products || null,
      }));

      setOrder({
        ...orderData,
        order_items: processedItems,
        buyer_profile: profileData || null,
        shipping_address: orderData.shipping_address as ShippingAddress | null,
        billing_address: orderData.billing_address as ShippingAddress | null,
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error(isRTL ? 'خطا در بارگذاری سفارش' : 'Error loading order');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', order.id);

      if (error) throw error;

      // Update seller orders too
      await supabase
        .from('seller_orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('order_id', order.id);

      setOrder({ ...order, status: newStatus });
      toast.success(isRTL ? 'وضعیت سفارش بروزرسانی شد' : 'Order status updated');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(isRTL ? 'خطا در بروزرسانی وضعیت' : 'Error updating status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePaymentStatusUpdate = async (newStatus: string) => {
    if (!order) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', order.id);

      if (error) throw error;

      setOrder({ ...order, payment_status: newStatus });
      toast.success(isRTL ? 'وضعیت پرداخت بروزرسانی شد' : 'Payment status updated');
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(isRTL ? 'خطا در بروزرسانی وضعیت پرداخت' : 'Error updating payment status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'cancelled':
      case 'refunded':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-primary" />;
      default:
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: isRTL ? 'در انتظار' : 'Pending', className: 'bg-warning text-warning-foreground' },
      confirmed: { label: isRTL ? 'تایید شده' : 'Confirmed', className: 'bg-primary text-primary-foreground' },
      processing: { label: isRTL ? 'در حال پردازش' : 'Processing', className: 'bg-info text-primary-foreground' },
      shipped: { label: isRTL ? 'ارسال شده' : 'Shipped', className: 'bg-accent text-accent-foreground' },
      delivered: { label: isRTL ? 'تحویل شده' : 'Delivered', className: 'bg-success text-success-foreground' },
      cancelled: { label: isRTL ? 'لغو شده' : 'Cancelled', className: 'bg-destructive text-destructive-foreground' },
      refunded: { label: isRTL ? 'مسترد شده' : 'Refunded', className: 'bg-muted text-muted-foreground' },
    };

    const info = statusMap[status] || { label: status, className: '' };
    return <Badge className={info.className}>{info.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: isRTL ? 'در انتظار' : 'Pending', variant: 'secondary' },
      paid: { label: isRTL ? 'پرداخت شده' : 'Paid', variant: 'default' },
      failed: { label: isRTL ? 'ناموفق' : 'Failed', variant: 'destructive' },
      refunded: { label: isRTL ? 'مسترد شده' : 'Refunded', variant: 'outline' },
    };

    const info = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout title={isRTL ? 'جزئیات سفارش' : 'Order Details'} description="">
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-64 lg:col-span-2" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title={isRTL ? 'سفارش یافت نشد' : 'Order Not Found'} description="">
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {isRTL ? 'سفارش مورد نظر یافت نشد' : 'Order not found'}
          </h2>
          <Button onClick={() => navigate('/dashboard/orders')} variant="outline">
            {isRTL ? <ArrowRight className="mr-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
            {isRTL ? 'بازگشت به سفارشات' : 'Back to Orders'}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const shippingAddress = order.shipping_address;

  return (
    <AdminLayout 
      title={isRTL ? 'جزئیات سفارش' : 'Order Details'} 
      description={`${isRTL ? 'شماره سفارش:' : 'Order #'} ${order.order_number}`}
    >
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/orders')}
            className="w-fit"
          >
            {isRTL ? <ArrowRight className="mr-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
            {isRTL ? 'بازگشت' : 'Back'}
          </Button>
          <div className="flex items-center gap-2">
            {getStatusIcon(order.status)}
            {getStatusBadge(order.status)}
            {getPaymentBadge(order.payment_status)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <Card className="lg:col-span-2 hover-lift">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {isRTL ? 'آیتم‌های سفارش' : 'Order Items'}
                <Badge variant="secondary" className="ml-2">
                  {order.order_items.length} {isRTL ? 'آیتم' : 'items'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {order.order_items.map((item) => (
                  <div key={item.id} className="p-4 flex gap-4 hover:bg-muted/50 transition-colors">
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                      <img
                        src={item.product_image || '/placeholder.svg'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate">{item.product_name}</h4>
                      {item.product?.sku && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <Hash className="h-3 w-3" />
                          SKU: {item.product.sku}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          {isRTL ? 'قیمت واحد:' : 'Unit:'} {formatCurrency(Number(item.unit_price), isRTL ? 'fa' : 'en')}
                        </span>
                        <span className="text-muted-foreground">
                          {isRTL ? 'تعداد:' : 'Qty:'} {item.quantity}
                        </span>
                        <span className="font-semibold text-primary">
                          {isRTL ? 'جمع:' : 'Total:'} {formatCurrency(Number(item.total_price), isRTL ? 'fa' : 'en')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="p-4 bg-muted/30 border-t border-border space-y-2">
                {order.subtotal_usd > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{isRTL ? 'جمع فرعی (USD)' : 'Subtotal (USD)'}</span>
                    <span>${Number(order.subtotal_usd).toFixed(2)}</span>
                  </div>
                )}
                {order.subtotal_afn > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{isRTL ? 'جمع فرعی (AFN)' : 'Subtotal (AFN)'}</span>
                    <span>{Number(order.subtotal_afn).toFixed(0)} AFN</span>
                  </div>
                )}
                {Number(order.delivery_fee_afn) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{isRTL ? 'هزینه ارسال' : 'Delivery Fee'}</span>
                    <span>{Number(order.delivery_fee_afn).toFixed(0)} AFN</span>
                  </div>
                )}
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{isRTL ? 'تخفیف' : 'Discount'}</span>
                    <span>-{formatCurrency(Number(order.discount), isRTL ? 'fa' : 'en')}</span>
                  </div>
                )}
                <Separator />
                {order.total_usd > 0 && (
                  <div className="flex justify-between font-bold text-lg">
                    <span>{isRTL ? 'مجموع (USD)' : 'Total (USD)'}</span>
                    <span className="text-primary">${Number(order.total_usd).toFixed(2)}</span>
                  </div>
                )}
                {order.total_afn > 0 && (
                  <div className="flex justify-between font-bold text-lg">
                    <span>{isRTL ? 'مجموع (AFN)' : 'Total (AFN)'}</span>
                    <span className="text-primary">{Number(order.total_afn).toFixed(0)} AFN</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Details */}
          <div className="space-y-6">
            {/* Order Info */}
            <Card className="hover-lift">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {isRTL ? 'اطلاعات سفارش' : 'Order Info'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{isRTL ? 'شماره سفارش' : 'Order #'}</span>
                  <span className="font-mono font-medium">{order.order_number}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{isRTL ? 'تاریخ' : 'Date'}</span>
                  <span>{formatDate(new Date(order.created_at), isRTL ? 'fa' : 'en')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{isRTL ? 'روش پرداخت' : 'Payment'}</span>
                  <span>{order.payment_method || (isRTL ? 'نقدی' : 'Cash')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Update Status */}
            <Card className="hover-lift">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  {isRTL ? 'بروزرسانی وضعیت' : 'Update Status'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isRTL ? 'وضعیت سفارش' : 'Order Status'}</label>
                  <Select
                    value={order.status}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{isRTL ? 'در انتظار' : 'Pending'}</SelectItem>
                      <SelectItem value="confirmed">{isRTL ? 'تایید شده' : 'Confirmed'}</SelectItem>
                      <SelectItem value="processing">{isRTL ? 'در حال پردازش' : 'Processing'}</SelectItem>
                      <SelectItem value="shipped">{isRTL ? 'ارسال شده' : 'Shipped'}</SelectItem>
                      <SelectItem value="delivered">{isRTL ? 'تحویل شده' : 'Delivered'}</SelectItem>
                      <SelectItem value="cancelled">{isRTL ? 'لغو شده' : 'Cancelled'}</SelectItem>
                      <SelectItem value="refunded">{isRTL ? 'مسترد شده' : 'Refunded'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{isRTL ? 'وضعیت پرداخت' : 'Payment Status'}</label>
                  <Select
                    value={order.payment_status}
                    onValueChange={handlePaymentStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{isRTL ? 'در انتظار' : 'Pending'}</SelectItem>
                      <SelectItem value="paid">{isRTL ? 'پرداخت شده' : 'Paid'}</SelectItem>
                      <SelectItem value="failed">{isRTL ? 'ناموفق' : 'Failed'}</SelectItem>
                      <SelectItem value="refunded">{isRTL ? 'مسترد شده' : 'Refunded'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="hover-lift">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  {isRTL ? 'اطلاعات مشتری' : 'Customer Info'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {order.buyer_profile ? (
                  <>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.buyer_profile.full_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{order.buyer_profile.email}</span>
                    </div>
                    {order.buyer_profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{order.buyer_profile.phone}</span>
                      </div>
                    )}
                  </>
                ) : shippingAddress ? (
                  <>
                    {shippingAddress.fullName && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{shippingAddress.fullName}</span>
                      </div>
                    )}
                    {shippingAddress.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{shippingAddress.phone}</span>
                      </div>
                    )}
                    {shippingAddress.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{shippingAddress.email}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'اطلاعات مشتری در دسترس نیست' : 'Customer info not available'}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Shipping Address */}
            {shippingAddress && (
              <Card className="hover-lift">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {isRTL ? 'آدرس ارسال' : 'Shipping Address'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="text-sm space-y-1">
                    {shippingAddress.street && <p>{shippingAddress.street}</p>}
                    <p>
                      {[shippingAddress.city, shippingAddress.state].filter(Boolean).join(', ')}
                    </p>
                    <p>
                      {[shippingAddress.postalCode, shippingAddress.country].filter(Boolean).join(' - ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {order.notes && (
              <Card className="hover-lift">
                <CardHeader className="border-b border-border pb-3">
                  <CardTitle className="text-base">
                    {isRTL ? 'یادداشت‌ها' : 'Notes'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className="text-sm text-muted-foreground">{order.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminOrderDetail;