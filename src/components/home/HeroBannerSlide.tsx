import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Headphones } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import { HeroBanner } from "@/hooks/useHeroBanners";

interface HeroBannerSlideProps {
  banner: HeroBanner;
}

const HeroBannerSlide = ({ banner }: HeroBannerSlideProps) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const title = isRTL && banner.title_fa ? banner.title_fa : banner.title;
  const description = isRTL && banner.description_fa ? banner.description_fa : banner.description;
  const badgeText = isRTL && banner.badge_text_fa ? banner.badge_text_fa : banner.badge_text;
  const ctaText = isRTL && banner.cta_text_fa ? banner.cta_text_fa : banner.cta_text;

  const handleCtaClick = () => {
    if (banner.cta_link) {
      if (banner.cta_link.startsWith("http")) {
        window.open(banner.cta_link, "_blank");
      } else {
        navigate(banner.cta_link);
      }
    }
  };

  return (
    <div className="lg:col-span-2 relative rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[350px] lg:min-h-[500px] animate-fade-in">
      {/* Background: image or gradient fallback */}
      {banner.background_image ? (
        <img src={banner.background_image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 gradient-hero" />
      )}

      {/* Overlay gradient for text readability */}
      <div
        className={`absolute inset-0 ${isRTL ? "bg-gradient-to-l from-foreground/95 via-foreground/80 to-foreground/40" : "bg-gradient-to-r from-foreground/95 via-foreground/80 to-foreground/40"}`}
      />

      {/* Decorative Elements - only show when no background image */}
      {!banner.background_image && (
        <>
          <div
            className={`absolute top-10 w-32 sm:w-64 h-32 sm:h-64 bg-cyan/20 rounded-full blur-3xl ${isRTL ? "right-4 sm:right-10" : "left-4 sm:left-10"}`}
          />
          <div
            className={`absolute bottom-10 w-24 sm:w-48 h-24 sm:h-48 bg-orange/20 rounded-full blur-3xl ${isRTL ? "right-4 sm:right-10" : "left-4 sm:left-10"}`}
          />
        </>
      )}

      {/* Content Container */}
      <div className={`relative z-10 h-full flex flex-col md:flex-row items-center justify-center md:justify-between px-4 sm:px-8 lg:px-16 py-6 md:py-0 gap-4 md:gap-8 ${isRTL ? "md:flex-row-reverse" : ""}`}>
        {/* Icon/Image - Hidden on mobile, shown on md+ */}
        <div className="flex-shrink-0 hidden md:block">
          {banner.icon_image ? (
            <div className="w-32 h-32 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-cyan/30 to-orange/30 flex items-center justify-center animate-float overflow-hidden">
              <img src={banner.icon_image} alt="" className="w-full h-full object-contain p-4" />
            </div>
          ) : (
            <div className="w-32 h-32 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-cyan/30 to-orange/30 flex items-center justify-center animate-float opacity-80">
              <Headphones className="w-16 h-16 lg:w-36 lg:h-36 text-background/50" />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div
          className={`w-full md:max-w-md flex flex-col justify-center
          ${isRTL ? "items-end text-right" : "items-start text-left"}`}
        >
          {badgeText && (
            <Badge variant="sale" className="w-fit mb-3 md:mb-4 text-xs sm:text-sm px-3 sm:px-4 py-1">
              {badgeText}
            </Badge>
          )}

          <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-background mb-2 md:mb-4 leading-tight">{title}</h2>

          {description && <p className="text-background/70 mb-4 md:mb-6 text-sm sm:text-base lg:text-lg line-clamp-2 md:line-clamp-none">{description}</p>}

          {ctaText && (
            <Button variant="orange" size="default" className="w-fit group md:text-base" onClick={handleCtaClick}>
              {ctaText}
              <ArrowLeft
                className={`h-4 w-4 md:h-5 md:w-5 transition-transform ${
                  isRTL ? "group-hover:-translate-x-1" : "group-hover:translate-x-1 rotate-180"
                }`}
              />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroBannerSlide;
