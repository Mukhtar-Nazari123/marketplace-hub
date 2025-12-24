import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Tag } from 'lucide-react';

const AdminPromotions = () => {
  return (
    <AdminLayout title="إدارة العروض" description="إنشاء وإدارة العروض الترويجية">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>العروض الترويجية</CardTitle>
                <CardDescription>إدارة الكوبونات والخصومات</CardDescription>
              </div>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة عرض
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Tag className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">لا يوجد عروض</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ابدأ بإنشاء عرض ترويجي جديد
              </p>
              <Button className="mt-4">
                <Plus className="ml-2 h-4 w-4" />
                إنشاء أول عرض
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPromotions;
