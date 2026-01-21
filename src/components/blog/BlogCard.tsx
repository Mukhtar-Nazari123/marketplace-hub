import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import type { Blog } from '@/hooks/useBlogs';

interface BlogCardProps {
  blog: Blog;
}

const BlogCard = ({ blog }: BlogCardProps) => {
  const { language, isRTL, t } = useLanguage();

  const title = isRTL && blog.title_fa ? blog.title_fa : blog.title;
  const excerpt = isRTL && blog.excerpt_fa ? blog.excerpt_fa : blog.excerpt;
  const authorName = isRTL && blog.author_name_fa ? blog.author_name_fa : blog.author_name;
  const categoryName = blog.category 
    ? (isRTL && blog.category.name_fa ? blog.category.name_fa : blog.category.name)
    : null;
  const tags = isRTL && blog.tags_fa?.length > 0 ? blog.tags_fa : blog.tags;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(isRTL ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatNumber = (num: number) => {
    return isRTL 
      ? num.toLocaleString('fa-IR')
      : num.toLocaleString('en-US');
  };

  return (
    <article className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-lg transition-shadow group">
      <Link to={`/blog/${blog.slug}`}>
        <div className="aspect-video overflow-hidden bg-muted">
          {blog.cover_image_url ? (
            <img
              src={blog.cover_image_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <span className="text-4xl">📝</span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-6">
        {/* Meta info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {formatDate(blog.published_at || blog.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <User size={14} />
            {authorName}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {formatNumber(blog.views_count)}
          </span>
        </div>

        {/* Category badge */}
        {categoryName && (
          <Badge variant="secondary" className="mb-3">
            {categoryName}
          </Badge>
        )}

        {/* Title */}
        <Link to={`/blog/${blog.slug}`}>
          <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors mb-3 line-clamp-2">
            {title}
          </h2>
        </Link>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-muted-foreground mb-4 line-clamp-2">
            {excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {tags?.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* Read more */}
          <Link
            to={`/blog/${blog.slug}`}
            className="text-primary font-medium hover:underline flex items-center gap-1 shrink-0"
          >
            {t.blog.readMore}
            {isRTL ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
