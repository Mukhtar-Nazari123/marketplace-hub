import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import MobileCategoryBar from "@/components/layout/MobileCategoryBar";
import Footer from "@/components/layout/Footer";
import StickyNavbar from "@/components/layout/StickyNavbar";
import HeroSection from "@/components/home/HeroSection";
import TodayDeals from "@/components/home/TodayDeals";
import BestSellers from "@/components/home/BestSellers";
import DiscoverProducts from "@/components/home/DiscoverProducts";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Auto-hide Sticky Navbar */}
      <StickyNavbar>
        <Header />
        <MobileCategoryBar />
        <Navigation />
      </StickyNavbar>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Today's Deals */}
        <TodayDeals />

        {/* Best Sellers */}
        <BestSellers />

        {/* Discover Products - Mixed categories grid */}
        <DiscoverProducts />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
