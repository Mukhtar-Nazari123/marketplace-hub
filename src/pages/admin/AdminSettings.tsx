import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/lib/i18n';

const AdminSettings = () => {
  const { t } = useLanguage();

  return (
    <AdminLayout title={t.admin.settings.title} description={t.admin.settings.description}>
      <div className="space-y-6 animate-fade-in">
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">{t.admin.settings.tabs.general}</TabsTrigger>
            <TabsTrigger value="notifications">{t.admin.settings.tabs.notifications}</TabsTrigger>
            <TabsTrigger value="security">{t.admin.settings.tabs.security}</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{t.admin.settings.general.title}</CardTitle>
                <CardDescription>{t.admin.settings.general.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">{t.admin.settings.general.siteName}</Label>
                  <Input id="siteName" placeholder={t.admin.settings.general.siteNamePlaceholder} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteEmail">{t.admin.settings.general.siteEmail}</Label>
                  <Input id="siteEmail" type="email" placeholder="admin@store.com" />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.general.maintenanceMode}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.general.maintenanceDescription}
                    </p>
                  </div>
                  <Switch />
                </div>
                <Button className="hover-scale">{t.admin.settings.saveChanges}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{t.admin.settings.notifications.title}</CardTitle>
                <CardDescription>{t.admin.settings.notifications.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.notifications.newOrders}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.notifications.newOrdersDescription}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.notifications.newRegistrations}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.notifications.newRegistrationsDescription}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.notifications.verificationRequests}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.notifications.verificationRequestsDescription}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="hover-scale">{t.admin.settings.saveChanges}</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>{t.admin.settings.security.title}</CardTitle>
                <CardDescription>{t.admin.settings.security.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.security.twoFactor}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.security.twoFactorDescription}
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.admin.settings.security.activityLog}</Label>
                    <p className="text-sm text-muted-foreground">
                      {t.admin.settings.security.activityLogDescription}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button className="hover-scale">{t.admin.settings.saveChanges}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
