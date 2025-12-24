import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Edit } from 'lucide-react';

const pages = [
  { id: 'home', name: 'الصفحة الرئيسية', description: 'إدارة محتوى الصفحة الرئيسية' },
  { id: 'about', name: 'من نحن', description: 'تعديل صفحة من نحن' },
  { id: 'contact', name: 'اتصل بنا', description: 'تعديل معلومات الاتصال' },
  { id: 'terms', name: 'الشروط والأحكام', description: 'تعديل الشروط والأحكام' },
  { id: 'privacy', name: 'سياسة الخصوصية', description: 'تعديل سياسة الخصوصية' },
];

const AdminCMS = () => {
  return (
    <AdminLayout title="إدارة المحتوى" description="تعديل صفحات ومحتوى الموقع">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pages.map((page) => (
            <Card key={page.id} className="hover-lift cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <Button variant="ghost" size="icon">
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
