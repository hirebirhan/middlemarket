import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Solid fill is the app's scarcest signal — one per view, reserved for
        // the action that completes the task.
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent",
        destructive:
          "border border-danger-foreground/30 bg-danger text-danger-foreground hover:bg-danger-foreground/15",
        // Underlined, because `primary` is the same ink as body text in this
        // palette — color alone cannot mark a link here.
        link: "text-foreground underline underline-offset-4 hover:no-underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-6",
        icon: "h-10 w-10",
      },
    },
    // Applied after `size`, so a link keeps its intrinsic height instead of
    // inheriting the default button box.
    compoundVariants: [{ variant: "link", className: "h-auto px-0 py-0" }],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        // Defaulting to "button" keeps stray buttons inside a <form> from
        // submitting it — the admin review row has two of them.
        type={type}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
