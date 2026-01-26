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
  const [searchQuery, setSearchQuery] = useState("");
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
      <header className="bg-background border-b border-muted-foreground/20 shadow-sm sticky top-0 z-50">
        <div className="container px-2 sm:px-4 py-2">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            {/* Logo - Only image */}
            <Link to="/" className="flex-shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 sm:h-10 w-auto object-contain" />
              ) : (
                <span className="text-primary font-bold text-2xl">{siteName}</span>
              )}
            </Link>

            {/* Search Bar - Red accent on focus */}
            <div className="flex-1 max-w-2xl hidden md:flex">
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
              {/* Theme Toggle - Hidden on mobile, shown in hamburger menu */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="hidden lg:flex transition-all duration-300 hover:bg-muted"
                    aria-label={
                      theme === "dark" ? (isRTL ? "حالت روشن" : "Light mode") : isRTL ? "حالت تاریک" : "Dark mode"
                    }
                  >
                    {theme === "dark" ? (
                      <Sun className="h-5 w-5 text-warning" />
                    ) : (
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {theme === "dark" ? (isRTL ? "حالت روشن" : "Light mode") : isRTL ? "حالت تاریک" : "Dark mode"}
                </TooltipContent>
              </Tooltip>

              {/* Wishlist - Only visible when logged in */}
              {user && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to="/dashboard/buyer/wishlist">
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
                  <TooltipContent>{isRTL ? "لیست علاقه‌مندی" : "Wishlist"}</TooltipContent>
                </Tooltip>
              )}

              {/* Cart - Only visible when logged in */}
              {user && (
                <Link to="/cart">
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
                            aria-label={isRTL ? "خروج" : "Logout"}
                          >
                            <LogOut className="h-5 w-5 text-muted-foreground hover:text-primary" />
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
                </div>
              ) : (
                <Link to="/login" className="hidden sm:flex items-center">
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
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder={t.header.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full h-10 rounded-full border border-muted-foreground/30 focus:border-primary ${isRTL ? "pr-4 pl-20 text-right" : "pl-4 pr-20 text-left"}`}
                dir={isRTL ? "rtl" : "ltr"}
              />
              <Button
                type="submit"
                size="sm"
                className={`absolute top-1/2 -translate-y-1/2 rounded-full px-3 hover:translate-y-[-50%] active:translate-y-[-50%] hover:scale-100 active:scale-100 ${isRTL ? "left-1" : "right-1"}`}
              >
                <Search className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};
export default Header;
