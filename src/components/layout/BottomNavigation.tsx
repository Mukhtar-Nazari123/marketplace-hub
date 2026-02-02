import { Home, ShoppingCart, TrendingUp, Heart, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  labelEn: string;
  labelFa: string;
  labelPs: string;
  href: string;
  authRequired?: boolean;
  badge?: number;
  scrollTo?: string;
}

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { user, role } = useAuth();
  const { itemCount: wishlistCount } = useWishlist();
  const { itemCount: cartCount } = useCart();

  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === "fa") return fa;
    if (language === "ps") return ps;
    return en;
  };

  // Get profile/dashboard link based on auth state
  const getProfileHref = () => {
    if (!user) return "/login";
    if (role === "admin") return "/dashboard/admin";
    if (role === "seller") return "/dashboard/seller";
    return "/dashboard/buyer";
  };

  const navItems: NavItem[] = [
    {
      icon: Home,
      labelEn: "Home",
      labelFa: "خانه",
      labelPs: "کور",
      href: "/",
    },
    {
      icon: ShoppingCart,
      labelEn: "Cart",
      labelFa: "سبد",
      labelPs: "کارټ",
      href: "/cart",
      badge: cartCount,
    },
    {
      icon: TrendingUp,
      labelEn: "Best Sellers",
      labelFa: "پرفروش‌ترین",
      labelPs: "غوره پلورل",
      href: "/",
      scrollTo: "best-sellers",
    },
    {
      icon: Heart,
      labelEn: "Wishlist",
      labelFa: "علاقه‌مندی",
      labelPs: "خوښې",
      href: user ? "/dashboard/buyer/wishlist" : "/login",
      badge: user ? wishlistCount : undefined,
    },
    {
      icon: User,
      labelEn: "Profile",
      labelFa: "حساب",
      labelPs: "حساب",
      href: getProfileHref(),
    },
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  // Format badge count for RTL
  const formatCount = (count: number) => {
    if (isRTL) {
      return count.toString().replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
    }
    return count.toString();
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-muted-foreground/20 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] lg:hidden safe-area-pb"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = item.scrollTo ? false : isActive(item.href);
          const Icon = item.icon;

          const handleClick = (e: React.MouseEvent) => {
            if (item.scrollTo) {
              e.preventDefault();
              if (location.pathname !== "/") {
                navigate("/");
                setTimeout(() => {
                  document.getElementById(item.scrollTo!)?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              } else {
                document.getElementById(item.scrollTo)?.scrollIntoView({ behavior: "smooth" });
              }
            }
          };

          return (
            <Link
              key={item.labelEn}
              to={item.href}
              onClick={handleClick}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 px-1 transition-all duration-200 relative",
                "active:scale-95 touch-manipulation",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {/* Active indicator */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full" />
              )}

              {/* Icon with badge */}
              <div className="relative">
                <Icon
                  className={cn(
                    "h-5 w-5 transition-all duration-200",
                    active && "scale-110"
                  )}
                />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 h-4 min-w-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {formatCount(item.badge > 99 ? 99 : item.badge)}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  "text-[10px] mt-1 font-medium transition-all duration-200 truncate max-w-full",
                  active && "font-semibold"
                )}
              >
                {getLabel(item.labelEn, item.labelFa, item.labelPs)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;
