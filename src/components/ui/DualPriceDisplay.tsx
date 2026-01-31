import { useCurrencyRate } from '@/hooks/useCurrencyRate';
import { formatCurrency } from '@/lib/currencyFormatter';
import { useLanguage } from '@/lib/i18n';

interface DualPriceDisplayProps {
  priceAFN: number;
  originalPriceAFN?: number;
  showUSD?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Displays prices in AFN with optional USD conversion
 * Uses admin-defined exchange rate for USD calculation
 */
export const DualPriceDisplay = ({
  priceAFN,
  originalPriceAFN,
  showUSD = true,
  className = '',
  size = 'md',
}: DualPriceDisplayProps) => {
  const { isRTL } = useLanguage();
  const { convertToUSD, rate, loading } = useCurrencyRate();

  const sizeClasses = {
    sm: { main: 'text-sm', secondary: 'text-xs', original: 'text-xs' },
    md: { main: 'text-base font-semibold', secondary: 'text-xs', original: 'text-sm' },
    lg: { main: 'text-lg font-bold', secondary: 'text-sm', original: 'text-base' },
  };

  const classes = sizeClasses[size];

  const formattedAFN = formatCurrency(priceAFN, 'AFN', isRTL);
  const formattedOriginalAFN = originalPriceAFN ? formatCurrency(originalPriceAFN, 'AFN', isRTL) : null;
  
  const usdPrice = rate ? convertToUSD(priceAFN) : null;
  const formattedUSD = usdPrice !== null ? `$${usdPrice.toFixed(2)}` : null;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center gap-2 flex-wrap">
        {/* Current Price in AFN */}
        <span className={`${classes.main} text-foreground`}>
          {formattedAFN}
        </span>
        
        {/* Original Price (if discounted) */}
        {formattedOriginalAFN && (
          <span className={`${classes.original} text-muted-foreground line-through`}>
            {formattedOriginalAFN}
          </span>
        )}
      </div>
      
      {/* USD Conversion */}
      {showUSD && formattedUSD && !loading && (
        <span className={`${classes.secondary} text-muted-foreground`}>
          ≈ {formattedUSD} USD
        </span>
      )}
    </div>
  );
};

export default DualPriceDisplay;
