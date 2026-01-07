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
      if (banner.cta_link.startsWith('http')) {
        window.open(banner.cta_link, '_blank');
      } else {
        navigate(banner.cta_link);
      }
    }
  };

  return (
    <div className="lg:col-span-2 relative rounded-xl sm:rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[350px] lg:min-h-[500px] w-full animate-fade-in">
      {/* Background: image or gradient fallback */}
      {banner.background_image ? (
        <img
          src={banner.background_image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
      ) : (
        <div className="absolute inset-0 gradient-hero" />
      )}
      
      {/* Overlay gradient for text readability */}
      <div
        className={`absolute inset-0 ${isRTL ? "bg-gradient-to-l from-foreground/95 via-foreground/85 to-foreground/50" : "bg-gradient-to-r from-foreground/95 via-foreground/85 to-foreground/50"}`}
      />

      {/* Decorative Elements - only show when no background image, hidden on mobile */}
      {!banner.background_image && (
        <>
          <div
            className={`hidden sm:block absolute top-10 w-32 sm:w-48 lg:w-64 h-32 sm:h-48 lg:h-64 bg-cyan/20 rounded-full blur-3xl ${isRTL ? "right-10" : "left-10"}`}
          />
          <div
            className={`hidden sm:block absolute bottom-10 w-24 sm:w-36 lg:w-48 h-24 sm:h-36 lg:h-48 bg-orange/20 rounded-full blur-3xl ${isRTL ? "right-10" : "left-10"}`}
          />
        </>
      )}

      {/* Content Container - Mobile: stacked, Desktop: side by side */}
      <div className={`relative z-10 h-full flex flex-col sm:flex-row items-center justify-center sm:justify-between px-4 sm:px-8 lg:px-16 py-6 sm:py-0 gap-4 sm:gap-6 ${isRTL ? "sm:flex-row-reverse" : ""}`}>
        {/* Icon/Image - Smaller on mobile, hidden text on very small screens */}
        <div className="flex-shrink-0 order-1 sm:order-none">
          {banner.icon_image ? (
            <div className="w-24 h-24 sm:w-36 sm:h-36 lg:w-56 lg:h-56 xl:w-72 xl:h-72 rounded-full bg-gradient-to-br from-cyan/30 to-orange/30 flex items-center justify-center animate-float overflow-hidden">
              <img 
                src={banner.icon_image} 
                alt="" 
                className="w-full h-full object-contain p-2 sm:p-4"
              />
            </div>
          ) : (
            <div className="w-24 h-24 sm:w-36 sm:h-36 lg:w-56 lg:h-56 xl:w-72 xl:h-72 rounded-full bg-gradient-to-br from-cyan/30 to-orange/30 flex items-center justify-center animate-float opacity-80">
              <Headphones className="w-12 h-12 sm:w-16 sm:h-16 lg:w-28 lg:h-28 xl:w-36 xl:h-36 text-background/50" />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div
          className={`flex-1 max-w-xs sm:max-w-sm lg:max-w-md flex flex-col justify-center order-2 sm:order-none
          ${isRTL ? "items-center sm:items-end text-center sm:text-right" : "items-center sm:items-start text-center sm:text-left"}`}
        >
          {badgeText && (
            <Badge variant="sale" className="w-fit mb-2 sm:mb-4 text-xs sm:text-sm px-3 sm:px-4 py-1">
              {badgeText}
            </Badge>
          )}

          <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-background mb-2 sm:mb-4 leading-tight">
            {title}
          </h2>

          {description && (
            <p className="text-background/70 mb-3 sm:mb-6 text-sm sm:text-base lg:text-lg line-clamp-2 sm:line-clamp-none">{description}</p>
          )}

          {ctaText && (
            <Button variant="orange" size="default" className="w-fit group sm:text-base lg:text-lg" onClick={handleCtaClick}>
              {ctaText}
              <ArrowLeft
                className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform ${
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
