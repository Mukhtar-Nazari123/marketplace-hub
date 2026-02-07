import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { useBlogs, useRecentBlogs } from '@/hooks/useBlogs';
import PublicLayout from '@/components/layout/PublicLayout';
import BlogCard from '@/components/blog/BlogCard';
import BlogCardSkeleton from '@/components/blog/BlogCardSkeleton';
import BlogSidebar from '@/components/blog/BlogSidebar';
import BlogPagination from '@/components/blog/BlogPagination';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

const Blog = () => {
  const { t, language, isRTL } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get params from URL
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('q') || '';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Fetch blogs with filters
  const { blogs, categories, loading, totalPages } = useBlogs({
    categorySlug,
    searchQuery,
    page: currentPage,
    pageSize: 6,
  });

  // Fetch recent blogs for sidebar
  const { blogs: recentBlogs, loading: recentLoading } = useRecentBlogs(5);

  // Get all unique tags from blogs
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    blogs.forEach(blog => {
      const blogTags = isRTL && blog.tags_fa?.length > 0 ? blog.tags_fa : blog.tags;
      blogTags?.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [blogs, isRTL]);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (localSearch.trim()) {
      params.set('q', localSearch.trim());
    } else {
      params.delete('q');
    }
    params.delete('page');
    setSearchParams(params);
  };

  // Handle category change
  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('page');
    setSearchParams(params);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync local search with URL
  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  return (
    <PublicLayout>
      {/* SEO Meta */}
      <title>{isRTL ? 'وبلاگ - یکتابازار' : 'Blog - YektaBazar'}</title>

      {/* Breadcrumb */}
      <div className="bg-muted/50 py-3">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              {t.pages.home}
            </Link>
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            <span className="text-primary">{t.blog.title}</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-cyan-400 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">{t.blog.title}</h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
            {t.blog.subtitle}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className={`flex flex-col lg:flex-row gap-8 ${isRTL ? 'lg:flex-row-reverse' : ''}`}>
            {/* Main Content */}
            <main className="flex-1">
              {/* Search */}
              <form onSubmit={handleSearch} className="relative mb-8">
                <Search className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} size={20} />
                <Input
                  type="search"
                  placeholder={t.blog.searchPlaceholder}
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className={`${isRTL ? 'pr-10' : 'pl-10'}`}
                />
              </form>

              {/* Active Filters */}
              {(categorySlug || searchQuery) && (
                <div className="mb-6 flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'فیلترها:' : 'Filters:'}
                  </span>
                  {categorySlug && (
                    <button
                      onClick={() => handleCategoryChange(null)}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full hover:bg-primary/20"
                    >
                      {categories.find(c => c.slug === categorySlug)?.name || categorySlug}
                      <span className="ml-1">×</span>
                    </button>
                  )}
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setLocalSearch('');
                        const params = new URLSearchParams(searchParams);
                        params.delete('q');
                        setSearchParams(params);
                      }}
                      className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-3 py-1 rounded-full hover:bg-primary/20"
                    >
                      "{searchQuery}"
                      <span className="ml-1">×</span>
                    </button>
                  )}
                </div>
              )}

              {/* Posts Grid */}
              {loading ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <BlogCardSkeleton key={i} />
                  ))}
                </div>
              ) : blogs.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    {blogs.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                  
                  {/* Pagination */}
                  <BlogPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl text-muted-foreground mb-2">
                    {t.blog.noResults}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL 
                      ? 'هیچ مقاله‌ای با این فیلترها یافت نشد' 
                      : 'No articles found with these filters'}
                  </p>
                </div>
              )}
            </main>

            {/* Sidebar */}
            <BlogSidebar
              categories={categories}
              recentBlogs={recentBlogs}
              selectedCategory={categorySlug}
              onCategorySelect={handleCategoryChange}
              allTags={allTags}
              loading={loading || recentLoading}
            />
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Blog;
