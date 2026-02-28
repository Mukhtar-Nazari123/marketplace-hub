
-- Seed one product per empty category
DO $$
DECLARE
  v_seller_id uuid := '740d3204-247b-4229-b6f7-52183db7c532';
  v_product_id uuid;
BEGIN

-- 1. Women's Clothing
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, compare_price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'manto-torabi-zananeh-' || extract(epoch from now())::bigint, 2800, 3200, 45, 'CLO-MNTO-7291', 'bbac98b9-de4d-44b8-ad7d-6bfaf842fcfa', 'active', 100, 0.4);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'مانتو ترکیبی زنانه طرح مدرن', 'مانتو ترکیبی با پارچه نخی و طراحی مدرن، مناسب فصل بهار و تابستان', 'این مانتو ترکیبی با استفاده از بهترین پارچه‌های نخی تولید شده و دارای طراحی مدرن و شیک است. دوخت تمیز و استاندارد آن باعث شده تا در هر مناسبتی بتوانید از آن استفاده کنید.

این محصول در رنگ‌های متنوع موجود بوده و برای فصل بهار و تابستان بسیار مناسب است. جنس پارچه سبک و راحت بوده و حتی در هوای گرم نیز احساس آرامش خواهید داشت.', 'مانتو ترکیبی زنانه مدرن', 'خرید مانتو ترکیبی زنانه با طراحی مدرن و پارچه نخی درجه یک');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=400', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'نارین', NULL, 0);

-- 2. Jewelry & Accessories
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, compare_price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'gardenband-neqreh-' || extract(epoch from now())::bigint, 4500, 5200, 30, 'JWL-NKLC-3847', '910f3929-d984-49ac-82ec-fe311218d97f', 'active', 50, 0.05);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'گردنبند نقره با نگین فیروزه', 'گردنبند نقره عیار ۹۲۵ با نگین فیروزه طبیعی نیشابور', 'این گردنبند زیبا از نقره خالص عیار ۹۲۵ ساخته شده و با نگین فیروزه طبیعی نیشابوری تزئین گردیده است. طراحی ظریف و خاص آن باعث شده تا هم برای استفاده روزانه و هم برای مهمانی‌ها مناسب باشد.

هر قطعه با دقت بالا توسط هنرمندان ماهر دست‌ساز شده و دارای گواهی اصالت نقره می‌باشد. بسته‌بندی لوکس و مناسب هدیه دادن.', 'گردنبند نقره فیروزه نیشابور', 'خرید گردنبند نقره ۹۲۵ با فیروزه طبیعی نیشابور، دست‌ساز و اصیل');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'زرناب', NULL, 0);

-- 3. Baby & Kids
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'set-lebas-nozadi-' || extract(epoch from now())::bigint, 1800, 60, 'BBY-BSET-5124', 'a71d36dd-3219-454f-adfd-6c708aa1b74e', 'active', 80, 0.3);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'ست لباس نوزادی پنبه‌ای ۵ تکه', 'ست ۵ تکه نوزادی از جنس پنبه ارگانیک، مناسب ۰ تا ۶ ماه', 'این ست لباس نوزادی شامل ۵ تکه از جنس پنبه ارگانیک ۱۰۰٪ است که برای پوست حساس نوزادان طراحی شده. شامل بادی، شلوار، کلاه، دستکش و جوراب می‌باشد.

تمامی قطعات با رنگ‌های طبیعی و بدون مواد شیمیایی مضر رنگ‌آمیزی شده‌اند. دوخت بدون درز داخلی برای جلوگیری از تحریک پوست نوزاد. قابل شستشو در ماشین لباسشویی.', 'ست لباس نوزادی پنبه ارگانیک', 'خرید ست لباس نوزادی ۵ تکه پنبه ارگانیک، ضد حساسیت');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'پاندا بیبی', NULL, 0);

