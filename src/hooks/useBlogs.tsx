import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface BlogCategory {
  id: string;
  name: string;
  name_fa: string | null;
  slug: string;
  description: string | null;
  description_fa: string | null;
  is_active: boolean;
  sort_order: number;
}

export interface Blog {
  id: string;
  title: string;
  title_fa: string | null;
  slug: string;
  excerpt: string | null;
  excerpt_fa: string | null;
  content: string | null;
  content_fa: string | null;
  cover_image_url: string | null;
  author_name: string;
  author_name_fa: string | null;
  category_id: string | null;
  category?: BlogCategory;
  is_published: boolean;
  is_featured: boolean;
  views_count: number;
  meta_title: string | null;
  meta_title_fa: string | null;
  meta_description: string | null;
  meta_description_fa: string | null;
  tags: string[];
  tags_fa: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface UseBlogsOptions {
  categorySlug?: string | null;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  featured?: boolean;
}

interface UseBlogsReturn {
  blogs: Blog[];
  categories: BlogCategory[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  totalPages: number;
  refetch: () => void;
}

export const useBlogs = (options: UseBlogsOptions = {}): UseBlogsReturn => {
  const { categorySlug, searchQuery, page = 1, pageSize = 6, featured } = options;
  
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching blog categories:', error);
      return [];
    }
    return data || [];
  }, []);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch categories first
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);

      // Build query
      let query = supabase
        .from('blogs')
        .select('*', { count: 'exact' })
        .eq('is_published', true)
        .order('published_at', { ascending: false, nullsFirst: false });

      // Filter by category
      if (categorySlug && categorySlug !== 'all') {
        const category = categoriesData.find(c => c.slug === categorySlug);
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      // Filter by featured
      if (featured) {
        query = query.eq('is_featured', true);
      }

      // Search filter
      if (searchQuery && searchQuery.trim()) {
        const search = searchQuery.trim().toLowerCase();
        query = query.or(`title.ilike.%${search}%,title_fa.ilike.%${search}%,excerpt.ilike.%${search}%,excerpt_fa.ilike.%${search}%`);
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data, error: fetchError, count } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Map categories to blogs
      const blogsWithCategories = (data || []).map(blog => ({
        ...blog,
        category: categoriesData.find(c => c.id === blog.category_id),
      }));

      setBlogs(blogsWithCategories);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching blogs:', err);
      setError('Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [categorySlug, searchQuery, page, pageSize, featured, fetchCategories]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return {
    blogs,
    categories,
    loading,
    error,
    totalCount,
    totalPages: Math.ceil(totalCount / pageSize),
    refetch: fetchBlogs,
  };
};

export const useBlogBySlug = (slug: string) => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch blog
        const { data: blogData, error: blogError } = await supabase
          .from('blogs')
          .select('*')
          .eq('slug', slug)
          .eq('is_published', true)
          .single();

        if (blogError) throw blogError;

        // Fetch category if exists
        let category: BlogCategory | undefined;
        if (blogData.category_id) {
          const { data: categoryData } = await supabase
            .from('blog_categories')
            .select('*')
            .eq('id', blogData.category_id)
            .single();
          category = categoryData || undefined;
        }

        setBlog({ ...blogData, category });

        // Increment view count
        await supabase.rpc('increment_blog_views', { blog_id: blogData.id });
      } catch (err) {
        console.error('Error fetching blog:', err);
        setError('Blog not found');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  return { blog, loading, error };
};

interface RecentBlog {
  id: string;
  title: string;
  title_fa: string | null;
  slug: string;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

export const useRecentBlogs = (limit: number = 5) => {
  const [blogs, setBlogs] = useState<RecentBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('id, title, title_fa, slug, cover_image_url, published_at, created_at')
          .eq('is_published', true)
          .order('published_at', { ascending: false, nullsFirst: false })
          .limit(limit);

        if (error) throw error;
        setBlogs(data || []);
      } catch (err) {
        console.error('Error fetching recent blogs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBlogs();
  }, [limit]);

  return { blogs, loading };
};
