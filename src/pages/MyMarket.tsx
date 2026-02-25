import { Package, Zap, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import PublicLayout from "@/components/layout/PublicLayout";

const navBoxes = [
  {
    icon: Package,
    labelEn: "Products",
    labelFa: "محصولات",
    labelPs: "محصولات",
    href: "/products",
  },
  {
    icon: Zap,
    labelEn: "New Arrival",
    labelFa: "جدیدترین‌ها",
    labelPs: "نوي راغلي",
    href: "/products?filter=new",
  },
  {
    icon: BookOpen,
    labelEn: "Weblogs",
    labelFa: "وبلاگ",
    labelPs: "بلاګ",
    href: "/blog",
  },
];

const MyMarket = () => {
  const { language, isRTL } = useLanguage();

  const getLabel = (en: string, fa: string, ps: string) => {
    if (language === "fa") return fa;
    if (language === "ps") return ps;
    return en;
  };

  return (
    <PublicLayout>
      <div className="min-h-[60vh] px-4 pt-4 pb-24" dir={isRTL ? "rtl" : "ltr"}>

        <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
          {navBoxes.map((box) => {
            const Icon = box.icon;
            return (
              <Link
                key={box.labelEn}
                to={box.href}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {getLabel(box.labelEn, box.labelFa, box.labelPs)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </PublicLayout>
  );
};

export default MyMarket;
