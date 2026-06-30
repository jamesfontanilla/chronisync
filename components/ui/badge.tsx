"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[color:var(--ui-accent)] focus:ring-offset-2 focus:ring-offset-[color:var(--ui-bg)]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[color:var(--ui-accent-soft)] text-[color:var(--ui-accent)]",
        secondary:
          "border-[color:var(--ui-border)] bg-[color:var(--ui-surface)] text-[color:var(--ui-text)]",
        destructive:
          "border-transparent bg-[color:var(--ui-warning-soft)] text-[color:var(--ui-warning)]",
        outline:
          "border-[color:var(--ui-border)] bg-transparent text-[color:var(--ui-text)]",
        glass:
          "border-[color:var(--ui-border)] bg-white/10 text-[color:var(--ui-text)] backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
