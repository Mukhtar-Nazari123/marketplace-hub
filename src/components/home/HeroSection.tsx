import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Headphones } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden">
      <div className="container py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Hero */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden gradient-hero min-h-[400px] lg:min-h-[500px] animate-fade-in">
            <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/90 to-transparent" />
            
            {/* Decorative Elements */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-cyan/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-20 w-48 h-48 bg-orange/20 rounded-full blur-3xl" />
            
            <div className="relative z-10 p-8 lg:p-12 h-full flex flex-col justify-center max-w-lg">
              <Badge variant="sale" className="w-fit mb-4 text-sm px-4 py-1">
                SALE 50% OFF
              </Badge>
              
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-background mb-4 leading-tight">
                MODERN STYLE
                <span className="block text-cyan">HEADPHONES</span>
                MODEL
              </h2>
              
              <p className="text-background/70 mb-6 text-lg">
                Be quick! Only 100 products available at this sale price.
              </p>
              
              <Button variant="orange" size="xl" className="w-fit group">
                Shop Now
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Floating Product Image Placeholder */}
            <div className="absolute right-8 bottom-8 lg:right-16 lg:bottom-16 opacity-80">
              <div className="w-48 h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-cyan/30 to-orange/30 flex items-center justify-center animate-float">
                <Headphones className="w-24 h-24 lg:w-32 lg:h-32 text-background/50" />
              </div>
            </div>
          </div>

          {/* Side Banners */}
          <div className="flex flex-col gap-6">
            {/* Banner 1 */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-cyan/10 to-cyan/5 p-6 flex-1 hover-lift animate-slide-in-right stagger-1">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan/20 rounded-full blur-2xl" />
              <Badge variant="new" className="mb-2">Now Available!</Badge>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                TOP SELLING <span className="text-cyan">iMAC</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-2">Latest generation</p>
              <p className="text-2xl font-bold text-cyan">
                Starting From <span className="text-foreground">$399</span>
              </p>
            </div>

            {/* Banner 2 */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-orange/10 to-orange/5 p-6 flex-1 hover-lift animate-slide-in-right stagger-2">
              <div className="absolute top-0 right-0 w-20 h-20 bg-orange/20 rounded-full blur-2xl" />
              <Badge variant="sale" className="mb-2">Now Available!</Badge>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                TOP SELLING <span className="text-orange">APPLIANCES</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-2">Kitchen essentials</p>
              <p className="text-2xl font-bold text-orange">
                Starting From <span className="text-foreground">$199</span>
              </p>
            </div>

            {/* Banner 3 */}
            <div className="relative rounded-xl overflow-hidden bg-gradient-to-br from-cyan/10 to-cyan/5 p-6 flex-1 hover-lift animate-slide-in-right stagger-3">
              <div className="absolute top-0 right-0 w-20 h-20 bg-cyan/20 rounded-full blur-2xl" />
              <Badge variant="new" className="mb-2">Now Available!</Badge>
              <h3 className="font-display font-bold text-lg text-foreground mb-1">
                TOP SELLING <span className="text-cyan">ACCESSORIES</span>
              </h3>
              <p className="text-muted-foreground text-sm mb-2">Must-have gadgets</p>
              <p className="text-2xl font-bold text-cyan">
                Starting From <span className="text-foreground">$99</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
