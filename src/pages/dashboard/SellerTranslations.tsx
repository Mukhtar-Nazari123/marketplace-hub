import { useState } from 'react';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { useLanguage } from '@/lib/i18n';
import { useTranslationCoverage, useProductTranslations, TranslationLanguage } from '@/hooks/useProductTranslations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, Edit, Languages, AlertCircle, Copy, Search } from 'lucide-react';
import { toast } from 'sonner';
import { sellerTranslations } from '@/lib/seller-translations';

const SellerTranslations = () => {
  const { language, isRTL } = useLanguage();
  const { coverage, stats, isLoading } = useTranslationCoverage();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');

  const t = (section: keyof typeof sellerTranslations, key: string) => {
    const sectionData = sellerTranslations[section] as Record<string, Record<string, string>> | undefined;
    if (!sectionData || !sectionData[key]) return key;
    return sectionData[key][language] || sectionData[key].en || key;
  };

  // Filter products based on search and status
  const filteredCoverage = coverage?.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'complete') return matchesSearch && item.en_complete && item.fa_complete && item.ps_complete;
    if (filterStatus === 'incomplete') return matchesSearch && (!item.en_complete || !item.fa_complete || !item.ps_complete);
    return matchesSearch;
  });

  const getLanguageLabel = (lang: TranslationLanguage) => {
    switch (lang) {
      case 'en': return t('translations', 'english');
      case 'fa': return t('translations', 'persian');
      case 'ps': return t('translations', 'pashto');
    }
  };

  const getCoveragePercentage = (lang: 'en' | 'fa' | 'ps') => {
    if (!stats.totalProducts) return 0;
    const complete = lang === 'en' ? stats.enComplete : lang === 'fa' ? stats.faComplete : stats.psComplete;
    return Math.round((complete / stats.totalProducts) * 100);
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title={t('translations', 'title')}
        description={t('translations', 'description')}
        allowedRoles={['seller']}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-lg" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={t('translations', 'title')}
      description={t('translations', 'description')}
      allowedRoles={['seller']}
    >
      <div className="space-y-6">
        {/* Coverage Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {(['en', 'fa', 'ps'] as const).map(lang => (
            <Card key={lang} className="border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Languages className="h-4 w-4 text-primary" />
                  {getLanguageLabel(lang)}
                </CardTitle>
                <CardDescription className="text-xs">
                  {t('translations', 'coverage')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{getCoveragePercentage(lang)}%</span>
                    <span className="text-muted-foreground">
                      {lang === 'en' ? stats.enComplete : lang === 'fa' ? stats.faComplete : stats.psComplete} / {stats.totalProducts}
                    </span>
                  </div>
                  <Progress 
                    value={getCoveragePercentage(lang)} 
                    className="h-2"
                  />
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Check className="h-3 w-3 mr-1 text-green-500" />
                      {lang === 'en' ? stats.enComplete : lang === 'fa' ? stats.faComplete : stats.psComplete} {t('translations', 'complete')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <AlertCircle className="h-3 w-3 mr-1 text-yellow-500" />
                      {lang === 'en' ? stats.enMissing : lang === 'fa' ? stats.faMissing : stats.psMissing} {t('translations', 'missing')}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Products Translation Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>{t('translations', 'allProducts')}</CardTitle>
                <CardDescription>{t('translations', 'description')}</CardDescription>
              </div>
              <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="relative">
                  <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                  <Input
                    placeholder={t('common', 'search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-64 ${isRTL ? 'pr-9' : 'pl-9'}`}
                  />
                </div>
                <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                  <TabsList>
                    <TabsTrigger value="all">{t('common', 'all')}</TabsTrigger>
                    <TabsTrigger value="complete">{t('translations', 'complete')}</TabsTrigger>
                    <TabsTrigger value="incomplete">{t('translations', 'incomplete')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('translations', 'productName')}</TableHead>
                    <TableHead className="text-center">{t('translations', 'english')}</TableHead>
                    <TableHead className="text-center">{t('translations', 'persian')}</TableHead>
                    <TableHead className="text-center">{t('translations', 'pashto')}</TableHead>
                    <TableHead className="text-center">{t('common', 'edit')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoverage?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        {t('common', 'noData')}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCoverage?.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell className="font-medium">{item.product_name}</TableCell>
                        <TableCell className="text-center">
                          <TranslationStatusBadge 
                            hasTranslation={item.en} 
                            isComplete={item.en_complete} 
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TranslationStatusBadge 
                            hasTranslation={item.fa} 
                            isComplete={item.fa_complete} 
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <TranslationStatusBadge 
                            hasTranslation={item.ps} 
                            isComplete={item.ps_complete} 
                          />
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedProduct(item.product_id);
                              setEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Translation Edit Dialog */}
        {selectedProduct && (
          <TranslationEditDialog
            productId={selectedProduct}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            language={language}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

// Status badge component
const TranslationStatusBadge = ({ hasTranslation, isComplete }: { hasTranslation: boolean; isComplete: boolean }) => {
  if (!hasTranslation) {
    return (
      <Badge variant="outline" className="text-xs bg-red-500/10 text-red-500 border-red-500/30">
        <X className="h-3 w-3 mr-1" />
        Missing
      </Badge>
    );
  }
  if (isComplete) {
    return (
      <Badge variant="outline" className="text-xs bg-green-500/10 text-green-500 border-green-500/30">
        <Check className="h-3 w-3 mr-1" />
        Complete
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
      <AlertCircle className="h-3 w-3 mr-1" />
      Incomplete
    </Badge>
  );
};

// Translation Edit Dialog Component
const TranslationEditDialog = ({
  productId,
  open,
  onOpenChange,
  language,
}: {
  productId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  language: 'en' | 'fa' | 'ps';
}) => {
  const { translations, getTranslation, saveTranslation, isSaving } = useProductTranslations(productId);
  const [activeTab, setActiveTab] = useState<TranslationLanguage>('ps');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    meta_title: '',
    meta_description: '',
  });

  const t = (section: keyof typeof sellerTranslations, key: string) => {
    const sectionData = sellerTranslations[section] as Record<string, Record<string, string>>;
    if (!sectionData || !sectionData[key]) return key;
    return sectionData[key][language] || sectionData[key].en || key;
  };

  // Load translation data when tab changes
  const loadTranslation = (lang: TranslationLanguage) => {
    const trans = getTranslation(lang);
    setFormData({
      name: trans?.name || '',
      description: trans?.description || '',
      short_description: trans?.short_description || '',
      meta_title: trans?.meta_title || '',
      meta_description: trans?.meta_description || '',
    });
  };

  // Copy from another language
  const copyFromLanguage = (sourceLang: TranslationLanguage) => {
    const trans = getTranslation(sourceLang);
    if (trans) {
      setFormData({
        name: trans.name || '',
        description: trans.description || '',
        short_description: trans.short_description || '',
        meta_title: trans.meta_title || '',
        meta_description: trans.meta_description || '',
      });
      toast.success(`Copied from ${sourceLang.toUpperCase()}`);
    }
  };

  const handleSave = () => {
    saveTranslation({
      productId,
      language: activeTab,
      data: formData,
    }, {
      onSuccess: () => {
        toast.success(t('translations', 'translationSaved'));
      },
      onError: (error) => {
        toast.error(t('common', 'error'));
        console.error(error);
      },
    });
  };

  const getTabDirection = (lang: TranslationLanguage) => {
    return lang === 'en' ? 'ltr' : 'rtl';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('translations', 'editTranslation')}</DialogTitle>
          <DialogDescription>
            {t('translations', 'description')}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as TranslationLanguage);
          loadTranslation(v as TranslationLanguage);
        }}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="en">EN</TabsTrigger>
              <TabsTrigger value="fa">FA</TabsTrigger>
              <TabsTrigger value="ps">PS</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {activeTab !== 'en' && getTranslation('en') && (
                <Button variant="outline" size="sm" onClick={() => copyFromLanguage('en')}>
                  <Copy className="h-3 w-3 mr-1" />
                  {t('translations', 'copyFrom')} EN
                </Button>
              )}
              {activeTab !== 'fa' && getTranslation('fa') && (
                <Button variant="outline" size="sm" onClick={() => copyFromLanguage('fa')}>
                  <Copy className="h-3 w-3 mr-1" />
                  {t('translations', 'copyFrom')} FA
                </Button>
              )}
            </div>
          </div>

          {(['en', 'fa', 'ps'] as const).map(lang => (
            <TabsContent key={lang} value={lang} className="space-y-4" dir={getTabDirection(lang)}>
              <div className="space-y-2">
                <Label>{t('translations', 'productName')}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('translations', 'productName')}
                  dir={getTabDirection(lang)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('translations', 'shortDescription')}</Label>
                <Input
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  placeholder={t('translations', 'shortDescription')}
                  dir={getTabDirection(lang)}
                />
              </div>

              <div className="space-y-2">
                <Label>{t('translations', 'productDescription')}</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('translations', 'productDescription')}
                  rows={5}
                  dir={getTabDirection(lang)}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('translations', 'metaTitle')}</Label>
                  <Input
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder={t('translations', 'metaTitle')}
                    dir={getTabDirection(lang)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('translations', 'metaDescription')}</Label>
                  <Input
                    value={formData.meta_description}
                    onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                    placeholder={t('translations', 'metaDescription')}
                    dir={getTabDirection(lang)}
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('common', 'cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t('common', 'loading') : t('translations', 'saveTranslation')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SellerTranslations;
