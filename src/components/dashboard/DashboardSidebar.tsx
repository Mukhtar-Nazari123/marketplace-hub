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
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BadgeCheck,
  Image,
  Tag,
  FileText,
  Settings,
  LogOut,
  Store,
  Globe,
  User,
  MapPin,
  Heart,
  CreditCard,
  BarChart3,
  Plus,
  Home,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useState } from 'react';

export const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Admin navigation items
  const adminMainNavItems = [
    { title: t.admin.dashboard, icon: LayoutDashboard, url: '/dashboard/admin' },
    { title: t.admin.users.title, icon: Users, url: '/dashboard/users' },
    { title: t.admin.products.title, icon: Package, url: '/dashboard/products' },
    { title: t.admin.orders.title, icon: ShoppingCart, url: '/dashboard/orders' },
    { title: t.admin.sellers.title, icon: BadgeCheck, url: '/dashboard/sellers' },
  ];

  const adminContentNavItems = [
    { title: t.admin.banners.title, icon: Image, url: '/dashboard/banners' },
    { title: t.admin.promotions.title, icon: Tag, url: '/dashboard/promotions' },
    { title: t.admin.cms.title, icon: FileText, url: '/dashboard/cms' },
  ];

  const adminSettingsNavItems = [
    { title: t.admin.settings.title, icon: Settings, url: '/dashboard/settings' },
  ];

  // Seller navigation items (shared dashboard)
  const sellerNavItems = [
    { title: isRTL ? 'داشبورد' : 'Dashboard', icon: LayoutDashboard, url: '/dashboard/seller' },
    { title: isRTL ? 'محصولات من' : 'My Products', icon: Package, url: '/dashboard/seller/products' },
    { title: isRTL ? 'سفارشات' : 'Orders', icon: ShoppingCart, url: '/dashboard/seller/orders' },
    { title: isRTL ? 'آمار فروش' : 'Analytics', icon: BarChart3, url: '/dashboard/seller/analytics' },
    { title: isRTL ? 'پروفایل' : 'Profile', icon: User, url: '/dashboard/profile' },
    { title: isRTL ? 'افزودن محصول' : 'Add Product', icon: Plus, url: '/dashboard/seller/products/new' },
  ];

  // Buyer navigation items (shared dashboard)
  const buyerNavItems = [
    { title: isRTL ? 'داشبورد' : 'Dashboard', icon: LayoutDashboard, url: '/dashboard/buyer' },
    { title: isRTL ? 'پروفایل' : 'Profile', icon: User, url: '/dashboard/profile' },
    { title: isRTL ? 'سفارشات من' : 'My Orders', icon: ShoppingCart, url: '/dashboard/buyer/orders' },
    { title: isRTL ? 'آدرس‌ها' : 'Addresses', icon: MapPin, url: '/dashboard/buyer/addresses' },
    { title: isRTL ? 'علاقه‌مندی‌ها' : 'Wishlist', icon: Heart, url: '/dashboard/buyer/wishlist' },
    { title: isRTL ? 'روش‌های پرداخت' : 'Payment Methods', icon: CreditCard, url: '/dashboard/buyer/payments' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fa' ? 'en' : 'fa');
  };

  const isActive = (url: string) => {
    if (url === '/dashboard/admin' && role === 'admin') {
      return location.pathname === '/dashboard/admin';
    }
    return location.pathname.startsWith(url);
  };

  const getRoleLabel = () => {
    if (role === 'admin') return isRTL ? 'مدیر' : 'Admin';
    if (role === 'seller') return isRTL ? 'فروشنده' : 'Seller';
    if (role === 'buyer') return isRTL ? 'خریدار' : 'Buyer';
    return isRTL ? 'کاربر' : 'User';
  };

  const logoutText = isRTL ? 'خروج' : 'Logout';
  const confirmLogoutText = isRTL ? 'تأیید خروج' : 'Confirm Logout';
  const logoutConfirmMessage = isRTL 
    ? 'آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟' 
    : 'Are you sure you want to logout?';
  const cancelText = isRTL ? 'انصراف' : 'Cancel';

  const renderNavItems = (items: typeof adminMainNavItems, label?: string) => (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={item.title}
                className="transition-all duration-200 hover:translate-x-1"
              >
                <button onClick={() => navigate(item.url)}>
                  <item.icon className="transition-transform duration-200 group-hover:scale-110" />
                  <span>{item.title}</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <Sidebar collapsible="icon" side={isRTL ? 'right' : 'left'} className="border-border/50">
      <SidebarHeader className="border-b border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent group">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg transition-transform group-hover:scale-105">
                <Store className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                  {role === 'admin' ? t.admin.panelTitle : (isRTL ? 'داشبورد' : 'Dashboard')}
                </span>
                <span className="text-xs text-muted-foreground">{getRoleLabel()}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Admin Navigation */}
        {role === 'admin' && (
          <>
            {renderNavItems(adminMainNavItems, t.admin.main)}
            {renderNavItems(adminContentNavItems, t.admin.content)}
            {renderNavItems(adminSettingsNavItems, t.admin.system)}
          </>
        )}

        {/* Seller Navigation */}
        {role === 'seller' && renderNavItems(sellerNavItems)}

        {/* Buyer Navigation */}
        {role === 'buyer' && renderNavItems(buyerNavItems)}

        {/* Home & Language Switcher */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Return to Home */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => navigate('/')} 
                  tooltip={isRTL ? 'صفحه اصلی' : 'Home'}
                  className="transition-all duration-200 hover:translate-x-1"
                >
                  <Home className="transition-transform duration-200 hover:scale-110" />
                  <span>{isRTL ? 'صفحه اصلی' : 'Home'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Language Switcher */}
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={toggleLanguage} 
                  tooltip={language === 'fa' ? 'English' : 'دری'}
                  className="transition-all duration-200 hover:translate-x-1"
                >
                  <Globe className="transition-transform duration-200 hover:rotate-12" />
                  <span>{language === 'fa' ? 'English' : 'دری'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-9 w-9 ring-2 ring-primary/20 transition-all hover:ring-primary/40">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className={`grid flex-1 text-sm leading-tight min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
                <span className="truncate font-semibold">{getRoleLabel()}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </span>
              </div>
              <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="animate-scale-in">
                  <AlertDialogHeader>
                    <AlertDialogTitle>{confirmLogoutText}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {logoutConfirmMessage}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className={isRTL ? 'flex-row-reverse gap-2' : ''}>
                    <AlertDialogCancel>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleLogout}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {logoutText}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
