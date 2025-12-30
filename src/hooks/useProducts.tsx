import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  images: string[] | null;
  category_id: string | null;
  seller_id: string;
  status: string;
  quantity: number;
  is_featured: boolean;
  created_at: string;
  currency: string;
  metadata: {
    brand?: string;
    [key: string]: unknown;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
  } | null;
}

interface UseProductsOptions {
  status?: string;
  categoryId?: string;
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
  sellerId?: string;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status = 'active', categoryId, categorySlug, featured, limit, sellerId } = options;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(id, name, slug, parent_id)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      if (featured) {
        query = query.eq('is_featured', true);
      }

      if (sellerId) {
        query = query.eq('seller_id', sellerId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // If filtering by category slug, we need to filter after fetch
      let filteredData = data || [];
      if (categorySlug && filteredData.length > 0) {
        filteredData = filteredData.filter(
          (p) => p.category?.slug === categorySlug || p.category?.parent_id === categorySlug
        );
      }

      setProducts(filteredData as DBProduct[]);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [status, categoryId, categorySlug, featured, limit, sellerId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

// Helper to convert DB product to display format
export const formatProductForDisplay = (product: DBProduct, language: 'fa' | 'en' = 'en') => {
  const metadata = product.metadata || {};
  const currency = product.currency || 'AFN';
  const currencySymbol = currency === 'USD' ? '$' : 'AFN';
  
  // Calculate discount percentage (absolute value to handle both directions)
  const discount = product.compare_at_price && product.compare_at_price !== product.price
    ? Math.abs(Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100))
    : 0;

  return {
    id: product.id,
    name: { fa: product.name, en: product.name },
    slug: product.slug,
    price: product.price,
    originalPrice: product.compare_at_price || undefined,
    images: product.images || ['/placeholder.svg'],
    category: product.category?.slug || '',
    categoryName: product.category?.name || '',
    brand: metadata.brand || '',
    rating: 0,
    reviewCount: 0,
    inStock: product.quantity > 0,
    isNew: new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    isHot: product.is_featured,
    discount,
    currency,
    currencySymbol,
    seller: {
      id: product.seller_id,
      name: '',
      rating: 0,
      productCount: 0,
      avatar: '',
    },
    description: { fa: product.description || '', en: product.description || '' },
    specifications: [],
  };
};
