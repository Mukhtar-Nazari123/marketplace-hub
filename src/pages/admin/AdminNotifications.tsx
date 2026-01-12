import { useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useLanguage } from "@/lib/i18n";
import { useAdminNotifications, NotificationType } from "@/hooks/useAdminNotifications";
import { NotificationCard } from "@/components/admin/notifications/NotificationCard";
import { NotificationFilters } from "@/components/admin/notifications/NotificationFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type FilterType = NotificationType | 'ALL';

const AdminNotifications = () => {
  const { isRTL } = useLanguage();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const { 
    notifications, 
    isLoading, 
    unreadCount,
    refetch,
    markAsRead, 
    markAllAsRead,
    isMarkingAllAsRead
  } = useAdminNotifications(filter);

  return (
    <AdminLayout
      title={isRTL ? "اعلان‌ها" : "Notifications"}
      description={isRTL ? "مدیریت اعلان‌های سیستم" : "Manage system notifications"}
    >
      <div className="space-y-6" dir={isRTL ? "rtl" : "ltr"}>
        {/* Header Actions */}
        <div className={cn(
          "flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between",
          isRTL && "sm:flex-row-reverse"
        )}>
          <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
            <div className="relative">
              <Bell className="h-8 w-8 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {isRTL ? 'مرکز اعلان‌ها' : 'Notification Center'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isRTL 
                  ? `${notifications.length} اعلان (${unreadCount} خوانده نشده)`
                  : `${notifications.length} notifications (${unreadCount} unread)`
                }
              </p>
            </div>
          </div>

          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className={cn("gap-2", isRTL && "flex-row-reverse")}
            >
              <RefreshCw className="h-4 w-4" />
              {isRTL ? 'بازخوانی' : 'Refresh'}
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
                className={cn("gap-2", isRTL && "flex-row-reverse")}
              >
                <CheckCheck className="h-4 w-4" />
                {isRTL ? 'همه خوانده شود' : 'Mark All Read'}
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={cn("text-lg", isRTL && "text-right")}>
              {isRTL ? 'فیلتر بر اساس نوع' : 'Filter by Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NotificationFilters activeFilter={filter} onFilterChange={setFilter} />
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle className={cn(isRTL && "text-right")}>
              {filter === 'ALL' 
                ? (isRTL ? 'همه اعلان‌ها' : 'All Notifications')
                : filter === 'NEW_PRODUCT'
                  ? (isRTL ? 'محصولات جدید' : 'New Products')
                  : filter === 'NEW_ORDER'
                    ? (isRTL ? 'سفارشات جدید' : 'New Orders')
                    : (isRTL ? 'فروشگاه‌های جدید' : 'New Stores')
              }
            </CardTitle>
            <CardDescription className={cn(isRTL && "text-right")}>
              {isRTL 
                ? 'کلیک کنید تا جزئیات را ببینید'
                : 'Click to view details'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Bell className="h-16 w-16 mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-1">
                  {isRTL ? 'اعلانی وجود ندارد' : 'No notifications'}
                </h3>
                <p className="text-sm">
                  {isRTL 
                    ? 'وقتی رویداد جدیدی اتفاق بیفتد، اینجا نمایش داده می‌شود'
                    : 'When new events occur, they will appear here'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminNotifications;
