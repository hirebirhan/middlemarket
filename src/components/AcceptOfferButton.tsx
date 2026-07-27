"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/LoadingButton";
import { toast } from "@/components/ui/toast";

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
  // The row disappears once the offer is accepted, so the button must stay
  // busy until that has actually happened.
  const [refreshing, startRefresh] = useTransition();

  // The button that was focused unmounts when the confirmation replaces it, so
  // without this a keyboard user's focus falls back to <body> and they have to
  // tab from the top of the page to answer a question they just asked for.
  const confirmRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  useEffect(() => {
    if (confirming && !wasConfirming.current) confirmRef.current?.focus();
    // Backing out returns focus to where it came from.
    else if (!confirming && wasConfirming.current) triggerRef.current?.focus();
    wasConfirming.current = confirming;
  }, [confirming]);

  async function accept() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/offers/${offerId}/accept`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "We couldn't accept this offer. Please try again.");
        setConfirming(false);
        return;
      }
      startRefresh(() => router.refresh());
      toast.add({
        type: "success",
        title: "Offer accepted",
        description: `Your order is placed at ${price}. You can follow it from this request.`,
      });
    } catch {
      setError("We couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  // Accepting closes the request and creates an order, and there is no undo —
  // worth one deliberate second click. An inline confirm rather than a modal:
  // the offer you are agreeing to stays on screen while you decide.
  if (!confirming) {
    return (
      <div className="md:text-right">
        <Button
          ref={triggerRef}
          size="sm"
          variant="default"
          onClick={() => setConfirming(true)}
        >
          Accept offer
        </Button>
        {error && (
          <p role="alert" className="mt-1.5 text-xs text-danger-foreground">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="md:text-right">
      {/* `price` arrives already formatted by formatMoney, currency included. */}
      <p className="mb-2 text-xs text-muted-foreground">
        Accept at {price}? This closes the request and places the order.
      </p>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <LoadingButton
          ref={confirmRef}
          size="sm"
          variant="default"
          loading={loading || refreshing}
          onClick={accept}
        >
          {loading || refreshing ? "Accepting…" : "Yes, accept"}
        </LoadingButton>
        <Button
          size="sm"
          variant="outline"
          disabled={loading || refreshing}
          onClick={() => setConfirming(false)}
        >
          Not yet
        </Button>
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-danger-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
