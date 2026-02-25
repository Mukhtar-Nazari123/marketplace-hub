import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 20;

export interface RecentlyViewedItem {
  productId: string;
  viewedAt: number;
}

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  const addProduct = useCallback((productId: string) => {
    setItems(prev => {
      const filtered = prev.filter(item => item.productId !== productId);
      const updated = [{ productId, viewedAt: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearAll = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setItems([]);
  }, []);

  return { items, productIds: items.map(i => i.productId), addProduct, clearAll, count: items.length };
}
