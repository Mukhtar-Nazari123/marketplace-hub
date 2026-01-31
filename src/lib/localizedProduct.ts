import { Language } from './i18n';

/**
 * Product data from products_with_translations view
 */
export interface LocalizableProduct {
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

/**
 * Resolve localized product name with fallback chain: requested -> fa (for ps) -> en
 */
export const getLocalizedProductName = <T extends LocalizableProduct>(
  product: T | null | undefined,
  language: Language
): string => {
  if (!product) return '';

  if (language === 'ps') {
    return product.name_ps || product.name_fa || product.name_en || product.name || '';
  }
  if (language === 'fa') {
    return product.name_fa || product.name_en || product.name || '';
  }
  // English (default)
  return product.name_en || product.name || '';
};

/**
 * Resolve localized product description with fallback chain
 */
export const getLocalizedProductDescription = <T extends LocalizableProduct>(
  product: T | null | undefined,
  language: Language
): string => {
  if (!product) return '';

  if (language === 'ps') {
    return product.description_ps || product.description_fa || product.description_en || product.description || '';
  }
  if (language === 'fa') {
    return product.description_fa || product.description_en || product.description || '';
  }
  // English (default)
  return product.description_en || product.description || '';
};

/**
 * Resolve localized short description with fallback chain
 */
export const getLocalizedShortDescription = <T extends LocalizableProduct>(
  product: T | null | undefined,
  language: Language
): string => {
  if (!product) return '';

  if (language === 'ps') {
    return product.short_description_ps || product.short_description_fa || product.short_description_en || '';
  }
  if (language === 'fa') {
    return product.short_description_fa || product.short_description_en || '';
  }
  // English (default)
  return product.short_description_en || '';
};
