import { Bell, CheckCheck, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage, Language } from "@/lib/i18n";
import { useAdminNotifications } from "@/hooks/useAdminNotifications";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NotificationCard } from "./NotificationCard";
import { Skeleton } from "@/components/ui/skeleton";

export const NotificationDropdown = () => {
  const navigate = useNavigate();
  const { isRTL, language } = useLanguage();
  const lang = language as Language;
  const { 
    notifications, 
    isLoading, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useAdminNotifications();

  const getLabel = (en: string, fa: string, ps: string) => {
    if (lang === 'ps') return ps;
    if (lang === 'fa') return fa;
    return en;
  };

  // Show only latest 5 notifications in dropdown
  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-all duration-300 hover:bg-primary/10 hover:scale-110"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground animate-pulse">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align={isRTL ? "start" : "end"} 
        className="w-[380px] p-0"
        sideOffset={8}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-4 py-3 border-b bg-muted/50",
          isRTL && "flex-row-reverse"
        )}>
          <h3 className="font-semibold text-sm">
            {getLabel('Notifications', 'اعلان‌ها', 'خبرتیاوې')}
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className={cn("gap-1 text-xs h-7", isRTL && "flex-row-reverse")}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              {getLabel('Mark all read', 'همه خوانده شود', 'ټول لوستل شوي')}
            </Button>
          )}
        </div>

        {/* Content */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="h-12 w-12 mb-3 opacity-50" />
              <p className="text-sm">
                {getLabel('No notifications yet', 'اعلان جدیدی نیست', 'تر اوسه هیڅ خبرتیا نشته')}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {recentNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full gap-2 text-sm",
                isRTL && "flex-row-reverse"
              )}
              onClick={() => navigate('/dashboard/admin/notifications')}
            >
              {getLabel('View all notifications', 'مشاهده همه اعلان‌ها', 'ټولې خبرتیاوې وګورئ')}
              <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
