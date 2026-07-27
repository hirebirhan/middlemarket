import { Suspense } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";
import { getRoleHome } from "@/lib/role-home";
import { readRequestIntentType } from "@/lib/request-intent";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Sign up as a buyer to post what you need, or as a shop to compete for requests across Addis Ababa.",
  robots: { index: false, follow: true },
};

type RegisterSearchParams = {
  need?: string | string[];
  type?: string | string[];
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<RegisterSearchParams>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const buyerNeed = typeof params.need === "string" ? params.need : null;
  const requestType = readRequestIntentType(params.type);
  if (user) redirect(getRoleHome(user.role, { buyerNeed, requestType }));

  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
