import { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Navigation from '@/components/layout/Navigation';
import MobileCategoryBar from '@/components/layout/MobileCategoryBar';
import Footer from '@/components/layout/Footer';
import StickyNavbar from '@/components/layout/StickyNavbar';
import TopBar from '@/components/layout/TopBar';

interface PublicLayoutProps {
  children: ReactNode;
  showMobileCategoryBar?: boolean;
  showFooter?: boolean;
}

/**
 * PublicLayout - Shared layout for all public-facing pages
 * Includes: TopBar, Header, Navigation, and Footer
 */
const PublicLayout = ({ 
  children, 
  showMobileCategoryBar = false,
  showFooter = true 
}: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* TopBar with features - Desktop only (at top) */}
      <div className="hidden lg:block">
        <TopBar />
      </div>

      {/* Auto-hide Sticky Navbar - Desktop */}
      <StickyNavbar className="hidden lg:block">
        <Header />
        {showMobileCategoryBar && <MobileCategoryBar />}
        <Navigation />
      </StickyNavbar>

      {/* Mobile/Tablet Header - Sticky */}
      <div className="lg:hidden sticky top-0 z-50 bg-background border-b border-muted-foreground/20 shadow-sm">
        <Header />
        {showMobileCategoryBar && <MobileCategoryBar />}
      </div>

      {/* TopBar for Mobile/Tablet - Below header */}
      <div className="lg:hidden">
        <TopBar />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {showFooter && <Footer />}
    </div>
  );
};

export default PublicLayout;
