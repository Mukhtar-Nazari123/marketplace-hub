import PublicLayout from "@/components/layout/PublicLayout";
import HeroSection from "@/components/home/HeroSection";
import HomepageCategories from "@/components/home/HomepageCategories";
import TodayDeals from "@/components/home/TodayDeals";
import BestSellers from "@/components/home/BestSellers";
import DiscoverProducts from "@/components/home/DiscoverProducts";

const Index = () => {
  return (
    <PublicLayout showMobileCategoryBar>
      {/* Hero Section */}
      <HeroSection />

      {/* Category Grid */}
      <HomepageCategories />

      {/* Today's Deals */}
      <TodayDeals />

      {/* Best Sellers */}
      <BestSellers />

      {/* Discover Products - Mixed categories grid */}
      <DiscoverProducts />
    </PublicLayout>
  );
};

export default Index;
