"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AcceptOfferButton({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await fetch(`/api/offers/${offerId}/accept`, { method: "POST" });
        setLoading(false);
        router.refresh();
      }}
      className="bg-emerald-600 text-white text-sm rounded px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-50 shrink-0"
    >
      {loading ? "..." : "Accept offer"}
    </button>
  );
}
