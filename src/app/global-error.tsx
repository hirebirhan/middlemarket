"use client";

import { useEffect } from "react";

/**
 * The last line of defence: an error thrown by the root layout itself, before
 * any of the app's chrome exists. `app/error.tsx` cannot catch this — it
 * renders *inside* the layout that just failed — so without this file the
 * visitor gets Next's unstyled default error screen.
 *
 * It replaces `<html>` wholesale, which means no ThemeProvider, no fonts and
 * no globals.css. Every style here is therefore inline and deliberately
 * minimal, and the colours are hard-coded because the token layer is exactly
 * what may have failed to load.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "1.5rem",
          backgroundColor: "#fbfaf8",
          color: "#231e1a",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          lineHeight: 1.55,
        }}
      >
        <main style={{ maxWidth: "32rem", textAlign: "center" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            MiddleMarket couldn&apos;t load
          </h1>
          <p style={{ margin: "0.75rem 0 0", color: "#6b6259" }}>
            Something failed before the page could start. Nothing you submitted
            has been lost. Reloading usually fixes it.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.75rem",
              minHeight: "2.75rem",
              padding: "0 1.5rem",
              borderRadius: "0.625rem",
              border: "none",
              backgroundColor: "#1f7a5c",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reload the page
          </button>
          {error.digest && (
            <p
              style={{
                margin: "1.75rem 0 0",
                fontFamily: "ui-monospace, monospace",
                fontSize: "0.6875rem",
                color: "#8a8078",
              }}
            >
              Reference {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
