import { X, ChevronDown, Package, Grid3X3, Zap, BookOpen, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const { t, isRTL } = useLanguage();

  const categories = [
    t.categories.electronics,
    t.categories.fashion,
    t.categories.homeGarden,
    t.categories.sports,
    t.categories.healthBeauty,
    t.categories.toysGames,
    t.categories.automotive,
    t.categories.booksMedia,
  ];

  const navLinks = [
    { label: t.nav.products, icon: Package, href: "/products" },
    { label: t.nav.categories, icon: Grid3X3, href: "/categories" },
    { label: t.nav.newArrivals, icon: Zap, href: "/products?filter=new", badge: isRTL ? "جدید" : "New" },
    { label: t.nav.blog, icon: BookOpen, href: "/blog" },
    { label: t.nav.contactUs, icon: Phone, href: "/contact" },
    { label: t.nav.aboutUs, icon: Info, href: "/about" },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Menu Panel */}
      <div className={`fixed top-0 h-full w-80 max-w-[85vw] bg-card z-50 lg:hidden shadow-xl overflow-y-auto ${isRTL ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-left'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange flex items-center justify-center">
              <span className="text-accent-foreground font-bold">M</span>
            </div>
            <span className="font-display font-bold text-foreground">{isRTL ? 'مارکت' : 'Market'}</span>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {/* Category Dropdown */}
          <div className="mb-4">
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center justify-between w-full px-4 py-3 bg-orange rounded-lg text-accent-foreground font-semibold"
            >
              <span className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                {t.nav.category}
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isCategoryOpen && (
              <div className="mt-2 bg-secondary rounded-lg overflow-hidden">
                {categories.map((category) => (
                  <Link
                    key={category}
                    to={`/categories/${encodeURIComponent(category)}`}
                    className="block px-4 py-3 hover:bg-orange/10 hover:text-orange transition-colors border-b border-border last:border-b-0"
                    onClick={onClose}
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary hover:text-cyan transition-colors"
                onClick={onClose}
              >
                <link.icon className="h-5 w-5" />
                <span>{link.label}</span>
                {link.badge && (
                  <Badge variant="sale" className={`text-[10px] px-1.5 py-0 ${isRTL ? 'mr-auto' : 'ml-auto'}`}>
                    {link.badge}
                  </Badge>
                )}
              </Link>
            ))}
          </div>

          {/* Special Offers */}
          <div className="mt-6 p-4 bg-gradient-to-r from-orange/10 to-cyan/10 rounded-lg">
            <Badge variant="hot" className="animate-pulse mb-2">
              {t.nav.blackFriday}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {t.nav.specialOffer}
            </p>
          </div>
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;
