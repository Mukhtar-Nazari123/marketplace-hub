-- Add Pashto (ps) language support to all content tables

-- 1. Categories table - add name_ps column
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_ps text;

-- 2. Subcategories table - add name_ps column
ALTER TABLE public.subcategories ADD COLUMN IF NOT EXISTS name_ps text;

-- 3. Products table - add Pashto fields in metadata (products use metadata jsonb for localized content)
-- No schema change needed as metadata already supports dynamic fields

-- 4. Blogs table - add Pashto content fields
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS title_ps text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS content_ps text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS excerpt_ps text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS meta_title_ps text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS meta_description_ps text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS author_name_ps text;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS tags_ps text[] DEFAULT '{}'::text[];

-- 5. Blog categories - add Pashto fields
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS name_ps text;
ALTER TABLE public.blog_categories ADD COLUMN IF NOT EXISTS description_ps text;

-- 6. Hero banners - add Pashto fields
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS title_ps text;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS description_ps text;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS badge_text_ps text;
ALTER TABLE public.hero_banners ADD COLUMN IF NOT EXISTS cta_text_ps text DEFAULT 'اوس پیرود وکړئ';

-- 7. Home banners - add Pashto fields
ALTER TABLE public.home_banners ADD COLUMN IF NOT EXISTS title_ps text;
ALTER TABLE public.home_banners ADD COLUMN IF NOT EXISTS subtitle_ps text;
ALTER TABLE public.home_banners ADD COLUMN IF NOT EXISTS button_text_ps text DEFAULT 'اوس پیرود وکړئ';
ALTER TABLE public.home_banners ADD COLUMN IF NOT EXISTS price_text_ps text;

-- 8. Promo cards - add Pashto fields
ALTER TABLE public.promo_cards ADD COLUMN IF NOT EXISTS title_ps text;
ALTER TABLE public.promo_cards ADD COLUMN IF NOT EXISTS subtitle_ps text;
ALTER TABLE public.promo_cards ADD COLUMN IF NOT EXISTS badge_text_ps text;

-- 9. About sections - add Pashto fields
ALTER TABLE public.about_sections ADD COLUMN IF NOT EXISTS title_ps text;
ALTER TABLE public.about_sections ADD COLUMN IF NOT EXISTS description_ps text;
ALTER TABLE public.about_sections ADD COLUMN IF NOT EXISTS content_ps text;

-- 10. About values - add Pashto fields
ALTER TABLE public.about_values ADD COLUMN IF NOT EXISTS title_ps text;
ALTER TABLE public.about_values ADD COLUMN IF NOT EXISTS description_ps text;

-- 11. About team members - add Pashto fields
ALTER TABLE public.about_team_members ADD COLUMN IF NOT EXISTS name_ps text;
ALTER TABLE public.about_team_members ADD COLUMN IF NOT EXISTS role_ps text;
ALTER TABLE public.about_team_members ADD COLUMN IF NOT EXISTS description_ps text;

-- 12. About awards - add Pashto fields
ALTER TABLE public.about_awards ADD COLUMN IF NOT EXISTS title_ps text;
ALTER TABLE public.about_awards ADD COLUMN IF NOT EXISTS description_ps text;

-- 13. Site settings - add Pashto site name
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS site_name_ps text DEFAULT 'مارکېټ';

-- 14. Site contact settings - add Pashto fields
ALTER TABLE public.site_contact_settings ADD COLUMN IF NOT EXISTS address_ps text;
ALTER TABLE public.site_contact_settings ADD COLUMN IF NOT EXISTS working_hours_ps text;

-- 15. Notifications - add Pashto message fields
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title_ps text;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message_ps text;

-- 16. Admin notifications - add Pashto message fields
ALTER TABLE public.admin_notifications ADD COLUMN IF NOT EXISTS title_ps text;
ALTER TABLE public.admin_notifications ADD COLUMN IF NOT EXISTS message_ps text;

-- Add comments to document the trilingual support
COMMENT ON COLUMN public.categories.name_ps IS 'Category name in Pashto';
COMMENT ON COLUMN public.subcategories.name_ps IS 'Subcategory name in Pashto';
COMMENT ON COLUMN public.blogs.title_ps IS 'Blog title in Pashto';
COMMENT ON COLUMN public.site_settings.site_name_ps IS 'Site name in Pashto';