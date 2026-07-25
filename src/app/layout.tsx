import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import AuthNav from "@/components/AuthNav";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Scale } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

export const metadata: Metadata = {
  title: "MiddleMarket — Mediated marketplace for fair prices",
  description: "Buyers post requests, sellers compete, and every price is reviewed before it reaches you.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const home =
    user?.role === "ADMIN" ? "/admin" : user?.role === "SELLER" ? "/seller" : "/buyer";
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${jetbrains.variable} bg-background text-foreground min-h-screen antialiased`}>
        <ThemeProvider>
          <a
            href="#main-content"
            className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:left-4 focus-visible:top-4 focus-visible:z-[60] focus-visible:rounded-md focus-visible:bg-card focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-medium"
          >
            Skip to content
          </a>
          <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/85 backdrop-blur-xl">
            <nav className="mx-auto flex h-14 max-w-page items-center justify-between px-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                  <Scale className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
                </div>
                <span className="text-sm font-semibold tracking-tight">MiddleMarket</span>
              </Link>
              <div className="flex items-center gap-3 text-sm">
                {user ? (
                  <>
                    <Link
                      href={home}
                      className="text-muted-foreground transition-opacity hover:opacity-75"
                    >
                      Dashboard
                    </Link>
                    <span className="text-muted-foreground hidden sm:inline font-mono text-xs">
                      {user.name.split(" ")[0]}
                    </span>
                    <LogoutButton />
                  </>
                ) : (
                  <AuthNav />
                )}
                <ThemeToggle />
              </div>
            </nav>
          </header>
          <main id="main-content" className="mx-auto max-w-page px-6 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
