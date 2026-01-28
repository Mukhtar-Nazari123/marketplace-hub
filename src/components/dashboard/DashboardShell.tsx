import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import { useLanguage, type Language } from "@/lib/i18n";
import { useIsMobile } from "@/hooks/use-mobile";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { MobileSidebarDrawer } from "@/components/dashboard/MobileSidebarDrawer";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardChromeProvider } from "@/components/dashboard/DashboardChromeContext";

type AppRole = "admin" | "seller" | "buyer" | "moderator";

type HeaderConfig = {
  title: string;
  description?: string;
};

const getAllowedRolesForPath = (pathname: string): AppRole[] => {
  if (pathname.startsWith("/dashboard/seller")) return ["seller"];
  if (pathname.startsWith("/dashboard/buyer")) return ["buyer"];

  // shared pages
  if (pathname.startsWith("/dashboard/notifications")) return ["buyer", "seller", "admin", "moderator"];
  if (pathname.startsWith("/dashboard/profile")) return ["buyer", "seller", "admin", "moderator"];

  // /dashboard (index redirect page)
  if (pathname === "/dashboard" || pathname === "/dashboard/") return ["buyer", "seller", "admin", "moderator"];

  // fallback: allow all (prevents accidental lock-out on future routes)
  return ["buyer", "seller", "admin", "moderator"];
};

const getHeaderConfig = (pathname: string, language: Language): HeaderConfig => {
  const t = (en: string, fa: string, ps: string) => {
    if (language === 'ps') return ps;
    if (language === 'fa') return fa;
    return en;
  };

  // Seller
  if (pathname === "/dashboard/seller" || pathname === "/dashboard/seller/") {
    return {
      title: t("Seller Dashboard", "داشبورد فروشنده", "د پلورونکي ډشبورډ"),
      description: t("Manage your sales and products", "مدیریت فروش و محصولات", "خپل پلور او محصولات اداره کړئ"),
    };
  }
  if (pathname.startsWith("/dashboard/seller/products/new")) {
    return {
      title: t("Add Product", "افزودن محصول", "محصول اضافه کړئ"),
      description: t("Add a new product to your store", "محصول جدید به فروشگاه اضافه کنید", "خپل پلورنځي ته نوی محصول اضافه کړئ"),
    };
  }
  if (pathname.includes("/dashboard/seller/products/edit/")) {
    return {
      title: t("Edit Product", "ویرایش محصول", "محصول سمول"),
      description: t("Edit your product", "ویرایش محصول", "خپل محصول وسموئ"),
    };
  }
  if (pathname.includes("/dashboard/seller/products/view/")) {
    return {
      title: t("View Product", "مشاهده محصول", "محصول وګورئ"),
      description: "",
    };
  }
  if (pathname.startsWith("/dashboard/seller/products")) {
    return {
      title: t("My Products", "محصولات من", "زما محصولات"),
      description: t("Manage your store products", "مدیریت محصولات فروشگاه", "د پلورنځي محصولات اداره کړئ"),
    };
  }
  if (pathname.startsWith("/dashboard/seller/orders")) {
    return {
      title: t("Orders", "سفارشات", "امرونه"),
      description: t("Manage customer orders", "مدیریت سفارشات مشتریان", "د پیرودونکو امرونه اداره کړئ"),
    };
  }
  if (pathname.startsWith("/dashboard/seller/reviews")) {
    return {
      title: t("Product Reviews", "نظرات محصولات", "د محصولاتو نظرونه"),
      description: t("View customer reviews about your products", "مشاهده نظرات خریداران درباره محصولات شما", "ستاسو د محصولاتو په اړه د پیرودونکو نظرونه وګورئ"),
    };
  }
  if (pathname.startsWith("/dashboard/seller/analytics")) {
    return {
      title: t("Analytics", "آنالیتیکس", "تحلیلات"),
      description: t("Sales statistics and reports", "آمار و گزارش فروش", "د پلور احصایې او راپورونه"),
    };
  }

  // Buyer
  if (pathname === "/dashboard/buyer" || pathname === "/dashboard/buyer/") {
    return {
      title: t("Buyer Dashboard", "داشبورد خریدار", "د پیرودونکي ډشبورډ"),
      description: t("Account overview and orders", "خلاصه حساب و سفارشات", "د حساب او امرونو لنډیز"),
    };
  }
  if (pathname.startsWith("/dashboard/buyer/orders")) {
    return {
      title: t("My Orders", "سفارشات من", "زما امرونه"),
      description: t("Track your orders and purchase history", "پیگیری سفارشات و سابقه خرید", "خپل امرونه او د پیرودلو تاریخ تعقیب کړئ"),
    };
  }
  if (pathname.startsWith("/dashboard/buyer/reviews")) {
    return {
      title: t("My Reviews", "نظرات من", "زما نظرونه"),
      description: t("Manage your reviews and ratings", "مدیریت نظرات و امتیازات شما", "خپل نظرونه او درجې اداره کړئ"),
    };
  }
  if (pathname.startsWith("/dashboard/buyer/wishlist")) {
    return {
      title: t("Wishlist", "علاقهمندیها", "خوښې"),
      description: t("Your favorite products", "محصولات مورد علاقه شما", "ستاسو خوښ محصولات"),
    };
  }
  if (pathname.startsWith("/dashboard/buyer/addresses")) {
    return {
      title: t("Addresses", "آدرسها", "پتې"),
      description: t("Manage your saved addresses", "مدیریت آدرسهای شما", "خپلې ساتل شوې پتې اداره کړئ"),
    };
  }
  if (pathname.startsWith("/dashboard/buyer/payments")) {
    return {
      title: t("Payment Methods", "روشهای پرداخت", "د تادیې لارې"),
      description: t("Manage your payment methods", "مدیریت روشهای پرداخت", "د تادیې لارې اداره کړئ"),
    };
  }

  // Shared
  if (pathname.startsWith("/dashboard/notifications")) {
    return {
      title: t("Notifications", "اعلانها", "خبرتیاوې"),
      description: t("View and manage your notifications", "مشاهده و مدیریت اعلانها", "خپلې خبرتیاوې وګورئ او اداره کړئ"),
    };
  }
  if (pathname.startsWith("/dashboard/profile")) {
    return {
      title: t("My Profile", "پروفایل من", "زما پروفایل"),
      description: t("Manage your account information", "مدیریت اطلاعات حساب", "د حساب معلومات اداره کړئ"),
    };
  }

  return { title: t("Dashboard", "داشبورد", "ډشبورډ") };
};

