import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { useLanguage } from '@/lib/i18n';

interface Activity {
  id: string;
  type: 'user' | 'order' | 'product' | 'seller';
  action: string;
  description: string;
  timestamp: Date;
}

interface RecentActivityCardProps {
  activities: Activity[];
  isLoading?: boolean;
}

export const RecentActivityCard = ({ activities, isLoading }: RecentActivityCardProps) => {
  const { t, language, isRTL } = useLanguage();
  
  const getActivityBadge = (type: Activity['type']) => {
    const badges = {
      user: { label: t.admin.user, className: 'bg-secondary text-secondary-foreground' },
      order: { label: t.admin.orders, className: 'bg-primary text-primary-foreground' },
      product: { label: t.admin.products, className: 'bg-accent text-accent-foreground' },
      seller: { label: t.admin.seller, className: 'bg-emerald-500/10 text-emerald-600' },
    };
    
    const badge = badges[type];
    return (
      <Badge 
        className={`${badge.className} transition-all duration-300 hover:scale-105`}
      >
        {badge.label}
      </Badge>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (language === 'fa') {
      if (seconds < 60) return 'لحظاتی پیش';
      if (seconds < 3600) return `${Math.floor(seconds / 60)} دقیقه پیش`;
      if (seconds < 86400) return `${Math.floor(seconds / 3600)} ساعت پیش`;
      return `${Math.floor(seconds / 86400)} روز پیش`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{t.admin.recentActivity}</CardTitle>
          <CardDescription>{t.admin.dashboardDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="h-6 w-16 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden group">
      <CardHeader className="bg-gradient-to-r from-transparent to-muted/30">
        <CardTitle className="flex items-center gap-2">
          <span className="relative">
            {t.admin.recentActivity}
            <span className="absolute -top-1 -right-2 rtl:-left-2 rtl:right-auto h-2 w-2 bg-primary rounded-full animate-pulse" />
          </span>
        </CardTitle>
        <CardDescription>{t.admin.dashboardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="h-[300px] pe-4">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                <span className="text-2xl">📭</span>
              </div>
              <p className="text-center">{t.admin.noOrders}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activities.map((activity, index) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0 animate-fade-in group/item hover:bg-muted/30 -mx-2 px-2 py-2 rounded-lg transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="transition-transform duration-300 group-hover/item:scale-110">
                    {getActivityBadge(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm font-medium leading-none truncate">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary/30 group-hover/item:bg-primary transition-colors duration-300 mt-2" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};