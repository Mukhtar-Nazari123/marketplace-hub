import { useEffect, useState } from 'react';
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
import { useLanguage, formatDate, formatCurrency } from '@/lib/i18n';

interface OrderItem {
  id: string;
  product_id: string | null;
  product_sku?: string | null;
}

interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
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

const AdminOrders = () => {
  const { t, direction } = useLanguage();
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
            products:product_id (sku)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map orders to include product SKUs
      const ordersWithSku = (data || []).map((order: any) => ({
        ...order,
        order_items: (order.order_items || []).map((item: any) => ({
          ...item,
          product_sku: item.products?.sku || null,
        })),
      }));

      setOrders(ordersWithSku);
      setFilteredOrders(ordersWithSku);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(t.admin.orders.loadError);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

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
                        <TableCell className="font-mono text-sm">
                          <span className="bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                            {formatProductSKUs(order.order_items, isRTL)}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                        <TableCell>{formatCurrency(Number(order.total), direction === 'rtl' ? 'fa' : 'en')}</TableCell>
                        <TableCell>
                          {formatDate(new Date(order.created_at), direction === 'rtl' ? 'fa' : 'en')}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
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
