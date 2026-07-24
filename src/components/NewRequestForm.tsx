"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewRequestForm() {
  const router = useRouter();
  const [type, setType] = useState<"PRODUCT" | "SERVICE">("PRODUCT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(form.get("title")),
        description: String(form.get("description")),
        budget: form.get("budget") ? Number(form.get("budget")) : null,
        type,
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }
    (e.target as HTMLFormElement).reset?.();
    router.refresh();
  }

  return (
    <div className="bg-white border rounded-lg p-5">
      <h2 className="text-lg font-semibold mb-3">Post a new request</h2>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="flex gap-2">
          {(["PRODUCT", "SERVICE"] as const).map((t) => (
            <button
              type="button"
              key={t}
              onClick={() => setType(t)}
              className={`border rounded px-3 py-1.5 text-sm ${
                type === t ? "bg-indigo-600 text-white border-indigo-600" : "bg-white"
              }`}
            >
              {t === "PRODUCT" ? "Product" : "Service"}
            </button>
          ))}
        </div>
        <input
          name="title"
          required
          placeholder="What do you need? e.g. iPhone 15, plumbing repair"
          className="w-full border rounded px-3 py-2"
        />
        <textarea
          name="description"
          required
          rows={3}
          placeholder="Describe details, quantity, timing, location..."
          className="w-full border rounded px-3 py-2"
        />
        <input
          name="budget"
          type="number"
          min="0"
          step="0.01"
          placeholder="Budget in $ (optional)"
          className="w-full border rounded px-3 py-2"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={loading}
          className="bg-indigo-600 text-white rounded px-4 py-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post request"}
        </button>
      </form>
    </div>
  );
}
