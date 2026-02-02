-- Update subcategory images with Supabase storage URLs
-- Base URL: https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/

-- Clothing subcategories
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/mens-clothing.jpg' WHERE slug = 'men';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/womens-clothing.jpg' WHERE slug = 'women';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/shoes.jpg' WHERE slug = 'shoes';

-- Beauty subcategories
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/skincare.jpg' WHERE slug = 'skincare';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/makeup.jpg' WHERE slug = 'makeup';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/haircare.jpg' WHERE slug = 'haircare';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/fragrance.jpg' WHERE slug = 'fragrance';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/personal-care.jpg' WHERE slug = 'personal';

-- Baby & Kids subcategories
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/toys.jpg' WHERE slug = 'toys';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/feeding.jpg' WHERE slug = 'feeding';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/nursery.jpg' WHERE slug = 'nursery';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/baby-safety.jpg' WHERE slug = 'safety';

-- Home & Living subcategories
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/furniture.jpg' WHERE slug = 'furniture';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/home-decor.jpg' WHERE slug = 'decor';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/kitchen.jpg' WHERE slug = 'kitchen';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/bedding.jpg' WHERE slug = 'bedding';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/garden.jpg' WHERE slug = 'garden';

-- Men's Clothing subcategories
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/casual-wear.jpg' WHERE slug = 'casual-wear';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/mens-shoes.jpg' WHERE slug = 'mens-shoes';

-- Sports & Outdoor subcategories
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/fitness.jpg' WHERE slug = 'fitness';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/outdoor.jpg' WHERE slug = 'outdoor';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/sportswear.jpg' WHERE slug = 'sportswear';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/cycling.jpg' WHERE slug = 'cycling';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/camping.jpg' WHERE slug = 'camping';

-- Electronics subcategories (only ones without images)
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/audio.jpg' WHERE slug = 'audio';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/smart-gadgets.jpg' WHERE slug = 'smart-gadgets';
UPDATE subcategories SET image_url = 'https://bwdsswkrlomfwhwpkwww.supabase.co/storage/v1/object/public/site-assets/subcategories/led-lighting.jpg' WHERE slug = 'led-lighting';