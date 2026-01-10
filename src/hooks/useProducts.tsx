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
    keywords?: string[];
    [key: string]: unknown;
  } | null;
  category?: {
    id: string;
    name: string;
    slug: string;
    parent_id: string | null;
  } | null;
  seller_verification?: {
    business_name: string | null;
  } | null;
}

interface UseProductsOptions {
  status?: string;
  categoryId?: string;
  categorySlug?: string;
  featured?: boolean;
  limit?: number;
  sellerId?: string;
  search?: string;
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { status = 'active', categoryId, categorySlug, featured, limit, sellerId, search } = options;

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

      // Backend search - search by name (case-insensitive)
      if (search && search.trim().length >= 2) {
        const searchTerm = search.trim();
        // Use ilike for case-insensitive search on name and description
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
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

      // Additional client-side search for brand and keywords in metadata
      if (search && search.trim().length >= 2) {
        const searchLower = search.trim().toLowerCase();
        filteredData = filteredData.filter((p) => {
          // Already matched by name/description from backend, but let's also check metadata
          const metadata = (p.metadata && typeof p.metadata === 'object' && !Array.isArray(p.metadata)) 
            ? p.metadata as Record<string, unknown>
            : {};
          const brand = (typeof metadata.brand === 'string' ? metadata.brand : '').toLowerCase();
          const keywords = Array.isArray(metadata.keywords) 
            ? (metadata.keywords as string[]).map((k) => String(k).toLowerCase())
            : [];
          const categoryName = (p.category?.name || '').toLowerCase();
          
          return (
            p.name.toLowerCase().includes(searchLower) ||
            (p.description || '').toLowerCase().includes(searchLower) ||
            brand.includes(searchLower) ||
            keywords.some((k) => k.includes(searchLower)) ||
            categoryName.includes(searchLower)
          );
        });

        // Sort by relevance: exact name match first, then partial name match, then others
        filteredData.sort((a, b) => {
          const aNameLower = a.name.toLowerCase();
          const bNameLower = b.name.toLowerCase();
          const aExact = aNameLower === searchLower;
          const bExact = bNameLower === searchLower;
          const aStartsWith = aNameLower.startsWith(searchLower);
          const bStartsWith = bNameLower.startsWith(searchLower);
          const aIncludes = aNameLower.includes(searchLower);
          const bIncludes = bNameLower.includes(searchLower);

          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          if (aIncludes && !bIncludes) return -1;
          if (!aIncludes && bIncludes) return 1;
          return 0;
        });
      }

      setProducts(filteredData as DBProduct[]);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [status, categoryId, categorySlug, featured, limit, sellerId, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
};

// Helper to convert DB product to display format
export const formatProductForDisplay = (product: DBProduct, language: 'fa' | 'en' = 'en') => {
  const metadata = product.metadata || {};
  // Read currency from database column first (primary source)
  const currency = product.currency || 'AFN';
  const currencySymbol = currency === 'USD' ? '$' : 'AFN';
  
  // Handle inverted price scenario
  const hasDiscount = product.compare_at_price && product.compare_at_price !== product.price;
  let originalPrice: number | undefined;
  let currentPrice = product.price;
  let discount = 0;

  if (hasDiscount) {
    if (product.compare_at_price! > product.price) {
      originalPrice = product.compare_at_price!;
      currentPrice = product.price;
    } else {
      originalPrice = product.price;
      currentPrice = product.compare_at_price!;
    }
    discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  return {
    id: product.id,
    name: { fa: product.name, en: product.name },
    slug: product.slug,
    price: currentPrice,
    originalPrice,
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
