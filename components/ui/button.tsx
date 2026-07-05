"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-[0.96rem] font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ui-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--ui-bg)]",
  {
    variants: {
      variant: {
        default:
          "bg-[linear-gradient(135deg,var(--ui-accent-fill),var(--ui-accent-fill-strong))] text-[#1a1a1a] shadow-[0_16px_30px_rgba(0,0,0,0.18)] hover:-translate-y-0.5",
        secondary:
          "border border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] text-[color:var(--ui-text)] hover:-translate-y-0.5 hover:bg-[color:var(--ui-surface-strong)]",
        outline:
          "border border-[color:var(--ui-border)] bg-transparent text-[color:var(--ui-text)] hover:-translate-y-0.5 hover:bg-[color:var(--ui-accent-soft)]",
        ghost:
          "bg-transparent text-[color:var(--ui-text)] hover:bg-[color:var(--ui-accent-soft)]",
        destructive:
          "bg-[color:var(--ui-warning)] text-[color:var(--ui-warning-fill-text)] shadow-sm hover:-translate-y-0.5",
        glass:
          "border border-[color:var(--ui-border)] bg-white/10 text-[color:var(--ui-text)] backdrop-blur-md hover:-translate-y-0.5 hover:bg-white/15",
        link: "bg-transparent text-[color:var(--ui-accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-5",
        sm: "h-11 px-4 text-xs",
        lg: "h-14 px-6 text-base",
        icon: "h-12 w-12",
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
