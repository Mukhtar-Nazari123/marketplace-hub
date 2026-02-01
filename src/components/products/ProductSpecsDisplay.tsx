import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useLanguage, Language } from '@/lib/i18n';
import { Tag, Settings, ShieldCheck } from 'lucide-react';

interface ProductAttribute {
  attribute_key: string;
  attribute_value: string;
  language_code: string | null;
}

interface ProductMetadata {
  brand?: string;
  hasWarranty?: boolean;
  warrantyDuration?: string;
  stockPerSize?: Record<string, number>;
}

interface ProductSpecsDisplayProps {
  metadata?: ProductMetadata | Record<string, unknown> | null;
  attributes?: ProductAttribute[];
  className?: string;
}

export const ProductSpecsDisplay = ({ metadata, attributes = [], className }: ProductSpecsDisplayProps) => {
  const { isRTL, language } = useLanguage();
  
  const meta = (metadata || {}) as ProductMetadata;

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

  // Get brand from attributes or metadata
  const brand = universalAttrs.brand || enAttrs.brand || meta.brand;
  
  // Get warranty info from attributes  
  const hasWarranty = enAttrs.hasWarranty === 'true' || universalAttrs.hasWarranty === 'true' || meta.hasWarranty;
  const warrantyDuration = enAttrs.warrantyDuration || universalAttrs.warrantyDuration || meta.warrantyDuration;
  
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

  // Don't render anything if no content
  if (!brand && !hasOtherSpecs && !hasWarranty && (!meta.stockPerSize || Object.keys(meta.stockPerSize).length === 0)) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
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
            <div className="flex flex-col gap-4">
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
      {meta.stockPerSize && Object.keys(meta.stockPerSize).length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            {isRTL ? 'موجودی بر اساس سایز' : 'Stock per Size'}
          </h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(meta.stockPerSize).map(([size, qty]) => (
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
