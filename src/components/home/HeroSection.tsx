import { useLanguage } from "@/lib/i18n";
import { usePromoCards } from "@/hooks/usePromoCards";
import { useHeroBanners } from "@/hooks/useHeroBanners";
import PromoCard from "./PromoCard";
import PromoCardSkeleton from "./PromoCardSkeleton";
import HeroBannerSlide from "./HeroBannerSlide";
import HeroBannerSkeleton from "./HeroBannerSkeleton";
const HeroSection = () => {
  const {
    isRTL
  } = useLanguage();
  const {
    promoCards,
    loading: promoLoading
  } = usePromoCards();
  const {
    heroBanners,
    loading: heroLoading
  } = useHeroBanners();

  // Get the first active banner for now (carousel-ready for future)
  const activeBanner = heroBanners[0];
  return <section className="relative w-full overflow-hidden">
      <div className="container px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Hero */}
          {heroLoading ? <HeroBannerSkeleton /> : activeBanner ? <HeroBannerSlide banner={activeBanner} /> : <div className="lg:col-span-2 relative rounded-xl sm:rounded-2xl overflow-hidden bg-muted min-h-[280px] sm:min-h-[350px] lg:min-h-[500px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm sm:text-base">
                {isRTL ? "بنر تبلیغاتی موجود نیست" : "No hero banner available"}
              </p>
            </div>}

          {/* Side Banners - Horizontal scroll on mobile, vertical on desktop */}
          <div className="flex flex-row lg:flex-col gap-3 sm:gap-4 lg:gap-6 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory lg:snap-none rounded mx-0">
            {promoLoading ? <>
                <div className="min-w-[260px] sm:min-w-[280px] lg:min-w-0 lg:w-full snap-start"><PromoCardSkeleton /></div>
                <div className="min-w-[260px] sm:min-w-[280px] lg:min-w-0 lg:w-full snap-start"><PromoCardSkeleton /></div>
                <div className="min-w-[260px] sm:min-w-[280px] lg:min-w-0 lg:w-full snap-start"><PromoCardSkeleton /></div>
              </> : promoCards.length === 0 ? <div className="flex items-center justify-center w-full min-h-[120px] text-muted-foreground text-sm">
                {isRTL ? "کارت تبلیغاتی وجود ندارد" : "No promotions available"}
              </div> : promoCards.map((card, index) => <div key={card.id} className="min-w-[260px] sm:min-w-[280px] lg:min-w-0 lg:w-full snap-start">
                  <PromoCard card={card} index={index} />
                </div>)}
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;