import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { User, ShoppingBag, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const texts = {
  en: {
    dashboardTitle: "Buyer Dashboard",
    dashboardDescription: "Account overview and orders",
    profile: "Profile",
    manageAccount: "Manage your account",
    goToProfile: "Go to profile",
    orders: "Orders",
    viewTrackOrders: "View and track orders",
    viewOrders: "View Orders",
    addresses: "Addresses",
    comingSoon: "Coming soon",
    buyer: "Buyer",
  },
  fa: {
    dashboardTitle: "داشبورد خریدار",
    dashboardDescription: "خلاصه حساب و سفارشات",
    profile: "پروفایل",
    manageAccount: "مدیریت اطلاعات حساب",
    goToProfile: "رفتن به پروفایل",
    orders: "سفارشات",
    viewTrackOrders: "مشاهده و پیگیری سفارشات",
    viewOrders: "مشاهده سفارشات",
    addresses: "آدرس‌ها",
    comingSoon: "به‌زودی",
    buyer: "خریدار",
  },
  ps: {
    dashboardTitle: "د پیرودونکي ډشبورډ",
    dashboardDescription: "د حساب او امرونو لنډیز",
    profile: "پروفایل",
    manageAccount: "د حساب معلومات اداره کړئ",
    goToProfile: "پروفایل ته لاړ شئ",
    orders: "امرونه",
    viewTrackOrders: "امرونه وګورئ او تعقیب کړئ",
    viewOrders: "امرونه وګورئ",
    addresses: "پتې",
    comingSoon: "ډیر ژر راځي",
    buyer: "پیرودونکی",
  },
};

const BuyerDashboard = () => {
  const { isRTL, language } = useLanguage();
  const t = texts[language] || texts.en;

  return (
    <DashboardLayout
      title={t.dashboardTitle}
      description={t.dashboardDescription}
      allowedRoles={["buyer"]}
    >
      <h1 className="sr-only">{t.dashboardTitle}</h1>
      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <User className="h-4 w-4 text-primary" />
              {t.profile}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t.manageAccount}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/profile">
              <Button variant="secondary" className="w-full min-h-[44px]">
                {t.goToProfile}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <ShoppingBag className="h-4 w-4 text-primary" />
              {t.orders}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t.viewTrackOrders}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/buyer/orders">
              <Button variant="secondary" className="w-full min-h-[44px]">
                {t.viewOrders}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50 sm:col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="h-4 w-4 text-primary" />
              {t.addresses}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">{t.comingSoon}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{t.buyer}</Badge>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
