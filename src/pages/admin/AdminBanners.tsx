import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image } from 'lucide-react';

const AdminBanners = () => {
  return (
    <AdminLayout title="إدارة البانرات" description="إدارة البانرات الإعلانية">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>البانرات</CardTitle>
                <CardDescription>إدارة البانرات والإعلانات</CardDescription>
              </div>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة بانر
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-4">
                <Image className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">لا يوجد بانرات</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                ابدأ بإضافة بانر جديد للصفحة الرئيسية
              </p>
              <Button className="mt-4">
                <Plus className="ml-2 h-4 w-4" />
                إضافة أول بانر
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminBanners;
