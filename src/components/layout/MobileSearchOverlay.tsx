import { useState, useEffect, useRef } from "react";
import { Search, X, ArrowLeft, TrendingUp, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/i18n";
import { useNavigate } from "react-router-dom";

interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileSearchOverlay = ({ isOpen, onClose }: MobileSearchOverlayProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const texts = {
    en: {
      searchPlaceholder: "Search products...",
      trending: "Trending",
      recent: "Recent Searches",
      clear: "Clear",
      cancel: "Cancel",
    },
    fa: {
      searchPlaceholder: "جستجوی محصولات...",
      trending: "پرطرفدار",
      recent: "جستجوهای اخیر",
      clear: "پاک کردن",
      cancel: "لغو",
    },
    ps: {
      searchPlaceholder: "محصولات لټون...",
      trending: "مشهور",
      recent: "وروستي لټونونه",
      clear: "پاکول",
      cancel: "لغوه",
    },
  };

  const txt = texts[language] || texts.en;

  // Mock trending searches
  const trendingSearches = [
    { en: "Smartphones", fa: "گوشی هوشمند", ps: "سمارټ فونونه" },
    { en: "Laptops", fa: "لپ تاپ", ps: "لپ ټاپ" },
    { en: "Headphones", fa: "هدفون", ps: "هیډفون" },
    { en: "Watches", fa: "ساعت", ps: "ساعتونه" },
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSearch = (query?: string) => {
    const searchTerm = query || searchQuery;
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
      setSearchQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-background"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b border-border/50 bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="flex-shrink-0"
        >
          {isRTL ? <ArrowLeft className="h-5 w-5 rotate-180" /> : <ArrowLeft className="h-5 w-5" />}
        </Button>

        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            type="text"
            placeholder={txt.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`w-full h-11 rounded-full bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20 ${
              isRTL ? "pr-4 pl-11 text-right" : "pl-4 pr-11 text-left"
            }`}
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => handleSearch()}
            className={`absolute top-1/2 -translate-y-1/2 h-8 w-8 ${
              isRTL ? "left-1.5" : "right-1.5"
            }`}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="flex-shrink-0 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-60px)]">
        {/* Trending Searches */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h3 className="font-medium text-sm text-foreground">{txt.trending}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {trendingSearches.map((item, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSearch(item[language] || item.en)}
                className="rounded-full border-border/50 hover:bg-primary/10 hover:border-primary/50 transition-colors"
              >
                {item[language] || item.en}
              </Button>
            ))}
          </div>
        </div>

        {/* Search Suggestions when typing */}
        {searchQuery && (
          <div className="space-y-1">
            {trendingSearches
              .filter((item) =>
                (item[language] || item.en)
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              )
              .map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(item[language] || item.en)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm">{item[language] || item.en}</span>
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSearchOverlay;
