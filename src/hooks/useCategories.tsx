import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Subcategory {
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

export interface Category {
  id: string;
  name: string;
  name_fa?: string | null;
  name_ps?: string | null;
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

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const cats = (categoriesResult.data || []) as Category[];
      const subs = (subcategoriesResult.data || []) as Subcategory[];

      // Map subcategories to their parent categories
      const subsByCategory = new Map<string, Subcategory[]>();
      subs.forEach((sub) => {
        const existing = subsByCategory.get(sub.category_id) || [];
        existing.push(sub);
        subsByCategory.set(sub.category_id, existing);
      });

      // Attach subcategories to categories
      cats.forEach((cat) => {
        cat.subcategories = subsByCategory.get(cat.id) || [];
      });

      setCategories(cats);
      setSubcategories(subs);
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
