// Local subcategory images mapping
import audio from '@/assets/subcategories/audio.jpg';
import babySafety from '@/assets/subcategories/baby-safety.jpg';
import bedding from '@/assets/subcategories/bedding.jpg';
import camping from '@/assets/subcategories/camping.jpg';
import casualWear from '@/assets/subcategories/casual-wear.jpg';
import cycling from '@/assets/subcategories/cycling.jpg';
import feeding from '@/assets/subcategories/feeding.jpg';
import fitness from '@/assets/subcategories/fitness.jpg';
import fragrance from '@/assets/subcategories/fragrance.jpg';
import furniture from '@/assets/subcategories/furniture.jpg';
import garden from '@/assets/subcategories/garden.jpg';
import haircare from '@/assets/subcategories/haircare.jpg';
import homeDecor from '@/assets/subcategories/home-decor.jpg';
import kitchen from '@/assets/subcategories/kitchen.jpg';
import ledLighting from '@/assets/subcategories/led-lighting.jpg';
import makeup from '@/assets/subcategories/makeup.jpg';
import mensClothing from '@/assets/subcategories/mens-clothing.jpg';
import mensShoes from '@/assets/subcategories/mens-shoes.webp';
import womensShoes from '@/assets/subcategories/womens-shoes.webp';
import kidsShoes from '@/assets/subcategories/kids-shoes.webp';
import sportsShoes from '@/assets/subcategories/sports-shoes.webp';
import sandalsSlippers from '@/assets/subcategories/sandals-slippers.webp';
import nursery from '@/assets/subcategories/nursery.jpg';
import outdoor from '@/assets/subcategories/outdoor.jpg';
import personalCare from '@/assets/subcategories/personal-care.jpg';
import shoes from '@/assets/subcategories/shoes.jpg';
import skincare from '@/assets/subcategories/skincare.jpg';
import smartGadgets from '@/assets/subcategories/smart-gadgets.jpg';
import sportswear from '@/assets/subcategories/sportswear.jpg';
import toys from '@/assets/subcategories/toys.jpg';
import womensClothing from '@/assets/subcategories/womens-clothing.jpg';

// Food & Groceries subcategories
import foodGroceries from '@/assets/subcategories/food-groceries.jpg';
import riceGrains from '@/assets/subcategories/rice-grains.jpg';
import oilsCooking from '@/assets/subcategories/oils-cooking.jpg';
import dairy from '@/assets/subcategories/dairy.jpg';
import legumes from '@/assets/subcategories/legumes.jpg';
import proteins from '@/assets/subcategories/proteins.jpg';

// Map slug to local image
export const subcategoryImageMap: Record<string, string> = {
  'audio': audio,
  'safety': babySafety,
  'bedding': bedding,
  'camping': camping,
  'casual-wear': casualWear,
  'cycling': cycling,
  'feeding': feeding,
  'fitness': fitness,
  'fragrance': fragrance,
  'furniture': furniture,
  'garden': garden,
  'haircare': haircare,
  'decor': homeDecor,
  'kitchen': kitchen,
  'led-lighting': ledLighting,
  'makeup': makeup,
  'men': mensClothing,
  'mens-shoes': mensShoes,
  'womens-shoes': womensShoes,
  'kids-shoes': kidsShoes,
  'sports-shoes': sportsShoes,
  'sandals-slippers': sandalsSlippers,
  'nursery': nursery,
  'outdoor': outdoor,
  'personal': personalCare,
  'shoes': shoes,
  'skincare': skincare,
  'smart-gadgets': smartGadgets,
  'sportswear': sportswear,
  'toys': toys,
  'women': womensClothing,
  // Food & Groceries
  'food-groceries': foodGroceries,
  'rice-grains': riceGrains,
  'oils-cooking': oilsCooking,
  'dairy': dairy,
  'legumes': legumes,
  'proteins': proteins,
};

export const getSubcategoryImage = (slug: string): string | undefined => {
  return subcategoryImageMap[slug];
};
