import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import TodayDeals from "@/components/home/TodayDeals";
import PromoBanner from "@/components/home/PromoBanner";
import BestSellers from "@/components/home/BestSellers";
import CategoryBanners from "@/components/home/CategoryBanners";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Bar */}
      <TopBar />

      {/* Header */}
      <Header />

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Today's Deals */}
        <TodayDeals />

        {/* Promo Banner */}
        <PromoBanner />

        {/* Best Sellers */}
        <BestSellers />

        {/* Category Banners */}
        <CategoryBanners />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
