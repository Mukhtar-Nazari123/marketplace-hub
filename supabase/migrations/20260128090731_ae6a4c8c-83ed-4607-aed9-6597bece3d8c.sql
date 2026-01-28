-- Drop promo_cards table and its policies
DROP POLICY IF EXISTS "Active promo cards are viewable by everyone" ON public.promo_cards;
DROP POLICY IF EXISTS "Admins can manage promo cards" ON public.promo_cards;
DROP TABLE IF EXISTS public.promo_cards;

-- Drop home_banners table and its policies
DROP POLICY IF EXISTS "Active home banners are viewable by everyone" ON public.home_banners;
DROP POLICY IF EXISTS "Admins can manage home banners" ON public.home_banners;
DROP TABLE IF EXISTS public.home_banners;