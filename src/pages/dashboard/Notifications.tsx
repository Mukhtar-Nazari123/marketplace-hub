import { useState } from 'react';
import { Bell, Package, ShoppingCart, Store, Star, CheckCircle, XCircle, Truck, RefreshCw, CheckCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useNotifications, Notification, NotificationType } from '@/hooks/useNotifications';
import { useLanguage } from '@/lib/i18n';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';

type FilterType = NotificationType | 'ALL';

const Notifications = () => {
  const { role } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('ALL');
  const { notifications, isLoading, unreadCount, refetch, markAsRead, markAllAsRead, isMarkingAllAsRead } = useNotifications(filter);

  // Get filter options based on role
  const getFilterOptions = () => {
    if (role === 'buyer') {
      return [
        { value: 'ALL', label: isRTL ? 'همه' : 'All' },
        { value: 'ORDER_STATUS_CHANGED', label: isRTL ? 'وضعیت سفارش' : 'Order Status' },
      ];
    }
    // Seller filters
    return [
      { value: 'ALL', label: isRTL ? 'همه' : 'All' },
      { value: 'NEW_ORDER', label: isRTL ? 'سفارشات' : 'Orders' },
      { value: 'PRODUCT_APPROVED', label: isRTL ? 'محصولات' : 'Products' },
      { value: 'STORE_APPROVED', label: isRTL ? 'فروشگاه' : 'Store' },
      { value: 'NEW_REVIEW', label: isRTL ? 'نظرات' : 'Reviews' },
    ];
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    const formatNum = (num: number) => {
      if (isRTL) {
        const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
        return num.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
      }
      return num.toString();
    };

    if (diffMins < 1) return isRTL ? 'همین الان' : 'Just now';
    if (diffMins < 60) return isRTL ? `${formatNum(diffMins)} دقیقه پیش` : `${diffMins} minutes ago`;
    if (diffHours < 24) return isRTL ? `${formatNum(diffHours)} ساعت پیش` : `${diffHours} hours ago`;
    return isRTL ? `${formatNum(diffDays)} روز پیش` : `${diffDays} days ago`;
  };

  // Get icon based on notification type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ORDER_STATUS_CHANGED':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'NEW_ORDER':
        return <ShoppingCart className="h-5 w-5 text-green-500" />;
      case 'STORE_APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'STORE_REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'PRODUCT_APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'PRODUCT_REJECTED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'NEW_REVIEW':
        return <Star className="h-5 w-5 text-yellow-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Get type badge variant
  const getTypeBadgeVariant = (type: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (type) {
      case 'STORE_APPROVED':
      case 'PRODUCT_APPROVED':
        return 'default';
      case 'STORE_REJECTED':
      case 'PRODUCT_REJECTED':
        return 'destructive';
      case 'NEW_ORDER':
      case 'NEW_REVIEW':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get type label
  const getTypeLabel = (type: string): string => {
    const labels: Record<string, { en: string; fa: string }> = {
      ORDER_STATUS_CHANGED: { en: 'Order', fa: 'سفارش' },
      NEW_ORDER: { en: 'New Order', fa: 'سفارش جدید' },
      STORE_APPROVED: { en: 'Store', fa: 'فروشگاه' },
      STORE_REJECTED: { en: 'Store', fa: 'فروشگاه' },
      PRODUCT_APPROVED: { en: 'Product', fa: 'محصول' },
      PRODUCT_REJECTED: { en: 'Product', fa: 'محصول' },
      NEW_REVIEW: { en: 'Review', fa: 'نظر' },
    };
    return isRTL ? labels[type]?.fa || type : labels[type]?.en || type;
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    switch (notification.related_entity_type) {
      case 'order':
        navigate(`/dashboard/buyer/orders`);
        break;
      case 'seller_order':
        navigate(`/dashboard/seller/orders`);
        break;
      case 'product':
        if (notification.product_id) {
          navigate(`/dashboard/seller/products`);
        }
        break;
      case 'seller_verification':
        navigate(`/dashboard/seller`);
        break;
      case 'review':
        navigate(`/dashboard/seller/reviews`);
        break;
      default:
        break;
    }
  };

  // Get allowed roles
  const allowedRoles: Array<'buyer' | 'seller'> = ['buyer', 'seller'];

  return (
    <DashboardLayout
      title={isRTL ? 'اعلان‌ها' : 'Notifications'}
      description={isRTL ? 'مشاهده و مدیریت اعلان‌ها' : 'View and manage your notifications'}
      allowedRoles={allowedRoles}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Bell className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">
                {isRTL ? 'اعلان‌های شما' : 'Your Notifications'}
              </h2>
              {unreadCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  {isRTL ? `${unreadCount} اعلان خوانده نشده` : `${unreadCount} unread notifications`}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'بروزرسانی' : 'Refresh'}
            </Button>
            {unreadCount > 0 && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
              >
                <CheckCheck className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'خواندن همه' : 'Mark All Read'}
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterType)}>
          <TabsList className="w-full sm:w-auto flex-wrap h-auto gap-1 p-1">
            {getFilterOptions().map((option) => (
              <TabsTrigger 
                key={option.value} 
                value={option.value}
                className="min-h-[36px]"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bell className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  {isRTL ? 'اعلانی وجود ندارد' : 'No notifications'}
                </h3>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  {isRTL ? 'وقتی اتفاقی بیفتد، اینجا مطلع می‌شوید' : "You'll be notified when something happens"}
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.is_read ? 'border-primary/30 bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12">
                        <AvatarImage 
                          src={notification.product_image_url || notification.store_logo_url || undefined} 
                        />
                        <AvatarFallback className="bg-muted">
                          {getTypeIcon(notification.type)}
                        </AvatarFallback>
                      </Avatar>
                      {!notification.is_read && (
                        <span className={`absolute -top-1 h-3 w-3 rounded-full bg-orange-500 border-2 border-background ${isRTL ? '-left-1' : '-right-1'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {isRTL ? notification.title_fa : notification.title_en}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {isRTL ? notification.message_fa : notification.message_en}
                          </p>
                        </div>
                        <Badge variant={getTypeBadgeVariant(notification.type)} className="flex-shrink-0">
                          {getTypeLabel(notification.type)}
                        </Badge>
                      </div>

                      {/* Meta info */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                        {notification.type === 'ORDER_STATUS_CHANGED' && notification.order_status && (
                          <Badge variant="outline" className="text-xs h-6 px-2 bg-blue-50 text-blue-700 border-blue-200 font-medium">
                            {notification.order_status.charAt(0).toUpperCase() + notification.order_status.slice(1)}
                          </Badge>
                        )}
                        {notification.order_number && (
                          <span className="flex items-center gap-1">
                            <ShoppingCart className="h-3 w-3" />
                            #{notification.order_number}
                          </span>
                        )}
                        {notification.product_name && (
                          <span className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {notification.product_name}
                          </span>
                        )}
                        {notification.rating && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-yellow-500" />
                            {notification.rating}/5
                          </span>
                        )}
                        <span>{formatTimeAgo(notification.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
