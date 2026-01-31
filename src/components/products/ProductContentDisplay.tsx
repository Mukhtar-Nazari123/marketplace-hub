import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import {
  FileText,
  Globe,
  CheckCircle2,
  AlertCircle,
  Tag,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface ProductTranslations {
  name?: string | null;
  name_en?: string | null;
  name_fa?: string | null;
  name_ps?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_fa?: string | null;
  description_ps?: string | null;
  short_description_en?: string | null;
  short_description_fa?: string | null;
  short_description_ps?: string | null;
}

interface ProductMetadata {
  shortDescription?: string;
  brand?: string;
  attributes?: Record<string, string | boolean | string[]>;
  categoryName?: string;
  subCategoryName?: string;
  stockPerSize?: Record<string, number>;
  hasWarranty?: boolean;
  warrantyDuration?: string;
}

interface ProductContentDisplayProps {
  product: ProductTranslations & {
    metadata?: ProductMetadata | Record<string, unknown> | null;
  };
  className?: string;
}

export const ProductContentDisplay = ({ product, className }: ProductContentDisplayProps) => {
  const { isRTL, language } = useLanguage();
  
  const metadata = (product.metadata || {}) as ProductMetadata;

  // Check translation completeness
  const hasEnglish = !!(product.name_en || product.description_en || product.short_description_en);
  const hasPersian = !!(product.name_fa || product.description_fa || product.short_description_fa);
  const hasPashto = !!(product.name_ps || product.description_ps || product.short_description_ps);

  const getTranslationStatus = (hasTranslation: boolean) => {
    if (hasTranslation) {
      return (
        <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1">
          <CheckCircle2 className="h-3 w-3" />
          {isRTL ? 'موجود' : 'Available'}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground gap-1">
        <AlertCircle className="h-3 w-3" />
        {isRTL ? 'ناموجود' : 'Missing'}
      </Badge>
    );
  };

  const renderContent = (
    name: string | null | undefined,
    shortDesc: string | null | undefined,
    desc: string | null | undefined,
    langLabel: string,
    direction: 'ltr' | 'rtl' = 'ltr'
  ) => {
    const hasContent = name || shortDesc || desc;
    
    if (!hasContent) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>{isRTL ? `محتوای ${langLabel} موجود نیست` : `No ${langLabel} content available`}</p>
        </div>
      );
    }

    return (
      <div className={cn("space-y-4", direction === 'rtl' && "text-right")} dir={direction}>
        {/* Name */}
        {name && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {isRTL ? 'نام محصول' : 'Product Name'}
            </label>
            <p className="text-lg font-semibold">{name}</p>
          </div>
        )}
        
        {/* Short Description */}
        {shortDesc && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {isRTL ? 'توضیح کوتاه' : 'Short Description'}
            </label>
            <p className="text-muted-foreground">{shortDesc}</p>
          </div>
        )}
        
        {/* Full Description */}
        {desc && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {isRTL ? 'توضیحات کامل' : 'Full Description'}
            </label>
            <div 
              className="prose prose-sm max-w-none dark:prose-invert text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: desc }}
            />
          </div>
        )}
      </div>
    );
  };

  // Attributes/Specifications
  const attributes = metadata.attributes || {};
  const hasWarranty = metadata.hasWarranty || attributes.hasWarranty;
  const warrantyDuration = metadata.warrantyDuration || attributes.warrantyDuration;
  
  // Filter out warranty fields from other specs
  const otherSpecs = Object.entries(attributes).filter(
    ([key]) => key !== 'hasWarranty' && key !== 'warrantyDuration'
  );
  const hasOtherSpecs = otherSpecs.some(([, value]) => value !== undefined && value !== '' && value !== null);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Product Content & Translations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            {isRTL ? 'محتوای محصول و ترجمه‌ها' : 'Product Content & Translations'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {isRTL 
              ? 'تمام محتوای وارد شده برای این محصول در زبان‌های مختلف'
              : 'All content entered for this product in different languages'}
          </p>
        </CardHeader>
        <CardContent>
          {/* Translation Status Overview */}
          <div className="flex flex-wrap gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">English:</span>
              {getTranslationStatus(hasEnglish)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">فارسی:</span>
              {getTranslationStatus(hasPersian)}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">پښتو:</span>
              {getTranslationStatus(hasPashto)}
            </div>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="en" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="en" className="gap-2">
                🇺🇸 English
                {hasEnglish && <CheckCircle2 className="h-3 w-3 text-success" />}
              </TabsTrigger>
              <TabsTrigger value="fa" className="gap-2">
                🇮🇷 فارسی
                {hasPersian && <CheckCircle2 className="h-3 w-3 text-success" />}
              </TabsTrigger>
              <TabsTrigger value="ps" className="gap-2">
                🇦🇫 پښتو
                {hasPashto && <CheckCircle2 className="h-3 w-3 text-success" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="en" className="mt-4 border rounded-lg p-4">
              {renderContent(
                product.name_en,
                product.short_description_en,
                product.description_en,
                'English',
                'ltr'
              )}
            </TabsContent>

            <TabsContent value="fa" className="mt-4 border rounded-lg p-4">
              {renderContent(
                product.name_fa,
                product.short_description_fa,
                product.description_fa,
                'Persian',
                'rtl'
              )}
            </TabsContent>

            <TabsContent value="ps" className="mt-4 border rounded-lg p-4">
              {renderContent(
                product.name_ps,
                product.short_description_ps,
                product.description_ps,
                'Pashto',
                'rtl'
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Brand */}
      {metadata.brand && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'برند' : 'Brand'}
            </span>
          </div>
          <p className="text-lg font-semibold">{metadata.brand}</p>
        </Card>
      )}

      {/* Technical Specifications */}
      {(hasOtherSpecs || hasWarranty !== undefined) && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              {isRTL ? 'مشخصات فنی' : 'Technical Specifications'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Specifications */}
              {hasOtherSpecs && (
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {isRTL ? 'مشخصات' : 'Specifications'}
                  </h4>
                  <div className="space-y-2 text-sm">
                    {otherSpecs.map(([key, value]) => {
                      if (!value && value !== false) return null;
                      const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                      const displayValue = typeof value === 'boolean' 
                        ? (value ? (isRTL ? 'بله' : 'Yes') : (isRTL ? 'خیر' : 'No'))
                        : Array.isArray(value) 
                          ? value.join(', ')
                          : String(value);
                      return (
                        <div key={key} className="flex gap-2 justify-between">
                          <span className="font-medium capitalize text-muted-foreground">{formattedKey}:</span>
                          <span className="font-semibold">{displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Warranty */}
              {hasWarranty !== undefined && (
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                    {isRTL ? 'گارانتی' : 'Warranty'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-semibold",
                        hasWarranty ? "text-success" : "text-destructive"
                      )}>
                        {hasWarranty 
                          ? (isRTL ? '✓ دارای گارانتی' : '✓ Has Warranty') 
                          : (isRTL ? '✗ بدون گارانتی' : '✗ No Warranty')
                        }
                      </span>
                    </div>
                    {warrantyDuration && (
                      <div className="pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          {isRTL ? 'مدت:' : 'Duration:'}
                        </span>
                        <span className="font-semibold ms-2">{String(warrantyDuration)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stock per Size */}
      {metadata.stockPerSize && Object.keys(metadata.stockPerSize).length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            {isRTL ? 'موجودی بر اساس سایز' : 'Stock per Size'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(metadata.stockPerSize).map(([size, qty]) => (
              <div
                key={size}
                className={cn(
                  "px-4 py-2 rounded-lg border text-center min-w-[70px]",
                  qty > 0 ? "bg-success/10 border-success/30" : "bg-muted border-muted-foreground/20"
                )}
              >
                <p className="font-bold text-sm">{size}</p>
                <p className={cn(
                  "text-xs",
                  qty > 0 ? "text-success" : "text-muted-foreground"
                )}>
                  {qty} {isRTL ? 'عدد' : 'pcs'}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
