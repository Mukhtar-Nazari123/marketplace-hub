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
    <div className="lg:col-span-2 relative rounded-2xl overflow-hidden min-h-[400px] lg:min-h-[500px] animate-fade-in">
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
            className={`absolute top-10 w-64 h-64 bg-cyan/20 rounded-full blur-3xl ${isRTL ? "right-10" : "left-10"}`}
          />
          <div
            className={`absolute bottom-10 w-48 h-48 bg-orange/20 rounded-full blur-3xl ${isRTL ? "right-10" : "left-10"}`}
          />
        </>
      )}

      {/* Content Container */}
      <div className={`relative z-10 h-full flex items-center justify-between px-8 lg:px-16 flex-row-reverse`}>
        {/* Icon/Image */}
        <div className="flex-shrink-0">
          {banner.icon_image ? (
            <div className="w-48 h-48 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-cyan/30 to-orange/30 flex items-center justify-center animate-float overflow-hidden">
              <img src={banner.icon_image} alt="" className="w-full h-full object-contain p-4" />
            </div>
          ) : (
            <div className="w-48 h-48 lg:w-72 lg:h-72 rounded-full bg-gradient-to-br from-cyan/30 to-orange/30 flex items-center justify-center animate-float opacity-80">
              <Headphones className="w-24 h-24 lg:w-36 lg:h-36 text-background/50" />
            </div>
          )}
        </div>

        {/* Text Content */}
        <div
          className={`max-w-md p-6 lg:p-8 flex flex-col justify-center
          ${isRTL ? "items-start text-right me-8 lg:me-16" : "items-start text-left"}`}
        >
          {badgeText && (
            <Badge variant="sale" className="w-fit mb-4 text-sm px-4 py-1">
              {badgeText}
            </Badge>
          )}

          <h2 className="font-display text-4xl lg:text-5xl font-bold text-background mb-4 leading-tight">{title}</h2>

          {description && <p className="text-background/70 mb-6 text-lg">{description}</p>}

          {ctaText && (
            <Button variant="orange" size="xl" className="w-fit group" onClick={handleCtaClick}>
              {ctaText}
              <ArrowLeft
                className={`h-5 w-5 transition-transform ${
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
