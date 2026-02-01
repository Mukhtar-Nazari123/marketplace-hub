import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import MobileCategoryBar from "@/components/layout/MobileCategoryBar";
import Footer from "@/components/layout/Footer";
import StickyNavbar from "@/components/layout/StickyNavbar";
import BottomNavigation from "@/components/layout/BottomNavigation";
import HeroSection from "@/components/home/HeroSection";
import TodayDeals from "@/components/home/TodayDeals";
import BestSellers from "@/components/home/BestSellers";
import DiscoverProducts from "@/components/home/DiscoverProducts";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Auto-hide Sticky Navbar - Hidden on mobile */}
      <StickyNavbar className="hidden md:block">
        <Header />
        <MobileCategoryBar />
        <Navigation />
      </StickyNavbar>

      {/* Mobile Header - Visible only on mobile */}
      <div className="md:hidden sticky top-0 z-50 bg-background border-b border-muted-foreground/20 shadow-sm">
        <Header />
      </div>

      {/* Main Content - Add bottom padding for mobile bottom nav */}
      <main className="flex-1 pb-20 md:pb-0">
        {/* Hero Section */}
        <HeroSection />

        {/* Today's Deals */}
        <TodayDeals />

        {/* Best Sellers */}
        <BestSellers />

        {/* Discover Products - Mixed categories grid */}
        <DiscoverProducts />
      </main>

      {/* Footer - Hidden on mobile to avoid overlap with bottom nav */}
      <Footer />

      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
