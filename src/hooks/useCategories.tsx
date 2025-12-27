import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  subcategories?: Category[];
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getCategoryBySlug: (slug: string) => Category | undefined;
  getSubcategories: (parentId: string) => Category[];
  getRootCategories: () => Category[];
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (fetchError) throw fetchError;

      // Build hierarchy
      const rootCategories: Category[] = [];
      const childrenMap = new Map<string, Category[]>();

      (data || []).forEach((cat) => {
        if (cat.parent_id) {
          const children = childrenMap.get(cat.parent_id) || [];
          children.push(cat);
          childrenMap.set(cat.parent_id, children);
        } else {
          rootCategories.push(cat);
        }
      });

      // Attach subcategories to root categories
      rootCategories.forEach((cat) => {
        cat.subcategories = childrenMap.get(cat.id) || [];
      });

      setCategories(data || []);
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

  const getSubcategories = (parentId: string) => {
    return categories.filter(cat => cat.parent_id === parentId);
  };

  const getRootCategories = () => {
    const rootCats = categories.filter(cat => !cat.parent_id);
    // Attach subcategories
    return rootCats.map(cat => ({
      ...cat,
      subcategories: categories.filter(c => c.parent_id === cat.id)
    }));
  };

  return (
    <CategoriesContext.Provider value={{
      categories,
      loading,
      error,
      refetch: fetchCategories,
      getCategoryBySlug,
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
