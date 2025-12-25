import { ReactNode, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/lib/i18n';
import { AdminSidebar } from './AdminSidebar';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Loader2, Home } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
}

export const AdminLayout = ({ children, title, description }: AdminLayoutProps) => {
  const { user, role, loading } = useAuth();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      navigate('/login');
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset>
        <header className={`flex h-16 shrink-0 items-center gap-2 border-b bg-background px-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <SidebarTrigger className={isRTL ? 'ml-1' : '-mr-1'} />
          <Separator orientation="vertical" className="mx-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground font-medium">{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          {description && (
            <span className={`text-sm text-muted-foreground ${isRTL ? 'ml-auto' : 'mr-auto'}`}>{description}</span>
          )}
          <div className={`${isRTL ? 'mr-auto' : 'ml-auto'}`}>
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <Home className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'صفحه اصلی' : 'Home'}
              </Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};
