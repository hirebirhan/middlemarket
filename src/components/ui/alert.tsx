import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "flex items-start gap-2.5 rounded-md border px-3 py-2.5 text-sm",
  {
    variants: {
      variant: {
        danger: "border-danger-foreground/25 bg-danger text-danger-foreground",
        success:
          "border-success-foreground/25 bg-success text-success-foreground",
        info: "border-info-foreground/25 bg-info text-info-foreground",
      },
    },
    defaultVariants: { variant: "info" },
  }
);

const ICONS = {
  danger: AlertCircle,
  success: CheckCircle2,
  info: Info,
} as const;

export function Alert({
  variant = "info",
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>) {
  const Icon = ICONS[variant ?? "info"];
  return (
    <div
      // Errors must be announced; informational text should not interrupt.
      role={variant === "danger" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
