import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useLanguage, Language } from '@/lib/i18n';
import {
  getLocalizedProductName,
  getLocalizedProductDescription,
  getLocalizedShortDescription,
} from '@/lib/localizedProduct';
import {
  FileText,
  Globe,
  CheckCircle2,
  AlertCircle,
  Tag,
  Settings,
  ShieldCheck,
  Info,
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

interface ProductAttribute {
  attribute_key: string;
  attribute_value: string;
  language_code: string | null;
}

interface ProductContentDisplayProps {
  product: ProductTranslations & {
    metadata?: ProductMetadata | Record<string, unknown> | null;
  };
  attributes?: ProductAttribute[];
  className?: string;
}

export const ProductContentDisplay = ({ product, attributes = [], className }: ProductContentDisplayProps) => {
  const { isRTL, language } = useLanguage();
  
  const metadata = (product.metadata || {}) as ProductMetadata;

  // Convert attributes array to grouped object by language
  const attributesByLang = attributes.reduce((acc, attr) => {
    const lang = attr.language_code || 'universal';
    if (!acc[lang]) acc[lang] = {};
    acc[lang][attr.attribute_key] = attr.attribute_value;
    return acc;
  }, {} as Record<string, Record<string, string>>);

  // Get merged attributes (universal + language-specific)
  const getAttributesForLang = (lang: string) => {
    return { ...(attributesByLang.universal || {}), ...(attributesByLang[lang] || {}) };
  };

  const universalAttrs = attributesByLang.universal || {};
  const enAttrs = getAttributesForLang('en');
  const faAttrs = getAttributesForLang('fa');
  const psAttrs = getAttributesForLang('ps');

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

  // Helper to get fallback content for a specific language
  const getFallbackContent = (targetLang: Language) => {
    const name = getLocalizedProductName(product, targetLang);
    const shortDesc = getLocalizedShortDescription(product, targetLang);
    const desc = getLocalizedProductDescription(product, targetLang);
    return { name, shortDesc, desc };
  };

  // Check if content is native (not from fallback)
  const isNativeContent = (targetLang: Language) => {
    if (targetLang === 'en') return !!(product.name_en || product.description_en || product.short_description_en);
    if (targetLang === 'fa') return !!(product.name_fa || product.description_fa || product.short_description_fa);
    if (targetLang === 'ps') return !!(product.name_ps || product.description_ps || product.short_description_ps);
    return false;
  };

  const renderContent = (
    name: string | null | undefined,
    shortDesc: string | null | undefined,
    desc: string | null | undefined,
    langLabel: string,
    direction: 'ltr' | 'rtl' = 'ltr',
    isFallback: boolean = false,
    fallbackLangLabel?: string
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
        {/* Fallback Notice */}
        {isFallback && fallbackLangLabel && (
          <div className="flex items-center gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning-foreground">
            <Info className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">
              {isRTL 
                ? `محتوای ${langLabel} موجود نیست. در حال نمایش محتوای ${fallbackLangLabel}.`
                : `No ${langLabel} content available. Showing ${fallbackLangLabel} content.`}
            </p>
          </div>
        )}

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

  // Get content for each tab with fallback logic
  const getTabContent = (targetLang: Language, langLabel: string, direction: 'ltr' | 'rtl') => {
    const isNative = isNativeContent(targetLang);
    const fallback = getFallbackContent(targetLang);
    
    // Determine fallback language label
    let fallbackLangLabel: string | undefined;
    if (!isNative && (fallback.name || fallback.shortDesc || fallback.desc)) {
      // Figure out which language the fallback is from
      if (targetLang === 'ps') {
        fallbackLangLabel = hasPersian ? (isRTL ? 'فارسی' : 'Persian') : (hasEnglish ? (isRTL ? 'انگلیسی' : 'English') : undefined);
      } else if (targetLang === 'fa') {
        fallbackLangLabel = hasEnglish ? (isRTL ? 'انگلیسی' : 'English') : undefined;
      }
    }

    return renderContent(
      fallback.name || null,
      fallback.shortDesc || null,
      fallback.desc || null,
      langLabel,
      direction,
      !isNative && !!(fallback.name || fallback.shortDesc || fallback.desc),
      fallbackLangLabel
    );
  };

  // Get brand from attributes or metadata
  const brand = universalAttrs.brand || enAttrs.brand || metadata.brand;
  
  // Get warranty info from attributes  
  const hasWarranty = enAttrs.hasWarranty === 'true' || universalAttrs.hasWarranty === 'true' || metadata.hasWarranty;
  const warrantyDuration = enAttrs.warrantyDuration || universalAttrs.warrantyDuration || metadata.warrantyDuration;
  
  // Filter out warranty and brand fields from specs display
  const excludedKeys = ['hasWarranty', 'warrantyDuration', 'brand'];
  
  // Get specs with fallback chain: current language -> fa -> en -> universal
  const getSpecsWithFallback = () => {
    const currentLangAttrs = language === 'fa' ? faAttrs : language === 'ps' ? psAttrs : enAttrs;
    const currentSpecs = Object.entries(currentLangAttrs).filter(
      ([key, value]) => !excludedKeys.includes(key) && value !== undefined && value !== '' && value !== null
    );
    
    // If current language has specs, use them
    if (currentSpecs.length > 0) {
      return currentSpecs;
    }
    
    // Fallback chain for ps: try fa, then en
    if (language === 'ps') {
      const faSpecs = Object.entries(faAttrs).filter(
        ([key, value]) => !excludedKeys.includes(key) && value !== undefined && value !== '' && value !== null
      );
      if (faSpecs.length > 0) return faSpecs;
    }
    
    // Fallback to English for both fa and ps
    if (language === 'fa' || language === 'ps') {
      const enSpecs = Object.entries(enAttrs).filter(
        ([key, value]) => !excludedKeys.includes(key) && value !== undefined && value !== '' && value !== null
      );
      if (enSpecs.length > 0) return enSpecs;
    }
    
    // Final fallback: universal only
    const universalSpecs = Object.entries(universalAttrs).filter(
      ([key, value]) => !excludedKeys.includes(key) && value !== undefined && value !== '' && value !== null
    );
    return universalSpecs;
  };
  
  const otherSpecs = getSpecsWithFallback();
  const hasOtherSpecs = otherSpecs.length > 0;

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
              {getTabContent('en', 'English', 'ltr')}
            </TabsContent>

            <TabsContent value="fa" className="mt-4 border rounded-lg p-4">
              {getTabContent('fa', isRTL ? 'فارسی' : 'Persian', 'rtl')}
            </TabsContent>

            <TabsContent value="ps" className="mt-4 border rounded-lg p-4">
              {getTabContent('ps', isRTL ? 'پښتو' : 'Pashto', 'rtl')}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Brand */}
      {brand && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              {isRTL ? 'برند' : 'Brand'}
            </span>
          </div>
          <p className="text-lg font-semibold">{brand}</p>
        </Card>
      )}

      {/* Technical Specifications */}
      {(hasOtherSpecs || hasWarranty) && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10 border-b pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              {isRTL ? 'مشخصات فنی' : 'Technical Specifications'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className={cn(
              "grid gap-4",
              hasOtherSpecs && hasWarranty ? "md:grid-cols-2" : "grid-cols-1"
            )}>
              {/* Specifications */}
              {hasOtherSpecs && (
                <div className="p-4 rounded-lg border bg-muted/30">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {isRTL ? 'مشخصات' : 'Specifications'}
                  </h4>
                  <div className="space-y-3 text-sm">
                    {otherSpecs.map(([key, value]) => {
                      if (!value) return null;
                      const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                      const isLongValue = String(value).length > 50;
                      return (
                        <div key={key} className={cn(
                          isLongValue ? "flex flex-col gap-1" : "flex gap-2 items-start"
                        )}>
                          <span className={cn(
                            "font-medium capitalize text-muted-foreground shrink-0",
                            !isLongValue && "min-w-[120px]"
                          )}>
                            {formattedKey}:
                          </span>
                          <span className={cn(
                            "font-semibold break-words",
                            isRTL ? "text-start" : "text-start",
                            isLongValue ? "whitespace-pre-wrap" : ""
                          )}>
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Warranty */}
              {hasWarranty && (
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
