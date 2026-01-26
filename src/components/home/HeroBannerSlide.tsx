import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
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

  // Determine background style
  const backgroundStyle: React.CSSProperties = banner.background_color
    ? { backgroundColor: banner.background_color }
    : {};

  return (
    <div
      className="lg:col-span-2 relative rounded-2xl overflow-hidden min-h-[280px] sm:min-h-[350px] lg:min-h-[500px] animate-fade-in"
      style={backgroundStyle}
    >
      {/* Gradient fallback when no background color */}
      {!banner.background_color && !banner.background_image && (
        <div className="absolute inset-0 gradient-hero" />
      )}

      {/* Content Container - Split layout */}
      <div
        className={`relative z-10 h-full flex items-center ${
          isRTL ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Text Content - Left Side (or Right for RTL) */}
        <div
          className={`flex-1 flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-8
            ${isRTL ? "items-end text-right" : "items-start text-left"}`}
        >
          {badgeText && (
            <Badge variant="sale" className="w-fit mb-3 md:mb-4 text-xs sm:text-sm px-3 sm:px-4 py-1">
              {badgeText}
            </Badge>
          )}

          <h2 className="font-display text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-2 md:mb-4 leading-tight drop-shadow-lg">
            {title}
          </h2>

          {description && (
            <p className="text-white/90 mb-4 md:mb-6 text-sm sm:text-base lg:text-lg line-clamp-2 md:line-clamp-none drop-shadow">
              {description}
            </p>
          )}

          {ctaText && (
            <Button
              variant="orange"
              size="default"
              className="w-fit group md:text-base shadow-lg"
              onClick={handleCtaClick}
            >
              {ctaText}
              <ArrowLeft
                className={`h-4 w-4 md:h-5 md:w-5 transition-transform ${
                  isRTL ? "group-hover:-translate-x-1" : "group-hover:translate-x-1 rotate-180"
                }`}
              />
            </Button>
          )}
        </div>

        {/* Image Section - Right Side (or Left for RTL) */}
        <div className="flex-1 relative h-full hidden md:block">
          {banner.background_image ? (
            <img
              src={banner.background_image}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover object-center ${
                isRTL ? "object-left" : "object-right"
              }`}
            />
          ) : banner.icon_image ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 lg:w-72 lg:h-72 rounded-full bg-white/10 flex items-center justify-center animate-float overflow-hidden">
                <img src={banner.icon_image} alt="" className="w-full h-full object-contain p-6" />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Image - Show below content on mobile */}
      {(banner.background_image || banner.icon_image) && (
        <div className="md:hidden absolute inset-0 pointer-events-none">
          {banner.background_image ? (
            <>
              <div className={`absolute inset-0 ${isRTL ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-transparent via-transparent to-black/20`} />
              <img
                src={banner.background_image}
                alt=""
                className="absolute right-0 top-0 h-full w-1/2 object-cover object-center opacity-50"
              />
            </>
          ) : banner.icon_image ? (
            <div className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2`}>
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                <img src={banner.icon_image} alt="" className="w-full h-full object-contain p-2" />
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default HeroBannerSlide;
