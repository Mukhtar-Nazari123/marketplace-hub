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
      className={`relative rounded-xl overflow-hidden bg-gradient-to-br ${bgGradient} p-6 flex-1 hover-lift animate-slide-in-left cursor-pointer transition-all duration-300`}
      style={{ animationDelay: `${(index + 1) * 100}ms` }}
    >
      <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-20 h-20 ${glowClass} rounded-full blur-2xl`} />
      
      {badgeText && (
        <Badge 
          variant={card.badge_variant === 'sale' ? 'sale' : 'new'} 
          className="mb-2"
        >
          {badgeText}
        </Badge>
      )}
      
      <h3 className="font-display font-bold text-lg text-foreground mb-1">
        <span className={textColorClass}>{title}</span>
      </h3>
      
      {subtitle && (
        <p className="text-muted-foreground text-sm mb-2">{subtitle}</p>
      )}
      
      <p className={`text-2xl font-bold ${textColorClass}`}>
        {startingFromText}{' '}
        <span className="text-foreground">
          {currencySymbol}{card.starting_price.toLocaleString()}
        </span>
      </p>
    </div>
  );
};

export default PromoCard;
