"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OfferForm({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 bg-indigo-600 text-white text-sm rounded px-3 py-1.5 hover:bg-indigo-700"
      >
        Make an offer
      </button>
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch(`/api/requests/${requestId}/offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price: Number(form.get("price")),
        message: String(form.get("message")),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Something went wrong");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <input
        name="price"
        type="number"
        min="0.01"
        step="0.01"
        required
        placeholder="Your price in $"
        className="w-full border rounded px-3 py-2 text-sm"
      />
      <textarea
        name="message"
        required
        rows={2}
        placeholder="Your pitch: what you offer, timeline, quality..."
        className="w-full border rounded px-3 py-2 text-sm"
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        disabled={loading}
        className="bg-indigo-600 text-white text-sm rounded px-3 py-1.5 hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit offer"}
      </button>
    </form>
  );
}
