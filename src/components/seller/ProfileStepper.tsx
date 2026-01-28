import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface Step {
  id: number;
  title: string;
  titleFa: string;
  titlePs?: string;
}

interface ProfileStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const ProfileStepper = ({ steps, currentStep, onStepClick }: ProfileStepperProps) => {
  const { isRTL, language } = useLanguage();

  const getStepTitle = (step: Step) => {
    if (language === 'ps' && step.titlePs) return step.titlePs;
    if (language === 'fa' && step.titleFa) return step.titleFa;
    return step.title;
  };

  const getCurrentStepLabel = () => {
    if (language === 'ps') return 'اوسنی مرحله';
    if (language === 'fa') return 'مرحله فعلی';
    return 'Current step';
  };

  return (
    <div className="w-full">
      {/* Desktop horizontal stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div 
              className={cn(
                "flex items-center cursor-pointer group",
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
                {getStepTitle(step)}
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
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={cn(
              "flex items-start",
              isRTL && "flex-row-reverse"
            )}
          >
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300",
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
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-0.5 h-8 mt-2 transition-colors duration-300",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
            <div className={cn("flex-1", isRTL ? "mr-3" : "ml-3")}>
              <span
                className={cn(
                  "text-sm font-medium transition-colors duration-300",
                  currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {getStepTitle(step)}
              </span>
              {currentStep === step.id && (
                <div className="text-xs text-muted-foreground mt-1">
                  {getCurrentStepLabel()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
