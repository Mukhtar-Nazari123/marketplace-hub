import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { StatsCard } from '@/components/admin/StatsCard';
import { RecentActivityCard } from '@/components/admin/RecentActivityCard';
import { QuickActionsCard } from '@/components/admin/QuickActionsCard';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { supabase } from '@/integrations/supabase/client';
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

const mockChartData = [
  { name: 'يناير', revenue: 4000, orders: 24 },
  { name: 'فبراير', revenue: 3000, orders: 13 },
  { name: 'مارس', revenue: 5000, orders: 28 },
  { name: 'أبريل', revenue: 2780, orders: 19 },
  { name: 'مايو', revenue: 1890, orders: 12 },
  { name: 'يونيو', revenue: 2390, orders: 15 },
  { name: 'يوليو', revenue: 3490, orders: 21 },
];

const AdminDashboard = () => {
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

        // Fetch total revenue
        const { data: revenueData } = await supabase
          .from('orders')
          .select('total')
          .eq('payment_status', 'paid');

        const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0;

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

        // Generate mock activities for now
        setActivities([
          {
            id: '1',
            type: 'user',
            action: 'تسجيل مستخدم جديد',
            description: 'انضم مستخدم جديد كمشتري',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
          },
          {
            id: '2',
            type: 'order',
            action: 'طلب جديد',
            description: 'تم إنشاء طلب جديد بقيمة $150',
            timestamp: new Date(Date.now() - 1000 * 60 * 60),
          },
          {
            id: '3',
            type: 'product',
            action: 'منتج جديد في الانتظار',
            description: 'تم إضافة منتج جديد يحتاج مراجعة',
            timestamp: new Date(Date.now() - 1000 * 60 * 90),
          },
          {
            id: '4',
            type: 'seller',
            action: 'طلب تحقق جديد',
            description: 'بائع جديد يطلب التحقق',
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
  }, []);

  return (
    <AdminLayout title="لوحة التحكم" description="نظرة عامة على النظام">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="إجمالي المستخدمين"
            value={stats.totalUsers}
            description="من الشهر الماضي"
            icon={Users}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="المنتجات النشطة"
            value={stats.totalProducts}
            description={`${stats.pendingProducts} في الانتظار`}
            icon={Package}
            iconClassName="bg-accent/10 text-accent"
          />
          <StatsCard
            title="إجمالي الطلبات"
            value={stats.totalOrders}
            description={`${stats.pendingOrders} قيد المعالجة`}
            icon={ShoppingCart}
            iconClassName="bg-success/10 text-success"
          />
          <StatsCard
            title="إجمالي الإيرادات"
            value={`$${stats.totalRevenue.toLocaleString()}`}
            description="من الشهر الماضي"
            icon={DollarSign}
            trend={{ value: 8, isPositive: true }}
            iconClassName="bg-warning/10 text-warning"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="التسجيلات الجديدة"
            value={stats.newRegistrations}
            description="هذا الأسبوع"
            icon={TrendingUp}
            iconClassName="bg-cyan/10 text-cyan"
          />
          <StatsCard
            title="البائعين النشطين"
            value={stats.activeSellers}
            description={`${stats.pendingSellers} في انتظار التحقق`}
            icon={Store}
            iconClassName="bg-orange/10 text-orange"
          />
          <StatsCard
            title="المنتجات المعلقة"
            value={stats.pendingProducts}
            description="تحتاج مراجعة"
            icon={Clock}
            iconClassName="bg-muted text-muted-foreground"
          />
          <StatsCard
            title="التنبيهات"
            value={stats.pendingProducts + stats.pendingSellers}
            description="تحتاج انتباه"
            icon={AlertCircle}
            iconClassName="bg-destructive/10 text-destructive"
          />
        </div>

        {/* Charts and Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RevenueChart data={mockChartData} isLoading={isLoading} />
          </div>
          <div>
            <QuickActionsCard
              pendingSellers={stats.pendingSellers}
              pendingProducts={stats.pendingProducts}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <RecentActivityCard activities={activities} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
