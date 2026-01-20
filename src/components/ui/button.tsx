import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Primary button - Red background, white text (CTAs, Add to Cart, Buy Now, Checkout, Login, Confirm)
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        // Destructive - Same as primary for consistency
        destructive: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg",
        // Secondary button - Transparent with grey border (Filters, Cancel, Back, Optional actions)
        outline: "border border-muted-foreground/30 bg-transparent hover:bg-muted-foreground/10 text-foreground",
        secondary: "border border-muted-foreground/30 bg-transparent hover:bg-muted-foreground/10 text-foreground",
        // Ghost button - No background, subtle hover
        ghost: "hover:bg-muted hover:text-foreground",
        // Link button - Red text with underline
        link: "text-primary underline-offset-4 hover:underline",
        // Legacy support - map to primary
        accent: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        cyan: "bg-primary text-primary-foreground hover:bg-primary/80 shadow-md hover:shadow-lg hover:-translate-y-0.5",
        orange: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg hover:-translate-y-0.5",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8 text-base",
        xl: "h-12 rounded-xl px-10 text-lg font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
