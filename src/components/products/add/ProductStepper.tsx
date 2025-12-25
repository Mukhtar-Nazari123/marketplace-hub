import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface Step {
  id: number;
  title: string;
  titleFa: string;
}

interface ProductStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const ProductStepper = ({ steps, currentStep, onStepClick }: ProductStepperProps) => {
  const { isRTL } = useLanguage();

  return (
    <div className="w-full">
      {/* Desktop horizontal stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className={cn("flex items-center flex-1", isRTL && "flex-row-reverse")}>
            <div 
              className={cn(
                "flex items-center cursor-pointer group",
                isRTL && "flex-row-reverse",
                onStepClick && currentStep > step.id && "hover:opacity-80"
              )}
              onClick={() => onStepClick && currentStep > step.id && onStepClick(step.id)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                  currentStep > step.id && "bg-primary text-primary-foreground",
                  currentStep === step.id && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  currentStep < step.id && "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  "hidden lg:block text-sm font-medium transition-colors duration-300",
                  isRTL ? "mr-3" : "ml-3",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {isRTL ? step.titleFa : step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mx-4 transition-colors duration-300",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile vertical stepper */}
      <div className="md:hidden space-y-3">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={cn(
              "flex items-center gap-3",
              isRTL && "flex-row-reverse"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 shrink-0",
                currentStep > step.id && "bg-primary text-primary-foreground",
                currentStep === step.id && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                currentStep < step.id && "bg-muted text-muted-foreground"
              )}
              onClick={() => onStepClick && currentStep > step.id && onStepClick(step.id)}
            >
              {currentStep > step.id ? (
                <Check className="w-4 h-4" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={cn(
                "text-sm font-medium transition-colors duration-300",
                currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {isRTL ? step.titleFa : step.title}
            </span>
            {currentStep === step.id && (
              <span className="text-xs text-primary px-2 py-0.5 bg-primary/10 rounded-full">
                {isRTL ? 'فعلی' : 'Current'}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
