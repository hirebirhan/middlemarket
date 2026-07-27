"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * `defaultTheme` was "dark" alongside `enableSystem`, which reads as "follow
 * the OS" but does not: the explicit default wins, so a visitor on a light
 * machine was handed a dark app on first paint. "system" is the honest
 * default — the toggle is still there for anyone who disagrees, and the choice
 * persists from then on.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
