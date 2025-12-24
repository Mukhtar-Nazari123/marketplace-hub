import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const AdminCMS = () => {
  const { t } = useLanguage();

  const pages = [
    { id: 'home', name: t.admin.cms.pages.home, description: t.admin.cms.pages.homeDescription },
    { id: 'about', name: t.admin.cms.pages.about, description: t.admin.cms.pages.aboutDescription },
    { id: 'contact', name: t.admin.cms.pages.contact, description: t.admin.cms.pages.contactDescription },
    { id: 'terms', name: t.admin.cms.pages.terms, description: t.admin.cms.pages.termsDescription },
    { id: 'privacy', name: t.admin.cms.pages.privacy, description: t.admin.cms.pages.privacyDescription },
  ];

  return (
    <AdminLayout title={t.admin.cms.title} description={t.admin.cms.description}>
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page, index) => (
            <Card 
              key={page.id} 
              className="hover-lift cursor-pointer transition-all duration-300"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <Button variant="ghost" size="icon" className="hover-scale">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
                <CardTitle className="text-lg">{page.name}</CardTitle>
                <CardDescription>{page.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCMS;
