import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useSellerStatus } from "@/hooks/useSellerStatus";
import { useLanguage } from "@/lib/i18n";
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

const getHeaderConfig = (pathname: string, isRTL: boolean): HeaderConfig => {
  const t = (fa: string, en: string) => (isRTL ? fa : en);

  // Seller
  if (pathname === "/dashboard/seller" || pathname === "/dashboard/seller/") {
    return {
      title: t("داشبورد فروشنده", "Seller Dashboard"),
      description: t("مدیریت فروش و محصولات", "Manage your sales and products"),
    };
  }
  if (pathname.startsWith("/dashboard/seller/products/new")) {
    return {
      title: t("افزودن محصول", "Add Product"),
      description: t("محصول جدید به فروشگاه اضافه کنید", "Add a new product to your store"),
    };
  }
  if (pathname.includes("/dashboard/seller/products/edit/")) {
    return {
      title: t("ویرایش محصول", "Edit Product"),
      description: t("ویرایش محصول", "Edit your product"),
    };
  }
  if (pathname.includes("/dashboard/seller/products/view/")) {
    return {
      title: t("مشاهده محصول", "View Product"),
      description: "",
    };
  }
  if (pathname.startsWith("/dashboard/seller/products")) {
    return {
      title: t("محصولات من", "My Products"),
      description: t("مدیریت محصولات فروشگاه", "Manage your store products"),
    };
  }
  if (pathname.startsWith("/dashboard/seller/orders")) {
    return {
      title: t("سفارشات", "Orders"),
      description: t("مدیریت سفارشات مشتریان", "Manage customer orders"),
    };
  }
  if (pathname.startsWith("/dashboard/seller/reviews")) {
    return {
      title: t("نظرات محصولات", "Product Reviews"),
      description: t("مشاهده نظرات خریداران درباره محصولات شما", "View customer reviews about your products"),
    };
  }
  if (pathname.startsWith("/dashboard/seller/analytics")) {
    return {
      title: t("آنالیتیکس", "Analytics"),
      description: t("آمار و گزارش فروش", "Sales statistics and reports"),
    };
  }

  // Buyer
  if (pathname === "/dashboard/buyer" || pathname === "/dashboard/buyer/") {
    return {
      title: t("داشبورد خریدار", "Buyer Dashboard"),
      description: t("خلاصه حساب و سفارشات", "Account overview and orders"),
    };
  }
  if (pathname.startsWith("/dashboard/buyer/orders")) {
    return {
      title: t("سفارشات من", "My Orders"),
      description: t("پیگیری سفارشات و سابقه خرید", "Track your orders and purchase history"),
    };
  }
  if (pathname.startsWith("/dashboard/buyer/reviews")) {
    return {
      title: t("نظرات من", "My Reviews"),
      description: t("مدیریت نظرات و امتیازات شما", "Manage your reviews and ratings"),
    };
  }
  if (pathname.startsWith("/dashboard/buyer/wishlist")) {
    return {
      title: t("علاقهمندیها", "Wishlist"),
      description: t("محصولات مورد علاقه شما", "Your favorite products"),
    };
  }
  if (pathname.startsWith("/dashboard/buyer/addresses")) {
    return {
      title: t("آدرسها", "Addresses"),
      description: t("مدیریت آدرسهای شما", "Manage your saved addresses"),
    };
  }
  if (pathname.startsWith("/dashboard/buyer/payments")) {
    return {
      title: t("روشهای پرداخت", "Payment Methods"),
      description: t("مدیریت روشهای پرداخت", "Manage your payment methods"),
    };
  }

  // Shared
  if (pathname.startsWith("/dashboard/notifications")) {
    return {
      title: t("اعلانها", "Notifications"),
      description: t("مشاهده و مدیریت اعلانها", "View and manage your notifications"),
    };
  }
  if (pathname.startsWith("/dashboard/profile")) {
    return {
      title: t("پروفایل من", "My Profile"),
      description: t("مدیریت اطلاعات حساب", "Manage your account information"),
    };
  }

  return { title: t("داشبورد", "Dashboard") };
};

export default function DashboardShell() {
  const { user, role, loading } = useAuth();
  const { status: sellerStatus, loading: sellerStatusLoading } = useSellerStatus();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mainContentRef = useRef<HTMLElement>(null);

  const allowedRoles = useMemo(() => getAllowedRolesForPath(location.pathname), [location.pathname]);
  const header = useMemo(
    () => getHeaderConfig(location.pathname, isRTL),
    [location.pathname, isRTL],
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
