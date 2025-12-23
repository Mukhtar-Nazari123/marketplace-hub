import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import MobileMenu from "./MobileMenu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, isRTL } = useLanguage();

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-orange flex items-center justify-center">
                <span className="text-accent-foreground font-bold text-xl">M</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-display text-xl font-bold text-foreground">{isRTL ? 'مارکت' : 'Market'}</h1>
                <p className="text-xs text-muted-foreground -mt-1">{t.footer.onlineStore}</p>
              </div>
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl hidden md:flex">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder={t.header.searchPlaceholder}
                  className={`w-full h-11 rounded-full border-2 border-border focus:border-cyan transition-colors ${isRTL ? 'pr-4 pl-24 text-right' : 'pl-4 pr-24 text-left'}`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
                <Button
                  variant="cyan"
                  size="sm"
                  className={`absolute top-1/2 -translate-y-1/2 rounded-full px-6 ${isRTL ? 'left-1' : 'right-1'}`}
                >
                  <Search className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                  {t.header.search}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Search */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Search className="h-5 w-5" />
              </Button>

              {/* Cart */}
              <Link to="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  <span className={`absolute -top-1 h-5 w-5 rounded-full bg-orange text-accent-foreground text-xs flex items-center justify-center font-bold ${isRTL ? '-right-1' : '-left-1'}`}>
                    {isRTL ? '۳' : '3'}
                  </span>
                </Button>
              </Link>

              {/* Account */}
              <Link to="/auth" className="hidden sm:flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div className={`text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="text-muted-foreground">{t.header.signIn}</p>
                  <p className="font-medium text-foreground">{t.header.welcomeGuest}</p>
                </div>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(true)}
                aria-label={isRTL ? 'منو' : 'Menu'}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-4 md:hidden">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder={t.header.searchPlaceholder}
                className={`w-full h-10 rounded-full border-2 border-border ${isRTL ? 'pr-4 pl-20 text-right' : 'pl-4 pr-20 text-left'}`}
                dir={isRTL ? 'rtl' : 'ltr'}
              />
              <Button
                variant="cyan"
                size="sm"
                className={`absolute top-1/2 -translate-y-1/2 rounded-full px-4 ${isRTL ? 'left-1' : 'right-1'}`}
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  );
};

export default Header;
