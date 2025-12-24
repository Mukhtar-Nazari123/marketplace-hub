import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  delay?: number;
}

export const StatsCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  iconClassName,
  delay = 0,
}: StatsCardProps) => {
  const { isRTL } = useLanguage();
  
  return (
    <Card 
      className={cn(
        'group relative overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1',
        'animate-fade-in',
        className
      )}
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      {/* Animated gradient background on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={cn(
          'rounded-lg p-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3',
          iconClassName || 'bg-primary/10 text-primary'
        )}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className={cn(
          "text-2xl font-bold transition-all duration-300 group-hover:scale-105",
          isRTL ? "origin-right" : "origin-left"
        )}>
          {value}
        </div>
        {(description || trend) && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 flex-wrap">
            {trend && (
              <span
                className={cn(
                  'font-medium inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] transition-all duration-300',
                  trend.isPositive 
                    ? 'text-emerald-600 bg-emerald-500/10' 
                    : 'text-red-600 bg-red-500/10'
                )}
              >
                <span className={cn(
                  'transition-transform duration-300',
                  trend.isPositive ? 'rotate-0' : 'rotate-180'
                )}>
                  ↑
                </span>
                {trend.value}%
              </span>
            )}
            <span>{description}</span>
          </p>
        )}
      </CardContent>
    </Card>
  );
};