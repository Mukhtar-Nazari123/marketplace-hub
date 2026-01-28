import { useState } from "react";
import { useLanguage, Language } from "@/lib/i18n";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical, Facebook, Twitter, Instagram, Youtube, Linkedin, Github, Globe } from "lucide-react";
import { useAllSocialLinks, useCreateSocialLink, useUpdateSocialLink, useDeleteSocialLink, SocialLink } from "@/hooks/useSocialLinks";
import { Skeleton } from "@/components/ui/skeleton";

const getLabel = (lang: Language, en: string, fa: string, ps: string) => {
  if (lang === 'ps') return ps;
  if (lang === 'fa') return fa;
  return en;
};

const PLATFORM_OPTIONS = [
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "twitter", label: "Twitter / X", icon: Twitter },
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "github", label: "GitHub", icon: Github },
  { value: "other", label: "Other", icon: Globe },
];

const getIconComponent = (iconName: string) => {
  const platform = PLATFORM_OPTIONS.find(p => p.label === iconName || p.value === iconName.toLowerCase());
  return platform?.icon || Globe;
};

const AdminSocialLinks = () => {
  const { language } = useLanguage();
  const lang = language as Language;
  const { data: socialLinks, isLoading } = useAllSocialLinks();
  const createMutation = useCreateSocialLink();
  const updateMutation = useUpdateSocialLink();
  const deleteMutation = useDeleteSocialLink();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [formData, setFormData] = useState({
    platform: "",
    url: "",
    icon: "",
    is_active: true,
    display_order: 0,
  });

  const handleOpenDialog = (link?: SocialLink) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        platform: link.platform,
        url: link.url,
        icon: link.icon,
        is_active: link.is_active,
        display_order: link.display_order,
      });
    } else {
      setEditingLink(null);
      setFormData({
        platform: "",
        url: "",
        icon: "",
        is_active: true,
        display_order: (socialLinks?.length || 0) + 1,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLink(null);
    setFormData({
      platform: "",
      url: "",
      icon: "",
      is_active: true,
      display_order: 0,
    });
  };

  const handlePlatformChange = (value: string) => {
    const platform = PLATFORM_OPTIONS.find(p => p.value === value);
    setFormData({
      ...formData,
      platform: value,
      icon: platform?.label || value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingLink) {
      await updateMutation.mutateAsync({
        id: editingLink.id,
        ...formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
    
    handleCloseDialog();
  };

  const handleToggleActive = async (link: SocialLink) => {
    await updateMutation.mutateAsync({
      id: link.id,
      is_active: !link.is_active,
    });
  };

  const handleDelete = async (id: string) => {
    const confirmMessage = getLabel(
      lang,
      "Are you sure you want to delete this link?",
      "آیا مطمئن هستید؟",
      "ایا تاسو ډاډه یاست چې غواړئ دا لینک حذف کړئ؟"
    );
    if (confirm(confirmMessage)) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <AdminLayout 
      title={getLabel(lang, "Social Links", "لینک‌های شبکه‌های اجتماعی", "ټولنیز رسنیو لینکونه")}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {getLabel(lang, "Social Links", "لینک‌های شبکه‌های اجتماعی", "ټولنیز رسنیو لینکونه")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {getLabel(
                lang,
                "Manage social media links displayed in the website footer",
                "مدیریت لینک‌های شبکه‌های اجتماعی در فوتر سایت",
                "په ویب پاڼې فوټر کې د ټولنیزو رسنیو لینکونه اداره کړئ"
              )}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 me-2" />
                {getLabel(lang, "Add Link", "افزودن لینک", "لینک اضافه کړئ")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLink 
                    ? getLabel(lang, "Edit Link", "ویرایش لینک", "لینک سمول")
                    : getLabel(lang, "Add New Link", "افزودن لینک جدید", "نوی لینک اضافه کړئ")
                  }
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{getLabel(lang, "Platform", "پلتفرم", "پلیټفارم")}</Label>
                  <Select value={formData.platform} onValueChange={handlePlatformChange}>
                    <SelectTrigger>
                      <SelectValue placeholder={getLabel(lang, "Select platform", "انتخاب پلتفرم", "پلیټفارم غوره کړئ")} />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{getLabel(lang, "URL", "آدرس URL", "URL پته")}</Label>
                  <Input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    required
                    dir="ltr"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{getLabel(lang, "Display Order", "ترتیب نمایش", "د ښودلو ترتیب")}</Label>
                  <Input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>{getLabel(lang, "Active", "فعال", "فعال")}</Label>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    {getLabel(lang, "Cancel", "انصراف", "لغوه کول")}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingLink 
                      ? getLabel(lang, "Save Changes", "ذخیره تغییرات", "بدلونونه خوندي کړئ")
                      : getLabel(lang, "Add", "افزودن", "اضافه کړئ")
                    }
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{getLabel(lang, "Existing Links", "لینک‌های موجود", "موجود لینکونه")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : !socialLinks?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                {getLabel(lang, "No social links found", "هیچ لینکی یافت نشد", "هیڅ ټولنیز لینک ونه موندل شو")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>{getLabel(lang, "Platform", "پلتفرم", "پلیټفارم")}</TableHead>
                    <TableHead>{getLabel(lang, "URL", "آدرس", "پته")}</TableHead>
                    <TableHead className="text-center">{getLabel(lang, "Status", "وضعیت", "حالت")}</TableHead>
                    <TableHead className="text-center">{getLabel(lang, "Order", "ترتیب", "ترتیب")}</TableHead>
                    <TableHead className="text-end">{getLabel(lang, "Actions", "عملیات", "عملیات")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {socialLinks.map((link) => {
                    const IconComponent = getIconComponent(link.icon);
                    return (
                      <TableRow key={link.id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5" />
                            <span className="capitalize">{link.platform}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                            dir="ltr"
                          >
                            {link.url}
                          </a>
                        </TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={link.is_active}
                            onCheckedChange={() => handleToggleActive(link)}
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          {link.display_order}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(link)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(link.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSocialLinks;
