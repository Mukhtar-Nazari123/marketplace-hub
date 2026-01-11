import { useDealCountdown } from '@/hooks/useDealCountdown';
import { useLanguage } from '@/lib/i18n';

interface DealCountdownProps {
  dealEndAt: string | null | undefined;
  dealStartAt?: string | null;
}

/**
 * Real-time countdown timer component for deal products
 * Displays hours:minutes:seconds format with labels
 */
const DealCountdown = ({ dealEndAt, dealStartAt }: DealCountdownProps) => {
  const { t, isRTL } = useLanguage();
  const { hours, minutes, seconds, isExpired } = useDealCountdown(dealEndAt, dealStartAt);

  // Don't render if expired or no deal end time
  if (isExpired || !dealEndAt) {
    return null;
  }

  const formatNumber = (num: number): string => {
    const padded = num.toString().padStart(2, '0');
    if (isRTL) {
      return padded.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)]);
    }
    return padded;
  };

  return (
    <div className="flex items-center justify-center gap-1 bg-foreground text-background rounded-lg p-2 h-full">
      <div className="text-center">
        <span className="font-bold text-lg">{formatNumber(hours)}</span>
        <p className="text-[10px] uppercase opacity-70">{t.product.hours}</p>
      </div>
      <span className="font-bold">:</span>
      <div className="text-center">
        <span className="font-bold text-lg">{formatNumber(minutes)}</span>
        <p className="text-[10px] uppercase opacity-70">{t.product.minutes}</p>
      </div>
      <span className="font-bold">:</span>
      <div className="text-center">
        <span className="font-bold text-lg">{formatNumber(seconds)}</span>
        <p className="text-[10px] uppercase opacity-70">{t.product.seconds}</p>
      </div>
    </div>
  );
};

export default DealCountdown;
