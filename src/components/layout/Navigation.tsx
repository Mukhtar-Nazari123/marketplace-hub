import { Zap, Package, Grid3X3, BookOpen, Phone, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import CategoryMegaMenu from "./CategoryMegaMenu";

const Navigation = () => {
  const { t, isRTL } = useLanguage();

  const navLinks = [
    { label: t.nav.products, icon: Package, href: "/products" },
    { label: t.nav.categories, icon: Grid3X3, href: "/categories" },
    { label: t.nav.newArrivals, icon: Zap, href: "/products?filter=new", badge: isRTL ? "جدید" : "New" },
    { label: t.nav.blog, icon: BookOpen, href: "/blog" },
    { label: t.nav.contactUs, icon: Phone, href: "/contact" },
    { label: t.nav.aboutUs, icon: Info, href: "/about" },
  ];

  return (
    <nav className="hidden lg:block bg-background/80 backdrop-blur-md border-b border-muted-foreground/20 shadow-sm">
      <div className="container">
        <div className="flex items-center">
          {/* Category Mega Menu */}
          <CategoryMegaMenu />

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

        </div>
      </div>
    </nav>
  );
};

export default Navigation;
