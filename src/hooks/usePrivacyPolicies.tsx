import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface PrivacyPolicy {
  id: string;
  title_en: string;
  title_fa: string | null;
  title_ps: string | null;
  slug: string;
  content_en: string | null;
  content_fa: string | null;
  content_ps: string | null;
  meta_title_en: string | null;
  meta_title_fa: string | null;
  meta_title_ps: string | null;
  meta_description_en: string | null;
  meta_description_fa: string | null;
  meta_description_ps: string | null;
  version: number;
  platform_type: string;
  policy_type: string;
  is_active: boolean;
  is_draft: boolean;
  created_by: string | null;
  updated_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PolicyVersion {
  id: string;
  policy_id: string;
  title_en: string | null;
  title_fa: string | null;
  title_ps: string | null;
  content_en: string | null;
  content_fa: string | null;
  content_ps: string | null;
  version: number;
  change_summary: string | null;
  created_by: string | null;
  created_at: string;
}

export const usePrivacyPolicies = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const policiesQuery = useQuery({
    queryKey: ['privacy-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('privacy_policies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as PrivacyPolicy[];
    },
  });

  // versions query removed - use usePrivacyPolicyVersions instead

  const createPolicy = useMutation({
    mutationFn: async (policy: Partial<PrivacyPolicy>) => {
      const { data, error } = await supabase
        .from('privacy_policies')
        .insert({ ...policy, created_by: user?.id, updated_by: user?.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-policies'] });
      toast.success('Policy created successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updatePolicy = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PrivacyPolicy> & { id: string }) => {
      const { data, error } = await supabase
        .from('privacy_policies')
        .update({ ...updates, updated_by: user?.id } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-policies'] });
      toast.success('Policy updated successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const publishPolicy = useMutation({
    mutationFn: async ({ id, changeSummary }: { id: string; changeSummary?: string }) => {
      // Get current policy
      const { data: current, error: fetchErr } = await supabase
        .from('privacy_policies')
        .select('*')
        .eq('id', id)
        .single();
      if (fetchErr) throw fetchErr;

      // Save version snapshot
      await supabase.from('privacy_policy_versions').insert({
        policy_id: id,
        title_en: current.title_en,
        title_fa: current.title_fa,
        title_ps: current.title_ps,
        content_en: current.content_en,
        content_fa: current.content_fa,
        content_ps: current.content_ps,
        version: current.version,
        change_summary: changeSummary || null,
        created_by: user?.id,
      } as any);

      // Update policy: increment version, set active, clear draft
      const { data, error } = await supabase
        .from('privacy_policies')
        .update({
          is_draft: false,
          is_active: true,
          version: current.version + 1,
          published_at: new Date().toISOString(),
          updated_by: user?.id,
        } as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-policies'] });
      queryClient.invalidateQueries({ queryKey: ['privacy-policy-versions'] });
      toast.success('Policy published successfully');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const rollbackPolicy = useMutation({
    mutationFn: async ({ policyId, versionId }: { policyId: string; versionId: string }) => {
      const { data: version, error: vErr } = await supabase
        .from('privacy_policy_versions')
        .select('*')
        .eq('id', versionId)
        .single();
      if (vErr) throw vErr;

      const { data, error } = await supabase
        .from('privacy_policies')
        .update({
          title_en: version.title_en,
          title_fa: version.title_fa,
          title_ps: version.title_ps,
          content_en: version.content_en,
          content_fa: version.content_fa,
          content_ps: version.content_ps,
          is_draft: true,
          updated_by: user?.id,
        } as any)
        .eq('id', policyId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-policies'] });
      toast.success('Rolled back to previous version');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deletePolicy = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('privacy_policies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['privacy-policies'] });
      toast.success('Policy deleted');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return {
    policies: policiesQuery.data || [],
    isLoading: policiesQuery.isLoading,
    error: policiesQuery.error,
    createPolicy,
    updatePolicy,
    publishPolicy,
    rollbackPolicy,
    deletePolicy,
  };
};

// Public hook for fetching active policy
export const useActivePrivacyPolicy = (policyType = 'general', platform = 'web') => {
  return useQuery({
    queryKey: ['active-privacy-policy', policyType, platform],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('privacy_policies')
        .select('*')
        .eq('policy_type', policyType)
        .eq('is_active', true)
        .eq('is_draft', false)
        .in('platform_type', [platform, 'both'])
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data as PrivacyPolicy | null;
    },
  });
};

// Hook for fetching policy versions (must be called at top level)
export const usePrivacyPolicyVersions = (policyId: string | null) => {
  return useQuery({
    queryKey: ['privacy-policy-versions', policyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('privacy_policy_versions')
        .select('*')
        .eq('policy_id', policyId!)
        .order('version', { ascending: false });
      if (error) throw error;
      return data as PolicyVersion[];
    },
    enabled: !!policyId,
  });
};
