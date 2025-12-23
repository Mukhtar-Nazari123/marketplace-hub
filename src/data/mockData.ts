// Mock data for the marketplace

export interface Category {
  id: string;
  name: { fa: string; en: string };
  slug: string;
  image: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: { fa: string; en: string };
  slug: string;
}

export interface Product {
  id: string;
  name: { fa: string; en: string };
  slug: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  subcategory?: string;
  brand: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isHot?: boolean;
  discount?: number;
  seller: Seller;
  description: { fa: string; en: string };
  specifications: { key: string; value: { fa: string; en: string } }[];
}

export interface Seller {
  id: string;
  name: string;
  rating: number;
  productCount: number;
  avatar: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BlogPost {
  id: string;
  title: { fa: string; en: string };
  slug: string;
  excerpt: { fa: string; en: string };
  content: { fa: string; en: string };
  image: string;
  category: string;
  author: string;
  date: string;
  tags: string[];
}

// Categories
export const categories: Category[] = [
  {
    id: '1',
    name: { fa: 'الکترونیکس', en: 'Electronics' },
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400',
    subcategories: [
      { id: '1-1', name: { fa: 'گوشی موبایل', en: 'Mobile Phones' }, slug: 'mobile-phones' },
      { id: '1-2', name: { fa: 'لپ‌تاپ', en: 'Laptops' }, slug: 'laptops' },
      { id: '1-3', name: { fa: 'تبلت', en: 'Tablets' }, slug: 'tablets' },
      { id: '1-4', name: { fa: 'هدفون و اسپیکر', en: 'Headphones & Speakers' }, slug: 'headphones-speakers' },
    ],
  },
  {
    id: '2',
    name: { fa: 'مد و لباس', en: 'Fashion' },
    slug: 'fashion',
    image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400',
    subcategories: [
      { id: '2-1', name: { fa: 'لباس مردانه', en: 'Men\'s Clothing' }, slug: 'mens-clothing' },
      { id: '2-2', name: { fa: 'لباس زنانه', en: 'Women\'s Clothing' }, slug: 'womens-clothing' },
      { id: '2-3', name: { fa: 'کیف و کفش', en: 'Bags & Shoes' }, slug: 'bags-shoes' },
      { id: '2-4', name: { fa: 'اکسسوری', en: 'Accessories' }, slug: 'accessories' },
    ],
  },
  {
    id: '3',
    name: { fa: 'خانه و باغ', en: 'Home & Garden' },
    slug: 'home-garden',
    image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400',
    subcategories: [
      { id: '3-1', name: { fa: 'مبلمان', en: 'Furniture' }, slug: 'furniture' },
      { id: '3-2', name: { fa: 'دکوراسیون', en: 'Decoration' }, slug: 'decoration' },
      { id: '3-3', name: { fa: 'لوازم آشپزخانه', en: 'Kitchen Appliances' }, slug: 'kitchen' },
      { id: '3-4', name: { fa: 'باغبانی', en: 'Gardening' }, slug: 'gardening' },
    ],
  },
  {
    id: '4',
    name: { fa: 'ورزش و فضای باز', en: 'Sports & Outdoors' },
    slug: 'sports',
    image: 'https://images.unsplash.com/photo-1461896836934- voices_from_the_hiker?w=400',
    subcategories: [
      { id: '4-1', name: { fa: 'تجهیزات ورزشی', en: 'Sports Equipment' }, slug: 'equipment' },
      { id: '4-2', name: { fa: 'لباس ورزشی', en: 'Sports Clothing' }, slug: 'sports-clothing' },
      { id: '4-3', name: { fa: 'کوهنوردی', en: 'Hiking' }, slug: 'hiking' },
    ],
  },
  {
    id: '5',
    name: { fa: 'سلامت و زیبایی', en: 'Health & Beauty' },
    slug: 'health-beauty',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400',
    subcategories: [
      { id: '5-1', name: { fa: 'آرایشی', en: 'Makeup' }, slug: 'makeup' },
      { id: '5-2', name: { fa: 'مراقبت پوست', en: 'Skincare' }, slug: 'skincare' },
      { id: '5-3', name: { fa: 'عطر', en: 'Perfume' }, slug: 'perfume' },
    ],
  },
  {
    id: '6',
    name: { fa: 'اسباب بازی و بازی‌ها', en: 'Toys & Games' },
    slug: 'toys-games',
    image: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=400',
    subcategories: [
      { id: '6-1', name: { fa: 'اسباب بازی', en: 'Toys' }, slug: 'toys' },
      { id: '6-2', name: { fa: 'بازی‌های ویدیویی', en: 'Video Games' }, slug: 'video-games' },
      { id: '6-3', name: { fa: 'پازل', en: 'Puzzles' }, slug: 'puzzles' },
    ],
  },
];

// Sellers
export const sellers: Seller[] = [
  { id: 's1', name: 'فروشگاه کابل تک', rating: 4.8, productCount: 150, avatar: 'https://i.pravatar.cc/100?img=1' },
  { id: 's2', name: 'بازار هرات', rating: 4.5, productCount: 89, avatar: 'https://i.pravatar.cc/100?img=2' },
  { id: 's3', name: 'دیجیتال استور', rating: 4.9, productCount: 230, avatar: 'https://i.pravatar.cc/100?img=3' },
  { id: 's4', name: 'مزار شاپ', rating: 4.6, productCount: 67, avatar: 'https://i.pravatar.cc/100?img=4' },
];

// Products
export const products: Product[] = [
  {
    id: 'p1',
    name: { fa: 'آیفون ۱۵ پرو مکس', en: 'iPhone 15 Pro Max' },
    slug: 'iphone-15-pro-max',
    price: 85000,
    originalPrice: 95000,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
    ],
    category: 'electronics',
    subcategory: 'mobile-phones',
    brand: 'Apple',
    rating: 4.9,
    reviewCount: 234,
    inStock: true,
    isNew: true,
    isHot: true,
    discount: 10,
    seller: sellers[0],
    description: {
      fa: 'آیفون ۱۵ پرو مکس با تراشه A17 Pro، دوربین ۴۸ مگاپیکسلی و نمایشگر Super Retina XDR',
      en: 'iPhone 15 Pro Max with A17 Pro chip, 48MP camera, and Super Retina XDR display',
    },
    specifications: [
      { key: 'Storage', value: { fa: '۲۵۶ گیگابایت', en: '256GB' } },
      { key: 'Display', value: { fa: '۶.۷ اینچ', en: '6.7 inches' } },
      { key: 'Battery', value: { fa: '۴۴۲۲ میلی‌آمپر', en: '4422 mAh' } },
    ],
  },
  {
    id: 'p2',
    name: { fa: 'لپ‌تاپ مک‌بوک پرو', en: 'MacBook Pro' },
    slug: 'macbook-pro',
    price: 120000,
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
    ],
    category: 'electronics',
    subcategory: 'laptops',
    brand: 'Apple',
    rating: 4.8,
    reviewCount: 189,
    inStock: true,
    isNew: true,
    seller: sellers[2],
    description: {
      fa: 'مک‌بوک پرو با تراشه M3 Pro، نمایشگر Liquid Retina XDR و باتری ۲۲ ساعته',
      en: 'MacBook Pro with M3 Pro chip, Liquid Retina XDR display, and 22-hour battery',
    },
    specifications: [
      { key: 'Processor', value: { fa: 'M3 Pro', en: 'M3 Pro' } },
      { key: 'RAM', value: { fa: '۱۸ گیگابایت', en: '18GB' } },
      { key: 'Storage', value: { fa: '۵۱۲ گیگابایت', en: '512GB SSD' } },
    ],
  },
  {
    id: 'p3',
    name: { fa: 'هدفون سونی WH-1000XM5', en: 'Sony WH-1000XM5' },
    slug: 'sony-wh-1000xm5',
    price: 15000,
    originalPrice: 18000,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    ],
    category: 'electronics',
    subcategory: 'headphones-speakers',
    brand: 'Sony',
    rating: 4.7,
    reviewCount: 156,
    inStock: true,
    isHot: true,
    discount: 15,
    seller: sellers[1],
    description: {
      fa: 'هدفون بی‌سیم سونی با نویز کنسلینگ پیشرفته و کیفیت صدای استثنایی',
      en: 'Sony wireless headphones with advanced noise canceling and exceptional sound quality',
    },
    specifications: [
      { key: 'Type', value: { fa: 'بی‌سیم', en: 'Wireless' } },
      { key: 'Battery', value: { fa: '۳۰ ساعت', en: '30 hours' } },
    ],
  },
  {
    id: 'p4',
    name: { fa: 'ساعت هوشمند اپل واچ', en: 'Apple Watch Series 9' },
    slug: 'apple-watch-series-9',
    price: 25000,
    images: [
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600',
    ],
    category: 'electronics',
    subcategory: 'tablets',
    brand: 'Apple',
    rating: 4.6,
    reviewCount: 98,
    inStock: true,
    isNew: true,
    seller: sellers[0],
    description: {
      fa: 'ساعت هوشمند اپل سری ۹ با نمایشگر همیشه روشن و ردیاب سلامت پیشرفته',
      en: 'Apple Watch Series 9 with always-on display and advanced health tracking',
    },
    specifications: [
      { key: 'Display', value: { fa: '۴۵ میلیمتر', en: '45mm' } },
      { key: 'Water Resistance', value: { fa: '۵۰ متر', en: '50 meters' } },
    ],
  },
  {
    id: 'p5',
    name: { fa: 'کیف چرم زنانه', en: 'Women\'s Leather Bag' },
    slug: 'womens-leather-bag',
    price: 3500,
    originalPrice: 4500,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    ],
    category: 'fashion',
    subcategory: 'bags-shoes',
    brand: 'Gucci',
    rating: 4.5,
    reviewCount: 67,
    inStock: true,
    discount: 22,
    seller: sellers[3],
    description: {
      fa: 'کیف چرم طبیعی با طراحی شیک و کلاسیک',
      en: 'Natural leather bag with elegant and classic design',
    },
    specifications: [
      { key: 'Material', value: { fa: 'چرم طبیعی', en: 'Genuine Leather' } },
      { key: 'Size', value: { fa: 'متوسط', en: 'Medium' } },
    ],
  },
  {
    id: 'p6',
    name: { fa: 'پیراهن مردانه', en: 'Men\'s Shirt' },
    slug: 'mens-shirt',
    price: 1200,
    images: [
      'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600',
    ],
    category: 'fashion',
    subcategory: 'mens-clothing',
    brand: 'Zara',
    rating: 4.3,
    reviewCount: 45,
    inStock: true,
    seller: sellers[1],
    description: {
      fa: 'پیراهن مردانه با پارچه نخی و طرح کلاسیک',
      en: 'Men\'s shirt with cotton fabric and classic design',
    },
    specifications: [
      { key: 'Material', value: { fa: 'نخ', en: 'Cotton' } },
      { key: 'Sizes', value: { fa: 'S, M, L, XL', en: 'S, M, L, XL' } },
    ],
  },
  {
    id: 'p7',
    name: { fa: 'مبل راحتی', en: 'Comfortable Sofa' },
    slug: 'comfortable-sofa',
    price: 45000,
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
    ],
    category: 'home-garden',
    subcategory: 'furniture',
    brand: 'IKEA',
    rating: 4.4,
    reviewCount: 32,
    inStock: true,
    isNew: true,
    seller: sellers[2],
    description: {
      fa: 'مبل راحتی سه نفره با پارچه مخمل و رنگ‌های متنوع',
      en: 'Three-seater sofa with velvet fabric and various colors',
    },
    specifications: [
      { key: 'Material', value: { fa: 'مخمل', en: 'Velvet' } },
      { key: 'Capacity', value: { fa: '۳ نفره', en: '3-seater' } },
    ],
  },
  {
    id: 'p8',
    name: { fa: 'دوچرخه کوهستان', en: 'Mountain Bike' },
    slug: 'mountain-bike',
    price: 28000,
    originalPrice: 32000,
    images: [
      'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?w=600',
    ],
    category: 'sports',
    subcategory: 'equipment',
    brand: 'Giant',
    rating: 4.7,
    reviewCount: 78,
    inStock: true,
    discount: 12,
    seller: sellers[3],
    description: {
      fa: 'دوچرخه کوهستان حرفه‌ای با بدنه آلومینیوم و ۲۱ دنده',
      en: 'Professional mountain bike with aluminum frame and 21 gears',
    },
    specifications: [
      { key: 'Frame', value: { fa: 'آلومینیوم', en: 'Aluminum' } },
      { key: 'Gears', value: { fa: '۲۱ سرعته', en: '21 Speed' } },
    ],
  },
];

