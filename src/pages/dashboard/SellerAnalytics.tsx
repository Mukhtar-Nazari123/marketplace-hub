import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DollarSign,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  ShoppingBag,
  CheckCircle,
  Truck,
  BarChart3,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface SellerOrder {
  id: string;
  total: number;
  subtotal: number;
  delivery_fee: number;
  currency: string;
  status: string;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  low_stock_threshold: number | null;
  images: string[] | null;
  price: number;
  currency: string;
}

interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  total_price: number;
}

interface SalesTrendData {
  date: string;
  sales: number;
  orders: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'hsl(38 92% 50%)',
  confirmed: 'hsl(195 100% 50%)',
  shipped: 'hsl(217 91% 60%)',
  delivered: 'hsl(142 76% 36%)',
  cancelled: 'hsl(0 84% 60%)',
};

const SellerAnalytics = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const daysAgo = parseInt(dateRange);
        const startDate = startOfDay(subDays(new Date(), daysAgo)).toISOString();

        // Fetch seller orders
        const { data: ordersData } = await supabase
          .from('seller_orders')
          .select('*')
          .eq('seller_id', user.id)
          .gte('created_at', startDate)
          .order('created_at', { ascending: false });

        // Fetch products
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name, quantity, low_stock_threshold, images, price, currency')
          .eq('seller_id', user.id);

        // Fetch order items for this seller
        const { data: itemsData } = await supabase
          .from('order_items')
          .select('*')
          .eq('seller_id', user.id);

        setOrders(ordersData || []);
        setProducts(productsData || []);
        setOrderItems(itemsData || []);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, dateRange]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered');
    const netEarnings = deliveredOrders.reduce((sum, order) => sum + order.subtotal, 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    return { totalSales, totalOrders, netEarnings, pendingOrders };
  }, [orders]);

  // Sales trend data
  const salesTrendData = useMemo(() => {
    const daysAgo = parseInt(dateRange);
    const data: SalesTrendData[] = [];

    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayOrders = orders.filter(
        o => format(new Date(o.created_at), 'yyyy-MM-dd') === dateStr
      );

      data.push({
        date: format(date, daysAgo > 7 ? 'MMM d' : 'EEE'),
        sales: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      });
    }

    return data;
  }, [orders, dateRange]);

  // Order status breakdown
  const statusBreakdown = useMemo(() => {
    const statusCounts: Record<string, number> = {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      delivered: 0,
    };

    orders.forEach(order => {
      if (statusCounts[order.status] !== undefined) {
        statusCounts[order.status]++;
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
      color: STATUS_COLORS[status] || 'hsl(var(--muted))',
    }));
  }, [orders]);

  // Top selling products
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {};

    orderItems.forEach(item => {
      const key = item.product_id || item.product_name;
      if (!productSales[key]) {
        productSales[key] = { name: item.product_name, quantity: 0, revenue: 0 };
      }
      productSales[key].quantity += item.quantity;
      productSales[key].revenue += item.total_price;
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orderItems]);

  // Low stock alerts
  const lowStockProducts = useMemo(() => {
    return products.filter(
      p => p.quantity <= (p.low_stock_threshold || 5)
    ).slice(0, 5);
  }, [products]);

  const getCurrencySymbol = (currency: string) => currency === 'USD' ? '$' : '؋';

  const statusLabels: Record<string, { en: string; fa: string }> = {
    pending: { en: 'Pending', fa: 'در انتظار' },
    confirmed: { en: 'Confirmed', fa: 'تایید شده' },
    shipped: { en: 'Shipped', fa: 'ارسال شده' },
    delivered: { en: 'Delivered', fa: 'تحویل شده' },
  };

  if (loading) {
    return (
      <DashboardLayout
        title={isRTL ? 'آنالیتیکس' : 'Analytics'}
        description={isRTL ? 'آمار و گزارش فروش' : 'Sales statistics and reports'}
        allowedRoles={['seller']}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-12 w-12 rounded-full mb-4" />
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isRTL ? 'آنالیتیکس' : 'Analytics'}
      description={isRTL ? 'آمار و گزارش فروش' : 'Sales statistics and reports'}
      allowedRoles={['seller']}
    >
      <div className="space-y-6">
        {/* Date Range Filter */}
        <div className="flex justify-end">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{isRTL ? '۷ روز گذشته' : 'Last 7 days'}</SelectItem>
              <SelectItem value="30">{isRTL ? '۳۰ روز گذشته' : 'Last 30 days'}</SelectItem>
              <SelectItem value="90">{isRTL ? '۹۰ روز گذشته' : 'Last 90 days'}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold tracking-tight">
                    {stats.totalSales.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'کل فروش (؋)' : 'Total Sales (AFN)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-7 h-7 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold tracking-tight">{stats.totalOrders}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'کل سفارشات' : 'Total Orders'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-7 h-7 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold tracking-tight">
                    {stats.netEarnings.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'درآمد خالص (؋)' : 'Net Earnings (AFN)'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-7 h-7 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-3xl font-bold tracking-tight">{stats.pendingOrders}</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'سفارشات در انتظار' : 'Pending Orders'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales Trend Chart */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {isRTL ? 'روند فروش' : 'Sales Trend'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'فروش روزانه در بازه انتخاب شده' : 'Daily sales over selected period'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(195 100% 50%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(195 100% 50%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} ؋`, isRTL ? 'فروش' : 'Sales']}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(195 100% 50%)"
                      strokeWidth={2}
                      fill="url(#salesGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Order Status Breakdown */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                {isRTL ? 'وضعیت سفارشات' : 'Order Status'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'توزیع وضعیت سفارشات' : 'Order status distribution'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {statusBreakdown.map(status => (
                  <div key={status.name} className="flex items-center gap-2 text-sm">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-muted-foreground">
                      {isRTL ? statusLabels[status.name]?.fa : statusLabels[status.name]?.en}
                    </span>
                    <span className="font-medium ms-auto">{status.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top Selling Products */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {isRTL ? 'محصولات پرفروش' : 'Top Selling Products'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'بر اساس درآمد' : 'By revenue'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>{isRTL ? 'هنوز فروشی ندارید' : 'No sales yet'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.quantity} {isRTL ? 'عدد فروخته شده' : 'sold'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">
                          {product.revenue.toLocaleString()} ؋
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {isRTL ? 'هشدار موجودی' : 'Low Stock Alerts'}
              </CardTitle>
              <CardDescription>
                {isRTL ? 'محصولات با موجودی کم' : 'Products running low on stock'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-70" />
                  <p>{isRTL ? 'موجودی همه محصولات کافی است' : 'All products have sufficient stock'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                      <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-5 h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getCurrencySymbol(product.currency)}{product.price.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                        {product.quantity} {isRTL ? 'عدد' : 'left'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SellerAnalytics;
