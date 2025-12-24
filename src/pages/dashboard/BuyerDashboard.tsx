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
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-primary" />
              {isRTL ? "پروفایل" : "Profile"}
            </CardTitle>
            <CardDescription>
              {isRTL ? "مدیریت اطلاعات حساب" : "Manage your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/profile">
              <Button variant="secondary" className="w-full">
                {isRTL ? "رفتن به پروفایل" : "Go to profile"}
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingBag className="h-4 w-4 text-primary" />
              {isRTL ? "سفارشات" : "Orders"}
            </CardTitle>
            <CardDescription>{isRTL ? "به‌زودی" : "Coming soon"}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {isRTL ? "پیگیری وضعیت سفارش" : "Track order status"}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4 text-primary" />
              {isRTL ? "آدرس‌ها" : "Addresses"}
            </CardTitle>
            <CardDescription>{isRTL ? "به‌زودی" : "Coming soon"}</CardDescription>
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
