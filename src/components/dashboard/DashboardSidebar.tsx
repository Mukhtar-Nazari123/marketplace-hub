import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Users, Package, ShoppingCart, BadgeCheck, Image, Tag, FileText, Settings, LogOut, Store, Globe, User, MapPin, Heart, CreditCard, BarChart3, Plus, Home, Star, Bell, Languages,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { unreadCount } = useNotifications();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const formatUnreadCount = (count: number): string => {
    if (count > 15) return isRTL ? '۱۵+' : '15+';
    if (isRTL) {
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return count.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
    }
    return count.toString();
  };

  const adminMainNavItems = [
    { title: t.admin.dashboard, icon: LayoutDashboard, url: '/dashboard/admin', showBadge: false },
    { title: t.admin.users.title, icon: Users, url: '/dashboard/users', showBadge: false },
    { title: t.admin.products.title, icon: Package, url: '/dashboard/products', showBadge: false },
    { title: t.admin.orders.title, icon: ShoppingCart, url: '/dashboard/orders', showBadge: false },
    { title: t.admin.sellers.title, icon: BadgeCheck, url: '/dashboard/sellers', showBadge: false },
  ];

  const adminContentNavItems = [
    { title: t.admin.banners.title, icon: Image, url: '/dashboard/banners', showBadge: false },
    { title: t.admin.promotions.title, icon: Tag, url: '/dashboard/promotions', showBadge: false },
    { title: t.admin.cms.title, icon: FileText, url: '/dashboard/cms', showBadge: false },
  ];

  const adminSettingsNavItems = [
    { title: t.admin.settings.title, icon: Settings, url: '/dashboard/settings', showBadge: false },
  ];

  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  const sellerNavItems = [
    { title: getLabel('Dashboard', 'داشبورد', 'ډشبورډ'), icon: LayoutDashboard, url: '/dashboard/seller', showBadge: false },
    { title: getLabel('Notifications', 'اعلان‌ها', 'خبرتیاوې'), icon: Bell, url: '/dashboard/notifications', showBadge: true },
    { title: getLabel('My Products', 'محصولات من', 'زما محصولات'), icon: Package, url: '/dashboard/seller/products', showBadge: false },
    { title: getLabel('Orders', 'سفارشات', 'امرونه'), icon: ShoppingCart, url: '/dashboard/seller/orders', showBadge: false },
    { title: getLabel('Translations', 'ترجمه‌ها', 'ژباړې'), icon: Languages, url: '/dashboard/seller/translations', showBadge: false },
    { title: getLabel('Reviews', 'نظرات', 'نظرونه'), icon: Star, url: '/dashboard/seller/reviews', showBadge: false },
    { title: getLabel('Analytics', 'آمار فروش', 'تحلیلات'), icon: BarChart3, url: '/dashboard/seller/analytics', showBadge: false },
    { title: getLabel('Profile', 'پروفایل', 'پروفایل'), icon: User, url: '/dashboard/profile', showBadge: false },
    { title: getLabel('Add Product', 'افزودن محصول', 'محصول اضافه کړئ'), icon: Plus, url: '/dashboard/seller/products/new', showBadge: false },
  ];

  const buyerNavItems = [
    { title: getLabel('Dashboard', 'داشبورد', 'ډشبورډ'), icon: LayoutDashboard, url: '/dashboard/buyer', showBadge: false },
    { title: getLabel('Notifications', 'اعلان‌ها', 'خبرتیاوې'), icon: Bell, url: '/dashboard/notifications', showBadge: true },
    { title: getLabel('Profile', 'پروفایل', 'پروفایل'), icon: User, url: '/dashboard/profile', showBadge: false },
    { title: getLabel('My Orders', 'سفارشات من', 'زما امرونه'), icon: ShoppingCart, url: '/dashboard/buyer/orders', showBadge: false },
    { title: getLabel('My Reviews', 'نظرات من', 'زما نظرونه'), icon: Star, url: '/dashboard/buyer/reviews', showBadge: false },
    { title: getLabel('Addresses', 'آدرس‌ها', 'پتې'), icon: MapPin, url: '/dashboard/buyer/addresses', showBadge: false },
    { title: getLabel('Wishlist', 'علاقه‌مندی‌ها', 'خوښې'), icon: Heart, url: '/dashboard/buyer/wishlist', showBadge: false },
    { title: getLabel('Payment Methods', 'روش‌های پرداخت', 'د تادیې لارې'), icon: CreditCard, url: '/dashboard/buyer/payments', showBadge: false },
  ];

  const handleLogout = async () => { await signOut(); navigate('/login'); };
  const toggleLanguage = () => { setLanguage(language === 'fa' ? 'en' : 'fa'); };
  const isActive = (url: string) => {
    if (url === '/dashboard/admin' && role === 'admin') return location.pathname === '/dashboard/admin';
    return location.pathname.startsWith(url);
  };
  const getRoleLabel = () => {
    if (role === 'admin') return getLabel('Admin', 'مدیر', 'اډمین');
    if (role === 'seller') return getLabel('Seller', 'فروشنده', 'پلورونکی');
    if (role === 'buyer') return getLabel('Buyer', 'خریدار', 'پیرودونکی');
    return getLabel('User', 'کاربر', 'کارن');
  };

  const renderNavItems = (items: typeof sellerNavItems, label?: string) => (
    <SidebarGroup>
      {label && !isCollapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title} className={`transition-all duration-200 ${isActive(item.url) ? 'text-primary border-l-2 border-primary' : 'text-sidebar-foreground'}`}>
                <button onClick={() => navigate(item.url)} className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon className={`h-4 w-4 shrink-0 ${isActive(item.url) ? 'text-primary' : 'text-muted-foreground'}`} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </div>
                  {item.showBadge && unreadCount > 0 && !isCollapsed && (
                    <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center rounded-full">
                      {formatUnreadCount(unreadCount)}
                    </Badge>
                  )}
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" side={isRTL ? 'right' : 'left'} className="border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="size-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold text-foreground">{role === 'admin' ? t.admin.panelTitle : getLabel('Dashboard', 'داشبورد', 'ډشبورډ')}</span>
                  <span className="text-xs text-muted-foreground">{getRoleLabel()}</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {role === 'admin' && <>{renderNavItems(adminMainNavItems, t.admin.main)}{renderNavItems(adminContentNavItems, t.admin.content)}{renderNavItems(adminSettingsNavItems, t.admin.system)}</>}
        {role === 'seller' && renderNavItems(sellerNavItems)}
        {role === 'buyer' && renderNavItems(buyerNavItems)}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => navigate('/')} tooltip={getLabel('Home', 'صفحه اصلی', 'کور پاڼه')}>
                  <Home className="shrink-0 text-muted-foreground" />
                  {!isCollapsed && <span>{getLabel('Home', 'صفحه اصلی', 'کور پاڼه')}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleLanguage} tooltip={language === 'en' ? 'دری' : 'English'}>
                  <Globe className="shrink-0 text-muted-foreground" />
                  {!isCollapsed && <span>{language === 'en' ? 'دری' : 'English'}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={`flex items-center gap-3 px-2 py-2 ${isCollapsed ? 'justify-center' : ''}`}>
              <Avatar className="h-9 w-9 shrink-0 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">{user?.email?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <>
                  <div className={`grid flex-1 text-sm leading-tight min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <span className="truncate font-semibold">{getRoleLabel()}</span>
                    <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                  </div>
                  <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10">
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{getLabel('Confirm Logout', 'تأیید خروج', 'د وتلو تایید')}</AlertDialogTitle>
                        <AlertDialogDescription>{getLabel('Are you sure you want to logout?', 'آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟', 'ایا تاسو ډاډه یاست چې غواړئ له خپل حساب څخه ووځئ؟')}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className={isRTL ? 'flex-row-reverse gap-2' : ''}>
                        <AlertDialogCancel>{getLabel('Cancel', 'انصراف', 'لغوه')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogout}>{getLabel('Logout', 'خروج', 'وتل')}</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
