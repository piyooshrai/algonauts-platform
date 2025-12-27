import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-error-600 text-white",
        outline:
          "border-border text-foreground",
        success:
          "border-transparent bg-success-100 text-success-700",
        warning:
          "border-transparent bg-warning-100 text-warning-700",
        info:
          "border-transparent bg-blue-100 text-blue-700",
        // Rank badges
        gold:
          "border-transparent bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-sm",
        silver:
          "border-transparent bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800 shadow-sm",
        bronze:
          "border-transparent bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-sm",
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
