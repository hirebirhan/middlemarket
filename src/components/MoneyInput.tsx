import * as React from "react";
import { Input } from "@/components/ui/input";

/**
 * An `Input` configured for money entry — numeric input mode, no spinners, and
 * monospace so digits line up. The stock shadcn `Input` has no `MoneyInput`
 * export, so this wrapper lives outside `ui/`.
 */
export function MoneyInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      inputMode="numeric"
      className={className}
      {...props}
    />
  );
}
