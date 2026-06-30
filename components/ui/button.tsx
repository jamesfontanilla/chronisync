"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ui-bg)]",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--ui-accent),var(--ui-accent-strong))] text-white shadow-[0_16px_30px_rgba(11,76,89,0.2)] hover:-translate-y-0.5",
        secondary:
          "border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] text-[color:var(--ui-text)] hover:-translate-y-0.5 hover:bg-[color:var(--ui-surface-strong)]",
        outline:
          "border border-[color:var(--ui-border)] bg-transparent text-[color:var(--ui-text)] hover:-translate-y-0.5 hover:bg-[color:var(--ui-accent-soft)]",
        ghost:
          "bg-transparent text-[color:var(--ui-text)] hover:bg-[color:var(--ui-accent-soft)]",
        destructive:
          "bg-[color:var(--ui-warning)] text-white shadow-sm hover:-translate-y-0.5",
        glass:
          "border border-[color:var(--ui-border)] bg-white/10 text-[color:var(--ui-text)] backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/15",
        link: "bg-transparent text-[color:var(--ui-accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-6 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
