-- Create subcategories table
CREATE TABLE public.subcategories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_fa text,
  slug text NOT NULL,
  description text,
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add unique constraint on slug within a category
ALTER TABLE public.subcategories ADD CONSTRAINT subcategories_category_slug_unique UNIQUE (category_id, slug);

-- Enable RLS on subcategories
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Create policies for subcategories
CREATE POLICY "Subcategories are viewable by everyone" 
  ON public.subcategories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Admins can manage subcategories" 
  ON public.subcategories 
  FOR ALL 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add name_fa column to categories table for Persian names
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_fa text;

-- Clear existing categories to avoid duplicates
DELETE FROM public.categories;

-- Insert main categories
INSERT INTO public.categories (name, name_fa, slug, sort_order, is_active) VALUES
  ('Electronics', 'الکترونیک', 'electronics', 1, true),
  ('Clothing', 'پوشاک', 'clothing', 2, true),
  ('Home & Living', 'خانه و زندگی', 'home', 3, true),
  ('Beauty & Personal Care', 'زیبایی و بهداشت', 'beauty', 4, true),
  ('Sports & Outdoor', 'ورزش و فضای باز', 'sports', 5, true),
  ('Baby & Kids', 'کودک و نوزاد', 'baby', 6, true);

-- Insert subcategories for Electronics
INSERT INTO public.subcategories (category_id, name, name_fa, slug, sort_order) 
SELECT c.id, sub.name, sub.name_fa, sub.slug, sub.sort_order
FROM public.categories c
CROSS JOIN (VALUES 
  ('Phones & Tablets', 'گوشی و تبلت', 'phones', 1),
  ('Computers & Laptops', 'کامپیوتر و لپ‌تاپ', 'computers', 2),
  ('Accessories', 'لوازم جانبی', 'accessories', 3),
  ('Cameras', 'دوربین', 'cameras', 4),
  ('Audio & Headphones', 'صوتی و هدفون', 'audio', 5)
) AS sub(name, name_fa, slug, sort_order)
WHERE c.slug = 'electronics';

-- Insert subcategories for Clothing
INSERT INTO public.subcategories (category_id, name, name_fa, slug, sort_order) 
SELECT c.id, sub.name, sub.name_fa, sub.slug, sub.sort_order
FROM public.categories c
CROSS JOIN (VALUES 
  ('Men''s Clothing', 'لباس مردانه', 'men', 1),
  ('Women''s Clothing', 'لباس زنانه', 'women', 2),
  ('Kids'' Clothing', 'لباس بچگانه', 'kids', 3),
  ('Shoes', 'کفش', 'shoes', 4),
  ('Fashion Accessories', 'اکسسوری', 'clothing-accessories', 5)
) AS sub(name, name_fa, slug, sort_order)
WHERE c.slug = 'clothing';

-- Insert subcategories for Home & Living
INSERT INTO public.subcategories (category_id, name, name_fa, slug, sort_order) 
SELECT c.id, sub.name, sub.name_fa, sub.slug, sub.sort_order
FROM public.categories c
CROSS JOIN (VALUES 
  ('Furniture', 'مبلمان', 'furniture', 1),
  ('Home Decor', 'دکوراسیون', 'decor', 2),
  ('Kitchen & Dining', 'آشپزخانه', 'kitchen', 3),
  ('Bedding', 'ملحفه و تشک', 'bedding', 4),
  ('Garden & Outdoor', 'باغ و فضای باز', 'garden', 5)
) AS sub(name, name_fa, slug, sort_order)
WHERE c.slug = 'home';

-- Insert subcategories for Beauty & Personal Care
INSERT INTO public.subcategories (category_id, name, name_fa, slug, sort_order) 
SELECT c.id, sub.name, sub.name_fa, sub.slug, sub.sort_order
FROM public.categories c
CROSS JOIN (VALUES 
  ('Skincare', 'مراقبت پوست', 'skincare', 1),
  ('Makeup', 'آرایش', 'makeup', 2),
  ('Hair Care', 'مراقبت مو', 'haircare', 3),
  ('Fragrance', 'عطر', 'fragrance', 4),
  ('Personal Care', 'بهداشت شخصی', 'personal', 5)
) AS sub(name, name_fa, slug, sort_order)
WHERE c.slug = 'beauty';

-- Insert subcategories for Sports & Outdoor
INSERT INTO public.subcategories (category_id, name, name_fa, slug, sort_order) 
SELECT c.id, sub.name, sub.name_fa, sub.slug, sub.sort_order
FROM public.categories c
CROSS JOIN (VALUES 
  ('Fitness Equipment', 'تجهیزات ورزشی', 'fitness', 1),
  ('Outdoor Recreation', 'تفریحات فضای باز', 'outdoor', 2),
  ('Sportswear', 'لباس ورزشی', 'sportswear', 3),
  ('Cycling', 'دوچرخه‌سواری', 'cycling', 4),
  ('Camping & Hiking', 'کمپینگ و کوهنوردی', 'camping', 5)
) AS sub(name, name_fa, slug, sort_order)
WHERE c.slug = 'sports';

-- Insert subcategories for Baby & Kids
INSERT INTO public.subcategories (category_id, name, name_fa, slug, sort_order) 
SELECT c.id, sub.name, sub.name_fa, sub.slug, sub.sort_order
FROM public.categories c
CROSS JOIN (VALUES 
  ('Toys', 'اسباب‌بازی', 'toys', 1),
  ('Feeding', 'تغذیه', 'feeding', 2),
  ('Nursery', 'اتاق کودک', 'nursery', 3),
  ('Baby Safety', 'ایمنی کودک', 'safety', 4),
  ('Strollers & Carriers', 'کالسکه و آغوشی', 'strollers', 5)
) AS sub(name, name_fa, slug, sort_order)
WHERE c.slug = 'baby';

-- Create trigger for updated_at
CREATE TRIGGER update_subcategories_updated_at
  BEFORE UPDATE ON public.subcategories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();