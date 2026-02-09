-- Update Food & Groceries category with image URL
UPDATE public.categories 
SET image_url = '/categories/food-groceries.jpg'
WHERE slug = 'food-groceries';

-- Update subcategories with image URLs
UPDATE public.subcategories 
SET image_url = '/categories/rice-grains.jpg'
WHERE slug = 'rice-grains';

UPDATE public.subcategories 
SET image_url = '/categories/oils-cooking.jpg'
WHERE slug = 'oils-cooking';

UPDATE public.subcategories 
SET image_url = '/categories/dairy.jpg'
WHERE slug = 'dairy';

UPDATE public.subcategories 
SET image_url = '/categories/legumes.jpg'
WHERE slug = 'legumes';

UPDATE public.subcategories 
SET image_url = '/categories/proteins.jpg'
WHERE slug = 'proteins';