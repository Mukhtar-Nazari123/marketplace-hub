import { Search, ShoppingCart, User, Menu, LayoutDashboard, LogOut, Moon, Sun, Heart } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
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
import MobileSearchOverlay from "./MobileSearchOverlay";
import { useTheme } from "next-themes";
import LanguageSwitcher from "./LanguageSwitcher";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { t, isRTL, language } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { siteName, logoUrl } = useSiteSettings();
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  const { user, role, signOut } = useAuth();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Get dashboard link based on role
  const getDashboardLink = () => {
    // Role can be null briefly right after login; send to /dashboard which will redirect.
    if (!role) return "/dashboard";
    if (role === "admin") return "/dashboard/admin";
    if (role === "seller") return "/dashboard/seller";
    return "/dashboard/buyer";
  };
  const getDashboardLabel = () => {
    const labels = {
      admin: { en: "Admin Dashboard", fa: "داشبورد مدیر", ps: "اډمین ډشبورډ" },
      seller: { en: "Seller Dashboard", fa: "داشبورد فروشنده", ps: "پلورونکي ډشبورډ" },
      buyer: { en: "Buyer Dashboard", fa: "داشبورد خریدار", ps: "پیرودونکي ډشبورډ" },
      default: { en: "Dashboard", fa: "داشبورد", ps: "ډشبورډ" }
    };
    const key = role && labels[role as keyof typeof labels] ? role as keyof typeof labels : 'default';
    return labels[key][language] || labels[key].en;
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
      <header className="bg-background border-b border-muted-foreground/20 shadow-sm sticky top-0 z-50">
        <div className="container px-1 sm:px-1.5 lg:px-2 py-2">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {/* Mobile Search Icon - Left side on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden flex-shrink-0"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t.header.searchPlaceholder}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Logo - Centered on mobile/tablet, left on desktop */}
            <Link to="/" className="flex-1 lg:flex-none flex justify-center lg:justify-start">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 sm:h-10 w-auto object-contain" />
              ) : (
                <span className="text-primary font-bold text-xl sm:text-2xl">{siteName}</span>
              )}
            </Link>

            {/* Mobile Menu Button - Right side */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden flex-shrink-0"
              onClick={() => setIsMenuOpen(true)}
              aria-label={t.header.menu}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search Bar - Desktop only */}
            <div className="flex-1 max-w-2xl hidden lg:flex">
              <form onSubmit={handleSearch} className="relative w-full">
                <Input
                  type="text"
                  placeholder={t.header.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`w-full h-11 rounded-full border border-muted-foreground/30 focus:border-primary transition-colors ${isRTL ? "pr-4 pl-24 text-right" : "pl-4 pr-24 text-left"}`}
                  dir={isRTL ? "rtl" : "ltr"}
                />
                <Button
                  type="submit"
                  size="sm"
                  className={`absolute top-1/2 -translate-y-1/2 rounded-full px-4 hover:translate-y-[-50%] active:translate-y-[-50%] hover:scale-100 active:scale-100 ${isRTL ? "left-1" : "right-1"}`}
                >
                  <Search className={`h-3.5 w-3.5 ${isRTL ? "ml-1" : "mr-1"}`} />
                </Button>
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
              {/* Language Switcher */}
              <LanguageSwitcher />

              {/* Theme Toggle - Hidden on mobile, shown in hamburger menu */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="hidden lg:flex transition-all duration-300 hover:bg-muted"
                    aria-label={t.header.themeToggle}
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5 text-warning" />
                    ) : (
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {t.header.themeToggle}
                </TooltipContent>
              </Tooltip>

              {/* Wishlist - Only visible when logged in, hidden on mobile/tablet */}
              {user && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/dashboard/buyer/wishlist" className="hidden lg:block">
                      <Button variant="ghost" size="icon" className="relative">
                        <Heart className="h-5 w-5 text-muted-foreground" />
                        {wishlistCount > 0 && (
                          <span
                            className={`absolute -top-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold ${isRTL ? "-right-1" : "-left-1"}`}
                          >
                            {formatCount(wishlistCount > 99 ? 99 : wishlistCount)}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>{t.header.wishlist}</TooltipContent>
                </Tooltip>
              )}

              {/* Cart - Only visible when logged in, hidden on mobile/tablet */}
              {user && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/cart" className="hidden lg:block">
                      <Button variant="ghost" size="icon" className="relative">
                        <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        {itemCount > 0 && (
                          <span
                            className={`absolute -top-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold ${isRTL ? "-right-1" : "-left-1"}`}
                          >
                            {formatCount(itemCount > 99 ? 99 : itemCount)}
                          </span>
                        )}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>{t.header.cart}</TooltipContent>
                </Tooltip>
              )}

              {/* Notifications - Only visible when logged in */}
              {user && (role === 'buyer' || role === 'seller') && (
                <NotificationBell />
              )}

              {/* Account / Dashboard / Logout - Hidden on mobile, shown on lg+ */}
              {user ? (
                <div className="hidden lg:flex items-center gap-1 sm:gap-2">
                  {/* Dashboard Link - Red icon */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link to={getDashboardLink()} className="flex">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="relative transition-all duration-300 hover:bg-primary/10"
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
                            className="transition-all duration-300 hover:bg-primary/10"
                            aria-label={t.header.logout}
                          >
                            <LogOut className="h-5 w-5 text-muted-foreground hover:text-primary" />
                          </Button>
                        </AlertDialogTrigger>
                      </TooltipTrigger>
                      <TooltipContent>{t.header.logout}</TooltipContent>
                    </Tooltip>
                    <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t.header.logoutTitle}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t.header.logoutConfirm}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className={isRTL ? "flex-row-reverse gap-2" : ""}>
                        <AlertDialogCancel className="border-muted-foreground/30">
                          {t.common.cancel}
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleLogout}
                          className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                          {t.header.logout}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center">
                  <div className={`text-sm ${isRTL ? "text-right" : "text-left"}`}>
                    <p className="text-muted-foreground">{t.header.signIn}</p>
                    <p className="font-medium text-foreground">{t.header.welcomeGuest}</p>
                  </div>
                </Link>
              )}

            </div>
          </div>

        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};
export default Header;
