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
  price_afn: number;
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

// Trilingual translations
const translations = {
  pageTitle: { en: 'Analytics', fa: 'آنالیتیکس', ps: 'تحلیلات' },
  pageDescription: { en: 'Sales statistics and reports', fa: 'آمار و گزارش فروش', ps: 'د پلور احصایې او راپورونه' },
  // Date range
  last7Days: { en: 'Last 7 days', fa: '۷ روز گذشته', ps: 'تېرې ۷ ورځې' },
  last30Days: { en: 'Last 30 days', fa: '۳۰ روز گذشته', ps: 'تېرې ۳۰ ورځې' },
  last90Days: { en: 'Last 90 days', fa: '۹۰ روز گذشته', ps: 'تېرې ۹۰ ورځې' },
  // Stats cards
  totalSales: { en: 'Total Sales (AFN)', fa: 'کل فروش (؋)', ps: 'ټول پلور (؋)' },
  totalOrders: { en: 'Total Orders', fa: 'کل سفارشات', ps: 'ټول امرونه' },
  netEarnings: { en: 'Net Earnings (AFN)', fa: 'درآمد خالص (؋)', ps: 'خالص عاید (؋)' },
  pendingOrders: { en: 'Pending Orders', fa: 'سفارشات در انتظار', ps: 'انتظار کې امرونه' },
  // Sales trend
  salesTrend: { en: 'Sales Trend', fa: 'روند فروش', ps: 'د پلور رجحان' },
  dailySales: { en: 'Daily sales over selected period', fa: 'فروش روزانه در بازه انتخاب شده', ps: 'په ټاکل شوي موده کې ورځنی پلور' },
  sales: { en: 'Sales', fa: 'فروش', ps: 'پلور' },
  // Order status
  orderStatus: { en: 'Order Status', fa: 'وضعیت سفارشات', ps: 'د امر حالت' },
  orderStatusDistribution: { en: 'Order status distribution', fa: 'توزیع وضعیت سفارشات', ps: 'د امر حالت ویش' },
  // Top products
  topSellingProducts: { en: 'Top Selling Products', fa: 'محصولات پرفروش', ps: 'تر ټولو ډېر پلورل شوي محصولات' },
  byRevenue: { en: 'By revenue', fa: 'بر اساس درآمد', ps: 'د عاید پر بنسټ' },
  sold: { en: 'sold', fa: 'فروخته شده', ps: 'پلورل شوي' },
  noSalesYet: { en: 'No sales yet', fa: 'هنوز فروشی ندارید', ps: 'تر اوسه پلور نشته' },
  // Low stock
  lowStockAlerts: { en: 'Low Stock Alerts', fa: 'هشدار موجودی', ps: 'د ذخیرې کمښت خبرتیا' },
  productsLowStock: { en: 'Products running low on stock', fa: 'محصولات با موجودی کم', ps: 'هغه محصولات چې ذخیره یې کمه ده' },
  allStockSufficient: { en: 'All products have sufficient stock', fa: 'موجودی همه محصولات کافی است', ps: 'ټول محصولات کافي ذخیره لري' },
  left: { en: 'left', fa: 'عدد', ps: 'پاتې' },
  // Status labels
  status: {
    pending: { en: 'Pending', fa: 'در انتظار', ps: 'انتظار کې' },
    confirmed: { en: 'Confirmed', fa: 'تایید شده', ps: 'تایید شوی' },
    shipped: { en: 'Shipped', fa: 'ارسال شده', ps: 'لېږل شوی' },
    delivered: { en: 'Delivered', fa: 'تحویل شده', ps: 'تحویل شوی' },
  },
};

type Language = 'en' | 'fa' | 'ps';

