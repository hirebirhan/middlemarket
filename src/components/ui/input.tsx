"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldProps } from "./field";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  const fieldProps = useFieldProps();
  return (
    <input
      type={type}
      ref={ref}
      {...fieldProps}
      {...props}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid]:border-danger-foreground",
        className
      )}
    />
  );
});
Input.displayName = "Input";

export { Input };
