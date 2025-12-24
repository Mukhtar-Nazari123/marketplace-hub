import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Tag } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const AdminPromotions = () => {
  const { t, direction } = useLanguage();
  const iconMarginClass = direction === 'rtl' ? 'ml-2' : 'mr-2';

  return (
    <AdminLayout title={t.admin.promotions.title} description={t.admin.promotions.description}>
      <div className="space-y-6 animate-fade-in">
        <Card className="hover-lift">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{t.admin.promotions.promotionsTitle}</CardTitle>
                <CardDescription>{t.admin.promotions.promotionsDescription}</CardDescription>
              </div>
              <Button className="hover-scale">
                <Plus className={`h-4 w-4 ${iconMarginClass}`} />
                {t.admin.promotions.addPromotion}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4 animate-pulse">
                <Tag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t.admin.promotions.noPromotions}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t.admin.promotions.startByCreating}
              </p>
              <Button className="mt-4 hover-scale">
                <Plus className={`h-4 w-4 ${iconMarginClass}`} />
                {t.admin.promotions.createFirst}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPromotions;
