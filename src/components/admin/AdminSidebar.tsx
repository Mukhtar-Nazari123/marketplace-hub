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
  FolderTree,
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

type Language = 'en' | 'fa' | 'ps';

const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

export const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { unreadCount } = useAdminNotifications();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const lang = language as Language;

  // Format unread count for display
  const formatUnreadCount = (count: number): string => {
    if (count > 15) return isRTL ? '۱۵+' : '15+';
    if (isRTL) {
      // Convert to Persian/Pashto numerals
      const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
      return count.toString().replace(/\d/g, (d) => persianDigits[parseInt(d)]);
    }
    return count.toString();
  };

  // Trilingual navigation labels
  const mainNavItems = [
    { title: getLabel(lang, 'Dashboard', 'داشبورد', 'ډشبورډ'), icon: LayoutDashboard, url: '/dashboard/admin', showBadge: false },
    { title: getLabel(lang, 'Notifications', 'اعلان‌ها', 'خبرتیاوې'), icon: Bell, url: '/dashboard/admin/notifications', showBadge: true },
    { title: getLabel(lang, 'Users', 'کاربران', 'کاروونکي'), icon: Users, url: '/dashboard/users', showBadge: false },
    { title: getLabel(lang, 'Products', 'محصولات', 'محصولات'), icon: Package, url: '/dashboard/products', showBadge: false },
    { title: getLabel(lang, 'Orders', 'سفارشات', 'امرونه'), icon: ShoppingCart, url: '/dashboard/orders', showBadge: false },
    { title: getLabel(lang, 'Sellers', 'فروشندگان', 'پلورونکي'), icon: BadgeCheck, url: '/dashboard/sellers', showBadge: false },
    { title: getLabel(lang, 'Reviews', 'نظرات', 'بیاکتنې'), icon: Star, url: '/dashboard/reviews', showBadge: false },
    { title: getLabel(lang, 'Contact Messages', 'پیام‌های تماس', 'د اړیکو پیغامونه'), icon: MessageSquare, url: '/dashboard/contact-messages', showBadge: false },
  ];

  const contentNavItems = [
    { title: getLabel(lang, 'Categories', 'دسته‌بندی‌ها', 'کټګورۍ'), icon: FolderTree, url: '/dashboard/categories' },
    { title: getLabel(lang, 'Blog', 'وبلاگ', 'بلاګ'), icon: FileText, url: '/dashboard/blogs' },
    { title: getLabel(lang, 'About Page', 'درباره ما', 'زموږ په اړه'), icon: FileText, url: '/dashboard/about' },
    { title: getLabel(lang, "Today's Deals", 'تخفیف‌های روزانه', 'نننۍ تخفیفونه'), icon: Zap, url: '/dashboard/deals' },
    { title: getLabel(lang, 'Hero Banners', 'بنرهای هیرو', 'هیرو بینرونه'), icon: Monitor, url: '/dashboard/hero-banners' },
    { title: getLabel(lang, 'CMS', 'مدیریت محتوا', 'د منځپانګې مدیریت'), icon: FileText, url: '/dashboard/cms' },
    { title: getLabel(lang, 'Newsletter', 'خبرنامه', 'خبرپاڼه'), icon: Mail, url: '/dashboard/newsletter' },
  ];

  const settingsNavItems = [
    { title: getLabel(lang, 'Social Links', 'لینک‌های اجتماعی', 'ټولنیز لینکونه'), icon: Share2, url: '/dashboard/social-links' },
    { title: getLabel(lang, 'Contact Settings', 'تنظیمات تماس', 'د اړیکو تنظیمات'), icon: MessageSquare, url: '/dashboard/contact-settings' },
    { title: getLabel(lang, 'Settings', 'تنظیمات', 'ترتیبات'), icon: Settings, url: '/dashboard/settings' },
  ];

  // Group labels
  const mainLabel = getLabel(lang, 'Main', 'اصلی', 'اصلي');
  const contentLabel = getLabel(lang, 'Content', 'محتوا', 'منځپانګه');
  const systemLabel = getLabel(lang, 'System', 'سیستم', 'سیسټم');
  const languageLabel = getLabel(lang, 'Language', 'زبان', 'ژبه');
  const managerLabel = getLabel(lang, 'Admin', 'مدیر', 'مدیر');
  const logoutLabel = getLabel(lang, 'Logout', 'خروج', 'وتل');
  const panelTitle = getLabel(lang, 'Admin Panel', 'پنل مدیریت', 'مدیریت پینل');
  const panelSubtitle = getLabel(lang, 'Manage your store', 'مدیریت فروشگاه', 'خپل پلورنځی مدیریت کړئ');

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Language options for cycling
  const languages: Language[] = ['en', 'fa', 'ps'];
  const languageNames: Record<Language, string> = {
    en: 'English',
    fa: 'دری',
    ps: 'پښتو',
  };

  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(lang);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  const getNextLanguageLabel = () => {
    const currentIndex = languages.indexOf(lang);
    const nextIndex = (currentIndex + 1) % languages.length;
    return languageNames[languages[nextIndex]];
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
                  <span className="font-semibold">{panelTitle}</span>
                  <span className="text-xs text-muted-foreground">{panelSubtitle}</span>
                </div>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          {!isCollapsed && <SidebarGroupLabel>{mainLabel}</SidebarGroupLabel>}
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
          {!isCollapsed && <SidebarGroupLabel>{contentLabel}</SidebarGroupLabel>}
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
          {!isCollapsed && <SidebarGroupLabel>{systemLabel}</SidebarGroupLabel>}
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
                <SidebarMenuButton onClick={cycleLanguage} tooltip={getNextLanguageLabel()}>
                  <Globe className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span>{getNextLanguageLabel()}</span>}
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
                        <span className="truncate font-semibold">{managerLabel}</span>
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
                <DropdownMenuItem onClick={cycleLanguage}>
                  <Globe className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {getNextLanguageLabel()}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {logoutLabel}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
