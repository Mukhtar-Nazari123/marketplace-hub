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
  heroContent?: ReactNode;
}

const PublicLayout = ({ 
  children, 
  showMobileCategoryBar = false,
  showFooter = true,
  heroContent
}: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {heroContent ? (
        <>
          {/* Hero behind header: hero is positioned, header overlays it */}
          <div className="relative w-full">
            {/* Hero background layer */}
            <div className="w-full">{heroContent}</div>

            {/* Header/Nav overlay on top of hero */}
            <div className="absolute top-0 left-0 right-0 z-50">
              {/* TopBar - Desktop only */}
              <div className="hidden lg:block">
                <TopBar />
              </div>

              {/* Desktop navbar */}
              <div className="hidden lg:block">
                <Header />
                {showMobileCategoryBar && <MobileCategoryBar />}
                <Navigation />
              </div>

              {/* Mobile/Tablet Header */}
              <div className="lg:hidden">
                <Header />
                {showMobileCategoryBar && <MobileCategoryBar />}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Normal layout without hero behind header */}
          <div className="hidden lg:block">
            <TopBar />
          </div>

          <StickyNavbar className="hidden lg:block">
            <Header />
            {showMobileCategoryBar && <MobileCategoryBar />}
            <Navigation />
          </StickyNavbar>

          <div className="lg:hidden sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-muted-foreground/20 shadow-sm">
            <Header />
            {showMobileCategoryBar && <MobileCategoryBar />}
          </div>
        </>
      )}

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
