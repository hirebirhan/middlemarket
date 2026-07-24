import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MiddleMarket",
  description: "Marketplace connecting buyers and sellers with fair, mediated pricing",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const home =
    user?.role === "ADMIN" ? "/admin" : user?.role === "SELLER" ? "/seller" : "/buyer";
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <header className="bg-white border-b">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-lg text-indigo-700">
              MiddleMarket
            </Link>
            <div className="flex items-center gap-4 text-sm">
              {user ? (
                <>
                  <Link href={home} className="hover:text-indigo-700">
                    Dashboard
                  </Link>
                  <span className="text-slate-500">
                    {user.name} ({user.role.toLowerCase()})
                  </span>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="hover:text-indigo-700">
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
