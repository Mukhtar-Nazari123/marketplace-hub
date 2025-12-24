import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

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

const getActivityBadge = (type: Activity['type']) => {
  switch (type) {
    case 'user':
      return <Badge variant="secondary">مستخدم</Badge>;
    case 'order':
      return <Badge className="bg-primary text-primary-foreground">طلب</Badge>;
    case 'product':
      return <Badge className="bg-accent text-accent-foreground">منتج</Badge>;
    case 'seller':
      return <Badge className="bg-success text-success-foreground">بائع</Badge>;
    default:
      return null;
  }
};

export const RecentActivityCard = ({ activities, isLoading }: RecentActivityCardProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>النشاط الأخير</CardTitle>
          <CardDescription>آخر الأحداث في النظام</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-8 w-16 rounded bg-muted" />
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
    <Card>
      <CardHeader>
        <CardTitle>النشاط الأخير</CardTitle>
        <CardDescription>آخر الأحداث في النظام</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pl-4">
          {activities.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا يوجد نشاط حديث
            </p>
          ) : (
            <div className="space-y-4">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b last:border-0"
                >
                  {getActivityBadge(activity.type)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.action}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(activity.timestamp, {
                        addSuffix: true,
                        locale: ar,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
