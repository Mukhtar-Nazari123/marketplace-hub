import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type TranslationLanguage = 'en' | 'fa' | 'ps';

export interface ProductTranslation {
  id: string;
  product_id: string;
  language: TranslationLanguage;
  name: string | null;
  description: string | null;
  short_description: string | null;
  specifications: Record<string, string> | null;
  meta_title: string | null;
  meta_description: string | null;
  is_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface TranslationCoverage {
  product_id: string;
  product_name: string;
  en: boolean;
  fa: boolean;
  ps: boolean;
  en_complete: boolean;
  fa_complete: boolean;
  ps_complete: boolean;
}

export function useProductTranslations(productId?: string) {
  const queryClient = useQueryClient();

  // Fetch translations for a single product
  const { data: translations, isLoading, error } = useQuery({
    queryKey: ['product-translations', productId],
    queryFn: async () => {
      if (!productId) return [];
      
      const { data, error } = await supabase
        .from('product_translations')
        .select('*')
        .eq('product_id', productId);

      if (error) throw error;
      return data as ProductTranslation[];
    },
    enabled: !!productId,
  });

  // Get translation for a specific language
  const getTranslation = (language: TranslationLanguage): ProductTranslation | undefined => {
    return translations?.find(t => t.language === language);
  };

  // Save or update translation
  const saveMutation = useMutation({
    mutationFn: async ({
      productId,
      language,
      data,
    }: {
      productId: string;
      language: TranslationLanguage;
      data: Partial<ProductTranslation>;
    }) => {
      // Check if translation exists
      const { data: existing } = await supabase
        .from('product_translations')
        .select('id')
        .eq('product_id', productId)
        .eq('language', language)
        .maybeSingle();

      if (existing) {
        // Update
        const { error } = await supabase
          .from('product_translations')
          .update({
            name: data.name,
            description: data.description,
            short_description: data.short_description,
            specifications: data.specifications,
            meta_title: data.meta_title,
            meta_description: data.meta_description,
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('product_translations')
          .insert({
            product_id: productId,
            language,
            name: data.name,
            description: data.description,
            short_description: data.short_description,
            specifications: data.specifications,
            meta_title: data.meta_title,
            meta_description: data.meta_description,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-translations', productId] });
      queryClient.invalidateQueries({ queryKey: ['translation-coverage'] });
    },
  });

  // Delete translation
  const deleteMutation = useMutation({
    mutationFn: async ({
      productId,
      language,
    }: {
      productId: string;
      language: TranslationLanguage;
    }) => {
      const { error } = await supabase
        .from('product_translations')
        .delete()
        .eq('product_id', productId)
        .eq('language', language);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-translations', productId] });
      queryClient.invalidateQueries({ queryKey: ['translation-coverage'] });
    },
  });

  return {
    translations,
    isLoading,
    error,
    getTranslation,
    saveTranslation: saveMutation.mutate,
    deleteTranslation: deleteMutation.mutate,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

// Hook for translation coverage dashboard
export function useTranslationCoverage() {
  const { user } = useAuth();

  const { data: coverage, isLoading, error, refetch } = useQuery({
    queryKey: ['translation-coverage', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get all products for the seller with translations
      const { data: products, error: productsError } = await supabase
        .from('products_with_translations')
        .select('id, name')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Get all translations
      const productIds = products.map(p => p.id);
      const { data: translations, error: transError } = await supabase
        .from('product_translations')
        .select('product_id, language, is_complete')
        .in('product_id', productIds);

      if (transError) throw transError;

      // Build coverage map
      const coverageMap: TranslationCoverage[] = products.map(product => {
        const productTrans = translations.filter(t => t.product_id === product.id);
        
        const enTrans = productTrans.find(t => t.language === 'en');
        const faTrans = productTrans.find(t => t.language === 'fa');
        const psTrans = productTrans.find(t => t.language === 'ps');

        return {
          product_id: product.id,
          product_name: product.name,
          en: !!enTrans,
          fa: !!faTrans,
          ps: !!psTrans,
          en_complete: enTrans?.is_complete || false,
          fa_complete: faTrans?.is_complete || false,
          ps_complete: psTrans?.is_complete || false,
        };
      });

      return coverageMap;
    },
    enabled: !!user?.id,
  });

  // Calculate summary statistics
  const stats = {
    totalProducts: coverage?.length || 0,
    enComplete: coverage?.filter(c => c.en_complete).length || 0,
    faComplete: coverage?.filter(c => c.fa_complete).length || 0,
    psComplete: coverage?.filter(c => c.ps_complete).length || 0,
    enMissing: coverage?.filter(c => !c.en).length || 0,
    faMissing: coverage?.filter(c => !c.fa).length || 0,
    psMissing: coverage?.filter(c => !c.ps).length || 0,
  };

  return {
    coverage,
    stats,
    isLoading,
    error,
    refetch,
  };
}
