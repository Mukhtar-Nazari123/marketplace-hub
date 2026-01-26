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
      <div className="container px-4 sm:px-6 lg:px-8 pt-1 pb-4 sm:pb-6 lg:pb-8">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Main Hero - Full Width */}
          {heroLoading ? <HeroBannerSkeleton /> : activeBanner ? <HeroBannerSlide banner={activeBanner} /> : <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-muted min-h-[200px] sm:min-h-[280px] lg:min-h-[350px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm sm:text-base">
                {isRTL ? "بنر تبلیغاتی موجود نیست" : "No hero banner available"}
              </p>
            </div>}

          {/* Promo Cards - Row below hero */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {promoLoading ? <>
                <PromoCardSkeleton />
                <PromoCardSkeleton />
                <PromoCardSkeleton />
              </> : promoCards.length === 0 ? <div className="col-span-full flex items-center justify-center min-h-[120px] text-muted-foreground text-sm">
                {isRTL ? "کارت تبلیغاتی وجود ندارد" : "No promotions available"}
              </div> : promoCards.map((card, index) => <PromoCard key={card.id} card={card} index={index} />)}
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;