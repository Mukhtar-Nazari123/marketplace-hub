import { X, Package, Zap, BookOpen, Phone, Info, LayoutDashboard, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
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
} from "@/components/ui/alert-dialog";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const { t, isRTL } = useLanguage();
  const { siteName, logoUrl } = useSiteSettings();
  const { user, role, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Get dashboard link based on role
  const getDashboardLink = () => {
    if (!role) return "/dashboard";
    if (role === "admin") return "/dashboard/admin";
    if (role === "seller") return "/dashboard/seller";
    return "/dashboard/buyer";
  };

  const getDashboardLabel = () => {
    if (role === "admin") return isRTL ? "داشبورد مدیر" : "Admin Dashboard";
    if (role === "seller") return isRTL ? "داشبورد فروشنده" : "Seller Dashboard";
    if (role === "buyer") return isRTL ? "داشبورد خریدار" : "Buyer Dashboard";
    return isRTL ? "داشبورد" : "Dashboard";
  };

  const handleLogout = async () => {
    await signOut();
    onClose();
    navigate("/login");
  };

  const navLinks = [
    { label: t.nav.products, icon: Package, href: "/products" },
    { label: t.nav.newArrivals, icon: Zap, href: "/products?filter=new", badge: isRTL ? "جدید" : "New" },
    { label: t.nav.blog, icon: BookOpen, href: "/blog" },
    { label: t.nav.contactUs, icon: Phone, href: "/contact" },
    { label: t.nav.aboutUs, icon: Info, href: "/about" },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className={`fixed top-0 h-full w-68 max-w-[70vw] bg-card z-50 lg:hidden shadow-xl overflow-y-auto ${isRTL ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-left'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Link to="/" className="flex-shrink-0" onClick={onClose}>
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={siteName} 
                className="h-12 w-auto object-contain" 
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-orange flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-lg">{siteName.charAt(0)}</span>
              </div>
            )}
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {/* Nav Links */}

          {/* Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary hover:text-cyan transition-colors"
                onClick={onClose}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
                {link.badge && (
                  <Badge variant="sale" className={`text-[10px] px-1.5 py-0 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                    {link.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* User Actions - Dashboard, Theme Toggle & Logout at bottom */}
          <div className="mt-6 pt-4 border-t border-border space-y-1">
            {/* Dashboard Link - Only for logged in users */}
            {user && (
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                onClick={onClose}
              >
                <LayoutDashboard className="h-5 w-5" />
                <span className="font-medium">{getDashboardLabel()}</span>
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5 text-warning" />
              ) : (
                <Moon className="h-5 w-5 text-muted-foreground" />
              )}
              <span>{theme === "dark" ? (isRTL ? "حالت روشن" : "Light mode") : (isRTL ? "حالت تاریک" : "Dark mode")}</span>
            </button>

            {/* Logout Button - Only for logged in users */}
            {user && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>{isRTL ? "خروج" : "Logout"}</span>
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{isRTL ? "خروج از حساب" : "Logout"}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {isRTL
                        ? "آیا مطمئن هستید که می‌خواهید از حساب خود خارج شوید؟"
                        : "Are you sure you want to logout from your account?"}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className={isRTL ? "flex-row-reverse gap-2" : ""}>
                    <AlertDialogCancel className="border-muted-foreground/30">
                      {isRTL ? "انصراف" : "Cancel"}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isRTL ? "خروج" : "Logout"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;