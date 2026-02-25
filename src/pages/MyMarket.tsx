import {
  Package, Zap, BookOpen, Bookmark, Clock, Scale, Info,
  Headphones, Newspaper, LayoutDashboard, Globe, Sun, Moon,
  ChevronLeft, ChevronRight, User, LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import PublicLayout from "@/components/layout/PublicLayout";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const MyMarket = () => {
  const { language, isRTL } = useLanguage();
  const { user, role, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const l = (en: string, fa: string, ps: string) => {
    if (language === "fa") return fa;
    if (language === "ps") return ps;
    return en;
  };

  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const getDashboardLink = () => {
    if (role === "admin") return "/dashboard/admin";
    if (role === "seller") return "/dashboard/seller";
    return "/dashboard/buyer";
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const topBoxes = [
    { icon: Package, label: l("Products", "محصولات", "محصولات"), href: "/products" },
    { icon: Zap, label: l("New Arrival", "جدیدترین‌ها", "نوي راغلي"), href: "/products?filter=new" },
    { icon: BookOpen, label: l("Weblogs", "وبلاگ", "بلاګ"), href: "/blog" },
  ];

  const quickAccess = [
    { icon: Bookmark, label: l("Wishlist", "نشان‌ها", "خوښې"), href: user ? "/dashboard/buyer/wishlist" : "/login" },
    { icon: Clock, label: l("Recent Views", "بازدیدهای اخیر", "وروستي لیدنې"), href: "/products" },
  ];

  const supportInfo = [
    { icon: Scale, label: l("Privacy Policy", "قوانین و حریم خصوصی", "د محرمیت تګلاره"), href: "/privacy-policy" },
    { icon: Info, label: l("About Us", "درباره ما", "زموږ په اړه"), href: "/about" },
    { icon: Headphones, label: l("Support", "پشتیبانی", "ملاتړ"), href: "/contact" },
    { icon: Newspaper, label: l("News", "اتاق خبر", "خبرتیاوې"), href: "/blog" },
  ];

  const langLabel = language === "fa" ? "فارسی" : language === "ps" ? "پښتو" : "English";

  const Row = ({ icon: Icon, label, href, right }: { icon: any; label: string; href?: string; right?: React.ReactNode }) => {
    const content = (
      <div className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors">
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <Icon className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        {right || <Chevron className="h-4 w-4 text-muted-foreground" />}
      </div>
    );
    if (href) return <Link to={href}>{content}</Link>;
    return content;
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <div className={`px-4 pt-5 pb-2 ${isRTL ? "text-right" : "text-left"}`}>
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</span>
    </div>
  );

  return (
    <PublicLayout>
      <div className="min-h-[60vh] pb-24" dir={isRTL ? "rtl" : "ltr"}>
        {/* Top nav boxes */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
            {topBoxes.map((box) => {
              const Icon = box.icon;
              return (
                <Link
                  key={box.label}
                  to={box.href}
                  className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-foreground text-center leading-tight">{box.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <SectionTitle title={l("Quick Access", "دسترسی سریع", "ګړندی لاسرسی")} />
        <div className="divide-y divide-border border-y border-border">
          {quickAccess.map((item) => (
            <Row key={item.label} icon={item.icon} label={item.label} href={item.href} />
          ))}
        </div>

        {/* Support & Info */}
        <SectionTitle title={l("Support & Information", "پشتیبانی و اطلاعات", "ملاتړ او معلومات")} />
        <div className="divide-y divide-border border-y border-border">
          {supportInfo.map((item) => (
            <Row key={item.label} icon={item.icon} label={item.label} href={item.href} />
          ))}
        </div>

        {/* Settings */}
        <SectionTitle title={l("Settings", "تنظیمات", "تنظیمات")} />
        <div className="divide-y divide-border border-y border-border">
          {user && (
            <Row icon={LayoutDashboard} label={l("Dashboard", "داشبورد", "ډشبورډ")} href={getDashboardLink()} />
          )}

          <Link to="/my-market">
            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors">
              <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Globe className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">{l("Language", "زبان", "ژبه")}</span>
              </div>
              <span className="text-sm text-muted-foreground">{langLabel}</span>
            </div>
          </Link>

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full"
          >
            <div className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors">
              <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                {theme === "dark" ? <Sun className="h-5 w-5 text-primary" /> : <Moon className="h-5 w-5 text-primary" />}
                <span className="text-sm font-medium text-foreground">{l("Theme", "تم", "تم")}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {theme === "dark" ? l("Dark", "تاریک", "تیاره") : l("Light", "روشن", "رڼا")}
              </span>
            </div>
          </button>
        </div>

        {/* Login / Logout */}
        <div className="mt-4 border-y border-border">
          {user ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-destructive/10 transition-colors">
                  <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                    <LogOut className="h-5 w-5 text-destructive" />
                    <span className="text-sm font-medium text-destructive">{l("Logout", "خروج", "وتل")}</span>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent dir={isRTL ? "rtl" : "ltr"}>
                <AlertDialogHeader>
                  <AlertDialogTitle>{l("Logout", "خروج از حساب", "له حساب وتل")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {l("Are you sure you want to logout?", "آیا مطمئن هستید که می‌خواهید خارج شوید؟", "ایا تاسو ډاډه یاست چې غواړئ ووځئ؟")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className={isRTL ? "flex-row-reverse gap-2" : ""}>
                  <AlertDialogCancel>{l("Cancel", "انصراف", "لغوه")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLogout} className="bg-primary text-primary-foreground">
                    {l("Logout", "خروج", "وتل")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Link to="/login">
              <div className="flex items-center justify-between px-4 py-3.5 hover:bg-muted/50 transition-colors">
                <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <User className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">{l("Login / Register", "ورود / ثبت‌نام", "ننوتل / نوم لیکنه")}</span>
                </div>
                <Chevron className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default MyMarket;
