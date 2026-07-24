"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "SELLER" ? "SELLER" : "BUYER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body: Record<string, string> = {
      email: String(form.get("email")),
      password: String(form.get("password")),
    };
    if (mode === "register") {
      body.name = String(form.get("name"));
      body.role = role;
    }
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }
    const user = await res.json();
    router.push(user.role === "ADMIN" ? "/admin" : user.role === "SELLER" ? "/seller" : "/buyer");
    router.refresh();
  }

  return (
    <div className="max-w-sm mx-auto bg-white border rounded-lg p-6">
      <h1 className="text-xl font-semibold mb-4">
        {mode === "login" ? "Log in" : "Create your account"}
      </h1>
      <form onSubmit={onSubmit} className="space-y-3">
        {mode === "register" && (
          <>
            <input
              name="name"
              required
              placeholder="Full name"
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex gap-2">
              {(["BUYER", "SELLER"] as const).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 border rounded px-3 py-2 text-sm ${
                    role === r ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
                  }`}
                >
                  {r === "BUYER" ? "I'm buying" : "I'm selling"}
                </button>
              ))}
            </div>
          </>
        )}
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Password"
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="w-full bg-indigo-600 text-white rounded py-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>
      <p className="text-sm text-slate-500 mt-4">
        {mode === "login" ? (
          <>
            No account? <Link href="/register" className="text-indigo-600">Sign up</Link>
          </>
        ) : (
          <>
            Have an account? <Link href="/login" className="text-indigo-600">Log in</Link>
          </>
        )}
      </p>
    </div>
  );
}
