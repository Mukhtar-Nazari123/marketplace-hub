import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ProductRating {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

interface RatingsMap {
  [productId: string]: ProductRating;
}

export const useProductRatings = (productIds: string[]) => {
  const [ratings, setRatings] = useState<RatingsMap>({});
  const [loading, setLoading] = useState(true);

  const fetchRatings = useCallback(async () => {
    if (productIds.length === 0) {
      setRatings({});
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('product_id, rating')
        .in('product_id', productIds);

      if (error) throw error;

      // Calculate averages per product
      const ratingsMap: RatingsMap = {};
      
      // Initialize all products with zero ratings
      productIds.forEach(id => {
        ratingsMap[id] = { productId: id, averageRating: 0, reviewCount: 0 };
      });

      // Group reviews by product and calculate averages
      if (data && data.length > 0) {
        const grouped: { [key: string]: number[] } = {};
        
        data.forEach(review => {
          if (!grouped[review.product_id]) {
            grouped[review.product_id] = [];
          }
          grouped[review.product_id].push(review.rating);
        });

        Object.entries(grouped).forEach(([productId, productRatings]) => {
          const sum = productRatings.reduce((a, b) => a + b, 0);
          ratingsMap[productId] = {
            productId,
            averageRating: Math.round((sum / productRatings.length) * 10) / 10,
            reviewCount: productRatings.length,
          };
        });
      }

      setRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching product ratings:', error);
    } finally {
      setLoading(false);
    }
  }, [productIds.join(',')]);

  useEffect(() => {
    fetchRatings();
  }, [fetchRatings]);

  const getRating = (productId: string): ProductRating => {
    return ratings[productId] || { productId, averageRating: 0, reviewCount: 0 };
  };

  return { ratings, loading, getRating, refetch: fetchRatings };
};

// Fetch single product rating
export const useProductRating = (productId: string) => {
  const [rating, setRating] = useState({ averageRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);

  const fetchRating = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('product_id', productId);

      if (error) throw error;

      if (data && data.length > 0) {
        const sum = data.reduce((a, b) => a + b.rating, 0);
        setRating({
          averageRating: Math.round((sum / data.length) * 10) / 10,
          reviewCount: data.length,
        });
      } else {
        setRating({ averageRating: 0, reviewCount: 0 });
      }
    } catch (error) {
      console.error('Error fetching product rating:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchRating();
  }, [fetchRating]);

  return { ...rating, loading, refetch: fetchRating };
};
