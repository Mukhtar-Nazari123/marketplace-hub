import { useLanguage } from "@/lib/i18n";
import { usePromoCards } from "@/hooks/usePromoCards";
import { useHeroBanners } from "@/hooks/useHeroBanners";
import PromoCard from "./PromoCard";
import PromoCardSkeleton from "./PromoCardSkeleton";
import HeroBannerSlide from "./HeroBannerSlide";
import HeroBannerSkeleton from "./HeroBannerSkeleton";
import HomeCategorySidebar from "./HomeCategorySidebar";

const HeroSection = () => {
  const { isRTL } = useLanguage();
  const { promoCards, loading: promoLoading } = usePromoCards();
  const { heroBanners, loading: heroLoading } = useHeroBanners();

  // Get the first active banner for now (carousel-ready for future)
  const activeBanner = heroBanners[0];

  return (
    <section className="relative w-full overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className={`grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 ${isRTL ? 'direction-rtl' : ''}`}>
          
          {/* Category Sidebar - Hidden on mobile, shown on desktop */}
          <div className={`hidden lg:block ${isRTL ? 'order-3' : 'order-1'}`}>
            <HomeCategorySidebar />
          </div>

          {/* Main Hero Banner */}
          <div className={`lg:col-span-2 ${isRTL ? 'order-2' : 'order-2'}`}>
            {heroLoading ? (
              <HeroBannerSkeleton />
            ) : activeBanner ? (
              <HeroBannerSlide banner={activeBanner} />
            ) : (
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-muted min-h-[280px] sm:min-h-[350px] lg:min-h-[400px] flex items-center justify-center">
                <p className="text-muted-foreground text-sm sm:text-base">
                  {isRTL ? "بنر تبلیغاتی موجود نیست" : "No hero banner available"}
                </p>
              </div>
            )}
          </div>

          {/* Side Promo Cards - Horizontal scroll on mobile, vertical on desktop */}
          <div className={`${isRTL ? 'order-1' : 'order-3'}`}>
            <div className="flex flex-row lg:flex-col gap-3 sm:gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 snap-x snap-mandatory lg:snap-none">
              {promoLoading ? (
                <>
                  <div className="min-w-[260px] sm:min-w-[280px] lg:min-w-0 lg:w-full snap-start"><PromoCardSkeleton /></div>
                  <div className="min-w-[260px] sm:min-w-[280px] lg:min-w-0 lg:w-full snap-start"><PromoCardSkeleton /></div>
                  <div className="min-w-[260px] sm:min-w-[280px] lg:min-w-0 lg:w-full snap-start"><PromoCardSkeleton /></div>
                </>
              ) : promoCards.length === 0 ? (
                <div className="flex items-center justify-center w-full min-h-[120px] text-muted-foreground text-sm">
                  {isRTL ? "کارت تبلیغاتی وجود ندارد" : "No promotions available"}
                </div>
              ) : (
                promoCards.map((card, index) => (
                  <div key={card.id} className="min-w-[260px] sm:min-w-[280px] lg:min-w-0 lg:w-full snap-start">
                    <PromoCard card={card} index={index} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;