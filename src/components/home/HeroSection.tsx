import { useLanguage } from "@/lib/i18n";
import { useHeroBanners } from "@/hooks/useHeroBanners";
import HeroBannerSlide from "./HeroBannerSlide";
import HeroBannerSkeleton from "./HeroBannerSkeleton";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { useRef, useState, useEffect } from "react";

const HeroSection = () => {
  const { isRTL } = useLanguage();
  const { heroBanners, loading: heroLoading } = useHeroBanners();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const autoplayPlugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true })
  );

  // Update current index when carousel changes
  const handleSelect = (api: any) => {
    if (api) {
      setCurrentIndex(api.selectedScrollSnap());
    }
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div className="container px-1 sm:px-1.5 lg:px-2 pt-2 lg:pb-2">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Main Hero - Full Width */}
          {heroLoading ? (
            <HeroBannerSkeleton />
          ) : heroBanners.length > 0 ? (
            <div className="relative">
              <Carousel
                opts={{
                  loop: true,
                  direction: isRTL ? "rtl" : "ltr",
                }}
                plugins={[autoplayPlugin.current]}
                className="w-full"
                setApi={(api) => {
                  if (api) {
                    api.on("select", () => handleSelect(api));
                  }
                }}
              >
                <CarouselContent className="-ml-0">
                  {heroBanners.map((banner) => (
                    <CarouselItem key={banner.id} className="pl-0">
                      <HeroBannerSlide banner={banner} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>

              {/* Pagination Dots */}
              {heroBanners.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {heroBanners.map((_, index) => (
                    <button
                      key={index}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "bg-white w-6"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
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
