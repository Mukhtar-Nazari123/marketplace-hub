import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminSettings = () => {
  return (
    <AdminLayout title="الإعدادات" description="إعدادات النظام والتكوين">
      <div className="space-y-6">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">عام</TabsTrigger>
            <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>الإعدادات العامة</CardTitle>
                <CardDescription>إعدادات النظام الأساسية</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">اسم الموقع</Label>
                  <Input id="siteName" placeholder="اسم المتجر" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteEmail">البريد الإلكتروني</Label>
                  <Input id="siteEmail" type="email" placeholder="admin@store.com" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>وضع الصيانة</Label>
                    <p className="text-sm text-muted-foreground">
                      تعطيل الموقع مؤقتاً للصيانة
                    </p>
                  </div>
                  <Switch />
                </div>
                <Button>حفظ التغييرات</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الإشعارات</CardTitle>
                <CardDescription>تكوين إشعارات البريد الإلكتروني</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات الطلبات الجديدة</Label>
                    <p className="text-sm text-muted-foreground">
                      تلقي إشعار عند إنشاء طلب جديد
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات التسجيل الجديد</Label>
                    <p className="text-sm text-muted-foreground">
                      تلقي إشعار عند تسجيل مستخدم جديد
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>إشعارات طلبات التحقق</Label>
                    <p className="text-sm text-muted-foreground">
                      تلقي إشعار عند طلب تحقق جديد
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>حفظ التغييرات</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>إعدادات الأمان</CardTitle>
                <CardDescription>تكوين خيارات الأمان</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>المصادقة الثنائية</Label>
                    <p className="text-sm text-muted-foreground">
                      تفعيل المصادقة الثنائية للمديرين
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>تسجيل الأنشطة</Label>
                    <p className="text-sm text-muted-foreground">
                      تسجيل جميع أنشطة المديرين
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>حفظ التغييرات</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
