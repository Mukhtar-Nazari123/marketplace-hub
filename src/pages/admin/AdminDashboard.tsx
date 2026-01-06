import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentActivityCard } from '@/components/admin/RecentActivityCard';
import { QuickActionsCard } from '@/components/admin/QuickActionsCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/lib/i18n';
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Store,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  newRegistrations: number;
  activeSellers: number;
  totalProducts: number;
  pendingProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  pendingSellers: number;
}

interface Activity {
  id: string;
  type: 'user' | 'order' | 'product' | 'seller';
  action: string;
  description: string;
  timestamp: Date;
}

const AdminDashboard = () => {
  const { t, language } = useLanguage();
  
  // Chart data with proper Dari month names
  const mockChartData = [
    { name: t.admin.months.january, revenue: 4000, orders: 24 },
    { name: t.admin.months.february, revenue: 3000, orders: 13 },
    { name: t.admin.months.march, revenue: 5000, orders: 28 },
    { name: t.admin.months.april, revenue: 2780, orders: 19 },
    { name: t.admin.months.may, revenue: 1890, orders: 12 },
    { name: t.admin.months.june, revenue: 2390, orders: 15 },
    { name: t.admin.months.july, revenue: 3490, orders: 21 },
  ];

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newRegistrations: 0,
    activeSellers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    pendingSellers: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user stats
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch user roles counts
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role');

        const sellerCount = roleData?.filter(r => r.role === 'seller').length || 0;

        // Fetch products stats
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        const { count: pendingProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch orders stats
        const { count: totalOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        const { count: pendingOrders } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        // Fetch total revenue (sum of AFN totals)
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total_afn, total_usd')
          .eq('payment_status', 'paid');

        const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_afn) + Number(order.total_usd), 0) || 0;

        // Fetch pending seller verifications
        const { count: pendingSellers } = await supabase
          .from('seller_verifications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalUsers: totalUsers || 0,
          newRegistrations: Math.floor((totalUsers || 0) * 0.15),
          activeSellers: sellerCount,
          totalProducts: totalProducts || 0,
          pendingProducts: pendingProducts || 0,
          totalOrders: totalOrders || 0,
          pendingOrders: pendingOrders || 0,
          totalRevenue,
          pendingSellers: pendingSellers || 0,
        });

        // Generate activities with translated text
        setActivities([
          {
            id: '1',
            type: 'user',
            action: t.admin.newUserRegistration,
            description: t.admin.newUserJoined,
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
          },
          {
            id: '2',
            type: 'order',
            action: t.admin.newOrder,
            description: t.admin.newOrderCreated,
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
          },
          {
            id: '3',
            type: 'product',
            action: t.admin.newProductPending,
            description: t.admin.newProductNeedsReview,
            timestamp: new Date(Date.now() - 1000 * 60 * 90),
          },
          {
            id: '4',
            type: 'seller',
            action: t.admin.newVerificationRequest,
            description: t.admin.newSellerVerification,
            timestamp: new Date(Date.now() - 1000 * 60 * 120),
          },
        ]);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  return (
    <AdminLayout title={t.admin.dashboard} description={t.admin.dashboardDescription}>
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t.admin.totalUsers}
            value={stats.totalUsers}
            description={t.admin.fromLastMonth}
            icon={Users}
            trend={{ value: 12, isPositive: true }}
            delay={0}
          />
          <StatsCard
            title={t.admin.activeProducts}
            value={stats.totalProducts}
            description={`${stats.pendingProducts} ${t.admin.pendingReview}`}
            icon={Package}
            iconClassName="bg-accent/10 text-accent"
            delay={1}
          />
          <StatsCard
            title={t.admin.totalOrders}
            value={stats.totalOrders}
            description={`${stats.pendingOrders} ${t.admin.inProgress}`}
            icon={ShoppingCart}
            iconClassName="bg-emerald-500/10 text-emerald-500"
            delay={2}
          />
          <StatsCard
            title={t.admin.totalRevenue}
            value={`$${stats.totalRevenue.toLocaleString()}`}
            description={t.admin.fromLastMonth}
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
            iconClassName="bg-amber-500/10 text-amber-500"
            delay={3}
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title={t.admin.newRegistrations}
            value={stats.newRegistrations}
            description={t.admin.thisWeek}
            icon={TrendingUp}
            iconClassName="bg-cyan-500/10 text-cyan-500"
            delay={4}
          />
          <StatsCard
            title={t.admin.activeSellers}
            value={stats.activeSellers}
            description={`${stats.pendingSellers} ${t.admin.awaitingVerification}`}
            icon={Store}
            iconClassName="bg-orange-500/10 text-orange-500"
            delay={5}
          />
          <StatsCard
            title={t.admin.pendingProducts}
            value={stats.pendingProducts}
            description={t.admin.pendingReview}
            icon={Clock}
            iconClassName="bg-muted text-muted-foreground"
            delay={6}
          />
          <StatsCard
            title={t.admin.alerts}
            value={stats.pendingProducts + stats.pendingSellers}
            description={t.admin.needsAttention}
            icon={AlertCircle}
            iconClassName="bg-destructive/10 text-destructive"
            delay={7}
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <RevenueChart data={mockChartData} isLoading={isLoading} />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
            <QuickActionsCard
              pendingSellers={stats.pendingSellers}
              pendingProducts={stats.pendingProducts}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <RecentActivityCard activities={activities} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;