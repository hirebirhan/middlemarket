import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Status chips read as tinted surfaces, never as solid `primary` fills — a
 * badge labels something, it does not ask to be clicked. Colors come from the
 * status tokens so light and dark stay contrast-checked together.
 */
const badgeVariants = cva(
  "inline-flex items-center whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-medium capitalize",
  {
    variants: {
      variant: {
        neutral: "border-transparent bg-secondary text-secondary-foreground",
        outline: "border-border text-muted-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        info: "border-transparent bg-info text-info-foreground",
        danger: "border-transparent bg-danger text-danger-foreground",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
