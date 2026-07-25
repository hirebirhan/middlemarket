"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFieldProps } from "./field";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => {
  const fieldProps = useFieldProps();
  return (
    <div className="relative">
      <select
        ref={ref}
        {...fieldProps}
        {...props}
        className={cn(
          "flex h-10 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm font-medium transition-colors",
          "hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid]:border-danger-foreground",
          className
        )}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
});
Select.displayName = "Select";

export { Select };
