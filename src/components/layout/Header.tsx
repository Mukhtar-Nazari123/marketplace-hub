import { Search, ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-orange flex items-center justify-center">
              <span className="text-accent-foreground font-bold text-xl">M</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-foreground">MARKET</h1>
              <p className="text-xs text-muted-foreground -mt-1">Online Store</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:flex">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search products..."
                className="w-full pl-4 pr-24 h-11 rounded-full border-2 border-border focus:border-cyan transition-colors"
              />
              <Button
                variant="cyan"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-6"
              >
                <Search className="h-4 w-4 mr-1" />
                Search
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
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-orange text-accent-foreground text-xs flex items-center justify-center font-bold">
                3
              </span>
            </Button>

            {/* Account */}
            <div className="hidden sm:flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="text-sm">
                <p className="text-muted-foreground">Sign In / Register</p>
                <p className="font-medium text-foreground">Welcome Guest</p>
              </div>
            </div>

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
              placeholder="Search products..."
              className="w-full pl-4 pr-20 h-10 rounded-full border-2 border-border"
            />
            <Button
              variant="cyan"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full px-4"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
