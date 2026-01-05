import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";
import type { PromoCard as PromoCardType } from "@/hooks/usePromoCards";

interface PromoCardProps {
  card: PromoCardType;
  index: number;
}

const PromoCard = ({ card, index }: PromoCardProps) => {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const title = isRTL && card.title_fa ? card.title_fa : card.title;
  const subtitle = isRTL && card.subtitle_fa ? card.subtitle_fa : card.subtitle;
  const badgeText = isRTL && card.badge_text_fa ? card.badge_text_fa : card.badge_text;
  
  const colorClass = card.color_theme === 'orange' ? 'orange' : 'cyan';
  const bgGradient = card.color_theme === 'orange' 
    ? 'from-orange/10 to-orange/5' 
    : 'from-cyan/10 to-cyan/5';
  const glowClass = card.color_theme === 'orange' ? 'bg-orange/20' : 'bg-cyan/20';
  const textColorClass = card.color_theme === 'orange' ? 'text-orange' : 'text-cyan';

  const currencySymbol = card.currency === 'AFN' ? '؋' : '$';
  const startingFromText = isRTL ? 'شروع از' : 'Starting from';

  const handleClick = () => {
    if (card.link_url) {
      navigate(card.link_url);
    } else if (card.category_id) {
      navigate(`/categories/${card.category_id}`);
    } else if (card.product_id) {
      navigate(`/products/${card.product_id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`relative rounded-xl overflow-hidden flex-1 hover-lift animate-slide-in-left cursor-pointer transition-all duration-300 min-h-[180px]`}
      style={{ animationDelay: `${(index + 1) * 100}ms` }}
    >
      {/* Background: image or gradient fallback */}
      {card.image_url ? (
        <img 
          src={card.image_url} 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient}`} />
      )}
      
      {/* Overlay for text readability when image is present */}
      {card.image_url && (
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/40 to-transparent" />
      )}
      
      {/* Decorative glow - only when no image */}
      {!card.image_url && (
        <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-20 h-20 ${glowClass} rounded-full blur-2xl`} />
      )}
      
      {/* Content */}
      <div className="relative z-10 p-6 h-full flex flex-col justify-end">
        {badgeText && (
          <Badge 
            variant={card.badge_variant === 'sale' ? 'sale' : 'new'} 
            className="mb-2 w-fit"
          >
            {badgeText}
          </Badge>
        )}
        
        <h3 className="font-display font-bold text-lg mb-1">
          <span className={card.image_url ? 'text-background' : textColorClass}>{title}</span>
        </h3>
        
        {subtitle && (
          <p className={card.image_url ? 'text-background/80' : 'text-muted-foreground'} >{subtitle}</p>
        )}
        
        <p className={`text-2xl font-bold ${card.image_url ? 'text-background' : textColorClass}`}>
          {startingFromText}{' '}
          <span className={card.image_url ? 'text-background' : 'text-foreground'}>
            {currencySymbol}{card.starting_price.toLocaleString()}
          </span>
        </p>
      </div>
    </div>
  );
};

export default PromoCard;
