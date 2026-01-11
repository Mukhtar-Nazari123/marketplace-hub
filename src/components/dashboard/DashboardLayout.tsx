import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSellerStatus } from '@/hooks/useSellerStatus';
import { useLanguage } from '@/lib/i18n';
import { DashboardSidebar } from './DashboardSidebar';
import { DashboardHeader } from './DashboardHeader';
import { MobileSidebarDrawer } from './MobileSidebarDrawer';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  allowedRoles?: ('admin' | 'seller' | 'buyer' | 'moderator')[];
}

export const DashboardLayout = ({ 
  children, 
  title, 
  description, 
  allowedRoles = ['admin', 'seller', 'buyer', 'moderator'] 
}: DashboardLayoutProps) => {
  const { user, role, loading } = useAuth();
  const { status: sellerStatus, loading: sellerStatusLoading } = useSellerStatus();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login', { state: { from: location.pathname } });
      } else if (role && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard based on role
        if (role === 'admin') navigate('/dashboard/admin');
        else if (role === 'seller') navigate('/dashboard/seller');
        else navigate('/dashboard/buyer');
      }
    }
  }, [user, role, loading, navigate, allowedRoles, location.pathname]);

  // Check seller status - redirect pending/rejected sellers to pending page
  useEffect(() => {
    if (!loading && !sellerStatusLoading && role === 'seller' && allowedRoles.includes('seller')) {
      if (sellerStatus && sellerStatus !== 'approved') {
        navigate('/dashboard/seller/pending');
      }
    }
  }, [role, sellerStatus, sellerStatusLoading, loading, navigate, allowedRoles]);

  if (loading || (role === 'seller' && sellerStatusLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">
            {isRTL ? 'در حال بارگذاری...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user || (role && !allowedRoles.includes(role))) {
    return null;
  }

  // Block non-approved sellers from dashboard
  if (role === 'seller' && sellerStatus && sellerStatus !== 'approved') {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Desktop Sidebar - hidden on mobile */}
        {!isMobile && <DashboardSidebar />}
        
        {/* Mobile Drawer */}
        {isMobile && (
          <MobileSidebarDrawer 
            open={mobileMenuOpen} 
            onOpenChange={setMobileMenuOpen} 
          />
        )}
        
        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <DashboardHeader 
            title={title} 
            description={description} 
            onMobileMenuToggle={() => setMobileMenuOpen(true)}
            isMobile={isMobile}
          />
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 animate-fade-in">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
