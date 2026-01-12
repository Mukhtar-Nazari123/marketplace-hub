import { useLanguage } from "@/lib/i18n";
import { HomeBanner as HomeBannerType } from "@/hooks/useHomeBanners";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HomeBannerProps {
  banner: HomeBannerType;
}

const HomeBanner = ({ banner }: HomeBannerProps) => {
  const { language, direction } = useLanguage();
  const navigate = useNavigate();
  const isRTL = direction === "rtl";

  // Select text based on language with fallback
  const title = isRTL && banner.title_fa ? banner.title_fa : banner.title_en;
  const subtitle = isRTL && banner.subtitle_fa ? banner.subtitle_fa : banner.subtitle_en;
  const buttonText = isRTL && banner.button_text_fa ? banner.button_text_fa : banner.button_text_en;
  const priceText = isRTL && banner.price_text_fa ? banner.price_text_fa : banner.price_text_en;

  const handleClick = () => {
    if (banner.button_url) {
      if (banner.button_url.startsWith("http")) {
        window.open(banner.button_url, "_blank");
      } else {
        navigate(banner.button_url);
      }
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Background styling
  const backgroundStyle: React.CSSProperties =
    banner.background_type === "image" && banner.background_image_path
      ? {
          backgroundImage: `url(${banner.background_image_path})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {
          backgroundColor: banner.background_color || "#0ea5e9",
        };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden min-h-[200px]"
      style={{
        ...backgroundStyle,
        direction: isRTL ? "rtl" : "ltr",
      }}
    >
      {/* Gradient overlay for image backgrounds */}
      {banner.background_type === "image" && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      )}

      {/* Decorative circles */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 -translate-x-1/2" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-white rounded-full translate-y-1/2" />
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-6">
        {/* Icon/Image */}
        <div className="flex items-center gap-8 mb-6 md:mb-0">
          {banner.icon_or_image_path && (
            <div className="hidden md:flex w-24 h-24 rounded-full bg-white/20 items-center justify-center backdrop-blur-sm">
              <img src={banner.icon_or_image_path} alt="" className="w-12 h-12 object-contain" />
            </div>
          )}

          <div className={`text-center ${isRTL ? "md:text-right" : "md:text-left"}`}>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-2">{title}</h2>
            {subtitle && <p className="text-white/80">{subtitle}</p>}
          </div>
        </div>

        {/* CTA and Price */}
        <div className="flex items-center gap-6">
          {buttonText && (
            <Button onClick={handleClick} variant="orange" size="xl" className="group">
              {buttonText}
              <ArrowIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}

          {priceText && (
            <div className={`hidden sm:block ${isRTL ? "text-left" : "text-right"}`}>
              <span className="text-white/60 text-sm block">{isRTL ? "شروع از" : "Starting from"}</span>
              <span className="font-display text-3xl font-bold text-white">{priceText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
