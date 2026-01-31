import { cn } from "@/lib/utils";
import { useAuthTranslations } from "@/lib/auth-translations";

interface PasswordStrengthIndicatorProps {
  password: string;
  language: 'en' | 'fa' | 'ps';
}

const PasswordStrengthIndicator = ({ password, language }: PasswordStrengthIndicatorProps) => {
  const { t } = useAuthTranslations(language);
  const isRTL = language === 'fa' || language === 'ps';

  const getStrength = (password: string): { score: number; labelKey: string; color: string } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 1, labelKey: 'weak', color: 'bg-destructive' };
    if (score <= 4) return { score: 2, labelKey: 'medium', color: 'bg-warning' };
    if (score <= 5) return { score: 3, labelKey: 'strong', color: 'bg-success' };
    return { score: 4, labelKey: 'veryStrong', color: 'bg-success' };
  };

  if (!password) return null;

  const strength = getStrength(password);
  const strengthLabel = t('passwordStrength', strength.labelKey);
  const labelPrefix = t('passwordStrength', 'label');

  return (
    <div className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              level <= strength.score ? strength.color : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className={cn(
        "text-xs transition-colors duration-300",
        strength.score <= 1 ? "text-destructive" :
        strength.score <= 2 ? "text-warning" : "text-success"
      )}>
        {labelPrefix} {strengthLabel}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
