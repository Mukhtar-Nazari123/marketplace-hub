
-- Create privacy_policies table with versioning and multilingual support
CREATE TABLE public.privacy_policies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL DEFAULT 'Privacy Policy',
  title_fa TEXT,
  title_ps TEXT,
  slug TEXT NOT NULL,
  content_en TEXT,
  content_fa TEXT,
  content_ps TEXT,
  meta_title_en TEXT,
  meta_title_fa TEXT,
  meta_title_ps TEXT,
  meta_description_en TEXT,
  meta_description_fa TEXT,
  meta_description_ps TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  platform_type TEXT NOT NULL DEFAULT 'both' CHECK (platform_type IN ('web', 'mobile', 'both')),
  policy_type TEXT NOT NULL DEFAULT 'general' CHECK (policy_type IN ('general', 'vendor', 'mobile_app')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_draft BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  updated_by UUID,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create privacy_policy_versions table for version history
CREATE TABLE public.privacy_policy_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_id UUID NOT NULL REFERENCES public.privacy_policies(id) ON DELETE CASCADE,
  title_en TEXT,
  title_fa TEXT,
  title_ps TEXT,
  content_en TEXT,
  content_fa TEXT,
  content_ps TEXT,
  version INTEGER NOT NULL,
  change_summary TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.privacy_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_policy_versions ENABLE ROW LEVEL SECURITY;

-- RLS policies for privacy_policies
CREATE POLICY "Active policies viewable by everyone"
ON public.privacy_policies
FOR SELECT
USING ((is_active = true AND is_draft = false) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage policies"
ON public.privacy_policies
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS policies for privacy_policy_versions
CREATE POLICY "Admins can view versions"
ON public.privacy_policy_versions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage versions"
ON public.privacy_policy_versions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_privacy_policies_updated_at
BEFORE UPDATE ON public.privacy_policies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create unique index for active policy per type/platform
CREATE UNIQUE INDEX idx_active_policy_unique 
ON public.privacy_policies (policy_type, platform_type) 
WHERE (is_active = true AND is_draft = false);
