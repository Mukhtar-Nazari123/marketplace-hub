import { useHomeBanners } from '@/hooks/useHomeBanners';
import HomeBanner from './HomeBanner';
import { Skeleton } from '@/components/ui/skeleton';

const HomeBannerList = () => {
  const { banners, loading } = useHomeBanners({ activeOnly: true });

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {banners.map((banner) => (
        <HomeBanner key={banner.id} banner={banner} />
      ))}
    </div>
  );
};

export default HomeBannerList;