const SellerAnalytics = () => {
  const { isRTL, language } = useLanguage();
  const lang = (language || 'en') as Language;
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dateRange, setDateRange] = useState('30');

  // Helper function for translations
  const t = (key: keyof Omit<typeof translations, 'status'>) => {
    const translation = translations[key];
    return (translation as Record<Language, string>)[lang] || (translation as Record<Language, string>).en;
  };

  const getStatusLabel = (status: string) => {
    const statusKey = status as keyof typeof translations.status;
    return translations.status[statusKey]?.[lang] || translations.status[statusKey]?.en || status;
  };

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
          .from('products_with_translations')
          .select('id, name, quantity, low_stock_threshold, images, price_afn')
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

  // Top selling products - get currency from products table
  const topProducts = useMemo(() => {
    const productSales: Record<string, { name: string; quantity: number; revenue: number; currency: string }> = {};

    orderItems.forEach(item => {
      const key = item.product_id || item.product_name;
      const currency = 'AFN';
      
      if (!productSales[key]) {
        productSales[key] = { name: item.product_name, quantity: 0, revenue: 0, currency };
      }
      productSales[key].quantity += item.quantity;
      productSales[key].revenue += item.total_price;
    });

    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orderItems, products]);

  // Low stock alerts
  const lowStockProducts = useMemo(() => {
    return products.filter(
      p => p.quantity <= (p.low_stock_threshold || 5)
    ).slice(0, 5);
  }, [products]);

  const getCurrencySymbol = (currency: string) => currency === 'USD' ? '$' : '؋';

  if (loading) {
    return (
      <DashboardLayout
        title={t('pageTitle')}
        description={t('pageDescription')}
        allowedRoles={['seller']}
      >
        <div className="space-y-4 sm:space-y-6">
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-4 sm:pt-6">
                  <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full mb-3 sm:mb-4" />
                  <Skeleton className="h-6 sm:h-8 w-20 sm:w-24 mb-2" />
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="p-4 sm:pt-6">
              <Skeleton className="h-[200px] sm:h-[300px] w-full" />
            </CardContent>
          </Card>
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
      <div className="space-y-4 sm:space-y-6">
        {/* Date Range Filter */}
        <div className="flex justify-end">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">{t('last7Days')}</SelectItem>
              <SelectItem value="30">{t('last30Days')}</SelectItem>
              <SelectItem value="90">{t('last90Days')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Cards - 2 columns on mobile, 4 on desktop */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-3 sm:p-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                </div>
                <div className="flex-1 text-center sm:text-start">
                  <p className="text-xl sm:text-3xl font-bold tracking-tight">
                    {stats.totalSales.toLocaleString()}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('totalSales')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border-blue-500/20">
            <CardContent className="p-3 sm:p-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
                </div>
                <div className="flex-1 text-center sm:text-start">
                  <p className="text-xl sm:text-3xl font-bold tracking-tight">{stats.totalOrders}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('totalOrders')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-green-500/20">
            <CardContent className="p-3 sm:p-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-green-600" />
                </div>
                <div className="flex-1 text-center sm:text-start">
                  <p className="text-xl sm:text-3xl font-bold tracking-tight">
                    {stats.netEarnings.toLocaleString()}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('netEarnings')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/20">
            <CardContent className="p-3 sm:p-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-amber-600" />
                </div>
                <div className="flex-1 text-center sm:text-start">
                  <p className="text-xl sm:text-3xl font-bold tracking-tight">{stats.pendingOrders}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {t('pendingOrders')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row - Stack on mobile */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Sales Trend Chart */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                {t('salesTrend')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('dailySales')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-2 sm:p-6 pt-0">
              <div className="h-[200px] sm:h-[300px] -mx-2 sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrendData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
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
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${value / 1000}k`}
                      width={35}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`${value.toLocaleString()} ؋`, t('sales')]}
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
          <Card className="hover:shadow-lg transition-shadow flex flex-col min-h-[320px] sm:min-h-0">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Package className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                {t('orderStatus')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('orderStatusDistribution')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 flex-1 flex flex-col">
              <div className="h-[140px] sm:h-[200px] flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={60}
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
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                {statusBreakdown.map(status => (
                  <div key={status.name} className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <div
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: status.color }}
                    />
                    <span className="text-muted-foreground truncate">
                      {getStatusLabel(status.name)}
                    </span>
                    <span className="font-medium ms-auto">{status.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row - Stack on mobile with equal heights */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {/* Top Selling Products */}
          <Card className="hover:shadow-lg transition-shadow flex flex-col min-h-[320px]">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                {t('topSellingProducts')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('byRevenue')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 flex-1">
              {topProducts.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground h-full flex flex-col items-center justify-center">
                  <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 opacity-50" />
                  <p className="text-sm sm:text-base">{t('noSalesYet')}</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs sm:text-sm font-bold text-primary flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {product.quantity} {t('sold')}
                        </p>
                      </div>
                      <div className="text-end flex-shrink-0">
                        <p className="font-bold text-sm sm:text-base text-primary">
                          {getCurrencySymbol(product.currency)}{product.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="hover:shadow-lg transition-shadow flex flex-col min-h-[320px]">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                {t('lowStockAlerts')}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {t('productsLowStock')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 flex-1">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-muted-foreground h-full flex flex-col items-center justify-center">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 text-green-500 opacity-70" />
                  <p className="text-sm sm:text-base">{t('allStockSufficient')}</p>
                </div>
              ) : (
                <div className="space-y-2 sm:space-y-3">
                  {lowStockProducts.map(product => (
                    <div
                      key={product.id}
                      className="flex items-center gap-2 sm:gap-4 p-2 sm:p-3 rounded-lg bg-amber-500/10 border border-amber-500/20"
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm sm:text-base truncate">{product.name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          AFN {product.price_afn.toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 text-xs flex-shrink-0">
                        {product.quantity} {t('left')}
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
