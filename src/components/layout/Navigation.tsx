import { Menu, ChevronDown, Zap, Gift, BookOpen, Phone, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const categories = [
  "Electronics",
  "Fashion & Clothing",
  "Home & Garden",
  "Sports & Outdoors",
  "Health & Beauty",
  "Toys & Games",
  "Automotive",
  "Books & Media",
];

const navLinks = [
  { label: "New Arrivals", icon: Zap, badge: "NEW" },
  { label: "Promotions", icon: Gift },
  { label: "Specials", icon: null },
  { label: "Blog", icon: BookOpen },
  { label: "Contact Us", icon: Phone },
  { label: "About Us", icon: Info },
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
              <span className="hidden sm:inline">CATEGORY</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
            </Button>

            {/* Category Dropdown Menu */}
            {isCategoryOpen && (
              <div className="absolute top-full left-0 w-64 bg-card border border-border shadow-xl rounded-b-lg z-50 animate-fade-in">
                {categories.map((category, index) => (
                  <a
                    key={category}
                    href="#"
                    className="flex items-center px-4 py-3 hover:bg-orange/10 hover:text-orange transition-colors border-b border-border last:border-b-0"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {category}
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden lg:flex items-center flex-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href="#"
                className="flex items-center gap-1 px-4 py-3 h-12 text-sm font-medium text-foreground hover:text-cyan transition-colors relative group"
              >
                {link.icon && <link.icon className="h-4 w-4" />}
                {link.label}
                {link.badge && (
                  <Badge variant="sale" className="ml-1 text-[10px] px-1.5 py-0">
                    {link.badge}
                  </Badge>
                )}
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </a>
            ))}
          </div>

          {/* Special Offers */}
          <div className="hidden md:flex items-center gap-4 ml-auto">
            <a href="#" className="text-sm text-muted-foreground hover:text-orange transition-colors">
              Special Offer!
            </a>
            <Badge variant="hot" className="animate-pulse">
              Black Friday
            </Badge>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
