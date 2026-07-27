"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/**
 * Which icon shows is decided by CSS, not by React state.
 *
 * The previous version rendered a placeholder box until a `useEffect` set a
 * `mounted` flag, because `resolvedTheme` is unknown during SSR. That cost a
 * cascading render on every page load — and tripped React's
 * `set-state-in-effect` rule — to solve a problem CSS solves for free: both
 * icons are always in the DOM and the `.dark` class, which next-themes' own
 * blocking script applies before first paint, picks one. Identical markup on
 * server and client, so there is nothing to hydrate and nothing to shift.
 *
 * The accessible name is swapped the same way, and names the outcome rather
 * than the state — "Toggle theme" left you to work out which way it would go.
 */
export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground"
    >
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
      {/* Hidden elements are excluded from the accessible name computation, so
          exactly one of these ever names the button. */}
      <span className="sr-only dark:hidden">Switch to dark theme</span>
      <span className="sr-only hidden dark:inline">Switch to light theme</span>
    </Button>
  );
}
