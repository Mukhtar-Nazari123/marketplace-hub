import { Search, ShoppingCart, User, Menu, LayoutDashboard, LogOut, Moon, Sun, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
import MobileMenu from "./MobileMenu";
import { useTheme } from "next-themes";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, isRTL } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { siteName, logoUrl } = useSiteSettings();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const { user, role, signOut } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();

  // Get dashboard link based on role
  const getDashboardLink = () => {
    // Role can be null briefly right after login; send to /dashboard which will redirect.
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
    navigate("/login");
  };

  // Format cart count for RTL
  const formatCount = (count: number) => {
    if (isRTL) {
      return count.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
    }
    return count.toString();
  };

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="w-20 h-20 rounded-lg object-contain" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-orange flex items-center justify-center">
                  <span className="text-accent-foreground font-bold text-xl">{siteName.charAt(0)}</span>
                </div>
              )}
              <div className="hidden sm:block">
                <h1 className="font-display text-xl font-bold text-foreground">{siteName}</h1>
                <p className="text-xs text-muted-foreground -mt-1">{t.footer.onlineStore}</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:flex">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder={t.header.searchPlaceholder}
                  className={`w-full h-11 rounded-full border-2 border-border focus:border-cyan transition-colors ${isRTL ? "pr-4 pl-24 text-right" : "pl-4 pr-24 text-left"}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <Button
                  variant="cyan"
                  size="sm"
                  className={`absolute top-1/2 -translate-y-1/2 rounded-full px-6 ${isRTL ? "left-1" : "right-1"}`}
                >
                  <Search className={`h-4 w-4 ${isRTL ? "ml-1" : "mr-1"}`} />
                  {t.header.search}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Search */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>

              {/* Theme Toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="transition-all duration-300 hover:bg-primary/10 hover:scale-110"
                    aria-label={
                      theme === "dark" ? (isRTL ? "حالت روشن" : "Light mode") : isRTL ? "حالت تاریک" : "Dark mode"
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5 text-warning" />
                    ) : (
                      <Moon className="h-5 w-5 text-primary" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {theme === "dark" ? (isRTL ? "حالت روشن" : "Light mode") : isRTL ? "حالت تاریک" : "Dark mode"}
                </TooltipContent>
              </Tooltip>

              {/* Wishlist */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/dashboard/buyer/wishlist">
                    <Button variant="ghost" size="icon" className="relative">
                      <Heart className="h-5 w-5" />
                      {wishlistCount > 0 && (
                        <span
                          className={`absolute -top-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold ${isRTL ? "-right-1" : "-left-1"}`}
                        >
                          {formatCount(wishlistCount > 99 ? 99 : wishlistCount)}
                        </span>
                      )}
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{isRTL ? "لیست علاقه‌مندی" : "Wishlist"}</TooltipContent>
              </Tooltip>

              {/* Cart */}
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span
                      className={`absolute -top-1 h-5 w-5 rounded-full bg-orange text-accent-foreground text-xs flex items-center justify-center font-bold ${isRTL ? "-right-1" : "-left-1"}`}
                    >
                      {formatCount(itemCount > 99 ? 99 : itemCount)}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Account / Dashboard / Logout */}
              {user ? (
                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Dashboard Link */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={getDashboardLink()} className="flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative transition-all duration-300 hover:bg-primary/10 hover:scale-110"
                          aria-label={getDashboardLabel()}
                        >
                          <LayoutDashboard className="h-5 w-5 text-primary" />
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>{getDashboardLabel()}</TooltipContent>
                  </Tooltip>

                  {/* Logout Button */}
                  <AlertDialog>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="transition-all duration-300 hover:bg-destructive/10 hover:scale-110"
                            aria-label={isRTL ? "خروج" : "Logout"}
                          >
                            <LogOut className="h-5 w-5 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>{isRTL ? "خروج" : "Logout"}</TooltipContent>
                    </Tooltip>
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
                        <AlertDialogCancel>{isRTL ? "انصراف" : "Cancel"}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleLogout}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isRTL ? "خروج" : "Logout"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div className={`text-sm ${isRTL ? "text-right" : "text-left"}`}>
                    <p className="text-muted-foreground">{t.header.signIn}</p>
                    <p className="font-medium text-foreground">{t.header.welcomeGuest}</p>
                  </div>
                </Link>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(true)}
                aria-label={isRTL ? "منو" : "Menu"}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder={t.header.searchPlaceholder}
                className={`w-full h-10 rounded-full border-2 border-border ${isRTL ? "pr-4 pl-20 text-right" : "pl-4 pr-20 text-left"}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <Button
                variant="cyan"
                size="sm"
                className={`absolute top-1/2 -translate-y-1/2 rounded-full px-4 ${isRTL ? "left-1" : "right-1"}`}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
