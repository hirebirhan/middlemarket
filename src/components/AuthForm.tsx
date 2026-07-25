"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Field, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Segmented } from "@/components/ui/segmented";

const ROLES = [
  { value: "BUYER", label: "Buy" },
  { value: "SELLER", label: "Sell" },
] as const;

type Role = (typeof ROLES)[number]["value"];

const ROLE_HINT: Record<Role, string> = {
  BUYER: "Post what you need and let sellers compete for it.",
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

      const user = await res.json();
      const buyerHome =
        need && user.role === "BUYER"
          ? `/buyer?need=${encodeURIComponent(need)}`
          : "/buyer";
      router.push(
        user.role === "ADMIN"
          ? "/admin"
          : user.role === "SELLER"
            ? "/seller"
            : buyerHome
      );
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col justify-center py-10 min-h-screen sm:py-16">
      <Card>
        <CardHeader>
          <CardTitle className="text-heading">
            {isRegister ? "Create your account" : "Welcome back"}
          </CardTitle>
          <CardDescription>
            {isRegister
              ? "Every price on MiddleMarket is reviewed before it reaches a buyer."
              : "Log in to pick up where you left off."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {need && (
            <div className="rounded-md border border-border bg-secondary px-3 py-2.5">
              <p className="text-xs text-muted-foreground">You&apos;re looking for</p>
              <p className="mt-0.5 text-sm font-medium">{need}</p>
            </div>
          )}

          {/* method="post" is never used on the hydrated path (onSubmit calls
              preventDefault). It matters if the form is submitted before React
              hydrates: the browser default would otherwise GET, putting the
              password in the URL, browser history and server logs. */}
          <form
            onSubmit={onSubmit}
            method="post"
            className="space-y-4"
            noValidate={false}
          >
            {/* The role decision shapes the whole account, so it leads the
                form rather than sitting buried between name and email. */}
            {isRegister && (
              <FieldSet label="I want to" hint={ROLE_HINT[role]}>
                <Segmented
                  label="Account type"
                  value={role}
                  onChange={setRole}
                  options={ROLES}
                />
              </FieldSet>
            )}

            {isRegister && (
              <Field label="Full name">
                <Input
                  name="name"
                  required
                  autoComplete="name"
                  placeholder="Ada Lovelace"
                />
              </Field>
            )}

            <Field label="Email">
              <Input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
              />
            </Field>

            <Field
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
            </Field>

            {error && <Alert variant="danger">{error}</Alert>}

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full"
            >
              {loading
                ? "Please wait…"
                : isRegister
                  ? `Create ${role === "SELLER" ? "seller" : "buyer"} account`
                  : "Log in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isRegister ? "Already have an account? " : "New to MiddleMarket? "}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="font-medium text-foreground underline underline-offset-4 hover:no-underline"
            >
              {isRegister ? "Log in" : "Create an account"}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
