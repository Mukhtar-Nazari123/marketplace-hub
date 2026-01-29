import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface DBProduct {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price_afn: number;
  compare_price_afn: number | null;
  images: string[] | null;
  category_id: string | null;
  subcategory_id: string | null;
  seller_id: string;
  status: string;
  quantity: number;
  is_featured: boolean;
  created_at: string;
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
  subcategory?: {
    id: string;
    name: string;
    slug: string;
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
      // Normalize search term
      const searchTerm = search?.trim() || '';
      const searchLower = searchTerm.toLowerCase();
      const hasSearch = searchTerm.length >= 2;

      // Fetch seller verifications for store name search and mapping
      let sellerMap: Map<string, string> = new Map();
      let matchingSellerIds: string[] = [];
      
      if (hasSearch) {
        const { data: sellerData } = await supabase
          .from('seller_verifications')
          .select('seller_id, business_name')
          .eq('status', 'approved');
        
        if (sellerData) {
          sellerData.forEach(s => {
            if (s.business_name) {
              sellerMap.set(s.seller_id, s.business_name);
              // Check if seller store name matches search
              if (s.business_name.toLowerCase().includes(searchLower)) {
                matchingSellerIds.push(s.seller_id);
              }
            }
          });
        }
      }

      // Use products_with_translations view for multilingual support
      let query = supabase
        .from('products_with_translations')
        .select(`
          *,
          category:categories(id, name, slug, parent_id),
          subcategory:subcategories(id, name, slug)
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

      // Map products with seller names
      let filteredData = (data || []).map(p => ({
        ...p,
        seller_verification: sellerMap.has(p.seller_id) 
          ? { business_name: sellerMap.get(p.seller_id) || null }
          : null
      }));

      // If filtering by category slug, filter after fetch
      if (categorySlug && filteredData.length > 0) {
        filteredData = filteredData.filter(
          (p) => p.category?.slug === categorySlug || p.category?.parent_id === categorySlug
        );
      }

      // Multi-field search filtering
      if (hasSearch) {
        filteredData = filteredData.filter((p) => {
          // Parse metadata safely
          const metadata = (p.metadata && typeof p.metadata === 'object' && !Array.isArray(p.metadata)) 
            ? p.metadata as Record<string, unknown>
            : {};
          
          // Extract searchable fields
          const productName = p.name.toLowerCase();
          const description = (p.description || '').toLowerCase();
          const brand = (typeof metadata.brand === 'string' ? metadata.brand : '').toLowerCase();
          const keywords = Array.isArray(metadata.keywords) 
            ? (metadata.keywords as string[]).map((k) => String(k).toLowerCase())
            : [];
          const categoryName = (p.category?.name || '').toLowerCase();
          const sellerName = (p.seller_verification?.business_name || '').toLowerCase();
          
          // Check all search fields
          const matchesName = productName.includes(searchLower);
          const matchesDescription = description.includes(searchLower);
          const matchesBrand = brand.includes(searchLower);
          const matchesKeywords = keywords.some((k) => k.includes(searchLower));
          const matchesCategory = categoryName.includes(searchLower);
          const matchesSeller = sellerName.includes(searchLower) || matchingSellerIds.includes(p.seller_id);
          
          return matchesName || matchesDescription || matchesBrand || matchesKeywords || matchesCategory || matchesSeller;
        });

        // Relevance ranking - priority: name > brand > keywords > category > seller > description
        filteredData.sort((a, b) => {
          const getScore = (p: typeof a) => {
            const productName = p.name.toLowerCase();
            const metadata = (p.metadata && typeof p.metadata === 'object' && !Array.isArray(p.metadata)) 
              ? p.metadata as Record<string, unknown>
              : {};
            const brand = (typeof metadata.brand === 'string' ? metadata.brand : '').toLowerCase();
            const keywords = Array.isArray(metadata.keywords) 
              ? (metadata.keywords as string[]).map((k) => String(k).toLowerCase())
              : [];
            const categoryName = (p.category?.name || '').toLowerCase();
            
            // Exact name match - highest priority
            if (productName === searchLower) return 100;
            // Name starts with search term
            if (productName.startsWith(searchLower)) return 90;
            // Name contains search term
            if (productName.includes(searchLower)) return 80;
            // Brand matches
            if (brand.includes(searchLower)) return 70;
            // Keywords match
            if (keywords.some((k) => k.includes(searchLower))) return 60;
            // Category matches
            if (categoryName.includes(searchLower)) return 50;
            // Seller matches
            if ((p.seller_verification?.business_name || '').toLowerCase().includes(searchLower)) return 40;
            // Description matches
            return 30;
          };
          
          return getScore(b) - getScore(a);
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
export const formatProductForDisplay = (product: DBProduct, language: 'fa' | 'en' | 'ps' = 'en') => {
  const metadata = product.metadata || {};
  // AFN is now the only stored currency
  const currency = 'AFN';
  const currencySymbol = 'AFN';
  
  // Handle inverted price scenario
  const hasDiscount = product.compare_price_afn && product.compare_price_afn !== product.price_afn;
  let originalPrice: number | undefined;
  let currentPrice = product.price_afn;
  let discount = 0;

  if (hasDiscount) {
    if (product.compare_price_afn! > product.price_afn) {
      originalPrice = product.compare_price_afn!;
      currentPrice = product.price_afn;
    } else {
      originalPrice = product.price_afn;
      currentPrice = product.compare_price_afn!;
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
    subcategory: product.subcategory?.slug || '',
    subcategoryName: product.subcategory?.name || '',
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
