// Local subcategory images mapping
import audio from '@/assets/subcategories/audio.webp';
import babySafety from '@/assets/subcategories/baby-safety.webp';
import bedding from '@/assets/subcategories/bedding.webp';
import camping from '@/assets/subcategories/camping.webp';
import casualWear from '@/assets/subcategories/casual-wear.webp';
import cycling from '@/assets/subcategories/cycling.webp';
import feeding from '@/assets/subcategories/feeding.webp';
import fitness from '@/assets/subcategories/fitness.webp';
import fragrance from '@/assets/subcategories/fragrance.webp';
import furniture from '@/assets/subcategories/furniture.webp';
import garden from '@/assets/subcategories/garden.webp';
import haircare from '@/assets/subcategories/haircare.webp';
import homeDecor from '@/assets/subcategories/home-decor.webp';
import kitchen from '@/assets/subcategories/kitchen.webp';
import ledLighting from '@/assets/subcategories/led-lighting.webp';
import makeup from '@/assets/subcategories/makeup.webp';
import mensClothing from '@/assets/subcategories/mens-clothing.webp';
import mensShoes from '@/assets/subcategories/mens-shoes.webp';
import womensShoes from '@/assets/subcategories/womens-shoes.webp';
import kidsShoes from '@/assets/subcategories/kids-shoes.webp';
import sportsShoes from '@/assets/subcategories/sports-shoes.webp';
import sandalsSlippers from '@/assets/subcategories/sandals-slippers.webp';
import nursery from '@/assets/subcategories/nursery.webp';
import outdoor from '@/assets/subcategories/outdoor.webp';
import personalCare from '@/assets/subcategories/personal-care.webp';
import shoes from '@/assets/subcategories/shoes.webp';
import skincare from '@/assets/subcategories/skincare.webp';
import smartGadgets from '@/assets/subcategories/smart-gadgets.webp';
import sportswear from '@/assets/subcategories/sportswear.webp';
import toys from '@/assets/subcategories/toys.webp';
import womensClothing from '@/assets/subcategories/womens-clothing.webp';

// Women's Clothing subcategories
import womensClothingMain from '@/assets/subcategories/womens-clothing-main.webp';
import jewelleryAccessories from '@/assets/subcategories/jewellery-accessories.webp';
import curvePlus from '@/assets/subcategories/curve-plus.webp';
import beautySubcat from '@/assets/subcategories/beauty.webp';
import bagsSubcat from '@/assets/subcategories/bags.webp';
import womensShoesMain from '@/assets/subcategories/womens-shoes-main.webp';

// Food & Groceries subcategories
import foodGroceries from '@/assets/subcategories/food-groceries.webp';
import riceGrains from '@/assets/subcategories/rice-grains.webp';
import oilsCooking from '@/assets/subcategories/oils-cooking.webp';
import dairy from '@/assets/subcategories/dairy.webp';
import legumes from '@/assets/subcategories/legumes.webp';
import proteins from '@/assets/subcategories/proteins.webp';

// Appliances subcategories
import kitchenAppliances from '@/assets/subcategories/kitchen-appliances.webp';
import laundryAppliances from '@/assets/subcategories/laundry-appliances.webp';
import heatingCooling from '@/assets/subcategories/heating-cooling.webp';
import vacuumCleaning from '@/assets/subcategories/vacuum-cleaning.webp';
import ironsGarmentCare from '@/assets/subcategories/irons-garment-care.webp';
import smallAppliances from '@/assets/subcategories/small-appliances.webp';
import chadorHijab from '@/assets/subcategories/chador-hijab.webp';

// Electronics subcategories
import phones from '@/assets/subcategories/phones.webp';
import computers from '@/assets/subcategories/computers.webp';
import accessoriesSubcat from '@/assets/subcategories/accessories.webp';
import cameras from '@/assets/subcategories/cameras.webp';

// Top-level category images
import sportsOutdoors from '@/assets/subcategories/sports-outdoors.webp';
import underwearSleepwear from '@/assets/subcategories/underwear-sleepwear.webp';
import babyKids from '@/assets/subcategories/baby-kids.webp';
import homeLiving from '@/assets/subcategories/home-living.webp';
import bagsLuggage from '@/assets/subcategories/bags-luggage.webp';
import toysGames from '@/assets/subcategories/toys-games.webp';
import officeSchool from '@/assets/subcategories/office-school.webp';
import petSupplies from '@/assets/subcategories/pet-supplies.webp';
import appliances from '@/assets/subcategories/appliances.webp';
import electronics from '@/assets/subcategories/electronics.webp';
import toolsHomeImprovement from '@/assets/subcategories/tools-home-improvement.webp';

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
  'mens-clothing': mensClothing,
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
  'womens-clothing': womensClothing,
  // Food & Groceries
  'food-groceries': foodGroceries,
  'rice-grains': riceGrains,
  'oils-cooking': oilsCooking,
  'dairy': dairy,
  'legumes': legumes,
  'proteins': proteins,
  // Women's Clothing subcategories
  'clothing': womensClothingMain,
  'jewellery-accessories': jewelleryAccessories,
  'jewelry-accessories': jewelleryAccessories,
  'curve-plus': curvePlus,
  'beauty': beautySubcat,
  'bags': bagsSubcat,
  'womens-shoes-main': womensShoesMain,
  // Appliances
  'kitchen-appliances': kitchenAppliances,
  'laundry-appliances': laundryAppliances,
  'heating-cooling': heatingCooling,
  'vacuum-cleaning': vacuumCleaning,
  'irons-garment-care': ironsGarmentCare,
  'small-appliances': smallAppliances,
  // Chador & Hijab
  'chador-hijab': chadorHijab,
  // Top-level categories
  'sports-outdoors': sportsOutdoors,
  'sports': sportsOutdoors,
  'underwear-sleepwear': underwearSleepwear,
  'baby-kids': babyKids,
  'baby': babyKids,
  'home-living': homeLiving,
  'home': homeLiving,
  'bags-luggage': bagsLuggage,
  'toys-games': toysGames,
  'office-school': officeSchool,
  'office-school-supplies': officeSchool,
  'pet-supplies': petSupplies,
  'appliances': appliances,
  'electronics': electronics,
  'tools-home-improvement': toolsHomeImprovement,
};

export const getSubcategoryImage = (slug: string): string | undefined => {
  return subcategoryImageMap[slug];
};
