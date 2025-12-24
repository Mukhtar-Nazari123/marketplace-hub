import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";

const DashboardIndex = () => {
  const { user, role, loading } = useAuth();
  const { isRTL } = useLanguage();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            {isRTL ? "در حال بارگذاری..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (role === "admin") return <Navigate to="/dashboard/admin" replace />;
  if (role === "seller") return <Navigate to="/dashboard/seller" replace />;
  return <Navigate to="/dashboard/buyer" replace />;
};

export default DashboardIndex;
