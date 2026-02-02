import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import MobileCategoryBar from "@/components/layout/MobileCategoryBar";
import Footer from "@/components/layout/Footer";
import StickyNavbar from "@/components/layout/StickyNavbar";
import TopBar from "@/components/layout/TopBar";
import HeroSection from "@/components/home/HeroSection";
import TodayDeals from "@/components/home/TodayDeals";
import BestSellers from "@/components/home/BestSellers";
import DiscoverProducts from "@/components/home/DiscoverProducts";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* TopBar with features - Desktop only */}
      <div className="hidden lg:block">
        <TopBar />
      </div>

      {/* Auto-hide Sticky Navbar - Hidden on mobile/tablet */}
      <StickyNavbar className="hidden lg:block">
        <Header />
        <MobileCategoryBar />
        <Navigation />
      </StickyNavbar>

      {/* Mobile/Tablet Header - Visible only on mobile/tablet */}
      <div className="lg:hidden sticky top-0 z-50 bg-background border-b border-muted-foreground/20 shadow-sm">
        <Header />
        <MobileCategoryBar />
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* TopBar for Mobile/Tablet - Below Hero */}
        <div className="lg:hidden">
          <TopBar />
        </div>

        {/* Today's Deals */}
        <TodayDeals />

        {/* Best Sellers */}
        <BestSellers />

        {/* Discover Products - Mixed categories grid */}
        <DiscoverProducts />
      </main>

      {/* Footer - Hidden on mobile to avoid overlap with bottom nav */}
      <Footer />
    </div>
  );
};

export default Index;