export default function DashboardShell() {
  const { user, role, loading } = useAuth();
  const { status: sellerStatus, loading: sellerStatusLoading } = useSellerStatus();
  const { isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  const allowedRoles = useMemo(() => getAllowedRolesForPath(location.pathname), [location.pathname]);
  const header = useMemo(
    () => getHeaderConfig(location.pathname, language),
    [location.pathname, language],
  );

  // Redirect logic
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }

      if (role && !allowedRoles.includes(role)) {
        if (role === "admin") navigate("/dashboard/admin");
        else if (role === "seller") navigate("/dashboard/seller");
        else navigate("/dashboard/buyer");
      }
    }
  }, [user, role, loading, navigate, allowedRoles, location.pathname]);

  // Check seller status - redirect pending/rejected sellers to pending page
  useEffect(() => {
    const isSellerArea = location.pathname.startsWith("/dashboard/seller");
    if (!loading && !sellerStatusLoading && role === "seller" && isSellerArea) {
      if (sellerStatus && sellerStatus !== "approved") {
        navigate("/dashboard/seller/pending");
      }
    }
  }, [role, sellerStatus, sellerStatusLoading, loading, navigate, location.pathname]);

  // Scroll to top on route change within dashboard shell
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTop = 0;
      mainContentRef.current.scrollLeft = 0;
    }
  }, [location.pathname]);

  const shouldWaitForSellerStatus =
    role === "seller" && location.pathname.startsWith("/dashboard/seller");

  if (loading || (shouldWaitForSellerStatus && sellerStatusLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            {isRTL ? "در حال بارگذاری..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user || (role && !allowedRoles.includes(role))) {
    return null;
  }

  if (role === "seller" && sellerStatus && sellerStatus !== "approved") {
    // SellerPending is rendered outside this shell route
    return null;
  }

  return (
    <DashboardChromeProvider value={{ inShell: true }}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          {!isMobile && <DashboardSidebar />}

          {isMobile && (
            <MobileSidebarDrawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen} />
          )}

          <SidebarInset className="flex-1 flex flex-col min-w-0">
            <DashboardHeader
              title={header.title}
              description={header.description}
              onMobileMenuToggle={() => setMobileMenuOpen(true)}
              isMobile={isMobile}
            />

            <main ref={mainContentRef} data-main-content className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
              <Suspense fallback={<DashboardSkeleton />}>
                <div className="animate-fade-in">
                  <Outlet />
                </div>
              </Suspense>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </DashboardChromeProvider>
  );
}

const DashboardSkeleton = () => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-32 rounded-lg" />
      ))}
    </div>
    <Skeleton className="h-64 rounded-lg" />
  </div>
);
