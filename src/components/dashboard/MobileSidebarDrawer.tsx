import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Star,
  X,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useState, useEffect } from 'react';

interface MobileSidebarDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MobileSidebarDrawer = ({ open, onOpenChange }: MobileSidebarDrawerProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Close drawer on route change
  useEffect(() => {
    onOpenChange(false);
  }, [location.pathname]);

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

  // Seller navigation items
  const sellerNavItems = [
    { title: isRTL ? 'داشبورد' : 'Dashboard', icon: LayoutDashboard, url: '/dashboard/seller' },
    { title: isRTL ? 'محصولات من' : 'My Products', icon: Package, url: '/dashboard/seller/products' },
    { title: isRTL ? 'سفارشات' : 'Orders', icon: ShoppingCart, url: '/dashboard/seller/orders' },
    { title: isRTL ? 'نظرات' : 'Reviews', icon: Star, url: '/dashboard/seller/reviews' },
    { title: isRTL ? 'آمار فروش' : 'Analytics', icon: BarChart3, url: '/dashboard/seller/analytics' },
    { title: isRTL ? 'پروفایل' : 'Profile', icon: User, url: '/dashboard/profile' },
    { title: isRTL ? 'افزودن محصول' : 'Add Product', icon: Plus, url: '/dashboard/seller/products/new' },
  ];

  // Buyer navigation items
  const buyerNavItems = [
    { title: isRTL ? 'داشبورد' : 'Dashboard', icon: LayoutDashboard, url: '/dashboard/buyer' },
    { title: isRTL ? 'پروفایل' : 'Profile', icon: User, url: '/dashboard/profile' },
    { title: isRTL ? 'سفارشات من' : 'My Orders', icon: ShoppingCart, url: '/dashboard/buyer/orders' },
    { title: isRTL ? 'نظرات من' : 'My Reviews', icon: Star, url: '/dashboard/buyer/reviews' },
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

  const handleNavigation = (url: string) => {
    navigate(url);
    onOpenChange(false);
  };

  const logoutText = isRTL ? 'خروج' : 'Logout';
  const confirmLogoutText = isRTL ? 'تأیید خروج' : 'Confirm Logout';
  const logoutConfirmMessage = isRTL 
    ? 'آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟' 
    : 'Are you sure you want to logout?';
  const cancelText = isRTL ? 'انصراف' : 'Cancel';

  const getNavItems = () => {
    if (role === 'admin') return [...adminMainNavItems, ...adminContentNavItems, ...adminSettingsNavItems];
    if (role === 'seller') return sellerNavItems;
    return buyerNavItems;
  };

  const navItems = getNavItems();

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side={isRTL ? 'right' : 'left'} 
          className="w-[280px] p-0 flex flex-col"
        >
          {/* Header */}
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg">
                <Store className="size-5" />
              </div>
              <div className="flex flex-col leading-none">
                <SheetTitle className="text-base font-semibold">
                  {role === 'admin' ? t.admin.panelTitle : (isRTL ? 'داشبورد' : 'Dashboard')}
                </SheetTitle>
                <span className="text-xs text-muted-foreground">{getRoleLabel()}</span>
              </div>
            </div>
          </SheetHeader>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-2">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.url);
                return (
                  <button
                    key={item.url}
                    onClick={() => handleNavigation(item.url)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 min-h-[48px] ${
                      active 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{item.title}</span>
                  </button>
                );
              })}
            </nav>

            <Separator className="my-4" />

            {/* Utility Navigation */}
            <nav className="space-y-1 px-2">
              <button
                onClick={() => handleNavigation('/')}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors min-h-[48px]"
              >
                <Home className="h-5 w-5 shrink-0" />
                <span>{isRTL ? 'صفحه اصلی' : 'Home'}</span>
              </button>
              <button
                onClick={toggleLanguage}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium hover:bg-muted transition-colors min-h-[48px]"
              >
                <Globe className="h-5 w-5 shrink-0" />
                <span>{language === 'fa' ? 'English' : 'دری'}</span>
              </button>
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{getRoleLabel()}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 min-h-[44px]"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut className="h-4 w-4" />
              {logoutText}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="animate-scale-in max-w-[90vw] sm:max-w-md">
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
    </>
  );
};
