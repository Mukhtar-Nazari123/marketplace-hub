import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/i18n';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ChartData {
  name: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: ChartData[];
  isLoading?: boolean;
}

export const RevenueChart = ({ data, isLoading }: RevenueChartProps) => {
  const { t, isRTL } = useLanguage();

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t.admin.revenueOverview}</CardTitle>
          <CardDescription>{t.admin.monthlyRevenue}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-gradient-to-t from-muted to-transparent rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden group">
      <CardHeader className="bg-gradient-to-r from-transparent to-muted/30">
        <CardTitle className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-gradient-to-r from-primary to-accent" />
          {t.admin.revenueOverview}
        </CardTitle>
        <CardDescription>{t.admin.monthlyRevenue}</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <Tabs defaultValue="revenue" className="space-y-4">
          <TabsList className="grid w-full max-w-[200px] grid-cols-2">
            <TabsTrigger 
              value="revenue" 
              className="transition-all duration-300 data-[state=active]:shadow-md"
            >
              {t.admin.revenue}
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="transition-all duration-300 data-[state=active]:shadow-md"
            >
              {t.admin.orders.title}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4 animate-fade-in">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} style={{ direction: 'ltr' }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                    }}
                    labelStyle={{ 
                      color: 'hsl(var(--foreground))',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, t.admin.revenue]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={3}
                    fill="url(#colorRevenue)"
                    dot={{ 
                      fill: 'hsl(var(--primary))', 
                      strokeWidth: 2,
                      stroke: 'hsl(var(--background))',
                      r: 4,
                    }}
                    activeDot={{ 
                      r: 6, 
                      strokeWidth: 3,
                      stroke: 'hsl(var(--background))',
                      fill: 'hsl(var(--primary))',
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 animate-fade-in">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} style={{ direction: 'ltr' }}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={1} />
                      <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '12px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                    }}
                    labelStyle={{ 
                      color: 'hsl(var(--foreground))',
                      fontWeight: 600,
                      marginBottom: '4px',
                    }}
                    cursor={{ fill: 'hsl(var(--muted)/0.3)' }}
                    formatter={(value: number) => [value, t.admin.orders.title]}
                  />
                  <Bar
                    dataKey="orders"
                    fill="url(#colorOrders)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};