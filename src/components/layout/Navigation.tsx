import { Menu, ChevronDown, Zap, Package, Grid3X3, BookOpen, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { useCategories } from "@/hooks/useCategories";
import { Skeleton } from "@/components/ui/skeleton";

const Navigation = () => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { t, isRTL } = useLanguage();
  const { getRootCategories, loading } = useCategories();

  const rootCategories = getRootCategories();

  const navLinks = [
    { label: t.nav.products, icon: Package, href: "/products" },
    { label: t.nav.categories, icon: Grid3X3, href: "/categories" },
    { label: t.nav.newArrivals, icon: Zap, href: "/products?filter=new", badge: isRTL ? "جدید" : "New" },
    { label: t.nav.blog, icon: BookOpen, href: "/blog" },
    { label: t.nav.contactUs, icon: Phone, href: "/contact" },
    { label: t.nav.aboutUs, icon: Info, href: "/about" },
  ];

  return (
    <nav className="bg-background border-b border-muted-foreground/20 shadow-sm">
      <div className="container">
        <div className="flex items-center">
          {/* Category Dropdown - Red button */}
          <div className="relative">
            <Button
              className="rounded-none h-12 px-6 gap-2 font-semibold"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="hidden sm:inline">{t.nav.category}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* Category Dropdown Menu */}
            {isCategoryOpen && (
              <div className={`absolute top-full w-64 bg-background border border-muted-foreground/30 shadow-xl rounded-b-lg z-50 animate-fade-in ${isRTL ? 'right-0' : 'left-0'}`}>
                {loading ? (
                  <div className="p-4 space-y-2">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : rootCategories.length > 0 ? (
                  rootCategories.map((category, index) => (
                    <Link
                      key={category.id}
                      to={`/categories?category=${category.slug}`}
                      className="flex items-center px-4 py-3 text-foreground hover:bg-primary/10 hover:text-primary transition-colors border-b border-muted-foreground/10 last:border-b-0"
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setIsCategoryOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))
                ) : (
                  <div className="px-4 py-3 text-muted-foreground text-sm">
                    {isRTL ? 'دسته‌بندی موجود نیست' : 'No categories available'}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center gap-1 px-4 py-3 h-12 text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {link.badge && (
                  <Badge variant="sale" className={`text-[10px] px-1.5 py-0 ${isRTL ? 'mr-1' : 'ml-1'}`}>
                    {link.badge}
                  </Badge>
                )}
                {/* Red underline indicator on hover */}
                <span className={`absolute bottom-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform ${isRTL ? 'right-0 origin-right' : 'left-0 origin-left'}`} />
              </Link>
            ))}
          </div>

          {/* Special Offers */}
          <div className={`hidden md:flex items-center gap-4 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
            <Link to="/products?filter=sale" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {t.nav.specialOffer}
            </Link>
            <Badge variant="hot" className="animate-pulse">
              {t.nav.blackFriday}
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
