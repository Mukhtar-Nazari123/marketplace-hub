import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
  isRTL?: boolean;
}

const PasswordStrengthIndicator = ({ password, isRTL }: PasswordStrengthIndicatorProps) => {
  const getStrength = (password: string): { score: number; label: { en: string; fa: string }; color: string } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 1, label: { en: 'Weak', fa: 'ضعیف' }, color: 'bg-destructive' };
    if (score <= 4) return { score: 2, label: { en: 'Medium', fa: 'متوسط' }, color: 'bg-warning' };
    if (score <= 5) return { score: 3, label: { en: 'Strong', fa: 'قوی' }, color: 'bg-success' };
    return { score: 4, label: { en: 'Very Strong', fa: 'بسیار قوی' }, color: 'bg-success' };
  };

  if (!password) return null;

  const strength = getStrength(password);

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
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
        {isRTL ? `قدرت رمز عبور: ${strength.label.fa}` : `Password strength: ${strength.label.en}`}
      </p>
    </div>
  );
};

export default PasswordStrengthIndicator;
