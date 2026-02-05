 import { useState, useEffect } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { useToast } from '@/hooks/use-toast';
 
 export interface DesignedBanner {
   id: string;
   image_url: string;
   cta_link: string | null;
   display_order: number;
   is_active: boolean;
   created_at: string;
   updated_at: string;
 }
 
 export interface DesignedBannerInput {
   image_url: string;
   cta_link?: string | null;
   display_order?: number;
   is_active?: boolean;
 }
 
 export interface BannerSettings {
   id: string;
   banner_type: 'dynamic' | 'designed';
   updated_at: string;
 }
 
 export const useDesignedBanners = (activeOnly: boolean = true) => {
   const [designedBanners, setDesignedBanners] = useState<DesignedBanner[]>([]);
   const [bannerSettings, setBannerSettings] = useState<BannerSettings | null>(null);
   const [loading, setLoading] = useState(true);
   const { toast } = useToast();
 
   const fetchDesignedBanners = async () => {
     try {
       setLoading(true);
       let query = supabase
         .from('designed_hero_banners')
         .select('*')
         .order('display_order', { ascending: true });
 
       if (activeOnly) {
         query = query.eq('is_active', true);
       }
 
       const { data, error } = await query;
 
       if (error) throw error;
       setDesignedBanners(data || []);
     } catch (error: any) {
       console.error('Error fetching designed banners:', error);
     } finally {
       setLoading(false);
     }
   };
 
   const fetchBannerSettings = async () => {
     try {
       const { data, error } = await supabase
         .from('hero_banner_settings')
         .select('*')
         .limit(1)
         .single();
 
       if (error && error.code !== 'PGRST116') throw error;
       setBannerSettings(data as BannerSettings | null);
     } catch (error: any) {
       console.error('Error fetching banner settings:', error);
     }
   };
 
   const createDesignedBanner = async (input: DesignedBannerInput) => {
     try {
       const { data, error } = await supabase
         .from('designed_hero_banners')
         .insert([input])
         .select()
         .single();
 
       if (error) throw error;
       
       await fetchDesignedBanners();
       toast({
         title: 'Success',
         description: 'Designed banner created successfully',
       });
       return data;
     } catch (error: any) {
       console.error('Error creating designed banner:', error);
       toast({
         title: 'Error',
         description: 'Failed to create designed banner',
         variant: 'destructive',
       });
       throw error;
     }
   };
 
   const updateDesignedBanner = async (id: string, input: Partial<DesignedBannerInput>) => {
     try {
       const { data, error } = await supabase
         .from('designed_hero_banners')
         .update(input)
         .eq('id', id)
         .select()
         .single();
 
       if (error) throw error;
       
       await fetchDesignedBanners();
       toast({
         title: 'Success',
         description: 'Designed banner updated successfully',
       });
       return data;
     } catch (error: any) {
       console.error('Error updating designed banner:', error);
       toast({
         title: 'Error',
         description: 'Failed to update designed banner',
         variant: 'destructive',
       });
       throw error;
     }
   };
 
   const deleteDesignedBanner = async (id: string) => {
     try {
       const { error } = await supabase
         .from('designed_hero_banners')
         .delete()
         .eq('id', id);
 
       if (error) throw error;
       
       await fetchDesignedBanners();
       toast({
         title: 'Success',
         description: 'Designed banner deleted successfully',
       });
     } catch (error: any) {
       console.error('Error deleting designed banner:', error);
       toast({
         title: 'Error',
         description: 'Failed to delete designed banner',
         variant: 'destructive',
       });
       throw error;
     }
   };
 
   const toggleDesignedBanner = async (id: string, isActive: boolean) => {
     return updateDesignedBanner(id, { is_active: isActive });
   };
 
   const updateBannerType = async (bannerType: 'dynamic' | 'designed') => {
     try {
       if (bannerSettings) {
         const { error } = await supabase
           .from('hero_banner_settings')
           .update({ banner_type: bannerType })
           .eq('id', bannerSettings.id);
 
         if (error) throw error;
       } else {
         const { error } = await supabase
           .from('hero_banner_settings')
           .insert([{ banner_type: bannerType }]);
 
         if (error) throw error;
       }
       
       await fetchBannerSettings();
       toast({
         title: 'Success',
         description: `Banner type changed to ${bannerType}`,
       });
     } catch (error: any) {
       console.error('Error updating banner type:', error);
       toast({
         title: 'Error',
         description: 'Failed to update banner type',
         variant: 'destructive',
       });
       throw error;
     }
   };
 
   useEffect(() => {
     fetchDesignedBanners();
     fetchBannerSettings();
   }, [activeOnly]);
 
   return {
     designedBanners,
     bannerSettings,
     loading,
     fetchDesignedBanners,
     fetchBannerSettings,
     createDesignedBanner,
     updateDesignedBanner,
     deleteDesignedBanner,
     toggleDesignedBanner,
     updateBannerType,
   };
 };