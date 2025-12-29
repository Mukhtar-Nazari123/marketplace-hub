import { Check, Clock, Package, Truck, CheckCircle, XCircle } from 'lucide-react';
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
  if (status === 'rejected') return -1; // Special case for rejected
  const index = ORDER_STEPS.findIndex(s => s.key === status);
  return index >= 0 ? index : 0;
};

export const OrderStatusProgress = ({
  currentStatus,
  className,
  compact = false,
}: OrderStatusProgressProps) => {
  const { isRTL } = useLanguage();
  const isRejected = currentStatus === 'rejected';
  const currentIndex = getStepIndex(currentStatus);

  // Show rejected status separately
  if (isRejected) {
    return (
      <div className={cn('flex items-center justify-center gap-2 py-4', className)}>
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="w-10 h-10 rounded-full bg-destructive flex items-center justify-center">
            <XCircle className="w-5 h-5 text-destructive-foreground" />
          </div>
          <div>
            <p className="font-medium text-destructive">
              {isRTL ? 'رد شده' : 'Rejected'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isRTL ? 'این سفارش رد شده است' : 'This order has been rejected'}
            </p>
          </div>
        </div>
      </div>
    );
  }

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
  if (currentStatus === 'rejected') return null;
  const currentIndex = getStepIndex(currentStatus);
  if (currentIndex < ORDER_STEPS.length - 1) {
    return ORDER_STEPS[currentIndex + 1].key;
  }
  return null;
};

export const canUpdateStatus = (currentStatus: string): boolean => {
  return currentStatus !== 'rejected' && getNextStatus(currentStatus) !== null;
};

export const canRejectOrder = (currentStatus: string): boolean => {
  // Can only reject if order is still pending
  return currentStatus === 'pending';
};

export { ORDER_STEPS, getStepIndex };