-- 4. Underwear & Sleepwear
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'pijameh-mardaneh-' || extract(epoch from now())::bigint, 1500, 80, 'CLO-PJMA-6382', 'd5b9b8dc-9413-42bd-98aa-f05708ce2c62', 'active', 70, 0.35);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'ست پیژامه مردانه نخی راحتی', 'پیژامه مردانه از جنس نخ پنبه، سبک و راحت برای خواب', 'این ست پیژامه مردانه از جنس نخ پنبه درجه یک تولید شده و بسیار نرم و لطیف است. طراحی ساده و شیک آن مناسب استفاده در خانه و خواب راحت می‌باشد.

دارای کش کمر قابل تنظیم و جیب‌های کناری عملی. پارچه تنفس‌پذیر که در تمام فصول قابل استفاده است. قابل شستشو در ماشین لباسشویی بدون تغییر رنگ یا فرم.', 'پیژامه مردانه نخی', 'خرید ست پیژامه مردانه نخی راحتی با کیفیت بالا');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1616627547584-bf28cee262db?w=400', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'آرامش', NULL, 0);

-- 5. Men's Clothing
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, compare_price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'pirahan-mardaneh-rasmi-' || extract(epoch from now())::bigint, 2200, 2600, 55, 'CLO-SHRT-9174', 'bdf20c3a-624a-4b88-8a08-8244e95ce1c5', 'active', 80, 0.25);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'پیراهن رسمی مردانه اسلیم فیت', 'پیراهن رسمی مردانه با دوخت اسلیم فیت و پارچه ترکیبی', 'پیراهن رسمی مردانه با برش اسلیم فیت که فرم بدن را زیبا نشان می‌دهد. پارچه ترکیبی نخ و پلی‌استر با خاصیت ضد چروک، مناسب محیط کار و مهمانی‌های رسمی.

دکمه‌های با کیفیت بالا و دوخت دقیق در تمام قسمت‌ها. یقه ایتالیایی شیک و آستین‌های بلند با دکمه سردست. در سایزهای M تا XXL موجود.', 'پیراهن رسمی مردانه', 'خرید پیراهن رسمی مردانه اسلیم فیت با پارچه ضد چروک');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1602810319428-019690571b5b?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'دیپلمات', NULL, 0);

-- 6. Sports & Outdoor
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, compare_price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'dambell-khaneqi-' || extract(epoch from now())::bigint, 3500, 4000, 25, 'SPT-DMBL-2056', 'f6fde7b6-4139-4443-a318-40a9c8221373', 'active', 200, 10);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'ست دمبل خانگی با پوشش لاستیکی ۲۰ کیلویی', 'ست دمبل ۲۰ کیلویی با روکش لاستیکی ضد لغزش', 'ست دمبل خانگی ۲۰ کیلویی شامل دو میله و وزنه‌های قابل تنظیم از ۲ تا ۱۰ کیلوگرم. روکش لاستیکی ضد لغزش که از آسیب به کف زمین جلوگیری می‌کند.

مناسب تمرینات قدرتی در خانه، ساخته شده از فولاد کروم با دوام بالا. دسته‌های ارگونومیک که فشار روی مچ دست را کاهش می‌دهد. همراه با کیف حمل رایگان.', 'ست دمبل خانگی ۲۰ کیلویی', 'خرید ست دمبل خانگی ۲۰ کیلویی با روکش لاستیکی');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'آیرون فیت', NULL, 0);

-- 7. Home & Living
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, compare_price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'farsh-dastbaf-' || extract(epoch from now())::bigint, 15000, 18000, 10, 'HOM-CRPT-4193', 'bc5396fb-24bd-4a5d-9c2e-beb9cf026675', 'active', 300, 5);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'فرش دستبافت ابریشمی طرح هراتی', 'فرش دستبافت ابریشمی با طرح هراتی اصیل، ابعاد ۲×۳ متر', 'فرش دستبافت ابریشمی با طرح هراتی اصیل افغانستانی که توسط هنرمندان ماهر بافته شده است. رنگ‌های طبیعی گیاهی و بافت فوق‌العاده ظریف آن، این فرش را به یک اثر هنری تبدیل کرده.

ابعاد ۲×۳ متر، مناسب اتاق نشیمن و پذیرایی. دارای گواهی اصالت و ضمانت کیفیت. هر فرش یک اثر منحصر به فرد است و ارزش سرمایه‌گذاری دارد.', 'فرش دستبافت ابریشمی هراتی', 'خرید فرش دستبافت ابریشمی طرح هراتی اصیل افغانستان');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'هرات‌باف', NULL, 0);

