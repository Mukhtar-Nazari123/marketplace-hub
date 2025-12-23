import { cn } from "@/lib/utils";
import { ShoppingBag, Store } from "lucide-react";

interface RoleCardProps {
  role: 'buyer' | 'seller';
  selected: boolean;
  onSelect: () => void;
  isRTL?: boolean;
}

const RoleCard = ({ role, selected, onSelect, isRTL }: RoleCardProps) => {
  const isBuyer = role === 'buyer';
  
  const titles = {
    buyer: { en: 'Buyer', fa: 'خریدار' },
    seller: { en: 'Seller', fa: 'فروشنده' }
  };
  
  const descriptions = {
    buyer: { en: 'Browse and purchase products easily', fa: 'محصولات را مرور کنید و به راحتی خرید کنید' },
    seller: { en: 'Create a store and sell your products', fa: 'فروشگاه ایجاد کنید و محصولات خود را بفروشید' }
  };

  return (
    <button
      type="button"
      onClick={onSelect}
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
          "absolute top-3 left-3 w-5 h-5 rounded-full border-2 transition-all duration-300",
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
        {isRTL ? titles[role].fa : titles[role].en}
      </h3>

      {/* Description */}
      <p className="text-sm text-muted-foreground text-center">
        {isRTL ? descriptions[role].fa : descriptions[role].en}
      </p>
    </button>
  );
};

export default RoleCard;
