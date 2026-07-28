import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Fraunces, Geist } from "next/font/google";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import SiteFooter from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/components/ui/toast";
import { getRoleHome } from "@/lib/role-home";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

/** Body and UI. */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
/** Headlines only — see the note on `--font-display` in globals.css. */
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces" });
/** Figures only. Money has to line up. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

/**
 * `metadataBase` resolves every relative OG/canonical URL. Without it Next
 * warns at build time and social cards fall back to relative paths that no
 * crawler can fetch.
 */
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  // Pages set only their own name; the product name is appended here, so a
  // browser-tab strip full of MiddleMarket tabs still tells them apart.
  title: {
    default: "MiddleMarket — Mediated marketplace for fair prices",
    template: "%s · MiddleMarket",
  },
  description:
    "Post what you need and shops around Addis Ababa come back with their best price. Someone on our team checks every quote against the going rate before it reaches you.",
  applicationName: "MiddleMarket",
  keywords: [
    "marketplace",
    "Addis Ababa",
    "Ethiopia",
    "price comparison",
    "request for quote",
    "electronics",
  ],
  openGraph: {
    type: "website",
    siteName: "MiddleMarket",
    locale: "en_ET",
    url: "/",
    title: "MiddleMarket — Fair prices, checked by people",
    description:
      "Buyers post requests, shops compete, and every price is reviewed by a person before the buyer sees it.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MiddleMarket — Fair prices, checked by people",
    description:
      "Buyers post requests, shops compete, and every price is reviewed by a person before the buyer sees it.",
  },
  robots: { index: true, follow: true },
};

/**
 * `colorScheme` tells the browser to render native chrome — form controls, the
 * scrollbar gutter, the `<select>` popup — in the matching theme. Without it a
 * dark page opens a blinding white dropdown.
 */
export const viewport: Viewport = {
  colorScheme: "light dark",
  // The sRGB equivalents of `--background` in each theme, so the mobile
  // browser chrome continues the page rather than framing it.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1f1ef" },
    { media: "(prefers-color-scheme: dark)", color: "#161412" },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const home = user ? getRoleHome(user.role) : "/buyer";

  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body
        className={`${inter.variable} ${fraunces.variable} ${jetbrains.variable} flex min-h-screen flex-col bg-background text-foreground antialiased`}
      >
        <ThemeProvider>
          <ToastProvider>
            <a
              href="#main-content"
              className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-50 focus-visible:rounded-lg focus-visible:border focus-visible:border-border focus-visible:bg-card focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium focus-visible:shadow-lg"
            >
              Skip to content
            </a>

            {/* Sits below the toast layer (z-50) so a confirmation is never
                covered by the thing it is confirming. */}
            <SiteHeader user={user} />

            {/* No container here on purpose — see `Container`. The admin
                console needs its rail to reach the viewport edge, which is
                impossible if the shell has already boxed every page in. */}
            <main id="main-content" className="flex-1">
              {children}
            </main>

            <SiteFooter userRole={user?.role ?? null} userHome={home} />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
