import { Check, Clock, Package, Truck, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface OrderStatusProgressProps {
  currentStatus: string;
  className?: string;
  compact?: boolean;
}

const ORDER_STEPS = [
  { key: 'pending', icon: Clock, labelEn: 'Pending', labelFa: 'در انتظار' },
  { key: 'confirmed', icon: Check, labelEn: 'Confirmed', labelFa: 'تایید شده' },
  { key: 'shipped', icon: Truck, labelEn: 'Shipped', labelFa: 'ارسال شده' },
  { key: 'delivered', icon: CheckCircle, labelEn: 'Delivered', labelFa: 'تحویل شده' },
];

const getStepIndex = (status: string) => {
  const index = ORDER_STEPS.findIndex(s => s.key === status);
  return index >= 0 ? index : 0;
};

export const OrderStatusProgress = ({
  currentStatus,
  className,
  compact = false,
}: OrderStatusProgressProps) => {
  const { isRTL } = useLanguage();
  const currentIndex = getStepIndex(currentStatus);

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex items-center">
              <div
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground',
                  isCurrent && 'ring-2 ring-primary/30 ring-offset-2 ring-offset-background'
                )}
              >
                <step.icon className="w-3 h-3" />
              </div>
              {index < ORDER_STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-4 mx-0.5',
                    index < currentIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      <div className="relative flex items-center justify-between">
        {/* Progress Line Background */}
        <div className="absolute top-5 start-0 end-0 h-0.5 bg-muted" />
        
        {/* Progress Line Fill */}
        <div
          className="absolute top-5 start-0 h-0.5 bg-primary transition-all duration-500"
          style={{
            width: `${(currentIndex / (ORDER_STEPS.length - 1)) * 100}%`,
          }}
        />

        {/* Steps */}
        {ORDER_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative flex flex-col items-center z-10">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2',
                  isCompleted
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground border-muted',
                  isCurrent && 'ring-4 ring-primary/20 scale-110'
                )}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium text-center transition-colors',
                  isCompleted ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isRTL ? step.labelFa : step.labelEn}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const getNextStatus = (currentStatus: string): string | null => {
  const currentIndex = getStepIndex(currentStatus);
  if (currentIndex < ORDER_STEPS.length - 1) {
    return ORDER_STEPS[currentIndex + 1].key;
  }
  return null;
};

export const canUpdateStatus = (currentStatus: string): boolean => {
  return getNextStatus(currentStatus) !== null;
};

export { ORDER_STEPS, getStepIndex };
