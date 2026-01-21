import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { BlogCategory } from '@/hooks/useBlogs';

interface RecentBlogItem {
  id: string;
  title: string;
  title_fa: string | null;
  slug: string;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

interface BlogSidebarProps {
  categories: BlogCategory[];
  recentBlogs: RecentBlogItem[];
  selectedCategory: string | null;
  onCategorySelect: (slug: string | null) => void;
  allTags: string[];
  loading?: boolean;
}

const BlogSidebar = ({
  categories,
  recentBlogs,
  selectedCategory,
  onCategorySelect,
  allTags,
  loading = false,
}: BlogSidebarProps) => {
  const { t, isRTL } = useLanguage();

  const getLocalizedName = (item: { name: string; name_fa?: string | null }) => {
    return isRTL && item.name_fa ? item.name_fa : item.name;
  };

  const getLocalizedTitle = (blog: RecentBlogItem) => {
    return isRTL && blog.title_fa ? blog.title_fa : blog.title;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'fa-IR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (loading) {
    return (
      <aside className="w-full lg:w-80 space-y-6">
        {/* Categories Skeleton */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <Skeleton className="h-6 w-24 mb-4" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>

        {/* Recent Posts Skeleton */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-full lg:w-80 space-y-6">
      {/* Categories */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <h3 className="font-bold text-foreground mb-4">{t.blog.categories}</h3>
        <div className="space-y-2">
          <button
            className={`block w-full ${isRTL ? 'text-right' : 'text-left'} p-2 rounded-lg transition-colors ${
              !selectedCategory ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
            }`}
            onClick={() => onCategorySelect(null)}
          >
            {isRTL ? 'همه' : 'All'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`block w-full ${isRTL ? 'text-right' : 'text-left'} p-2 rounded-lg transition-colors ${
                selectedCategory === cat.slug ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'
              }`}
              onClick={() => onCategorySelect(cat.slug)}
            >
              {getLocalizedName(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Posts */}
      {recentBlogs.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="font-bold text-foreground mb-4">{t.blog.recentPosts}</h3>
          <div className="space-y-4">
            {recentBlogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.slug}`}
                className="flex gap-3 group"
              >
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  {blog.cover_image_url ? (
                    <img
                      src={blog.cover_image_url}
                      alt={getLocalizedTitle(blog)}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      📝
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm">
                    {getLocalizedTitle(blog)}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(blog.published_at || blog.created_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tags */}
      {allTags.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <h3 className="font-bold text-foreground mb-4">{t.blog.tags}</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag, index) => (
              <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary/10">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default BlogSidebar;
