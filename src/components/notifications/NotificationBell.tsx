import { Bell, Package, ShoppingCart, Store, Star, CheckCircle, XCircle, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useLanguage } from '@/lib/i18n';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export const NotificationBell = () => {
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  // Format count for display (RTL/LTR)
  const formatCount = (count: number): string => {
    if (count > 99) return isRTL ? '۹۹+' : '99+';
    if (isRTL) {
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return count.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
    }
    return count.toString();
  };

  // Format time ago
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isRTL ? 'همین الان' : 'Just now';
    if (diffMins < 60) return isRTL ? `${formatCount(diffMins)} دقیقه پیش` : `${diffMins}m ago`;
    if (diffHours < 24) return isRTL ? `${formatCount(diffHours)} ساعت پیش` : `${diffHours}h ago`;
    return isRTL ? `${formatCount(diffDays)} روز پیش` : `${diffDays}d ago`;
  };

  // Get icon based on notification type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ORDER_STATUS_CHANGED':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'NEW_ORDER':
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'STORE_APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'STORE_REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'PRODUCT_APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'PRODUCT_REJECTED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'NEW_REVIEW':
        return <Star className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Get image for notification
  const getNotificationImage = (notification: Notification): string | null => {
    return notification.product_image_url || notification.store_logo_url || null;
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    // Navigate based on type
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

  // Get latest 10 notifications
  const latestNotifications = notifications.slice(0, 10);

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  className={`absolute -top-1 h-5 min-w-[20px] rounded-full bg-orange-500 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center px-1.5 ${isRTL ? '-right-1' : '-left-1'}`}
                >
                  {formatCount(unreadCount)}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          {isRTL ? 'اعلان‌ها' : 'Notifications'}
        </TooltipContent>
      </Tooltip>

      <DropdownMenuContent 
        align={isRTL ? 'start' : 'end'} 
        className={`w-80 sm:w-96 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-4 py-3 border-b ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">
              {isRTL ? 'اعلان‌ها' : 'Notifications'}
            </span>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {formatCount(unreadCount)}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7"
              onClick={() => markAllAsRead()}
            >
              {isRTL ? 'خواندن همه' : 'Mark all read'}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : latestNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-10 w-10 mb-3 opacity-50" />
              <p className="text-sm">{isRTL ? 'اعلانی وجود ندارد' : 'No notifications yet'}</p>
            </div>
          ) : (
            <div className="divide-y">
              {latestNotifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-3 hover:bg-muted/50 transition-colors text-${isRTL ? 'right' : 'left'} ${
                    !notification.is_read ? 'bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar/Image */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={getNotificationImage(notification) || undefined} />
                        <AvatarFallback className="bg-muted">
                          {getTypeIcon(notification.type)}
                        </AvatarFallback>
                      </Avatar>
                      {!notification.is_read && (
                        <span className={`absolute -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 border-2 border-background ${isRTL ? '-left-0.5' : '-right-0.5'}`} />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium line-clamp-1 ${!notification.is_read ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {isRTL ? notification.title_fa : notification.title_en}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {isRTL ? notification.message_fa : notification.message_en}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {notification.type === 'ORDER_STATUS_CHANGED' && notification.order_status && (
                          <Badge variant="outline" className="text-[10px] h-5 px-1.5 bg-blue-50 text-blue-700 border-blue-200">
                            {notification.order_status.charAt(0).toUpperCase() + notification.order_status.slice(1)}
                          </Badge>
                        )}
                        <p className="text-xs text-muted-foreground/70">
                          {formatTimeAgo(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full justify-center text-sm h-9"
                onClick={() => navigate('/dashboard/notifications')}
              >
                {isRTL ? 'مشاهده همه اعلان‌ها' : 'View all notifications'}
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
