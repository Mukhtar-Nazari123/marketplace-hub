import { useLanguage } from '@/lib/i18n';
import { HomeBanner as HomeBannerType } from '@/hooks/useHomeBanners';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HomeBannerProps {
  banner: HomeBannerType;
}

const HomeBanner = ({ banner }: HomeBannerProps) => {
  const { language, direction } = useLanguage();
  const navigate = useNavigate();
  const isRTL = direction === 'rtl';

  // Select text based on language with fallback
  const title = (isRTL && banner.title_fa) ? banner.title_fa : banner.title_en;
  const subtitle = (isRTL && banner.subtitle_fa) ? banner.subtitle_fa : banner.subtitle_en;
  const buttonText = (isRTL && banner.button_text_fa) ? banner.button_text_fa : banner.button_text_en;
  const priceText = (isRTL && banner.price_text_fa) ? banner.price_text_fa : banner.price_text_en;

  const handleClick = () => {
    if (banner.button_url) {
      if (banner.button_url.startsWith('http')) {
        window.open(banner.button_url, '_blank');
      } else {
        navigate(banner.button_url);
      }
    }
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // Background styling
  const backgroundStyle: React.CSSProperties = banner.background_type === 'image' && banner.background_image_path
    ? {
        backgroundImage: `url(${banner.background_image_path})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundColor: banner.background_color || '#0ea5e9',
      };

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{
        ...backgroundStyle,
        direction: isRTL ? 'rtl' : 'ltr',
      }}
    >
      {/* Gradient overlay for image backgrounds */}
      {banner.background_type === 'image' && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      )}

      {/* Decorative circles */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/10 blur-sm" />
      <div className="absolute right-24 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 md:p-8 lg:p-10 gap-4 md:gap-6">
        {/* Icon/Image */}
        <div className="flex items-center gap-4 md:gap-6">
          {banner.icon_or_image_path && (
            <div className="flex-shrink-0 w-14 h-14 md:w-16 md:h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <img 
                src={banner.icon_or_image_path} 
                alt="" 
                className="w-8 h-8 md:w-10 md:h-10 object-contain"
              />
            </div>
          )}

          {/* Text Content */}
          <div className={`text-${isRTL ? 'right' : 'left'}`}>
            <h3 className="text-white text-lg md:text-xl lg:text-2xl font-bold leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-white/80 text-sm md:text-base mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* CTA and Price */}
        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4">
          {buttonText && (
            <Button
              onClick={handleClick}
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
            >
              {buttonText}
              <ArrowIcon className="w-4 h-4" />
            </Button>
          )}

          {priceText && (
            <div className={`text-${isRTL ? 'right' : 'left'}`}>
              <span className="text-white/70 text-xs block">
                {isRTL ? 'شروع از' : 'Starting from'}
              </span>
              <span className="text-white text-xl md:text-2xl font-bold">
                {priceText}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeBanner;
