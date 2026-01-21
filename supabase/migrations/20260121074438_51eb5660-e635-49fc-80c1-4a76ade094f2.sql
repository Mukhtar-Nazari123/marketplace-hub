-- Create blog_categories table
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_fa TEXT,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  description_fa TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create blogs table
CREATE TABLE public.blogs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_fa TEXT,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  excerpt_fa TEXT,
  content TEXT,
  content_fa TEXT,
  cover_image_url TEXT,
  author_name TEXT NOT NULL DEFAULT 'Admin',
  author_name_fa TEXT,
  category_id UUID REFERENCES public.blog_categories(id) ON DELETE SET NULL,
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  views_count INTEGER NOT NULL DEFAULT 0,
  meta_title TEXT,
  meta_title_fa TEXT,
  meta_description TEXT,
  meta_description_fa TEXT,
  tags TEXT[] DEFAULT '{}',
  tags_fa TEXT[] DEFAULT '{}',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Blog categories policies
CREATE POLICY "Blog categories are viewable by everyone"
ON public.blog_categories
FOR SELECT
USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage blog categories"
ON public.blog_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Blogs policies
CREATE POLICY "Published blogs are viewable by everyone"
ON public.blogs
FOR SELECT
USING (is_published = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage blogs"
ON public.blogs
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updating updated_at
CREATE TRIGGER update_blog_categories_updated_at
BEFORE UPDATE ON public.blog_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
BEFORE UPDATE ON public.blogs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_blogs_slug ON public.blogs(slug);
CREATE INDEX idx_blogs_category_id ON public.blogs(category_id);
CREATE INDEX idx_blogs_is_published ON public.blogs(is_published);
CREATE INDEX idx_blogs_published_at ON public.blogs(published_at DESC);
CREATE INDEX idx_blog_categories_slug ON public.blog_categories(slug);

-- Function to increment blog views
CREATE OR REPLACE FUNCTION public.increment_blog_views(blog_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.blogs
  SET views_count = views_count + 1
  WHERE id = blog_id;
END;
$$;