import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
    <div className="hero-container relative overflow-hidden rounded-2xl min-h-[160px] sm:min-h-[180px] lg:min-h-[220px] xl:min-h-[260px] 2xl:min-h-[280px] max-h-[300px] flex items-center animate-fade-in">
      {/* Layer 1: Solid Background Color */}
      <div className="hero-bg absolute inset-0 z-[1]">
        {banner.background_color ? (
          <div className="w-full h-full" style={{ backgroundColor: banner.background_color }} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#0f2027] via-[#203a43] to-[#2c5364]" />
        )}
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
      </div>

      {/* Layer 2: Background Image as Circle */}
      {banner.background_image && (
        <div
          className={`absolute z-[2] top-1/2 -translate-y-1/2 pointer-events-none
            ${isRTL ? "left-[3%] sm:left-[5%]" : "right-[3%] sm:right-[5%]"}
          `}
        >
          <div 
            className="w-[140px] h-[140px] sm:w-[180px] sm:h-[180px] lg:w-[220px] lg:h-[220px] xl:w-[260px] xl:h-[260px] rounded-full overflow-hidden border-4 border-white/20 shadow-2xl"
          >
            <img
              src={banner.background_image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Layer 3: Icon/Product Image (optional additional image) */}
      {banner.icon_image && !banner.background_image && (
        <div
          className={`hero-image absolute z-[2] bottom-0 pointer-events-none
            ${isRTL ? "left-[5%]" : "right-[5%]"}
            max-h-[75%] sm:max-h-[85%] lg:max-h-[90%]
          `}
          style={{
            maskImage: isRTL
              ? "linear-gradient(to right, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)"
              : "linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: isRTL
              ? "linear-gradient(to right, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)"
              : "linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0) 100%)",
          }}
        >
          <img
            src={banner.icon_image}
            alt=""
            className="h-full w-auto object-contain max-h-[240px] sm:max-h-[300px] lg:max-h-[380px]"
          />
        </div>
      )}

      {/* Layer 3: Content (Text + CTA) */}
      <div
        className={`hero-content relative z-[3] px-4 sm:px-8 lg:px-12 py-4 sm:py-5 lg:py-6 max-w-[480px]
          ${isRTL ? "mr-auto text-right" : "ml-0 text-left"}
        `}
      >
        {/* Badge */}
        {badgeText && (
          <Badge variant="sale" className="mb-2 sm:mb-3 px-3 py-1 text-xs sm:text-sm font-semibold rounded-full">
            {badgeText}
          </Badge>
        )}

        {/* Title */}
        <h2 className="hero-title text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-extrabold text-white leading-tight mb-2 sm:mb-3">
          {title}
        </h2>

        {/* Description */}
        {description && (
          <p className="hero-text text-white/85 text-xs sm:text-sm lg:text-base mb-3 sm:mb-4 line-clamp-2">
            {description}
          </p>
        )}

        {/* CTA Button */}
        {ctaText && (
          <Button
            variant="default"
            size="default"
            className="hero-btn rounded-full font-semibold px-4 sm:px-6 text-sm group"
            onClick={handleCtaClick}
          >
            {ctaText}
            {isRTL ? (
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default HeroBannerSlide;
