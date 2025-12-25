import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, BarChart3, Settings, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useSellerStatus } from "@/hooks/useSellerStatus";

const SellerDashboard = () => {
  const { isRTL } = useLanguage();
  const { profileCompleted } = useSellerStatus();

  return (
    <DashboardLayout
      title={isRTL ? "داشبورد فروشنده" : "Seller Dashboard"}
      description={isRTL ? "مدیریت فروش و محصولات" : "Manage your sales and products"}
      allowedRoles={["seller"]}
    >
      <h1 className="sr-only">{isRTL ? "داشبورد فروشنده" : "Seller Dashboard"}</h1>
      
      {/* Edit Profile Card */}
      <Card className="border-primary/30 bg-primary/5 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-primary" />
            {isRTL ? "پروفایل فروشگاه" : "Store Profile"}
          </CardTitle>
          <CardDescription>
            {profileCompleted 
              ? (isRTL ? "پروفایل شما کامل است. می‌توانید اطلاعات را ویرایش کنید." : "Your profile is complete. You can edit your information.")
              : (isRTL ? "پروفایل خود را تکمیل کنید" : "Complete your profile")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Badge variant={profileCompleted ? "default" : "secondary"} className={profileCompleted ? "bg-success" : "bg-warning"}>
            {profileCompleted ? (isRTL ? "کامل" : "Complete") : (isRTL ? "ناقص" : "Incomplete")}
          </Badge>
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link to="/seller/complete-profile">
              <Settings size={16} />
              {isRTL ? "ویرایش پروفایل" : "Edit Profile"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4 text-primary" />
              {isRTL ? "محصولات" : "Products"}
            </CardTitle>
            <CardDescription>{isRTL ? "به‌زودی" : "Coming soon"}</CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">{isRTL ? "فروشنده" : "Seller"}</Badge>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShoppingCart className="h-4 w-4 text-primary" />
              {isRTL ? "سفارشات" : "Orders"}
            </CardTitle>
            <CardDescription>{isRTL ? "به‌زودی" : "Coming soon"}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {isRTL ? "نمایش و مدیریت سفارشات" : "View and manage orders"}
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-primary" />
              {isRTL ? "آمار" : "Analytics"}
            </CardTitle>
            <CardDescription>{isRTL ? "به‌زودی" : "Coming soon"}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {isRTL ? "گزارش فروش و روندها" : "Sales reports and trends"}
          </CardContent>
        </Card>
      </section>
    </DashboardLayout>
  );
};

export default SellerDashboard;