import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useState } from "react";
import { translations } from "@/lib/i18n";

const categories = [
  translations.categories.electronics,
  translations.bestSellers.television,
  translations.bestSellers.airConditional,
  translations.bestSellers.laptopsAccessories,
  translations.bestSellers.smartphoneTablets,
];

const products = [
  { name: "مخلوط‌کن جدید", price: 95.0, rating: 4, reviews: 0 },
  { name: "اپل آیفون ۶ ۱۲۸ گیگابایت", price: 295.0, rating: 5, reviews: 0, badge: "new" as const },
  { name: "مخلوط‌کن جدید", price: 140.0, originalPrice: 200.0, rating: 4, reviews: 0, badge: "sale" as const, discount: 30 },
  { name: "مخلوط‌کن جدید", price: 395.0, rating: 4, reviews: 0 },
  { name: "مخلوط‌کن جدید", price: 95.0, rating: 3, reviews: 0, badge: "new" as const },
];

const BestSellers = () => {
  const [activeCategory, setActiveCategory] = useState(translations.categories.electronics);

  return (
    <section className="py-12 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange px-4 py-2 rounded-lg">
              <h2 className="font-display font-bold text-lg text-accent-foreground">{translations.bestSellers.weeklyBestSellers}</h2>
            </div>
            <Button variant="link" className="text-muted-foreground hover:text-cyan gap-1">
              {translations.deals.seeAll} <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap rounded-lg transition-all ${
                  activeCategory === category ? "bg-cyan text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <div key={index} className="opacity-0 animate-fade-in-up" style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}>
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
