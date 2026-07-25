"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useFieldProps } from "./field";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  const fieldProps = useFieldProps();
  return (
    <textarea
      ref={ref}
      {...fieldProps}
      {...props}
      className={cn(
        "flex min-h-[5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm transition-colors",
        "placeholder:text-muted-foreground",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-[invalid]:border-danger-foreground",
        className
      )}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
