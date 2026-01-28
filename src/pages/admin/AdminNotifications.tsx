import { useState } from "react";
import { Bell, CheckCheck, RefreshCw } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useLanguage, Language } from "@/lib/i18n";
import { useAdminNotifications, NotificationType } from "@/hooks/useAdminNotifications";
import { NotificationCard } from "@/components/admin/notifications/NotificationCard";
import { NotificationFilters } from "@/components/admin/notifications/NotificationFilters";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type FilterType = NotificationType | 'ALL';

// Trilingual translations
const translations = {
  pageTitle: { en: 'Notifications', fa: 'اعلان‌ها', ps: 'خبرتیاوې' },
  pageDescription: { en: 'Manage system notifications', fa: 'مدیریت اعلان‌های سیستم', ps: 'د سیستم خبرتیاوې اداره کړئ' },
  notificationCenter: { en: 'Notification Center', fa: 'مرکز اعلان‌ها', ps: 'د خبرتیاوو مرکز' },
  notificationsCount: { 
    en: (total: number, unread: number) => `${total} notifications (${unread} unread)`,
    fa: (total: number, unread: number) => `${total} اعلان (${unread} خوانده نشده)`,
    ps: (total: number, unread: number) => `${total} خبرتیاوې (${unread} نه لوستل شوې)`
  },
  refresh: { en: 'Refresh', fa: 'بازخوانی', ps: 'تازه کول' },
  markAllRead: { en: 'Mark All Read', fa: 'همه خوانده شود', ps: 'ټول لوستل شوي' },
  filterByType: { en: 'Filter by Type', fa: 'فیلتر بر اساس نوع', ps: 'د ډول له مخې فلټر' },
  allNotifications: { en: 'All Notifications', fa: 'همه اعلان‌ها', ps: 'ټولې خبرتیاوې' },
  newProducts: { en: 'New Products', fa: 'محصولات جدید', ps: 'نوي محصولات' },
  newOrders: { en: 'New Orders', fa: 'سفارشات جدید', ps: 'نوې امرونه' },
  newStores: { en: 'New Stores', fa: 'فروشگاه‌های جدید', ps: 'نوې پلورنځي' },
  clickToViewDetails: { en: 'Click to view details', fa: 'کلیک کنید تا جزئیات را ببینید', ps: 'د جزیاتو لیدلو لپاره کلیک وکړئ' },
  noNotifications: { en: 'No notifications', fa: 'اعلانی وجود ندارد', ps: 'هیڅ خبرتیا نشته' },
  noNotificationsDesc: { 
    en: 'When new events occur, they will appear here', 
    fa: 'وقتی رویداد جدیدی اتفاق بیفتد، اینجا نمایش داده می‌شود',
    ps: 'کله چې نوي پیښې رامنځته شي، دلته به ښکاره شي'
  },
};

const AdminNotifications = () => {
  const { isRTL, language } = useLanguage();
  const lang = language as Language;
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

  const t = (key: keyof typeof translations) => {
    const value = translations[key];
    if (typeof value === 'object' && 'en' in value && typeof value.en === 'string') {
      return (value as Record<Language, string>)[lang] || value.en;
    }
    return '';
  };

  const getFilterTitle = () => {
    switch (filter) {
      case 'ALL': return t('allNotifications');
      case 'NEW_PRODUCT': return t('newProducts');
      case 'NEW_ORDER': return t('newOrders');
      case 'NEW_STORE': return t('newStores');
      default: return t('allNotifications');
    }
  };

  const notificationsCountText = translations.notificationsCount[lang](notifications.length, unreadCount);

  return (
    <AdminLayout
      title={t('pageTitle')}
      description={t('pageDescription')}
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
                {t('notificationCenter')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {notificationsCountText}
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
              {t('refresh')}
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
                {t('markAllRead')}
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className={cn("text-lg", isRTL && "text-right")}>
              {t('filterByType')}
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
              {getFilterTitle()}
            </CardTitle>
            <CardDescription className={cn(isRTL && "text-right")}>
              {t('clickToViewDetails')}
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
                  {t('noNotifications')}
                </h3>
                <p className="text-sm">
                  {t('noNotificationsDesc')}
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