// Blog Posts
export const blogPosts: BlogPost[] = [
  {
    id: 'b1',
    title: { 
      fa: 'راهنمای خرید گوشی هوشمند در سال ۱۴۰۳', 
      en: 'Smartphone Buying Guide 2024' 
    },
    slug: 'smartphone-buying-guide-2024',
    excerpt: {
      fa: 'در این مقاله به بررسی نکات مهم در خرید گوشی هوشمند می‌پردازیم...',
      en: 'In this article, we explore important points when buying a smartphone...',
    },
    content: {
      fa: 'محتوای کامل مقاله در اینجا قرار می‌گیرد...',
      en: 'Full article content goes here...',
    },
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
    category: 'تکنولوژی',
    author: 'احمد محمدی',
    date: '2024-01-15',
    tags: ['گوشی', 'تکنولوژی', 'راهنما'],
  },
  {
    id: 'b2',
    title: { 
      fa: 'ترندهای مد بهار ۱۴۰۳', 
      en: 'Spring 2024 Fashion Trends' 
    },
    slug: 'spring-2024-fashion-trends',
    excerpt: {
      fa: 'آشنایی با جدیدترین ترندهای مد در فصل بهار...',
      en: 'Discover the latest fashion trends for spring...',
    },
    content: {
      fa: 'محتوای کامل مقاله در اینجا قرار می‌گیرد...',
      en: 'Full article content goes here...',
    },
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600',
    category: 'مد',
    author: 'سارا احمدی',
    date: '2024-02-20',
    tags: ['مد', 'لباس', 'ترند'],
  },
  {
    id: 'b3',
    title: { 
      fa: 'نحوه مراقبت از گیاهان آپارتمانی', 
      en: 'How to Care for Indoor Plants' 
    },
    slug: 'indoor-plant-care',
    excerpt: {
      fa: 'نکات ضروری برای نگهداری از گیاهان در خانه...',
      en: 'Essential tips for maintaining plants at home...',
    },
    content: {
      fa: 'محتوای کامل مقاله در اینجا قرار می‌گیرد...',
      en: 'Full article content goes here...',
    },
    image: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600',
    category: 'خانه',
    author: 'مریم کریمی',
    date: '2024-03-10',
    tags: ['گیاه', 'خانه', 'دکوراسیون'],
  },
  {
    id: 'b4',
    title: { 
      fa: 'بهترین تجهیزات ورزشی خانگی', 
      en: 'Best Home Workout Equipment' 
    },
    slug: 'best-home-workout-equipment',
    excerpt: {
      fa: 'معرفی بهترین وسایل ورزشی برای استفاده در خانه...',
      en: 'Introduction to the best sports equipment for home use...',
    },
    content: {
      fa: 'محتوای کامل مقاله در اینجا قرار می‌گیرد...',
      en: 'Full article content goes here...',
    },
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
    category: 'ورزش',
    author: 'علی رضایی',
    date: '2024-03-25',
    tags: ['ورزش', 'سلامت', 'تجهیزات'],
  },
];

// Reviews
export const reviews: Review[] = [
  { id: 'r1', userId: 'u1', userName: 'احمد م.', rating: 5, comment: 'محصول عالی بود، خیلی راضی هستم.', date: '2024-01-10' },
  { id: 'r2', userId: 'u2', userName: 'سارا ک.', rating: 4, comment: 'کیفیت خوب بود ولی ارسال کمی طول کشید.', date: '2024-01-15' },
  { id: 'r3', userId: 'u3', userName: 'محمد ر.', rating: 5, comment: 'بهترین خرید من تا الان!', date: '2024-02-01' },
  { id: 'r4', userId: 'u4', userName: 'فاطمه ا.', rating: 3, comment: 'معمولی بود، انتظار بیشتری داشتم.', date: '2024-02-10' },
];

// Brands
export const brands = ['Apple', 'Samsung', 'Sony', 'LG', 'Gucci', 'Zara', 'Nike', 'Adidas', 'IKEA', 'Giant'];
