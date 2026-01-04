import { useLanguage } from "@/lib/i18n";
import { usePromoCards } from "@/hooks/usePromoCards";
import { useHeroBanners } from "@/hooks/useHeroBanners";
import PromoCard from "./PromoCard";
import PromoCardSkeleton from "./PromoCardSkeleton";
import HeroBannerSlide from "./HeroBannerSlide";
import HeroBannerSkeleton from "./HeroBannerSkeleton";

const HeroSection = () => {
  const { isRTL } = useLanguage();
  const { promoCards, loading: promoLoading } = usePromoCards();
  const { heroBanners, loading: heroLoading } = useHeroBanners();

  // Get the first active banner for now (carousel-ready for future)
  const activeBanner = heroBanners[0];

  return (
    <section className="relative overflow-hidden">
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Hero */}
          {heroLoading ? (
            <HeroBannerSkeleton />
          ) : activeBanner ? (
            <HeroBannerSlide banner={activeBanner} />
          ) : (
            <div className="lg:col-span-2 relative rounded-2xl overflow-hidden bg-muted min-h-[400px] lg:min-h-[500px] flex items-center justify-center">
              <p className="text-muted-foreground">
                {isRTL ? "بنر تبلیغاتی موجود نیست" : "No hero banner available"}
              </p>
            </div>
          )}

          {/* Side Banners - Dynamic from Database */}
          <div className="flex flex-col gap-6">
            {promoLoading ? (
              <>
                <PromoCardSkeleton />
                <PromoCardSkeleton />
                <PromoCardSkeleton />
              </>
            ) : promoCards.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                {isRTL ? "کارت تبلیغاتی وجود ندارد" : "No promotions available"}
              </div>
            ) : (
              promoCards.map((card, index) => <PromoCard key={card.id} card={card} index={index} />)
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
