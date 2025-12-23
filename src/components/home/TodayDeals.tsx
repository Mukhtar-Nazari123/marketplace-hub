import { ArrowRight, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";

const products = [
  {
    name: "New Style Blender Pro",
    price: 160.0,
    originalPrice: 200.0,
    rating: 4,
    reviews: 0,
    badge: "sale" as const,
    discount: 20,
    countdown: { hours: 90, minutes: 48, seconds: 53 },
  },
  {
    name: "Apple iPhone 6 128GB",
    price: 255.0,
    rating: 5,
    reviews: 0,
    countdown: { hours: 90, minutes: 48, seconds: 53 },
  },
  {
    name: "New Style Blender Mini",
    price: 140.0,
    originalPrice: 200.0,
    rating: 4,
    reviews: 0,
    badge: "sale" as const,
    discount: 30,
    countdown: { hours: 90, minutes: 48, seconds: 53 },
  },
  {
    name: "Portable Earbuds Set",
    price: 95.0,
    originalPrice: 105.0,
    rating: 3,
    reviews: 0,
    badge: "sale" as const,
    discount: 20,
    countdown: { hours: 90, minutes: 48, seconds: 53 },
  },
  {
    name: "Pro Laptop 15 inch",
    price: 195.0,
    rating: 4,
    reviews: 0,
    badge: "new" as const,
    countdown: { hours: 90, minutes: 48, seconds: 53 },
  },
];

const TodayDeals = () => {
  return (
    <section className="py-12 bg-background">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange px-4 py-2 rounded-lg">
              <Clock className="h-5 w-5 text-accent-foreground" />
              <h2 className="font-display font-bold text-lg text-accent-foreground">TODAY DEAL</h2>
            </div>
            <Button variant="link" className="text-muted-foreground hover:text-cyan gap-1">
              See All <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {products.map((product, index) => (
            <div
              key={index}
              className="opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TodayDeals;
