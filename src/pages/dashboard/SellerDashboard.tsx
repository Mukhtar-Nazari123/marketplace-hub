import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useLanguage } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, ShoppingCart, BarChart3, Settings, Store, ArrowRight, ChevronLeft, Bell, Languages, Star, User, Plus } from "lucide-react";
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
    notifications: "Notifications",
    stayUpdated: "Stay updated with alerts",
    viewNotifications: "View Notifications",
    translations: "Translations",
    manageTranslations: "Manage product translations",
    viewTranslations: "View Translations",
    reviews: "Reviews",
    manageReviews: "View customer reviews",
    viewReviews: "View Reviews",
    profile: "Profile",
    manageProfile: "Manage your account",
    viewProfile: "View Profile",
    addProduct: "Add Product",
    createProduct: "Create a new product",
    addNew: "Add New",
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
    notifications: "اعلان‌ها",
    stayUpdated: "از هشدارها مطلع شوید",
    viewNotifications: "مشاهده اعلان‌ها",
    translations: "ترجمه‌ها",
    manageTranslations: "مدیریت ترجمه محصولات",
    viewTranslations: "مشاهده ترجمه‌ها",
    reviews: "نظرات",
    manageReviews: "مشاهده نظرات مشتریان",
    viewReviews: "مشاهده نظرات",
    profile: "پروفایل",
    manageProfile: "مدیریت حساب کاربری",
    viewProfile: "مشاهده پروفایل",
    addProduct: "افزودن محصول",
    createProduct: "ایجاد محصول جدید",
    addNew: "افزودن جدید",
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
    notifications: "خبرتیاوې",
    stayUpdated: "له خبرتیاوو سره تازه اوسئ",
    viewNotifications: "خبرتیاوې وګورئ",
    translations: "ژباړې",
    manageTranslations: "د محصولاتو ژباړې اداره کړئ",
    viewTranslations: "ژباړې وګورئ",
    reviews: "نظرونه",
    manageReviews: "د پیرودونکو نظرونه وګورئ",
    viewReviews: "نظرونه وګورئ",
    profile: "پروفایل",
    manageProfile: "خپل حساب اداره کړئ",
    viewProfile: "پروفایل وګورئ",
    addProduct: "محصول اضافه کړئ",
    createProduct: "نوی محصول جوړ کړئ",
    addNew: "نوی اضافه کړئ",
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

      <section className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {/* Products Card */}
        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/seller/products">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Package className="h-4 w-4 text-primary" />
                {t.products}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t.manageProducts}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <Badge variant="secondary">{t.seller}</Badge>
              <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Link>
        </Card>

        {/* Orders Card */}
        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/seller/orders">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <ShoppingCart className="h-4 w-4 text-primary" />
                {t.orders}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t.manageOrders}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t.viewManageOrders}
              </span>
              <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Link>
        </Card>

        {/* Analytics Card */}
        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/seller/analytics">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <BarChart3 className="h-4 w-4 text-primary" />
                {t.analytics}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t.statsReports}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t.salesReports}
              </span>
              <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Link>
        </Card>

        {/* Notifications Card */}
        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/notifications">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Bell className="h-4 w-4 text-primary" />
                {t.notifications}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t.stayUpdated}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t.viewNotifications}
              </span>
              <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Link>
        </Card>

        {/* Translations Card */}
        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/seller/translations">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Languages className="h-4 w-4 text-primary" />
                {t.translations}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t.manageTranslations}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t.viewTranslations}
              </span>
              <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Link>
        </Card>

        {/* Reviews Card */}
        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/seller/reviews">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Star className="h-4 w-4 text-primary" />
                {t.reviews}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t.manageReviews}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t.viewReviews}
              </span>
              <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Link>
        </Card>

        {/* Profile Card */}
        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/profile">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <User className="h-4 w-4 text-primary" />
                {t.profile}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t.manageProfile}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t.viewProfile}
              </span>
              <ArrowIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </CardContent>
          </Link>
        </Card>

        {/* Add Product Card */}
        <Card className="border-border/50 hover:border-primary/50 transition-colors group">
          <Link to="/dashboard/seller/products/new">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                <Plus className="h-4 w-4 text-primary" />
                {t.addProduct}
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">{t.createProduct}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {t.addNew}
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