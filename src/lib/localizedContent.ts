import { Language } from './i18n';

/**
 * Get localized content with fallback chain: requested language -> fa (for ps) -> en
 * This utility provides a consistent way to retrieve localized content from database records
 * that have language-specific fields like name, name_fa, name_ps, etc.
 */
export const getLocalizedField = <T extends Record<string, unknown>>(
  item: T,
  fieldName: string,
  language: Language
): string => {
  if (!item) return '';
  
  // Get the language-specific field name
  const localizedFieldName = language === 'en' ? fieldName : `${fieldName}_${language}`;
  
  // Try to get the localized value
  const localizedValue = item[localizedFieldName] as string | null | undefined;
  
  if (localizedValue) {
    return localizedValue;
  }
  
  // Fallback chain for Pashto: ps -> fa -> en (base field)
  if (language === 'ps') {
    const faValue = item[`${fieldName}_fa`] as string | null | undefined;
    if (faValue) return faValue;
  }
  
  // Fallback to English (base field)
  return (item[fieldName] as string) || '';
};

/**
 * Get localized category name
 */
export const getCategoryName = (
  category: { name: string; name_fa?: string | null; name_ps?: string | null },
  language: Language
): string => {
  if (language === 'ps') {
    return category.name_ps || category.name_fa || category.name;
  }
  if (language === 'fa') {
    return category.name_fa || category.name;
  }
  return category.name;
};

/**
 * Get localized subcategory name
 */
export const getSubcategoryName = (
  subcategory: { name: string; name_fa?: string | null; name_ps?: string | null },
  language: Language
): string => {
  if (language === 'ps') {
    return subcategory.name_ps || subcategory.name_fa || subcategory.name;
  }
  if (language === 'fa') {
    return subcategory.name_fa || subcategory.name;
  }
  return subcategory.name;
};

/**
 * Get localized banner/content title
 */
export const getLocalizedTitle = (
  item: { title?: string; title_en?: string; title_fa?: string | null; title_ps?: string | null },
  language: Language
): string => {
  if (language === 'ps') {
    return item.title_ps || item.title_fa || item.title || item.title_en || '';
  }
  if (language === 'fa') {
    return item.title_fa || item.title || item.title_en || '';
  }
  return item.title_en || item.title || '';
};

/**
 * Get localized description/subtitle
 */
export const getLocalizedDescription = (
  item: { 
    description?: string; 
    description_en?: string; 
    description_fa?: string | null; 
    description_ps?: string | null;
    subtitle?: string;
    subtitle_en?: string;
    subtitle_fa?: string | null;
    subtitle_ps?: string | null;
  },
  language: Language,
  fieldType: 'description' | 'subtitle' = 'description'
): string => {
  if (fieldType === 'subtitle') {
    if (language === 'ps') {
      return item.subtitle_ps || item.subtitle_fa || item.subtitle || item.subtitle_en || '';
    }
    if (language === 'fa') {
      return item.subtitle_fa || item.subtitle || item.subtitle_en || '';
    }
    return item.subtitle_en || item.subtitle || '';
  }
  
  if (language === 'ps') {
    return item.description_ps || item.description_fa || item.description || item.description_en || '';
  }
  if (language === 'fa') {
    return item.description_fa || item.description || item.description_en || '';
  }
  return item.description_en || item.description || '';
};

/**
 * Get localized button text
 */
export const getLocalizedButtonText = (
  item: { 
    button_text?: string;
    button_text_en?: string; 
    button_text_fa?: string | null; 
    button_text_ps?: string | null;
    cta_text?: string;
    cta_text_fa?: string | null;
    cta_text_ps?: string | null;
  },
  language: Language,
  defaultText: string = ''
): string => {
  // Check cta_text fields first (for hero banners)
  if (item.cta_text !== undefined || item.cta_text_fa !== undefined || item.cta_text_ps !== undefined) {
    if (language === 'ps') {
      return item.cta_text_ps || item.cta_text_fa || item.cta_text || defaultText;
    }
    if (language === 'fa') {
      return item.cta_text_fa || item.cta_text || defaultText;
    }
    return item.cta_text || defaultText;
  }
  
  // Check button_text fields (for home banners)
  if (language === 'ps') {
    return item.button_text_ps || item.button_text_fa || item.button_text || item.button_text_en || defaultText;
  }
  if (language === 'fa') {
    return item.button_text_fa || item.button_text || item.button_text_en || defaultText;
  }
  return item.button_text_en || item.button_text || defaultText;
};

/**
 * Get localized blog content
 */
export const getLocalizedBlogContent = (
  blog: {
    title: string;
    title_fa?: string | null;
    title_ps?: string | null;
    content?: string | null;
    content_fa?: string | null;
    content_ps?: string | null;
    excerpt?: string | null;
    excerpt_fa?: string | null;
    excerpt_ps?: string | null;
    author_name: string;
    author_name_fa?: string | null;
    author_name_ps?: string | null;
  },
  language: Language
): { title: string; content: string; excerpt: string; authorName: string } => {
  let title: string, content: string, excerpt: string, authorName: string;
  
  if (language === 'ps') {
    title = blog.title_ps || blog.title_fa || blog.title;
    content = blog.content_ps || blog.content_fa || blog.content || '';
    excerpt = blog.excerpt_ps || blog.excerpt_fa || blog.excerpt || '';
    authorName = blog.author_name_ps || blog.author_name_fa || blog.author_name;
  } else if (language === 'fa') {
    title = blog.title_fa || blog.title;
    content = blog.content_fa || blog.content || '';
    excerpt = blog.excerpt_fa || blog.excerpt || '';
    authorName = blog.author_name_fa || blog.author_name;
  } else {
    title = blog.title;
    content = blog.content || '';
    excerpt = blog.excerpt || '';
    authorName = blog.author_name;
  }
  
  return { title, content, excerpt, authorName };
};
