import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface AboutSection {
  id: string;
  section_key: string;
  title_en: string;
  title_fa: string | null;
  description_en: string | null;
  description_fa: string | null;
  content_en: string | null;
  content_fa: string | null;
  icon: string | null;
  start_year: number | null;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface AboutValue {
  id: string;
  title_en: string;
  title_fa: string | null;
  description_en: string | null;
  description_fa: string | null;
  icon: string;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutTeamMember {
  id: string;
  name_en: string;
  name_fa: string | null;
  role_en: string;
  role_fa: string | null;
  description_en: string | null;
  description_fa: string | null;
  photo_url: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AboutAward {
  id: string;
  title_en: string;
  title_fa: string | null;
  description_en: string | null;
  description_fa: string | null;
  year: number | null;
  icon_or_image: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Fetch hooks for public page
export const useAboutSections = () => {
  return useQuery({
    queryKey: ['about-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_sections')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as AboutSection[];
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

export const useAboutValues = () => {
  return useQuery({
    queryKey: ['about-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_values')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as AboutValue[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAboutTeamMembers = () => {
  return useQuery({
    queryKey: ['about-team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_team_members')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as AboutTeamMember[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useAboutAwards = () => {
  return useQuery({
    queryKey: ['about-awards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_awards')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as AboutAward[];
    },
    staleTime: 5 * 60 * 1000,
  });
};

// Admin hooks - fetch all including inactive
export const useAdminAboutSections = () => {
  return useQuery({
    queryKey: ['admin-about-sections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_sections')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as AboutSection[];
    },
  });
};

export const useAdminAboutValues = () => {
  return useQuery({
    queryKey: ['admin-about-values'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_values')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as AboutValue[];
    },
  });
};

export const useAdminAboutTeamMembers = () => {
  return useQuery({
    queryKey: ['admin-about-team-members'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_team_members')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as AboutTeamMember[];
    },
  });
};

export const useAdminAboutAwards = () => {
  return useQuery({
    queryKey: ['admin-about-awards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_awards')
        .select('*')
        .order('priority', { ascending: true });
      
      if (error) throw error;
      return data as AboutAward[];
    },
  });
};

// Mutation hooks
export const useUpdateAboutSection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AboutSection> & { id: string }) => {
      const { error } = await supabase
        .from('about_sections')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-sections'] });
      queryClient.invalidateQueries({ queryKey: ['about-sections'] });
    },
  });
};

export const useCreateAboutValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<AboutValue, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('about_values')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-values'] });
      queryClient.invalidateQueries({ queryKey: ['about-values'] });
    },
  });
};

export const useUpdateAboutValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AboutValue> & { id: string }) => {
      const { error } = await supabase
        .from('about_values')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-values'] });
      queryClient.invalidateQueries({ queryKey: ['about-values'] });
    },
  });
};

export const useDeleteAboutValue = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('about_values')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-values'] });
      queryClient.invalidateQueries({ queryKey: ['about-values'] });
    },
  });
};

export const useCreateAboutTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<AboutTeamMember, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('about_team_members')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['about-team-members'] });
    },
  });
};

export const useUpdateAboutTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AboutTeamMember> & { id: string }) => {
      const { error } = await supabase
        .from('about_team_members')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['about-team-members'] });
    },
  });
};

export const useDeleteAboutTeamMember = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('about_team_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-team-members'] });
      queryClient.invalidateQueries({ queryKey: ['about-team-members'] });
    },
  });
};

export const useCreateAboutAward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Omit<AboutAward, 'id' | 'created_at' | 'updated_at'>) => {
      const { error } = await supabase
        .from('about_awards')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-awards'] });
      queryClient.invalidateQueries({ queryKey: ['about-awards'] });
    },
  });
};

export const useUpdateAboutAward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<AboutAward> & { id: string }) => {
      const { error } = await supabase
        .from('about_awards')
        .update(data)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-awards'] });
      queryClient.invalidateQueries({ queryKey: ['about-awards'] });
    },
  });
};

export const useDeleteAboutAward = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('about_awards')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-about-awards'] });
      queryClient.invalidateQueries({ queryKey: ['about-awards'] });
    },
  });
};
