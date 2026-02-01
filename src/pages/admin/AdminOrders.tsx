import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, RefreshCw, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage, formatDate, Language } from '@/lib/i18n';
import { formatCurrency } from '@/lib/currencyFormatter';
import { getLocalizedProductName, LocalizableProduct } from '@/lib/localizedProduct';

interface OrderItem {
  id: string;
  product_id: string | null;
  product_sku?: string | null;
  product_name: string;
  // Localized fields from products_with_translations
  name_en?: string | null;
  name_fa?: string | null;
  name_ps?: string | null;
}

interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  status: string;
  payment_status: string;
  total_afn: number;
  total_usd: number;
  subtotal_afn: number;
  subtotal_usd: number;
  delivery_fee_afn: number;
  currency: string;
  created_at: string;
  order_items?: OrderItem[];
  seller_orders?: { currency: string }[];
}

const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case 'AFN': return '؋';
    case 'USD': return '$';
    default: return currency;
  }
};

const formatPriceWithCurrency = (price: number, currency: string, isRTL: boolean): string => {
  const symbol = getCurrencySymbol(currency);
  const formattedPrice = price.toLocaleString(isRTL ? 'fa-IR' : 'en-US');
  return isRTL ? `${formattedPrice} ${symbol}` : `${symbol}${formattedPrice}`;
};

// Helper to format product names for display (localized)
const formatProductNames = (
  items: OrderItem[] | undefined, 
  isRTL: boolean, 
  language: Language
): string => {
  if (!items || items.length === 0) return isRTL ? 'بدون محصول' : 'No products';
  
  const names = items.map(item => {
    // Try localized name first
    if (item.name_en || item.name_fa || item.name_ps) {
      return getLocalizedProductName(item as LocalizableProduct, language) || item.product_name;
    }
    return item.product_name;
  }).filter(name => name && name.trim() !== '');
  
  if (names.length === 0) return isRTL ? 'بدون محصول' : 'No products';
  if (names.length === 1) return names[0];
  if (names.length === 2) return names.join(isRTL ? ' ، ' : ', ');
  return `${names[0]}${isRTL ? ' و ' : ', '}+${names.length - 1}`;
};

