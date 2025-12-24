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
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { toast } from 'sonner';

interface Order {
  id: string;
  order_number: string;
  buyer_id: string;
  status: string;
  payment_status: string;
  total: number;
  created_at: string;
}

const AdminOrders = () => {
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
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrders(data || []);
      setFilteredOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('فشل في تحميل الطلبات');
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
      pending: { label: 'قيد الانتظار', className: 'bg-warning text-warning-foreground' },
      confirmed: { label: 'مؤكد', className: 'bg-primary text-primary-foreground' },
      processing: { label: 'قيد المعالجة', className: 'bg-info text-primary-foreground' },
      shipped: { label: 'تم الشحن', className: 'bg-accent text-accent-foreground' },
      delivered: { label: 'تم التسليم', className: 'bg-success text-success-foreground' },
      cancelled: { label: 'ملغي', className: 'bg-destructive text-destructive-foreground' },
      refunded: { label: 'مسترد', className: 'bg-muted text-muted-foreground' },
    };

    const info = statusMap[status] || { label: status, className: '' };
    return <Badge className={info.className}>{info.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: 'في الانتظار', variant: 'secondary' },
      paid: { label: 'مدفوع', variant: 'default' },
      failed: { label: 'فشل', variant: 'destructive' },
      refunded: { label: 'مسترد', variant: 'outline' },
    };

    const info = statusMap[status] || { label: status, variant: 'outline' as const };
    return <Badge variant={info.variant}>{info.label}</Badge>;
  };

  return (
    <AdminLayout title="إدارة الطلبات" description="عرض ومتابعة جميع الطلبات">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>الطلبات</CardTitle>
                <CardDescription>
                  إجمالي {filteredOrders.length} طلب
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={fetchOrders}>
                <RefreshCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="mb-6 flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="البحث برقم الطلب..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="ml-2 h-4 w-4" />
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="processing">قيد المعالجة</SelectItem>
                  <SelectItem value="shipped">تم الشحن</SelectItem>
                  <SelectItem value="delivered">تم التسليم</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الدفع</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead className="text-left">الإجراءات</TableHead>
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
                        لا يوجد طلبات
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">
                          {order.order_number}
                        </TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getPaymentBadge(order.payment_status)}</TableCell>
                        <TableCell>${Number(order.total).toFixed(2)}</TableCell>
                        <TableCell>
                          {format(new Date(order.created_at), 'dd MMM yyyy', {
                            locale: ar,
                          })}
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
