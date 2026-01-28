import { useNavigate } from "react-router-dom";
import { Package, ShoppingCart, Store, CheckCheck } from "lucide-react";
import { useLanguage, Language } from "@/lib/i18n";
import { AdminNotification } from "@/hooks/useAdminNotifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NotificationCardProps {
  notification: AdminNotification;
  onMarkAsRead: (id: string) => void;
}

export const NotificationCard = ({ notification, onMarkAsRead }: NotificationCardProps) => {
  const navigate = useNavigate();
  const { isRTL, language } = useLanguage();
  const lang = language as Language;

  const getLabel = (en: string, fa: string, ps: string) => {
    if (lang === 'ps') return ps;
    if (lang === 'fa') return fa;
    return en;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return getLabel('Just now', 'همین الان', 'همدا اوس');
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return getLabel(`${minutes}m ago`, `${minutes} دقیقه پیش`, `${minutes} دقیقې مخکې`);
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return getLabel(`${hours}h ago`, `${hours} ساعت پیش`, `${hours} ساعته مخکې`);
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return getLabel(`${days}d ago`, `${days} روز پیش`, `${days} ورځې مخکې`);
    }
  };

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (amount === null) return '';
    const curr = currency || 'AFN';
    if (isRTL) {
      const currLabel = curr === 'AFN' ? getLabel('AFN', 'افغانی', 'افغانۍ') : curr;
      return `${amount.toLocaleString('fa-AF')} ${currLabel}`;
    }
    return `${amount.toLocaleString()} ${curr}`;
  };

  const getTypeIcon = () => {
    switch (notification.type) {
      case 'NEW_PRODUCT':
        return <Package className="h-4 w-4" />;
      case 'NEW_ORDER':
        return <ShoppingCart className="h-4 w-4" />;
      case 'NEW_STORE':
        return <Store className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTypeBadgeVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    switch (notification.type) {
      case 'NEW_PRODUCT':
        return 'secondary';
      case 'NEW_ORDER':
        return 'default';
      case 'NEW_STORE':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getTypeLabel = () => {
    switch (notification.type) {
      case 'NEW_PRODUCT':
        return getLabel('Product', 'محصول', 'محصول');
      case 'NEW_ORDER':
        return getLabel('Order', 'سفارش', 'امر');
      case 'NEW_STORE':
        return getLabel('Store', 'فروشگاه', 'پلورنځی');
      default:
        return '';
    }
  };

  const getImageUrl = () => {
    if (notification.type === 'NEW_STORE') {
      return notification.store_logo_url;
    }
    return notification.product_image_url || notification.store_logo_url;
  };

  const getImageFallback = () => {
    if (notification.type === 'NEW_STORE') {
      return notification.store_name?.charAt(0) || 'S';
    }
    if (notification.type === 'NEW_PRODUCT') {
      return notification.product_name?.charAt(0) || 'P';
    }
    return notification.order_number?.charAt(0) || 'O';
  };

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id);
    }

    switch (notification.type) {
      case 'NEW_PRODUCT':
        if (notification.related_entity_id) {
          navigate(`/dashboard/admin/products/${notification.related_entity_id}`);
        }
        break;
      case 'NEW_ORDER':
        if (notification.related_entity_id) {
          navigate(`/dashboard/admin/orders/${notification.related_entity_id}`);
        }
        break;
      case 'NEW_STORE':
        navigate('/dashboard/admin/sellers');
        break;
    }
  };

  const title = lang === 'ps' 
    ? (notification.title_ps || notification.title_fa || notification.title_en) 
    : (lang === 'fa' ? notification.title_fa : notification.title_en);
  const message = lang === 'ps' 
    ? (notification.message_ps || notification.message_fa || notification.message_en) 
    : (lang === 'fa' ? notification.message_fa : notification.message_en);

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
        isRTL && "flex-row-reverse",
        notification.is_read 
          ? "bg-card border-border" 
          : "bg-primary/5 border-primary/20 hover:bg-primary/10"
      )}
    >
      {/* Unread indicator */}
      {!notification.is_read && (
        <div className={cn(
          "absolute top-4 w-2 h-2 rounded-full bg-primary animate-pulse",
          isRTL ? "left-4" : "right-4"
        )} />
      )}

      {/* Image/Avatar */}
      <Avatar className="h-12 w-12 shrink-0 border-2 border-background shadow-sm">
        <AvatarImage src={getImageUrl() || undefined} alt={title} />
        <AvatarFallback className="bg-muted text-muted-foreground font-medium">
          {getImageFallback()}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className={cn("flex-1 min-w-0", isRTL && "text-right")}>
        <div className={cn("flex items-center gap-2 mb-1", isRTL && "flex-row-reverse")}>
          <Badge variant={getTypeBadgeVariant()} className="gap-1 text-xs">
            {getTypeIcon()}
            {getTypeLabel()}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatTimeAgo(notification.created_at)}
          </span>
        </div>

        <h4 className={cn(
          "font-semibold text-sm text-foreground mb-1 line-clamp-1",
          !notification.is_read && "text-primary"
        )}>
          {title}
        </h4>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {message}
        </p>

        {/* Meta info */}
        <div className={cn(
          "flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap",
          isRTL && "flex-row-reverse"
        )}>
          {notification.order_number && (
            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">
              #{notification.order_number}
            </span>
          )}
          {notification.seller_name && (
            <span>{getLabel('Seller:', 'فروشنده:', 'پلورونکی:')} {notification.seller_name}</span>
          )}
          {notification.buyer_name && (
            <span>{getLabel('Buyer:', 'خریدار:', 'پیرودونکی:')} {notification.buyer_name}</span>
          )}
        </div>
      </div>

      {/* Order total */}
      {notification.type === 'NEW_ORDER' && notification.order_total && (
        <div className={cn(
          "shrink-0 text-right",
          isRTL && "text-left"
        )}>
          <div className="font-bold text-sm text-foreground">
            {formatCurrency(notification.order_total, notification.order_currency)}
          </div>
        </div>
      )}

      {/* Mark as read button (only on hover if unread) */}
      {!notification.is_read && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7",
            isRTL ? "left-2 bottom-2" : "right-2 bottom-2"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onMarkAsRead(notification.id);
          }}
        >
          <CheckCheck className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
