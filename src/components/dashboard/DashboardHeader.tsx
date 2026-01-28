import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { LogOut, User, Settings, Moon, Sun, ChevronDown, Home, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardHeaderProps {
  title: string;
  description?: string;
  onMobileMenuToggle?: () => void;
  isMobile?: boolean;
}

export const DashboardHeader = ({ title, description, onMobileMenuToggle, isMobile }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Helper for trilingual labels
  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const logoutText = getLabel('Logout', 'خروج', 'وتل');
  const confirmLogoutText = getLabel('Confirm Logout', 'تأیید خروج', 'د وتلو تایید');
  const logoutConfirmMessage = getLabel(
    'Are you sure you want to logout?',
    'آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟',
    'ایا تاسو ډاډه یاست چې غواړئ له خپل حساب څخه ووځئ؟'
  );
  const cancelText = getLabel('Cancel', 'انصراف', 'لغوه');
  const profileText = getLabel('Profile', 'پروفایل', 'پروفایل');
  const settingsText = getLabel('Settings', 'تنظیمات', 'ترتیبات');
  const homeTooltip = getLabel('Return to Home', 'بازگشت به خانه', 'کور ته بیرته');
  const lightModeText = getLabel('Light Mode', 'حالت روشن', 'روښانه حالت');
  const darkModeText = getLabel('Dark Mode', 'حالت تاریک', 'تیاره حالت');
  const homeText = getLabel('Home', 'صفحه اصلی', 'کور');
  const toggleSidebarText = getLabel('Toggle Sidebar', 'تغییر نوار کناری', 'سایډبار بدل کړئ');

  return (
    <header className={`flex h-14 sm:h-16 shrink-0 items-center justify-between gap-2 border-b bg-card/50 backdrop-blur-sm px-3 sm:px-4 sticky top-0 z-40 transition-all duration-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-2 min-w-0 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Mobile Menu Button */}
        {isMobile ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileMenuToggle}
            className="shrink-0 h-9 w-9"
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
          <SidebarTrigger tooltipText={toggleSidebarText} className={`transition-transform hover:scale-110 shrink-0 ${isRTL ? 'ml-1' : '-mr-1'}`} />
        )}
        
        <Separator orientation="vertical" className="mx-1 sm:mx-2 h-4 hidden sm:block" />
        
        <Breadcrumb className="min-w-0">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium truncate text-sm sm:text-base max-w-[150px] sm:max-w-none">
                {title}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        
        {description && (
          <span className={`text-sm text-muted-foreground hidden lg:inline truncate ${isRTL ? 'mr-2' : 'ml-2'}`}>
            — {description}
          </span>
        )}
      </div>

      <div className={`flex items-center gap-1 sm:gap-2 shrink-0 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Return to Home - hidden on mobile */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="rounded-full transition-all duration-300 hover:bg-accent hover:scale-110 h-8 w-8 sm:h-9 sm:w-9 hidden sm:flex"
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {homeTooltip}
          </TooltipContent>
        </Tooltip>

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full transition-all duration-300 hover:bg-accent hover:scale-110 h-8 w-8 sm:h-9 sm:w-9"
            >
              {isDark ? (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 transition-transform duration-300 rotate-0 hover:rotate-90" />
              ) : (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 hover:-rotate-12" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isDark ? lightModeText : darkModeText}
          </TooltipContent>
        </Tooltip>

        {/* User Menu with Logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={`flex items-center gap-1 sm:gap-2 px-1 sm:px-2 py-1 h-auto rounded-full transition-all duration-300 hover:bg-accent/80 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-7 w-7 sm:h-8 sm:w-8 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/50">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-medium text-xs sm:text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium max-w-[100px] lg:max-w-[120px] truncate">
                {user?.email?.split('@')[0]}
              </span>
              <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground hidden sm:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align={isRTL ? 'start' : 'end'} 
            className="w-56 animate-scale-in"
          >
            <div className="px-2 py-1.5 text-sm text-muted-foreground truncate">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigate('/dashboard/profile')}
              className="cursor-pointer transition-colors min-h-[44px]"
            >
              <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {profileText}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/dashboard/settings')}
              className="cursor-pointer transition-colors min-h-[44px]"
            >
              <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {settingsText}
            </DropdownMenuItem>
            {/* Home link for mobile */}
            <DropdownMenuItem 
              onClick={() => navigate('/')}
              className="cursor-pointer transition-colors min-h-[44px] sm:hidden"
            >
              <Home className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {homeText}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowLogoutConfirm(true);
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive transition-colors min-h-[44px]"
                >
                  <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {logoutText}
                </DropdownMenuItem>
              </AlertDialogTrigger>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
