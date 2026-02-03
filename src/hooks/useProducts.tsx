import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getLocalizedProductName, getLocalizedProductDescription } from '@/lib/localizedProduct';

export interface DBProduct {
  id: string;
  name: string;
  name_en?: string | null;
  name_fa?: string | null;
  name_ps?: string | null;
  slug: string;
  description: string | null;
  description_en?: string | null;
  description_fa?: string | null;
  description_ps?: string | null;
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
      
      // Fetch product attributes for color/size search
      let productAttributesMap: Map<string, { colors: string[], sizes: string[], tags: string[] }> = new Map();
      
      if (hasSearch) {
        // Fetch sellers
        const { data: sellerData } = await supabase
          .from('seller_verifications')
          .select('seller_id, business_name')
          .eq('status', 'approved');
        
        if (sellerData) {
          sellerData.forEach(s => {
            if (s.business_name) {
              sellerMap.set(s.seller_id, s.business_name);
              if (s.business_name.toLowerCase().includes(searchLower)) {
                matchingSellerIds.push(s.seller_id);
              }
            }
          });
        }

        // Fetch product attributes (color, size, tags)
        const { data: attributesData } = await supabase
          .from('product_attributes')
          .select('product_id, attribute_key, attribute_value')
          .in('attribute_key', ['color', 'size', 'tags', 'material', 'style']);
        
        if (attributesData) {
          attributesData.forEach(attr => {
            if (!productAttributesMap.has(attr.product_id)) {
              productAttributesMap.set(attr.product_id, { colors: [], sizes: [], tags: [] });
            }
            const entry = productAttributesMap.get(attr.product_id)!;
            const key = attr.attribute_key.toLowerCase();
            if (key === 'color') {
              entry.colors.push(attr.attribute_value.toLowerCase());
            } else if (key === 'size') {
              entry.sizes.push(attr.attribute_value.toLowerCase());
            } else {
              entry.tags.push(attr.attribute_value.toLowerCase());
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

      // Map products with seller names and attributes
      let filteredData = (data || []).map(p => ({
        ...p,
        seller_verification: sellerMap.has(p.seller_id) 
          ? { business_name: sellerMap.get(p.seller_id) || null }
          : null,
        _attributes: productAttributesMap.get(p.id) || { colors: [], sizes: [], tags: [] }
      }));

      // If filtering by category slug, filter after fetch
      if (categorySlug && filteredData.length > 0) {
        filteredData = filteredData.filter(
          (p) => p.category?.slug === categorySlug || p.category?.parent_id === categorySlug
        );
      }

      // Multi-field search filtering (SKU, name, category, subcategory, color, size, brand, keywords, seller, description)
      if (hasSearch) {
        filteredData = filteredData.filter((p) => {
          // Parse metadata safely
          const metadata = (p.metadata && typeof p.metadata === 'object' && !Array.isArray(p.metadata)) 
            ? p.metadata as Record<string, unknown>
            : {};
          
          // Extract all searchable fields
          const sku = (p.sku || '').toLowerCase();
          const barcode = (p.barcode || '').toLowerCase();
          const productName = p.name.toLowerCase();
          const description = (p.description || '').toLowerCase();
          const brand = (typeof metadata.brand === 'string' ? metadata.brand : '').toLowerCase();
          const keywords = Array.isArray(metadata.keywords) 
            ? (metadata.keywords as string[]).map((k) => String(k).toLowerCase())
            : [];
          const categoryName = (p.category?.name || '').toLowerCase();
          const subcategoryName = (p.subcategory?.name || '').toLowerCase();
          const sellerName = (p.seller_verification?.business_name || '').toLowerCase();
          
          // Get attributes (color, size, tags)
          const attrs = p._attributes;
          const colors = attrs.colors;
          const sizes = attrs.sizes;
          const tags = attrs.tags;
          
          // Check all search fields
          const matchesSku = sku.includes(searchLower) || barcode.includes(searchLower);
          const matchesName = productName.includes(searchLower);
          const matchesDescription = description.includes(searchLower);
          const matchesBrand = brand.includes(searchLower);
          const matchesKeywords = keywords.some((k) => k.includes(searchLower));
          const matchesCategory = categoryName.includes(searchLower);
          const matchesSubcategory = subcategoryName.includes(searchLower);
          const matchesSeller = sellerName.includes(searchLower) || matchingSellerIds.includes(p.seller_id);
          const matchesColor = colors.some(c => c.includes(searchLower));
          const matchesSize = sizes.some(s => s.includes(searchLower));
          const matchesTags = tags.some(t => t.includes(searchLower));
          
          return matchesSku || matchesName || matchesDescription || matchesBrand || 
                 matchesKeywords || matchesCategory || matchesSubcategory || 
                 matchesSeller || matchesColor || matchesSize || matchesTags;
        });

        // Relevance ranking - priority: SKU > name > brand > color/size > keywords > category/subcategory > seller > description
        filteredData.sort((a, b) => {
          const getScore = (p: typeof a) => {
            const sku = (p.sku || '').toLowerCase();
            const barcode = (p.barcode || '').toLowerCase();
            const productName = p.name.toLowerCase();
            const metadata = (p.metadata && typeof p.metadata === 'object' && !Array.isArray(p.metadata)) 
              ? p.metadata as Record<string, unknown>
              : {};
            const brand = (typeof metadata.brand === 'string' ? metadata.brand : '').toLowerCase();
            const keywords = Array.isArray(metadata.keywords) 
              ? (metadata.keywords as string[]).map((k) => String(k).toLowerCase())
              : [];
            const categoryName = (p.category?.name || '').toLowerCase();
            const subcategoryName = (p.subcategory?.name || '').toLowerCase();
            const attrs = p._attributes;
            
            // Exact SKU match - highest priority
            if (sku === searchLower || barcode === searchLower) return 110;
            // SKU starts with search term
            if (sku.startsWith(searchLower) || barcode.startsWith(searchLower)) return 105;
            // Exact name match
            if (productName === searchLower) return 100;
            // Name starts with search term
            if (productName.startsWith(searchLower)) return 90;
            // Name contains search term
            if (productName.includes(searchLower)) return 80;
            // Brand matches
            if (brand.includes(searchLower)) return 75;
            // Color/Size exact match
            if (attrs.colors.includes(searchLower) || attrs.sizes.includes(searchLower)) return 70;
            // Color/Size partial match
            if (attrs.colors.some(c => c.includes(searchLower)) || attrs.sizes.some(s => s.includes(searchLower))) return 65;
            // Keywords match
            if (keywords.some((k) => k.includes(searchLower))) return 60;
            // Subcategory matches
            if (subcategoryName.includes(searchLower)) return 55;
            // Category matches
            if (categoryName.includes(searchLower)) return 50;
            // Seller matches
            if ((p.seller_verification?.business_name || '').toLowerCase().includes(searchLower)) return 40;
            // Tags match
            if (attrs.tags.some(t => t.includes(searchLower))) return 35;
            // Description matches
            return 30;
          };
          
          return getScore(b) - getScore(a);
        });
      }

      // Remove internal _attributes before setting state
      const cleanedData = filteredData.map(({ _attributes, ...rest }) => rest);
      setProducts(cleanedData as DBProduct[]);
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
    name: getLocalizedProductName(product, language),
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
    description: getLocalizedProductDescription(product, language),
    specifications: [],
  };
};
