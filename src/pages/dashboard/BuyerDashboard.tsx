import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { User, ShoppingBag, MapPin, Bell, Star, Heart, CreditCard } from "lucide-react";
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
    notifications: "Notifications",
    stayUpdated: "Stay updated with alerts",
    viewNotifications: "View Notifications",
    reviews: "My Reviews",
    manageReviews: "View and manage your reviews",
    viewReviews: "View Reviews",
    wishlist: "Wishlist",
    savedItems: "Your saved items",
    viewWishlist: "View Wishlist",
    payments: "Payment Methods",
    managePayments: "Manage payment options",
    viewPayments: "View Payments",
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
    notifications: "اعلان‌ها",
    stayUpdated: "از هشدارها مطلع شوید",
    viewNotifications: "مشاهده اعلان‌ها",
    reviews: "نظرات من",
    manageReviews: "مشاهده و مدیریت نظرات",
    viewReviews: "مشاهده نظرات",
    wishlist: "علاقه‌مندی‌ها",
    savedItems: "موارد ذخیره شده",
    viewWishlist: "مشاهده علاقه‌مندی‌ها",
    payments: "روش‌های پرداخت",
    managePayments: "مدیریت گزینه‌های پرداخت",
    viewPayments: "مشاهده پرداخت‌ها",
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
    notifications: "خبرتیاوې",
    stayUpdated: "له خبرتیاوو سره تازه اوسئ",
    viewNotifications: "خبرتیاوې وګورئ",
    reviews: "زما نظرونه",
    manageReviews: "خپل نظرونه وګورئ او اداره کړئ",
    viewReviews: "نظرونه وګورئ",
    wishlist: "خوښې",
    savedItems: "ستاسو خوندي شوي توکي",
    viewWishlist: "خوښې وګورئ",
    payments: "د تادیې لارې",
    managePayments: "د تادیې اختیارونه اداره کړئ",
    viewPayments: "تادیې وګورئ",
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
      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
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

        {/* Orders Card */}
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

        {/* Notifications Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Bell className="h-4 w-4 text-primary" />
              {t.notifications}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t.stayUpdated}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/notifications">
              <Button variant="secondary" className="w-full min-h-[44px]">
                {t.viewNotifications}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* My Reviews Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Star className="h-4 w-4 text-primary" />
              {t.reviews}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t.manageReviews}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/buyer/reviews">
              <Button variant="secondary" className="w-full min-h-[44px]">
                {t.viewReviews}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Wishlist Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Heart className="h-4 w-4 text-primary" />
              {t.wishlist}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t.savedItems}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/buyer/wishlist">
              <Button variant="secondary" className="w-full min-h-[44px]">
                {t.viewWishlist}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Payment Methods Card */}
        <Card className="border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CreditCard className="h-4 w-4 text-primary" />
              {t.payments}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {t.managePayments}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/dashboard/buyer/payments">
              <Button variant="secondary" className="w-full min-h-[44px]">
                {t.viewPayments}
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Addresses Card */}
        <Card className="border-border/50">
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
