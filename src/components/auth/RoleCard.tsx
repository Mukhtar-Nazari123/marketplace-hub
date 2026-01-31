import { cn } from "@/lib/utils";
import { ShoppingBag, Store } from "lucide-react";
import { useAuthTranslations } from "@/lib/auth-translations";

interface RoleCardProps {
  role: 'buyer' | 'seller';
  selected: boolean;
  onSelect: () => void;
  language: 'en' | 'fa' | 'ps';
}

const RoleCard = ({ role, selected, onSelect, language }: RoleCardProps) => {
  const { t } = useAuthTranslations(language);
  const isBuyer = role === 'buyer';
  const isRTL = language === 'fa' || language === 'ps';

  const title = isBuyer ? t('roles', 'buyer') : t('roles', 'seller');
  const description = isBuyer ? t('roles', 'buyerDesc') : t('roles', 'sellerDesc');

  return (
    <button
      type="button"
      onClick={onSelect}
      dir={isRTL ? 'rtl' : 'ltr'}
      className={cn(
        "relative flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-300 w-full",
        "hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2",
        selected
          ? isBuyer
            ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 shadow-glow-cyan focus:ring-primary"
            : "border-accent bg-gradient-to-br from-accent/10 to-accent/5 shadow-glow-orange focus:ring-accent"
          : "border-border bg-card hover:border-muted-foreground/30"
      )}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          "absolute top-3 w-5 h-5 rounded-full border-2 transition-all duration-300",
          isRTL ? "right-3" : "left-3",
          selected
            ? isBuyer
              ? "bg-primary border-primary"
              : "bg-accent border-accent"
            : "border-muted-foreground/30 bg-transparent"
        )}
      >
        {selected && (
          <svg className="w-full h-full text-primary-foreground p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>

      {/* Icon */}
      <div
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-all duration-300",
          selected
            ? isBuyer
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground"
            : "bg-muted text-muted-foreground"
        )}
      >
        {isBuyer ? (
          <ShoppingBag className="w-8 h-8" />
        ) : (
          <Store className="w-8 h-8" />
        )}
      </div>

      {/* Title */}
      <h3 className={cn(
        "font-semibold text-lg mb-2 transition-colors duration-300",
        selected
          ? isBuyer
            ? "text-primary"
            : "text-accent"
          : "text-foreground"
      )}>
        {title}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground text-center">
        {description}
      </p>
    </button>
  );
};

export default RoleCard;