-- 8. Bags & Luggage
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, compare_price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'kooleh-poshti-safari-' || extract(epoch from now())::bigint, 3200, 3800, 35, 'BAG-BKPK-8461', 'a9fe821d-15bb-4b0d-8759-90bbb4b8c588', 'active', 120, 1.2);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'کوله پشتی سفری ضد آب ۴۵ لیتری', 'کوله پشتی سفری ۴۵ لیتری ضد آب با پورت USB', 'کوله پشتی سفری ۴۵ لیتری با پارچه ضد آب و بندهای ارگونومیک که فشار روی شانه و کمر را به حداقل می‌رساند. مجهز به پورت شارژ USB خارجی و محفظه جداگانه لپ‌تاپ.

دارای چندین جیب سازمان‌دهی شده برای وسایل شخصی، قفل رمزی ضد سرقت و بند سینه‌ای قابل تنظیم. مناسب سفر، کوهنوردی و استفاده روزانه.', 'کوله پشتی سفری ضد آب', 'خرید کوله پشتی سفری ۴۵ لیتری ضد آب با پورت USB');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'تراولمیت', NULL, 0);

-- 9. Toys & Games
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'lego-sakhteman-' || extract(epoch from now())::bigint, 2400, 40, 'TOY-LEGO-7539', 'c4d10e96-9b53-4f2e-8690-66afae29f988', 'active', 100, 0.8);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'بلوک ساختنی ۵۰۰ تکه شهر رویایی', 'بلوک ساختنی ۵۰۰ تکه‌ای مناسب کودکان ۶ سال به بالا', 'مجموعه بلوک ساختنی ۵۰۰ تکه‌ای با طرح شهر رویایی شامل ساختمان‌ها، ماشین‌ها و شخصیت‌های متنوع. مناسب کودکان ۶ سال به بالا برای تقویت خلاقیت و مهارت‌های فضایی.

قطعات از جنس پلاستیک ABS بدون سرب و مواد سمی، کاملاً ایمن برای کودکان. دارای دفترچه راهنمای تصویری مرحله به مرحله. قابل ترکیب با سایر مجموعه‌های این برند.', 'بلوک ساختنی ۵۰۰ تکه', 'خرید بلوک ساختنی ۵۰۰ تکه شهر رویایی، مناسب کودکان');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'بریکس‌تاون', NULL, 0);

-- 10. Office & School Supplies
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'set-lavazem-tahrir-' || extract(epoch from now())::bigint, 950, 100, 'OFC-STST-4827', '178db899-e972-4ad8-829e-2fea2dd2f8d1', 'active', 50, 0.5);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'ست لوازم التحریر حرفه‌ای ۱۲ تکه', 'ست کامل لوازم التحریر شامل ۱۲ تکه برای دانش‌آموزان و دانشجویان', 'ست لوازم التحریر حرفه‌ای ۱۲ تکه شامل خودکار، مداد، پاک‌کن، تراش، خط‌کش، نقاله، گونیا، قیچی، چسب، ماژیک هایلایت و جامدادی چرمی.

تمامی قلم‌ها با جوهر با کیفیت و ماندگار بالا. جامدادی از جنس چرم مصنوعی با دوام و ظاهر شیک. بسته‌بندی جعبه‌ای مناسب هدیه دادن. ایده‌آل برای شروع سال تحصیلی جدید.', 'ست لوازم التحریر ۱۲ تکه', 'خرید ست لوازم التحریر حرفه‌ای ۱۲ تکه با جامدادی چرمی');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'نوشت‌افزار', NULL, 0);

-- 11. Pet Supplies
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'ghaza-gorbeh-' || extract(epoch from now())::bigint, 1200, 70, 'PET-CFOD-3294', 'bd6c7da3-ae9d-4d20-a269-57c394f5b44d', 'active', 100, 3);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'غذای خشک گربه بالغ ۳ کیلویی', 'غذای خشک گربه بالغ با طعم مرغ و ماهی، ۳ کیلوگرم', 'غذای خشک گربه بالغ با فرمول ویژه حاوی پروتئین بالا از گوشت مرغ و ماهی سالمون. غنی شده با ویتامین‌ها و مواد معدنی ضروری برای سلامت پوست، مو و سیستم ایمنی گربه.

