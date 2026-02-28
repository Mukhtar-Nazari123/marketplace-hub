import {
  Package, Zap, BookOpen, Bookmark, Clock, Scale, Info,
  Headphones, Newspaper, LayoutDashboard, Globe, Sun, Moon, Heart,
  ChevronLeft, ChevronRight, User, LogOut, Check,
  Facebook, Twitter, Instagram, Youtube, Linkedin, Github,
} from "lucide-react";
import { useState } from "react";
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
import { useSocialLinks } from "@/hooks/useSocialLinks";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Facebook, Twitter, Instagram, Youtube, YouTube: Youtube,
  LinkedIn: Linkedin, Linkedin, GitHub: Github, Github, Other: Globe, Globe,
};
const MyMarket = () => {
  const { language, setLanguage, isRTL } = useLanguage();
  const { user, role, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [langOpen, setLangOpen] = useState(false);
  const { data: socialLinks } = useSocialLinks();
  const { siteName } = useSiteSettings();

  const l = (en: string, fa: string, ps: string) => {
    if (language === "fa") return fa;
    if (language === "ps") return ps;
    return en;
  };

  const Chevron = isRTL ? ChevronRight : ChevronLeft;

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
    { icon: Heart, label: l("Wishlist", "علاقه‌مندی", "خوښې"), href: user ? "/dashboard/buyer/wishlist" : "/login" },
  ];

  const quickAccess = [
    { icon: Clock, label: l("Recent Views", "بازدیدهای اخیر", "وروستي لیدنې"), href: "/recently-viewed" },
  ];

  const supportInfo = [
    { icon: Scale, label: l("Privacy Policy", "قوانین و حریم خصوصی", "د محرمیت تګلاره"), href: "/privacy-policy" },
    { icon: Info, label: l("About Us", "درباره ما", "زموږ په اړه"), href: "/about" },
    { icon: Headphones, label: l("Support", "پشتیبانی", "ملاتړ"), href: "/contact" },
    { icon: Newspaper, label: l("News", "اتاق خبر", "خبرتیاوې"), href: "/blog" },
  ];

  const languages = [
    { code: "en" as const, label: "English" },
    { code: "fa" as const, label: "فارسی" },
    { code: "ps" as const, label: "پښتو" },
  ];
  const langLabel = languages.find((l) => l.code === language)?.label || "English";

  const Row = ({ icon: Icon, label, href, right, destructive }: {
    icon: any; label: string; href?: string; right?: React.ReactNode; destructive?: boolean;
  }) => {
    const inner = (
      <div className="flex items-center justify-between px-4 py-4 group-hover:bg-muted/40 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${destructive ? "bg-destructive/10" : "bg-primary/10"}`}>
            <Icon className={`h-[18px] w-[18px] ${destructive ? "text-destructive" : "text-primary"}`} />
          </div>
          <span className={`text-sm font-medium ${destructive ? "text-destructive" : "text-foreground"}`}>{label}</span>
        </div>
        {right || <Chevron className="h-4 w-4 text-muted-foreground/60" />}
      </div>
    );
    if (href) return <Link to={href} className="group">{inner}</Link>;
    return <div className="group">{inner}</div>;
  };

  const SectionTitle = ({ title }: { title: string }) => (
    <div className="px-4 pt-6 pb-2">
      <span className="text-[11px] font-bold text-muted-foreground/70 uppercase tracking-widest">{title}</span>
    </div>
  );

  return (
    <PublicLayout>
      <div className="min-h-[60vh] pb-4 max-w-lg mx-auto" dir={isRTL ? "rtl" : "ltr"}>
        {/* Top nav boxes */}
        <div className="px-4 pt-5">
          <div className="grid grid-cols-3 gap-3">
            {topBoxes.map((box) => {
              const Icon = box.icon;
              return (
                <Link
                  key={box.label}
                  to={box.href}
                  className="flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-xs font-semibold text-foreground text-center leading-tight">{box.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Login - shown only when not logged in */}
        {!user && (
          <div className="mx-4 mt-4 rounded-2xl border border-border bg-card overflow-hidden">
            <Link to="/login">
              <Row icon={User} label={l("Login / Register", "ورود / ثبت‌نام", "ننوتل / نوم لیکنه")} />
            </Link>
          </div>
        )}

        {/* Quick Access */}
        <SectionTitle title={l("Quick Access", "دسترسی سریع", "ګړندی لاسرسی")} />
        <div className="mx-4 rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {quickAccess.map((item) => (
            <Row key={item.label} icon={item.icon} label={item.label} href={item.href} />
          ))}
        </div>

        {/* Support & Info */}
        <SectionTitle title={l("Support & Information", "پشتیبانی و اطلاعات", "ملاتړ او معلومات")} />
        <div className="mx-4 rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {supportInfo.map((item) => (
            <Row key={item.label} icon={item.icon} label={item.label} href={item.href} />
          ))}
        </div>

        {/* Settings */}
        <SectionTitle title={l("Settings", "تنظیمات", "تنظیمات")} />
        <div className="mx-4 rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          {user && (
            <Row icon={LayoutDashboard} label={l("Dashboard", "داشبورد", "ډشبورډ")} href={getDashboardLink()} />
          )}

          <button onClick={() => setLangOpen(!langOpen)} className="w-full">
            <Row
              icon={Globe}
              label={l("Language", "زبان", "ژبه")}
              right={<span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{langLabel}</span>}
            />
          </button>
          {langOpen && (
            <div className="bg-muted/30 divide-y divide-border">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                  className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-muted/60 transition-colors"
                >
                  <span className={`text-sm font-medium ${language === lang.code ? "text-primary" : "text-foreground"}`}>{lang.label}</span>
                  {language === lang.code && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          )}

          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="w-full">
            <Row
              icon={theme === "dark" ? Sun : Moon}
              label={l("Theme", "تم", "تم")}
              right={
                <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {theme === "dark" ? l("Dark", "تاریک", "تیاره") : l("Light", "روشن", "رڼا")}
                </span>
              }
            />
          </button>
        </div>


        {/* Logout - shown only when logged in, at bottom */}
        {user && (
          <div className="mx-4 mt-4 rounded-2xl border border-border bg-card overflow-hidden">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full">
                  <Row icon={LogOut} label={l("Logout", "خروج", "وتل")} destructive right={<span />} />
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
          </div>
        )}

        {/* Social Links & Copyright */}
        <div className="mx-4 mt-4 mb-2 flex flex-col items-center gap-3">
          {socialLinks && socialLinks.length > 0 && (
            <div className="flex gap-3">
              {socialLinks.map((link) => {
                const IconComponent = ICON_MAP[link.icon] || Globe;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <IconComponent className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          )}
          <p className="text-xs text-muted-foreground text-center">
            © {isRTL ? "۱۴۰۴" : "2025"} {siteName}. {l("All rights reserved.", "تمام حقوق محفوظ است.", "ټول حقونه خوندي دي.")}
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default MyMarket;
