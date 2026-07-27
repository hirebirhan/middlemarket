import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { getRoleHome } from "@/lib/role-home";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to your MiddleMarket buyer, shop or admin account.",
  // An auth screen has nothing to offer a search result, and indexing it
  // splits the ranking of the pages that do.
  robots: { index: false, follow: true },
};

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(getRoleHome(user.role));

  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
