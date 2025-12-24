import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  UserPlus,
  Package,
  BadgeCheck,
  Image,
  Tag,
  AlertTriangle,
} from 'lucide-react';

interface QuickAction {
  label: string;
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

  const quickActions: QuickAction[] = [
    {
      label: 'إدارة المستخدمين',
      icon: UserPlus,
      path: '/admin/users',
      variant: 'outline',
    },
    {
      label: 'مراجعة المنتجات',
      icon: Package,
      path: '/admin/products',
      variant: pendingProducts > 0 ? 'default' : 'outline',
      badge: pendingProducts,
    },
    {
      label: 'التحقق من البائعين',
      icon: BadgeCheck,
      path: '/admin/sellers',
      variant: pendingSellers > 0 ? 'default' : 'outline',
      badge: pendingSellers,
    },
    {
      label: 'إدارة البانرات',
      icon: Image,
      path: '/admin/banners',
      variant: 'outline',
    },
    {
      label: 'إدارة العروض',
      icon: Tag,
      path: '/admin/promotions',
      variant: 'outline',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>إجراءات سريعة</CardTitle>
        <CardDescription>الوصول السريع للمهام الشائعة</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.path}
              variant={action.variant || 'outline'}
              className="w-full justify-start gap-2 relative"
              onClick={() => navigate(action.path)}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
              {action.badge && action.badge > 0 && (
                <span className="absolute left-3 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground text-xs">
                  {action.badge}
                </span>
              )}
            </Button>
          ))}
        </div>

        {(pendingSellers > 0 || pendingProducts > 0) && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-warning/10 p-3 text-sm">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span>
              لديك {pendingSellers + pendingProducts} عناصر تحتاج مراجعة
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
