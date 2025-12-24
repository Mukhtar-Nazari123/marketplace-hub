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
import { LogOut, User, Settings, Moon, Sun, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

export const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  const { user, signOut } = useAuth();
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isDark, setIsDark] = useState(false);

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

  const logoutText = isRTL ? 'خروج' : 'Logout';
  const confirmLogoutText = isRTL ? 'تأیید خروج' : 'Confirm Logout';
  const logoutConfirmMessage = isRTL 
    ? 'آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟' 
    : 'Are you sure you want to logout?';
  const cancelText = isRTL ? 'انصراف' : 'Cancel';
  const profileText = isRTL ? 'پروفایل' : 'Profile';
  const settingsText = isRTL ? 'تنظیمات' : 'Settings';

  return (
    <header className={`flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-card/50 backdrop-blur-sm px-4 sticky top-0 z-40 transition-all duration-300 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <SidebarTrigger className={`transition-transform hover:scale-110 ${isRTL ? 'ml-1' : '-mr-1'}`} />
        <Separator orientation="vertical" className="mx-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-foreground font-medium">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        {description && (
          <span className={`text-sm text-muted-foreground hidden md:inline ${isRTL ? 'mr-2' : 'ml-2'}`}>
            — {description}
          </span>
        )}
      </div>

      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full transition-all duration-300 hover:bg-accent hover:scale-110"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-yellow-500 transition-transform duration-300 rotate-0 hover:rotate-90" />
              ) : (
                <Moon className="h-5 w-5 transition-transform duration-300 hover:-rotate-12" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isDark ? (isRTL ? 'حالت روشن' : 'Light Mode') : (isRTL ? 'حالت تاریک' : 'Dark Mode')}
          </TooltipContent>
        </Tooltip>

        {/* User Menu with Logout */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className={`flex items-center gap-2 px-2 py-1 h-auto rounded-full transition-all duration-300 hover:bg-accent/80 ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 transition-all duration-300 hover:ring-primary/50">
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium max-w-[120px] truncate">
                {user?.email?.split('@')[0]}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align={isRTL ? 'start' : 'end'} 
            className="w-56 animate-scale-in"
          >
            <div className="px-2 py-1.5 text-sm text-muted-foreground">
              {user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => navigate('/dashboard/profile')}
              className="cursor-pointer transition-colors"
            >
              <User className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {profileText}
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/dashboard/settings')}
              className="cursor-pointer transition-colors"
            >
              <Settings className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {settingsText}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem 
                  onSelect={(e) => {
                    e.preventDefault();
                    setShowLogoutConfirm(true);
                  }}
                  className="cursor-pointer text-destructive focus:text-destructive transition-colors"
                >
                  <LogOut className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  {logoutText}
                </DropdownMenuItem>
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
