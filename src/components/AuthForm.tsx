"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { LabeledField, LabeledFieldSet } from "@/components/LabeledField";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/LoadingButton";
import { Alert } from "@/components/ui/alert";
import { Segmented } from "@/components/ui/segmented";
import { toast } from "@/components/ui/toast";
import { Container } from "@/components/Container";
import { getRoleHome } from "@/lib/role-home";
import { readRequestIntentType } from "@/lib/request-intent";
import type { Role as UserRole } from "@prisma/client";

const ROLES = [
  { value: "BUYER", label: "Buy" },
  { value: "SELLER", label: "Sell" },
] as const;

type Role = (typeof ROLES)[number]["value"];
type AuthUser = { name: string; role: UserRole };

const ROLE_HINT: Record<Role, string> = {
  BUYER: "Post what you need and let shops compete for it. Always free.",
  SELLER: "Browse buyer requests and bid with your best price.",
};

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const isRegister = mode === "register";

  const [role, setRole] = useState<Role>(
    params.get("role") === "SELLER" ? "SELLER" : "BUYER"
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // What the visitor typed into the landing-page request box. Carried through
  // signup so the search box is a real starting point, not a decorative one.
  const need = isRegister ? params.get("need")?.trim() : null;
  const requestType = isRegister
    ? readRequestIntentType(params.get("type"))
    : undefined;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      email: String(form.get("email")),
      password: String(form.get("password")),
    };
    if (isRegister) {
      body.name = String(form.get("name"));
      body.role = role;
    }

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      const user = (await res.json()) as AuthUser;
      router.push(getRoleHome(user.role, { buyerNeed: need, requestType }));
      router.refresh();
      toast.add({
        type: "success",
        title: isRegister
          ? `Welcome to MiddleMarket, ${user.name.split(" ")[0]}`
          : `Welcome back, ${user.name.split(" ")[0]}`,
      });
    } catch {
      setError(
        "We couldn't reach the server. Check your connection and try again."
      );
      setLoading(false);
    }
  }

  return (
    // The page sits inside the layout's <main>, which already supplies the
    // header, footer and vertical padding — the old `min-h-screen` here added a
    // second full viewport and pushed the footer far below the fold.
    <Container size="narrow" className="flex max-w-md flex-col justify-center">
      <Card>
        <CardHeader>
          {/* The page's h1 — this card is the entire screen. */}
          <CardTitle className="text-title">
            {isRegister ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isRegister
              ? "It takes a minute, and posting a request is always free."
              : "Log in to pick up where you left off."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {need && (
            <div className="rounded-lg border border-brand-border/60 bg-brand-muted px-3.5 py-3">
              <p className="text-xs text-brand">You&apos;re looking for</p>
              <p className="mt-0.5 font-medium">{need}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                We&apos;ll carry this straight through to your first request.
              </p>
            </div>
          )}

          {/* method="post" is never used on the hydrated path (onSubmit calls
              preventDefault). It matters if the form is submitted before React
              hydrates: the browser default would otherwise GET, putting the
              password in the URL, browser history and server logs. */}
          <form
            onSubmit={onSubmit}
            method="post"
            className="space-y-5"
            noValidate={false}
          >
            {/* The role decision shapes the whole account, so it leads the
                form rather than sitting buried between name and email. */}
            {isRegister && (
              <LabeledFieldSet label="I want to" hint={ROLE_HINT[role]}>
                <Segmented
                  label="Account type"
                  value={role}
                  onChange={setRole}
                  options={ROLES}
                />
              </LabeledFieldSet>
            )}

            {isRegister && (
              <LabeledField label="Full name">
                <Input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                />
              </LabeledField>
            )}

            <LabeledField label="Email">
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </LabeledField>

            <LabeledField
              label="Password"
              hint={isRegister ? "At least 6 characters." : undefined}
            >
              <Input
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="••••••••"
              />
            </LabeledField>

            {error && <Alert variant="destructive">{error}</Alert>}

            {/* Ink, not brand green: signing in is not a money action, and the
                green fill is reserved for the ones that are. */}
            <LoadingButton
              type="submit"
              size="lg"
              loading={loading}
              className="w-full"
            >
              {loading
                ? "One moment…"
                : isRegister
                  ? `Create ${role === "SELLER" ? "shop" : "buyer"} account`
                  : "Log in"}
            </LoadingButton>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? "Already have an account? " : "New to MiddleMarket? "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="rounded-sm font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-current"
            >
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>
        </CardContent>
      </Card>

      {isRegister && (
        <p className="mt-5 flex items-start justify-center gap-2 text-center text-xs text-muted-foreground">
          <ShieldCheck className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          Every price on MiddleMarket is checked by a person before a buyer
          sees it.
        </p>
      )}
    </Container>
  );
}
