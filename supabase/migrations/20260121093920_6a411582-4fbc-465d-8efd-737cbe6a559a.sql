
-- About page sections (vision, mission, history, awards intro)
CREATE TABLE public.about_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT NOT NULL UNIQUE, -- 'vision', 'mission', 'history', 'awards_intro'
  title_en TEXT NOT NULL,
  title_fa TEXT,
  description_en TEXT,
  description_fa TEXT,
  content_en TEXT, -- for rich text (history)
  content_fa TEXT,
  icon TEXT, -- lucide icon name
  start_year INTEGER, -- for history
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- About page values
CREATE TABLE public.about_values (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_fa TEXT,
  description_en TEXT,
  description_fa TEXT,
  icon TEXT NOT NULL DEFAULT 'CheckCircle',
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- About page team members
CREATE TABLE public.about_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_fa TEXT,
  role_en TEXT NOT NULL,
  role_fa TEXT,
  description_en TEXT,
  description_fa TEXT,
  photo_url TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- About page awards
CREATE TABLE public.about_awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title_en TEXT NOT NULL,
  title_fa TEXT,
  description_en TEXT,
  description_fa TEXT,
  year INTEGER,
  icon_or_image TEXT,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_awards ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "About sections are viewable by everyone" ON public.about_sections FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "About values are viewable by everyone" ON public.about_values FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "About team members are viewable by everyone" ON public.about_team_members FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "About awards are viewable by everyone" ON public.about_awards FOR SELECT USING (is_active = true OR has_role(auth.uid(), 'admin'::app_role));

-- Admin management policies
CREATE POLICY "Admins can manage about sections" ON public.about_sections FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage about values" ON public.about_values FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage about team members" ON public.about_team_members FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage about awards" ON public.about_awards FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Updated_at triggers
CREATE TRIGGER update_about_sections_updated_at BEFORE UPDATE ON public.about_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_values_updated_at BEFORE UPDATE ON public.about_values FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_team_members_updated_at BEFORE UPDATE ON public.about_team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_about_awards_updated_at BEFORE UPDATE ON public.about_awards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default sections
INSERT INTO public.about_sections (section_key, title_en, title_fa, description_en, description_fa, icon) VALUES
('vision', 'Our Vision', 'چشم‌انداز ما', 'To become the leading online marketplace in Afghanistan, connecting sellers and buyers with trust and convenience.', 'تبدیل شدن به بزرگترین بازار آنلاین در افغانستان، اتصال فروشندگان و خریداران با اعتماد و راحتی.', 'Eye'),
('mission', 'Our Mission', 'ماموریت ما', 'Empowering local businesses and providing customers with quality products at competitive prices through a secure and user-friendly platform.', 'توانمندسازی کسب‌وکارهای محلی و ارائه محصولات با کیفیت به مشتریان با قیمت‌های رقابتی از طریق یک پلتفرم امن و کاربرپسند.', 'Target'),
('history', 'Our History', 'تاریخچه ما', 'Founded with a vision to transform e-commerce in Afghanistan, we started our journey in 2020. Since then, we have grown to become a trusted platform serving thousands of customers.', 'با چشم‌انداز تحول تجارت الکترونیک در افغانستان، سفر خود را در سال ۲۰۲۰ آغاز کردیم. از آن زمان تاکنون، به یک پلتفرم معتبر تبدیل شده‌ایم که به هزاران مشتری خدمات ارائه می‌دهد.', 'History');

-- Insert default values
INSERT INTO public.about_values (title_en, title_fa, description_en, description_fa, icon, priority) VALUES
('Integrity', 'صداقت', 'Transparency and honesty in all transactions', 'شفافیت و صداقت در تمام معاملات', 'CheckCircle', 1),
('Quality', 'کیفیت', 'Providing the best products with highest quality', 'ارائه بهترین محصولات با بالاترین کیفیت', 'Award', 2),
('Customer Focus', 'مشتری‌مداری', 'Customer satisfaction is our priority', 'اولویت ما رضایت مشتریان است', 'Users', 3),
('Innovation', 'نوآوری', 'Always looking for better ways', 'همیشه به دنبال راه‌های بهتر هستیم', 'Heart', 4);

-- Insert default team members
INSERT INTO public.about_team_members (name_en, name_fa, role_en, role_fa, description_en, description_fa, photo_url, priority) VALUES
('Ahmad Mohammadi', 'احمد محمدی', 'CEO', 'مدیر عامل', 'Over 15 years of business management experience', 'بیش از ۱۵ سال تجربه در مدیریت کسب‌وکار', 'https://i.pravatar.cc/300?img=11', 1),
('Sara Ahmadi', 'سارا احمدی', 'CTO', 'مدیر فناوری', 'Expert in software development and infrastructure', 'متخصص در توسعه نرم‌افزار و زیرساخت', 'https://i.pravatar.cc/300?img=5', 2),
('Ali Rezaei', 'علی رضایی', 'Marketing Director', 'مدیر بازاریابی', 'Digital marketing strategist', 'استراتژیست دیجیتال مارکتینگ', 'https://i.pravatar.cc/300?img=12', 3),
('Fatima Karimi', 'فاطمه کریمی', 'Support Manager', 'مدیر پشتیبانی', 'Committed to customer satisfaction', 'تعهد به رضایت مشتری', 'https://i.pravatar.cc/300?img=9', 4);
