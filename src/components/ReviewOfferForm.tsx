"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReviewOfferForm({ offerId }: { offerId: string }) {
  const router = useRouter();
  const [adminPrice, setAdminPrice] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);

  async function review(action: "APPROVE" | "REJECT") {
    setLoading(true);
    await fetch(`/api/offers/${offerId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        adminPrice: adminPrice ? Number(adminPrice) : null,
        adminNote: adminNote || null,
      }),
    });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="mt-3 border-t pt-3 flex flex-wrap items-center gap-2">
      <input
        value={adminPrice}
        onChange={(e) => setAdminPrice(e.target.value)}
        type="number"
        min="0.01"
        step="0.01"
        placeholder="Adjusted price (optional)"
        className="border rounded px-3 py-1.5 text-sm w-48"
      />
      <input
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
        placeholder="Note to buyer/seller (optional)"
        className="border rounded px-3 py-1.5 text-sm flex-1 min-w-48"
      />
      <button
        disabled={loading}
        onClick={() => review("APPROVE")}
        className="bg-emerald-600 text-white text-sm rounded px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        disabled={loading}
        onClick={() => review("REJECT")}
        className="bg-red-600 text-white text-sm rounded px-3 py-1.5 hover:bg-red-700 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  );
}
