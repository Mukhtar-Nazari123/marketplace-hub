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
import { useLanguage, formatDate, formatCurrency, Language } from '@/lib/i18n';
import { getLocalizedProductName, LocalizableProduct } from '@/lib/localizedProduct';

// Trilingual helper
const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  unit_price: number;
  quantity: number;
  total_price: number;
  seller_id: string;
  product_currency?: string | null;
  product?: {
    sku: string | null;
  } | null;
  // Localized fields from products_with_translations
  name_en?: string | null;
  name_fa?: string | null;
  name_ps?: string | null;
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
  const { t, direction, language: lang } = useLanguage();
  const isRTL = direction === 'rtl';

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Helper for localized item name
  const getItemDisplayName = (item: OrderItem): string => {
    if (item.name_en || item.name_fa || item.name_ps) {
      return getLocalizedProductName(item as LocalizableProduct, lang as Language) || item.product_name;
    }
    return item.product_name;
  };

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
            products:product_id (sku, currency)
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

      // Get all product IDs to fetch localized names
      const productIds = (orderData.order_items || [])
        .map((item: any) => item.product_id)
        .filter((id: string | null): id is string => id !== null);

      // Fetch localized names from products_with_translations
      let productTranslations: Record<string, { name_en: string | null; name_fa: string | null; name_ps: string | null }> = {};
      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products_with_translations')
          .select('id, name_en, name_fa, name_ps')
          .in('id', productIds);

        if (productsData) {
          productTranslations = productsData.reduce((acc, p) => {
            acc[p.id] = { name_en: p.name_en, name_fa: p.name_fa, name_ps: p.name_ps };
            return acc;
          }, {} as Record<string, { name_en: string | null; name_fa: string | null; name_ps: string | null }>);
        }
      }

      // Process order items with localized names
      const processedItems = (orderData.order_items || []).map((item: any) => ({
        ...item,
        product: item.products || null,
        product_currency: item.products?.currency || null,
        name_en: item.product_id ? productTranslations[item.product_id]?.name_en : null,
        name_fa: item.product_id ? productTranslations[item.product_id]?.name_fa : null,
        name_ps: item.product_id ? productTranslations[item.product_id]?.name_ps : null,
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
      toast.error(getLabel(lang, 'Error loading order', 'خطا در بارگذاری سفارش', 'د امر په پورته کولو کې تېروتنه'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id, lang]);

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
      toast.success(getLabel(lang, 'Order status updated', 'وضعیت سفارش بروزرسانی شد', 'د امر حالت تازه شو'));
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(getLabel(lang, 'Error updating status', 'خطا در بروزرسانی وضعیت', 'د حالت په تازه کولو کې تېروتنه'));
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
      toast.success(getLabel(lang, 'Payment status updated', 'وضعیت پرداخت بروزرسانی شد', 'د پیسو حالت تازه شو'));
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error(getLabel(lang, 'Error updating payment status', 'خطا در بروزرسانی وضعیت پرداخت', 'د پیسو د حالت په تازه کولو کې تېروتنه'));
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-success" />;
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
      pending: { label: getLabel(lang, 'Pending', 'در انتظار', 'انتظار کې'), className: 'bg-warning text-warning-foreground' },
      confirmed: { label: getLabel(lang, 'Confirmed', 'تایید شده', 'تایید شوی'), className: 'bg-primary text-primary-foreground' },
      processing: { label: getLabel(lang, 'Processing', 'در حال پردازش', 'پروسس کېږي'), className: 'bg-info text-primary-foreground' },
      shipped: { label: getLabel(lang, 'Shipped', 'ارسال شده', 'لیږل شوی'), className: 'bg-accent text-accent-foreground' },
      delivered: { label: getLabel(lang, 'Delivered', 'تحویل شده', 'تحویل شوی'), className: 'bg-success text-success-foreground' },
      cancelled: { label: getLabel(lang, 'Cancelled', 'لغو شده', 'لغوه شوی'), className: 'bg-destructive text-destructive-foreground' },
      refunded: { label: getLabel(lang, 'Refunded', 'مسترد شده', 'بیرته ورکړل شوی'), className: 'bg-muted text-muted-foreground' },
    };

    const info = statusMap[status] || { label: status, className: '' };
    return <Badge className={info.className}>{info.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: getLabel(lang, 'Pending', 'در انتظار', 'انتظار کې'), variant: 'secondary' },
      paid: { label: getLabel(lang, 'Paid', 'پرداخت شده', 'تادیه شوی'), variant: 'default' },
      failed: { label: getLabel(lang, 'Failed', 'ناموفق', 'ناکام'), variant: 'destructive' },
      refunded: { label: getLabel(lang, 'Refunded', 'مسترد شده', 'بیرته ورکړل شوی'), variant: 'outline' },
    };

    const info = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  if (isLoading) {
    return (
      <AdminLayout title={getLabel(lang, 'Order Details', 'جزئیات سفارش', 'د امر جزئیات')} description="">
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
      <AdminLayout title={getLabel(lang, 'Order Not Found', 'سفارش یافت نشد', 'امر ونه موندل شو')} description="">
        <div className="text-center py-12">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">
            {getLabel(lang, 'Order not found', 'سفارش مورد نظر یافت نشد', 'مطلوب امر ونه موندل شو')}
          </h2>
          <Button onClick={() => navigate('/dashboard/orders')} variant="outline">
            {isRTL ? <ArrowRight className="mr-2 h-4 w-4" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
            {getLabel(lang, 'Back to Orders', 'بازگشت به سفارشات', 'امرونو ته بیرته')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const shippingAddress = order.shipping_address;

  return (
    <AdminLayout 
      title={getLabel(lang, 'Order Details', 'جزئیات سفارش', 'د امر جزئیات')} 
      description={`${getLabel(lang, 'Order #', 'شماره سفارش:', 'د امر شمېره:')} ${order.order_number}`}
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
            {getLabel(lang, 'Back', 'بازگشت', 'بیرته')}
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
                {getLabel(lang, 'Order Items', 'آیتم‌های سفارش', 'د امر توکي')}
                <Badge variant="secondary" className="ml-2">
                  {order.order_items.length} {getLabel(lang, 'items', 'آیتم', 'توکي')}
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
                          alt={getItemDisplayName(item)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground truncate">{getItemDisplayName(item)}</h4>
                        {item.product?.sku && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                            <Hash className="h-3 w-3" />
                            SKU: {item.product.sku}
                          </p>
                        )}
                      <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          {getLabel(lang, 'Unit:', 'قیمت واحد:', 'واحد:')} {item.product_currency === 'USD' 
                            ? `$${Number(item.unit_price).toLocaleString()}` 
                            : `${Number(item.unit_price).toLocaleString()} AFN`}
                        </span>
                        <span className="text-muted-foreground">
                          {getLabel(lang, 'Qty:', 'تعداد:', 'شمېر:')} {item.quantity}
                        </span>
                        <span className="font-semibold text-primary">
                          {getLabel(lang, 'Total:', 'جمع:', 'ټول:')} {item.product_currency === 'USD' 
                            ? `$${Number(item.total_price).toLocaleString()}` 
                            : `${Number(item.total_price).toLocaleString()} AFN`}
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
                    <span className="text-muted-foreground">{getLabel(lang, 'Subtotal (USD)', 'جمع فرعی (USD)', 'فرعي مجموعه (USD)')}</span>
                    <span>${Number(order.subtotal_usd).toFixed(2)}</span>
                  </div>
                )}
                {order.subtotal_afn > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{getLabel(lang, 'Subtotal (AFN)', 'جمع فرعی (AFN)', 'فرعي مجموعه (AFN)')}</span>
                    <span>{Number(order.subtotal_afn).toFixed(0)} AFN</span>
                  </div>
                )}
                {Number(order.delivery_fee_afn) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{getLabel(lang, 'Delivery Fee', 'هزینه ارسال', 'د رسولو فیس')}</span>
                    <span>{Number(order.delivery_fee_afn).toFixed(0)} AFN</span>
                  </div>
                )}
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>{getLabel(lang, 'Discount', 'تخفیف', 'تخفیف')}</span>
                    <span>-{formatCurrency(Number(order.discount), lang)}</span>
                  </div>
                )}
                <Separator />
                {order.total_usd > 0 && (
                  <div className="flex justify-between font-bold text-lg">
                    <span>{getLabel(lang, 'Total (USD)', 'مجموع (USD)', 'ټول (USD)')}</span>
                    <span className="text-primary">${Number(order.total_usd).toFixed(2)}</span>
                  </div>
                )}
                {order.total_afn > 0 && (
                  <div className="flex justify-between font-bold text-lg">
                    <span>{getLabel(lang, 'Total (AFN)', 'مجموع (AFN)', 'ټول (AFN)')}</span>
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
                  {getLabel(lang, 'Order Info', 'اطلاعات سفارش', 'د امر معلومات')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{getLabel(lang, 'Order #', 'شماره سفارش', 'د امر شمېره')}</span>
                  <span className="font-mono font-medium">{order.order_number}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{getLabel(lang, 'Date', 'تاریخ', 'نیټه')}</span>
                  <span>{formatDate(new Date(order.created_at), lang)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{getLabel(lang, 'Payment', 'روش پرداخت', 'د تادیې طریقه')}</span>
                  <span>{order.payment_method || getLabel(lang, 'Cash', 'نقدی', 'نغدي')}</span>
                </div>
              </CardContent>
            </Card>

            {/* Update Status */}
            <Card className="hover-lift">
              <CardHeader className="border-b border-border pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  {getLabel(lang, 'Update Status', 'بروزرسانی وضعیت', 'حالت تازه کول')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{getLabel(lang, 'Order Status', 'وضعیت سفارش', 'د امر حالت')}</label>
                  <Select
                    value={order.status}
                    onValueChange={handleStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{getLabel(lang, 'Pending', 'در انتظار', 'انتظار کې')}</SelectItem>
                      <SelectItem value="confirmed">{getLabel(lang, 'Confirmed', 'تایید شده', 'تایید شوی')}</SelectItem>
                      <SelectItem value="processing">{getLabel(lang, 'Processing', 'در حال پردازش', 'پروسس کېږي')}</SelectItem>
                      <SelectItem value="shipped">{getLabel(lang, 'Shipped', 'ارسال شده', 'لیږل شوی')}</SelectItem>
                      <SelectItem value="delivered">{getLabel(lang, 'Delivered', 'تحویل شده', 'تحویل شوی')}</SelectItem>
                      <SelectItem value="cancelled">{getLabel(lang, 'Cancelled', 'لغو شده', 'لغوه شوی')}</SelectItem>
                      <SelectItem value="refunded">{getLabel(lang, 'Refunded', 'مسترد شده', 'بیرته ورکړل شوی')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{getLabel(lang, 'Payment Status', 'وضعیت پرداخت', 'د تادیې حالت')}</label>
                  <Select
                    value={order.payment_status}
                    onValueChange={handlePaymentStatusUpdate}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">{getLabel(lang, 'Pending', 'در انتظار', 'انتظار کې')}</SelectItem>
                      <SelectItem value="paid">{getLabel(lang, 'Paid', 'پرداخت شده', 'تادیه شوی')}</SelectItem>
                      <SelectItem value="failed">{getLabel(lang, 'Failed', 'ناموفق', 'ناکام')}</SelectItem>
                      <SelectItem value="refunded">{getLabel(lang, 'Refunded', 'مسترد شده', 'بیرته ورکړل شوی')}</SelectItem>
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
                  {getLabel(lang, 'Customer Info', 'اطلاعات مشتری', 'د پیرودونکي معلومات')}
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
                        <span className="text-sm" dir="ltr">{order.buyer_profile.phone}</span>
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
                        <span className="text-sm" dir="ltr">{shippingAddress.phone}</span>
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
                    {getLabel(lang, 'Customer info not available', 'اطلاعات مشتری در دسترس نیست', 'د پیرودونکي معلومات شتون نلري')}
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
                    {getLabel(lang, 'Shipping Address', 'آدرس ارسال', 'د لیږلو پته')}
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
                    {getLabel(lang, 'Notes', 'یادداشت‌ها', 'یادښتونه')}
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