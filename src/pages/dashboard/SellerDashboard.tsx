import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, BarChart3, Settings, Store, ArrowRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useSellerStatus } from "@/hooks/useSellerStatus";

const texts = {
  en: {
    dashboardTitle: "Seller Dashboard",
    dashboardDescription: "Manage your sales and products",
    storeProfile: "Store Profile",
    profileComplete: "Your profile is complete. You can edit your information.",
    completeProfile: "Complete your profile",
    complete: "Complete",
    incomplete: "Incomplete",
    editProfile: "Edit Profile",
    products: "Products",
    manageProducts: "Manage products",
    seller: "Seller",
    orders: "Orders",
    manageOrders: "Manage orders",
    viewManageOrders: "View and manage orders",
    analytics: "Analytics",
    statsReports: "Stats & reports",
    salesReports: "Sales reports and trends",
  },
  fa: {
    dashboardTitle: "داشبورد فروشنده",
    dashboardDescription: "مدیریت فروش و محصولات",
    storeProfile: "پروفایل فروشگاه",
    profileComplete: "پروفایل شما کامل است. می‌توانید اطلاعات را ویرایش کنید.",
    completeProfile: "پروفایل خود را تکمیل کنید",
    complete: "کامل",
    incomplete: "ناقص",
    editProfile: "ویرایش پروفایل",
    products: "محصولات",
    manageProducts: "مدیریت محصولات",
    seller: "فروشنده",
    orders: "سفارشات",
    manageOrders: "مدیریت سفارشات",
    viewManageOrders: "نمایش و مدیریت سفارشات",
    analytics: "آنالیتیکس",
    statsReports: "آمار و گزارش‌ها",
    salesReports: "گزارش فروش و روندها",
  },
  ps: {
    dashboardTitle: "د پلورونکي ډشبورډ",
    dashboardDescription: "خپل پلور او محصولات اداره کړئ",
    storeProfile: "د پلورنځي پروفایل",
    profileComplete: "ستاسو پروفایل بشپړ دی. تاسو کولی شئ معلومات سم کړئ.",
    completeProfile: "خپل پروفایل بشپړ کړئ",
    complete: "بشپړ",
    incomplete: "نابشپړ",
    editProfile: "پروفایل سم کړئ",
    products: "محصولات",
    manageProducts: "محصولات اداره کړئ",
    seller: "پلورونکی",
    orders: "امرونه",
    manageOrders: "امرونه اداره کړئ",
    viewManageOrders: "امرونه وګورئ او اداره کړئ",
    analytics: "تحلیلات",
    statsReports: "احصایې او راپورونه",
    salesReports: "د پلور راپورونه او رجحانات",
  },
};

const SellerDashboard = () => {
  const { isRTL, language } = useLanguage();
  const { profileCompleted } = useSellerStatus();
  const t = texts[language] || texts.en;

  const ArrowIcon = isRTL ? ChevronLeft : ArrowRight;

  return (
    <DashboardLayout
      title={t.dashboardTitle}
      description={t.dashboardDescription}
      allowedRoles={["seller"]}
    >
      <h1 className="sr-only">{t.dashboardTitle}</h1>
      
      {/* Edit Profile Card */}
      <Card className="border-primary/30 bg-primary/5 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-primary" />
            {t.storeProfile}
          </CardTitle>
          <CardDescription>
            {profileCompleted ? t.profileComplete : t.completeProfile}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Badge variant={profileCompleted ? "default" : "secondary"} className={profileCompleted ? "bg-success" : "bg-warning"}>
            {profileCompleted ? t.complete : t.incomplete}
          </Badge>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/seller/complete-profile">
              <Settings size={16} />
              {t.editProfile}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/seller/products">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4 text-primary" />
                {t.products}
              </CardTitle>
              <CardDescription>{t.manageProducts}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge variant="secondary">{t.seller}</Badge>
              <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Link>
        </Card>

        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/seller/orders">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="h-4 w-4 text-primary" />
                {t.orders}
              </CardTitle>
              <CardDescription>{t.manageOrders}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t.viewManageOrders}
              </span>
              <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Link>
        </Card>

        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/seller/analytics">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                {t.analytics}
              </CardTitle>
              <CardDescription>{t.statsReports}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t.salesReports}
              </span>
              <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Link>
        </Card>
      </section>
    </DashboardLayout>
  );
};

export default SellerDashboard;