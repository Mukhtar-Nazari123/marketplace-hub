import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { useAdminNotifications } from '@/hooks/useAdminNotifications';
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
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  BadgeCheck,
  Image,
  Monitor,
  Tag,
  LayoutGrid,
  FileText,
  Settings,
  LogOut,
  Store,
  ChevronDown,
  Globe,
  Star,
  MessageSquare,
  Mail,
  Share2,
  Zap,
  Bell,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { unreadCount } = useAdminNotifications();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  // Format unread count for display
  const formatUnreadCount = (count: number): string => {
    if (count > 15) return isRTL ? '۱۵+' : '15+';
    if (isRTL) {
      // Convert to Persian numerals
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return count.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
    }
    return count.toString();
  };

  const mainNavItems = [
    { title: t.admin.dashboard, icon: LayoutDashboard, url: '/dashboard/admin', showBadge: false },
    { title: isRTL ? 'اعلان‌ها' : 'Notifications', icon: Bell, url: '/dashboard/admin/notifications', showBadge: true },
    { title: t.admin.users.title, icon: Users, url: '/dashboard/users', showBadge: false },
    { title: t.admin.products.title, icon: Package, url: '/dashboard/products', showBadge: false },
    { title: t.admin.orders.title, icon: ShoppingCart, url: '/dashboard/orders', showBadge: false },
    { title: t.admin.sellers.title, icon: BadgeCheck, url: '/dashboard/sellers', showBadge: false },
    { title: isRTL ? 'نظرات' : 'Reviews', icon: Star, url: '/dashboard/reviews', showBadge: false },
    { title: isRTL ? 'پیام‌های تماس' : 'Contact Messages', icon: MessageSquare, url: '/dashboard/contact-messages', showBadge: false },
  ];

  const contentNavItems = [
    { title: isRTL ? 'وبلاگ' : 'Blog', icon: FileText, url: '/dashboard/blogs' },
    { title: isRTL ? 'تخفیف‌های روزانه' : "Today's Deals", icon: Zap, url: '/dashboard/deals' },
    { title: isRTL ? 'بنرهای خانه' : 'Home Banners', icon: LayoutGrid, url: '/dashboard/home-banners' },
    { title: isRTL ? 'بنرهای هیرو' : 'Hero Banners', icon: Monitor, url: '/dashboard/hero-banners' },
    { title: isRTL ? 'کارت‌های تبلیغاتی' : 'Promo Cards', icon: LayoutGrid, url: '/dashboard/promo-cards' },
    { title: t.admin.cms.title, icon: FileText, url: '/dashboard/cms' },
    { title: isRTL ? 'خبرنامه' : 'Newsletter', icon: Mail, url: '/dashboard/newsletter' },
  ];

  const settingsNavItems = [
    { title: isRTL ? 'لینک‌های اجتماعی' : 'Social Links', icon: Share2, url: '/dashboard/social-links' },
    { title: isRTL ? 'تنظیمات تماس' : 'Contact Settings', icon: MessageSquare, url: '/dashboard/contact-settings' },
    { title: t.admin.settings.title, icon: Settings, url: '/dashboard/settings' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'fa' ? 'en' : 'fa');
  };

  const isActive = (url: string) => {
    if (url === '/dashboard/admin') {
      return location.pathname === '/dashboard/admin';
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar collapsible="icon" side={isRTL ? 'right' : 'left'}>
      <SidebarHeader className="border-b">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Store className="size-4" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">{t.admin.panelTitle}</span>
                  <span className="text-xs text-muted-foreground">{t.admin.panelSubtitle}</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>{t.admin.main}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <button onClick={() => navigate(item.url)} className="w-full flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </div>
                      {item.showBadge && unreadCount > 0 && !isCollapsed && (
                        <Badge 
                          className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-2 py-0.5 min-w-[20px] h-5 flex items-center justify-center rounded-full shadow-sm"
                        >
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

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>{t.admin.content}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {contentNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <button onClick={() => navigate(item.url)}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>{t.admin.system}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsNavItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <button onClick={() => navigate(item.url)}>
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Language Switcher */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={toggleLanguage} tooltip={language === 'fa' ? 'English' : 'دری'}>
                  <Globe className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{language === 'fa' ? 'English' : 'دری'}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.email?.charAt(0).toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <>
                      <div className={`grid flex-1 text-sm leading-tight ${isRTL ? 'text-right' : 'text-left'}`}>
                        <span className="truncate font-semibold">{t.admin.manager}</span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user?.email}
                        </span>
                      </div>
                      <ChevronDown className={`size-4 ${isRTL ? 'mr-auto' : 'ml-auto'}`} />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align={isRTL ? 'start' : 'end'}
                sideOffset={4}
              >
                <DropdownMenuItem onClick={toggleLanguage}>
                  <Globe className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {language === 'fa' ? 'English' : 'دری'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {t.admin.logout}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
