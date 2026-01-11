import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { User, ShoppingBag, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const BuyerDashboard = () => {
  const { isRTL } = useLanguage();

  return (
    <DashboardLayout
      title={isRTL ? "داشبورد خریدار" : "Buyer Dashboard"}
      description={isRTL ? "خلاصه حساب و سفارشات" : "Account overview and orders"}
      allowedRoles={["buyer"]}
    >
      <h1 className="sr-only">{isRTL ? "داشبورد خریدار" : "Buyer Dashboard"}</h1>
      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <User className="h-4 w-4 text-primary" />
              {isRTL ? "پروفایل" : "Profile"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {isRTL ? "مدیریت اطلاعات حساب" : "Manage your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/profile">
              <Button variant="secondary" className="w-full min-h-[44px]">
                {isRTL ? "رفتن به پروفایل" : "Go to profile"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <ShoppingBag className="h-4 w-4 text-primary" />
              {isRTL ? "سفارشات" : "Orders"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {isRTL ? "مشاهده و پیگیری سفارشات" : "View and track orders"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/buyer/orders">
              <Button variant="secondary" className="w-full min-h-[44px]">
                {isRTL ? "مشاهده سفارشات" : "View Orders"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50 sm:col-span-2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <MapPin className="h-4 w-4 text-primary" />
              {isRTL ? "آدرس‌ها" : "Addresses"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">{isRTL ? "به‌زودی" : "Coming soon"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{isRTL ? "خریدار" : "Buyer"}</Badge>
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
};

export default BuyerDashboard;
