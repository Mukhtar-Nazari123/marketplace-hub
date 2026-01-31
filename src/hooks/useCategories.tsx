import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage, Language } from '@/lib/i18n';

// Raw database types (before localization)
interface RawSubcategory {
  id: string;
  name: string;
  name_fa: string | null;
  name_ps: string | null;
  slug: string;
  description: string | null;
  image_url: string | null;
  category_id: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

interface RawCategory {
  id: string;
  name: string;
  name_fa: string | null;
  name_ps: string | null;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

// Localized types (returned to components - ready to render)
export interface Subcategory {
  id: string;
  name: string; // Already localized based on active language
  slug: string;
  description: string | null;
  image_url: string | null;
  category_id: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface Category {
  id: string;
  name: string; // Already localized based on active language
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  subcategories?: Subcategory[];
}

interface CategoriesContextType {
  categories: Category[];
  subcategories: Subcategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getSubcategoryBySlug: (slug: string) => Subcategory | undefined;
  getSubcategories: (categoryId: string) => Subcategory[];
  getRootCategories: () => Category[];
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

// Helper function to resolve localized name with fallback chain: ps -> fa -> en
const resolveLocalizedName = (
  item: { name: string; name_fa: string | null; name_ps: string | null },
  language: Language
): string => {
  if (language === 'ps') {
    return item.name_ps || item.name_fa || item.name;
  }
  if (language === 'fa') {
    return item.name_fa || item.name;
  }
  return item.name;
};

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [rawCategories, setRawCategories] = useState<RawCategory[]>([]);
  const [rawSubcategories, setRawSubcategories] = useState<RawSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch categories and subcategories in parallel
      const [categoriesResult, subcategoriesResult] = await Promise.all([
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .is('parent_id', null)
          .order('sort_order', { ascending: true }),
        supabase
          .from('subcategories')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
      ]);

      if (categoriesResult.error) throw categoriesResult.error;
      if (subcategoriesResult.error) throw subcategoriesResult.error;

      setRawCategories((categoriesResult.data || []) as RawCategory[]);
      setRawSubcategories((subcategoriesResult.data || []) as RawSubcategory[]);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Memoized localized data - transforms raw data based on current language
  const { categories, subcategories } = useMemo(() => {
    // Transform subcategories with localized names
    const localizedSubcategories: Subcategory[] = rawSubcategories.map((sub) => ({
      id: sub.id,
      name: resolveLocalizedName(sub, language),
      slug: sub.slug,
      description: sub.description,
      image_url: sub.image_url,
      category_id: sub.category_id,
      is_active: sub.is_active,
      sort_order: sub.sort_order,
      created_at: sub.created_at,
    }));

    // Group subcategories by category_id
    const subsByCategory = new Map<string, Subcategory[]>();
    localizedSubcategories.forEach((sub) => {
      const existing = subsByCategory.get(sub.category_id) || [];
      existing.push(sub);
      subsByCategory.set(sub.category_id, existing);
    });

    // Transform categories with localized names and attach subcategories
    const localizedCategories: Category[] = rawCategories.map((cat) => ({
      id: cat.id,
      name: resolveLocalizedName(cat, language),
      slug: cat.slug,
      description: cat.description,
      image_url: cat.image_url,
      parent_id: cat.parent_id,
      is_active: cat.is_active,
      sort_order: cat.sort_order,
      created_at: cat.created_at,
      subcategories: subsByCategory.get(cat.id) || [],
    }));

    return { categories: localizedCategories, subcategories: localizedSubcategories };
  }, [rawCategories, rawSubcategories, language]);

  const getCategoryBySlug = (slug: string) => {
    return categories.find(cat => cat.slug === slug);
  };

  const getSubcategoryBySlug = (slug: string) => {
    return subcategories.find(sub => sub.slug === slug);
  };

  const getSubcategories = (categoryId: string) => {
    return subcategories.filter(sub => sub.category_id === categoryId);
  };

  const getRootCategories = () => {
    return categories;
  };

  return (
    <CategoriesContext.Provider value={{
      categories,
      subcategories,
      loading,
      error,
      refetch: fetchCategories,
      getCategoryBySlug,
      getSubcategoryBySlug,
      getSubcategories,
      getRootCategories,
    }}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
};