const AdminOrders = () => {
  const navigate = useNavigate();
  const { t, direction, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            product_name,
            products:product_id (sku)
          ),
          seller_orders (
            currency
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get all product IDs to fetch localized names
      const allProductIds = (data || []).flatMap((order: any) => 
        (order.order_items || [])
          .map((item: any) => item.product_id)
          .filter((id: string | null): id is string => id !== null)
      );
      const uniqueProductIds = [...new Set(allProductIds)];

      // Fetch localized names from products_with_translations
      let productTranslations: Record<string, { name_en: string | null; name_fa: string | null; name_ps: string | null }> = {};
      if (uniqueProductIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products_with_translations')
          .select('id, name_en, name_fa, name_ps')
          .in('id', uniqueProductIds);

        if (productsData) {
          productTranslations = productsData.reduce((acc, p) => {
            acc[p.id] = { name_en: p.name_en, name_fa: p.name_fa, name_ps: p.name_ps };
            return acc;
          }, {} as Record<string, { name_en: string | null; name_fa: string | null; name_ps: string | null }>);
        }
      }

      // Map orders to include product names with localized translations
      const ordersWithLocalizedNames = (data || []).map((order: any) => ({
        ...order,
        order_items: (order.order_items || []).map((item: any) => ({
          ...item,
          product_sku: item.products?.sku || null,
          name_en: item.product_id ? productTranslations[item.product_id]?.name_en : null,
          name_fa: item.product_id ? productTranslations[item.product_id]?.name_fa : null,
          name_ps: item.product_id ? productTranslations[item.product_id]?.name_ps : null,
        })),
      }));

      setOrders(ordersWithLocalizedNames);
      setFilteredOrders(ordersWithLocalizedNames);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t.admin.orders.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [language]);

  useEffect(() => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter((order) =>
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [searchQuery, statusFilter, orders]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      pending: { label: t.admin.orders.statuses.pending, className: 'bg-warning text-warning-foreground' },
      confirmed: { label: t.admin.orders.statuses.confirmed, className: 'bg-primary text-primary-foreground' },
      processing: { label: t.admin.orders.statuses.processing, className: 'bg-info text-primary-foreground' },
      shipped: { label: t.admin.orders.statuses.shipped, className: 'bg-accent text-accent-foreground' },
      delivered: { label: t.admin.orders.statuses.delivered, className: 'bg-success text-success-foreground' },
      cancelled: { label: t.admin.orders.statuses.cancelled, className: 'bg-destructive text-destructive-foreground' },
      refunded: { label: t.admin.orders.statuses.refunded, className: 'bg-muted text-muted-foreground' },
    };

    const info = statusMap[status] || { label: status, className: '' };
    return <Badge className={info.className}>{info.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: t.admin.orders.paymentStatuses.pending, variant: 'secondary' },
      paid: { label: t.admin.orders.paymentStatuses.paid, variant: 'default' },
      failed: { label: t.admin.orders.paymentStatuses.failed, variant: 'destructive' },
      refunded: { label: t.admin.orders.paymentStatuses.refunded, variant: 'outline' },
    };

    const info = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  const isRTL = direction === 'rtl';
  const searchIconClass = isRTL ? 'right-3' : 'left-3';
  const inputPaddingClass = isRTL ? 'pr-9' : 'pl-9';
  const iconMarginClass = isRTL ? 'ml-2' : 'mr-2';

  return (
    <AdminLayout title={t.admin.orders.title} description={t.admin.orders.description}>
      <div className="space-y-6 animate-fade-in">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>{t.admin.orders.ordersTitle}</CardTitle>
                <CardDescription>
                  {t.admin.orders.totalOrders.replace('{count}', String(filteredOrders.length))}
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchOrders} className="hover-scale">
                <RefreshCw className={`h-4 w-4 ${iconMarginClass}`} />
                {t.admin.orders.refresh}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className={`absolute ${searchIconClass} top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground`} />
                <Input
                  placeholder={t.admin.orders.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={inputPaddingClass}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className={`h-4 w-4 ${iconMarginClass}`} />
                  <SelectValue placeholder={t.admin.orders.filterByStatus} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.admin.orders.allStatuses}</SelectItem>
                  <SelectItem value="pending">{t.admin.orders.statuses.pending}</SelectItem>
                  <SelectItem value="confirmed">{t.admin.orders.statuses.confirmed}</SelectItem>
                  <SelectItem value="processing">{t.admin.orders.statuses.processing}</SelectItem>
                  <SelectItem value="shipped">{t.admin.orders.statuses.shipped}</SelectItem>
                  <SelectItem value="delivered">{t.admin.orders.statuses.delivered}</SelectItem>
                  <SelectItem value="cancelled">{t.admin.orders.statuses.cancelled}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t.admin.orders.orderNumber}</TableHead>
                    <TableHead>{t.admin.orders.status}</TableHead>
                    <TableHead>{t.admin.orders.payment}</TableHead>
                    <TableHead>{t.admin.orders.amount}</TableHead>
                    <TableHead>{t.admin.orders.date}</TableHead>
                    <TableHead className={isRTL ? 'text-left' : 'text-right'}>{t.admin.orders.actions}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    [...Array(5)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j}>
                            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        {t.admin.orders.noOrders}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium text-sm max-w-[200px] truncate">
                          {formatProductNames(order.order_items, isRTL, language as Language)}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                        <TableCell>
                          {order.delivery_fee_afn > 0 ? (
                            <>
                              {order.currency === 'USD' 
                                ? formatCurrency(order.subtotal_usd, 'USD', isRTL)
                                : formatCurrency(order.subtotal_afn, 'AFN', isRTL)
                              } + {formatCurrency(order.delivery_fee_afn, 'AFN', isRTL)}
                            </>
                          ) : (
                            order.currency === 'USD'
                              ? formatCurrency(order.total_usd, 'USD', isRTL)
                              : formatCurrency(order.total_afn, 'AFN', isRTL)
                          )}
                        </TableCell>
                        <TableCell>
                          {formatDate(new Date(order.created_at), direction === 'rtl' ? 'fa' : 'en')}
                        </TableCell>
                        <TableCell className={isRTL ? 'text-left' : 'text-right'}>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                            title={isRTL ? 'مشاهده جزئیات' : 'View Details'}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
