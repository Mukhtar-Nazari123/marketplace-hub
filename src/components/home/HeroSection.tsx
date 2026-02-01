import { useLanguage } from "@/lib/i18n";
import { useHeroBanners } from "@/hooks/useHeroBanners";
import HeroBannerSlide from "./HeroBannerSlide";
import HeroBannerSkeleton from "./HeroBannerSkeleton";

const HeroSection = () => {
  const { isRTL } = useLanguage();
  const { heroBanners, loading: heroLoading } = useHeroBanners();

  // Get the first active banner for now (carousel-ready for future)
  const activeBanner = heroBanners[0];

  return (
    <section className="relative w-full overflow-hidden">
      <div className="container px-1 sm:px-1.5 lg:px-2 pt-2 pb-2">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Main Hero - Full Width */}
          {heroLoading ? (
            <HeroBannerSkeleton />
          ) : activeBanner ? (
            <HeroBannerSlide banner={activeBanner} />
          ) : (
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-muted min-h-[200px] sm:min-h-[280px] lg:min-h-[350px] flex items-center justify-center">
              <p className="text-muted-foreground text-sm sm:text-base">
                {isRTL ? "بنر تبلیغاتی موجود نیست" : "No hero banner available"}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;