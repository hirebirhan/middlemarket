"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

/**
 * A `Button` that shows a spinner and blocks interaction while `loading` is
 * true. The stock shadcn `Button` does not carry a `loading` prop, so this
 * wrapper composes it with `Spinner` — keeping `ui/button.tsx` stock.
 */
type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean;
};

export function LoadingButton({
  loading = false,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={disabled || loading}
      className={cn(loading && "cursor-not-allowed", className)}
      {...props}
    >
      {loading && <Spinner className="absolute" aria-hidden="true" />}
      <span
        className={cn(
          "inline-flex items-center justify-center gap-1.5 whitespace-nowrap",
          loading && "opacity-0"
        )}
      >
        {children}
      </span>
    </Button>
  );
}
