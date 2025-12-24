import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import {
  UserPlus,
  Package,
  BadgeCheck,
  Image,
  Tag,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface QuickAction {
  labelKey: string;
  icon: React.ElementType;
  path: string;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  badge?: number;
}

interface QuickActionsCardProps {
  pendingSellers?: number;
  pendingProducts?: number;
}

export const QuickActionsCard = ({
  pendingSellers = 0,
  pendingProducts = 0,
}: QuickActionsCardProps) => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const ArrowIcon = isRTL ? ChevronLeft : ChevronRight;

  const quickActions: QuickAction[] = [
    {
      labelKey: 'users',
      icon: UserPlus,
      path: '/admin/users',
      variant: 'outline',
    },
    {
      labelKey: 'products',
      icon: Package,
      path: '/admin/products',
      variant: pendingProducts > 0 ? 'default' : 'outline',
      badge: pendingProducts,
    },
    {
      labelKey: 'sellers',
      icon: BadgeCheck,
      path: '/admin/sellers',
      variant: pendingSellers > 0 ? 'default' : 'outline',
      badge: pendingSellers,
    },
    {
      labelKey: 'banners',
      icon: Image,
      path: '/admin/banners',
      variant: 'outline',
    },
    {
      labelKey: 'promotions',
      icon: Tag,
      path: '/admin/promotions',
      variant: 'outline',
    },
  ];

  const getLabel = (key: string) => {
    const section = t.admin[key as keyof typeof t.admin];
    if (typeof section === 'object' && 'title' in section) {
      return section.title as string;
    }
    return key;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          {t.admin.quickActions}
        </CardTitle>
        <CardDescription>{t.admin.dashboardDescription}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={action.path}
              variant={action.variant || 'outline'}
              className="w-full justify-between gap-2 relative group overflow-hidden h-11 animate-fade-in transition-all duration-300 hover:shadow-md"
              style={{ animationDelay: `${index * 0.05}s` }}
              onClick={() => navigate(action.path)}
            >
              {/* Hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <span className="flex items-center gap-2 relative z-10">
                <action.icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                <span className="truncate">{getLabel(action.labelKey)}</span>
              </span>
              
              <span className="flex items-center gap-2 relative z-10">
                {action.badge && action.badge > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs px-1.5 animate-pulse">
                    {action.badge}
                  </span>
                )}
                <ArrowIcon className="h-4 w-4 opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
              </span>
            </Button>
          ))}
        </div>

        {(pendingSellers > 0 || pendingProducts > 0) && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm animate-fade-in group hover:bg-amber-500/15 transition-colors duration-300">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 animate-pulse" />
            <span className="text-amber-700 dark:text-amber-400">
              {t.admin.needsAttention}: {pendingSellers + pendingProducts} {t.admin.pendingReview}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};