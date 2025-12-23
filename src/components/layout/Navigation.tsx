import { Menu, ChevronDown, Zap, Package, Grid3X3, BookOpen, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";
import { translations } from "@/lib/i18n";

const categories = [
  translations.categories.electronics,
  translations.categories.fashion,
  translations.categories.homeGarden,
  translations.categories.sports,
  translations.categories.healthBeauty,
  translations.categories.toysGames,
  translations.categories.automotive,
  translations.categories.booksMedia,
];

const navLinks = [
  { label: translations.nav.products, icon: Package, href: "/products" },
  { label: translations.nav.categories, icon: Grid3X3, href: "/categories" },
  { label: translations.nav.newArrivals, icon: Zap, href: "/products?filter=new", badge: "جدید" },
  { label: translations.nav.blog, icon: BookOpen, href: "/blog" },
  { label: translations.nav.contactUs, icon: Phone, href: "/contact" },
  { label: translations.nav.aboutUs, icon: Info, href: "/about" },
];

const Navigation = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  return (
    <nav className="bg-card border-b border-border">
      <div className="container">
        <div className="flex items-center">
          {/* Category Dropdown */}
          <div className="relative">
            <Button
              variant="accent"
              className="rounded-none h-12 px-6 gap-2 font-semibold"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="hidden sm:inline">{translations.nav.category}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* Category Dropdown Menu */}
            {isCategoryOpen && (
              <div className="absolute top-full left-0 w-64 bg-card border border-border shadow-xl rounded-b-lg z-50 animate-fade-in">
                {categories.map((category, index) => (
                  <Link
                    key={category}
                    to={`/categories/${encodeURIComponent(category)}`}
                    className="flex items-center px-4 py-3 hover:bg-orange/10 hover:text-orange transition-colors border-b border-border last:border-b-0"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center gap-1 px-4 py-3 h-12 text-sm font-medium text-foreground hover:text-cyan transition-colors relative group"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {link.badge && (
                  <Badge variant="sale" className="mr-1 text-[10px] px-1.5 py-0">
                    {link.badge}
                  </Badge>
                )}
                <span className="absolute bottom-0 right-0 w-full h-0.5 bg-cyan scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
              </Link>
            ))}
          </div>

          {/* Special Offers */}
          <div className="hidden md:flex items-center gap-4 mr-auto">
            <Link to="/products?filter=sale" className="text-sm text-muted-foreground hover:text-orange transition-colors">
              {translations.nav.specialOffer}
            </Link>
            <Badge variant="hot" className="animate-pulse">
              {translations.nav.blackFriday}
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