بدون رنگ و طعم‌دهنده مصنوعی. حاوی تائورین برای سلامت چشم و قلب. ذرات کروکت با اندازه مناسب برای بهداشت دندان. مناسب تمام نژادهای گربه بالغ ۱ تا ۷ سال.', 'غذای خشک گربه ۳ کیلویی', 'خرید غذای خشک گربه بالغ ۳ کیلویی با طعم مرغ و ماهی');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'پت‌لایف', NULL, 0);

-- 12. Appliances
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, compare_price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'abmiveh-giri-' || extract(epoch from now())::bigint, 5500, 6500, 20, 'APL-JCMK-6718', 'a7f2f87d-a038-4559-81a2-1d445c04787e', 'active', 150, 4);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'آبمیوه‌گیری صنعتی ۱۰۰۰ واتی', 'آبمیوه‌گیری صنعتی با موتور ۱۰۰۰ وات و بدنه استیل', 'آبمیوه‌گیری صنعتی با موتور پرقدرت ۱۰۰۰ واتی و بدنه تمام استیل ضد زنگ. مجهز به سیستم فشار سرد برای حفظ حداکثر ویتامین‌ها و مواد مغذی میوه‌ها.

دهانه ورودی ۷۵ میلی‌متری برای میوه‌های درشت بدون نیاز به خرد کردن. مخزن تفاله ۱.۵ لیتری و پارچ آب‌میوه ۱ لیتری. قطعات قابل شستشو در ماشین ظرف‌شویی. ضمانت ۲ ساله.', 'آبمیوه‌گیری صنعتی ۱۰۰۰ وات', 'خرید آبمیوه‌گیری صنعتی ۱۰۰۰ واتی با بدنه استیل');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1622480914691-6362e3082ca3?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'پارسیکا', NULL, 0);

-- 13. Tools & Home Improvement
v_product_id := gen_random_uuid();
INSERT INTO products (id, seller_id, slug, price_afn, compare_price_afn, quantity, sku, category_id, status, delivery_fee, weight)
VALUES (v_product_id, v_seller_id, 'set-abzar-khanegi-' || extract(epoch from now())::bigint, 4200, 4800, 30, 'TLS-TLKT-5903', '11b0e166-ad9c-445f-b50e-5c7021d74087', 'active', 180, 6);
INSERT INTO product_translations (product_id, language, name, short_description, description, meta_title, meta_description)
VALUES (v_product_id, 'fa', 'جعبه ابزار خانگی ۸۵ تکه حرفه‌ای', 'جعبه ابزار ۸۵ تکه شامل آچار، پیچ‌گوشتی، انبردست و متر', 'جعبه ابزار خانگی ۸۵ تکه شامل انواع آچار، پیچ‌گوشتی‌های دوسو و چهارسو، انبردست، دم‌باریک، چکش، متر، تراز و سری‌های بکس در اندازه‌های مختلف.

تمامی ابزارها از فولاد کروم-وانادیوم ساخته شده و مقاوم در برابر زنگ‌زدگی هستند. جعبه سازمان‌دهی شده با قفل ایمنی، حمل آسان و دسترسی سریع به هر ابزار. مناسب تعمیرات خانگی و کارهای روزمره.', 'جعبه ابزار خانگی ۸۵ تکه', 'خرید جعبه ابزار خانگی ۸۵ تکه حرفه‌ای با فولاد ضد زنگ');
INSERT INTO product_media (product_id, media_type, url, sort_order, is_primary)
VALUES (v_product_id, 'image', 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=600', 0, true),
       (v_product_id, 'image', 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600', 1, false);
INSERT INTO product_attributes (product_id, attribute_key, attribute_value, language_code, sort_order)
VALUES (v_product_id, 'brand', 'کرافت‌پرو', NULL, 0);

END $$;
