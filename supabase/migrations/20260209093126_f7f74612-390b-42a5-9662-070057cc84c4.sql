-- Add Food & Groceries main category
INSERT INTO public.categories (name, name_fa, name_ps, slug, description, is_active, sort_order)
VALUES (
  'Food & Groceries',
  'مواد غذایی و خوراکی',
  'خوراکي توکي',
  'food-groceries',
  'Daily food and grocery products for households',
  true,
  7
);

-- Get the category ID for subcategories
DO $$
DECLARE
  v_category_id UUID;
BEGIN
  SELECT id INTO v_category_id FROM public.categories WHERE slug = 'food-groceries';
  
  -- Insert subcategories
  INSERT INTO public.subcategories (name, name_fa, name_ps, slug, category_id, is_active, sort_order)
  VALUES
    ('Rice & Grains', 'برنج و غلات', 'وريجې او غنم', 'rice-grains', v_category_id, true, 1),
    ('Oils & Cooking', 'روغن و مواد پخت', 'غوړي او پخلي توکي', 'oils-cooking', v_category_id, true, 2),
    ('Dairy', 'لبنیات', 'شیدې او شیدیز محصولات', 'dairy', v_category_id, true, 3),
    ('Legumes', 'حبوبات', 'حبوبات', 'legumes', v_category_id, true, 4),
    ('Proteins', 'مواد پروتئینی', 'پروتیني توکي', 'proteins', v_category_id, true, 5);
END $$;