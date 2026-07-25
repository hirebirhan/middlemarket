"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AcceptOfferButton({
  offerId,
  price,
}: {
  offerId: string;
  price: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/offers/${offerId}/accept`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not accept this offer.");
        setConfirming(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  // Accepting closes the request and creates an order, and there is no undo —
  // worth one deliberate second click.
  if (!confirming) {
    return (
      <div className="md:text-right">
        <Button size="sm" onClick={() => setConfirming(true)}>
          Accept offer
        </Button>
        {error && (
          <p role="alert" className="mt-1 text-xs text-danger-foreground">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="md:text-right">
      <p className="mb-1.5 text-xs text-muted-foreground">
        Accept at ${price}? This closes the request.
      </p>
      <div className="flex gap-2 md:justify-end">
        <Button size="sm" disabled={loading} onClick={accept}>
          {loading ? "Accepting…" : "Yes, accept"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => setConfirming(false)}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
