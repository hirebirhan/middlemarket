"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Field, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export default function ReviewOfferForm({
  offerId,
  askingPrice,
}: {
  offerId: string;
  askingPrice: string;
}) {
  const router = useRouter();
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const [adminPrice, setAdminPrice] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [bandLow, setBandLow] = useState("");
  const [bandHigh, setBandHigh] = useState("");
  const [pending, setPending] = useState<"APPROVE" | "REJECT" | null>(null);
  const [error, setError] = useState("");

  const parsedPrice = adminPrice.trim() === "" ? null : Number(adminPrice);
  const priceIsValid =
    parsedPrice === null || (Number.isFinite(parsedPrice) && parsedPrice > 0);

  const low = bandLow.trim() === "" ? null : Number(bandLow);
  const high = bandHigh.trim() === "" ? null : Number(bandHigh);

  async function review(action: "APPROVE" | "REJECT") {
    setError("");

    // Mirrors the server rule, so the admin finds out before the round trip.
    if (action === "REJECT" && !adminNote.trim()) {
      setError("Tell the seller why this offer was rejected.");
      noteRef.current?.focus();
      return;
    }
    if (action === "APPROVE" && !priceIsValid) {
      setError("Adjusted price must be greater than 0.");
      return;
    }
    if (
      (low !== null && (!Number.isFinite(low) || low <= 0)) ||
      (high !== null && (!Number.isFinite(high) || high <= 0))
    ) {
      setError("Fair-price band values must be greater than 0.");
      return;
    }
    if (low !== null && high !== null && low > high) {
      setError("Fair-price band low must be ≤ high.");
      return;
    }

    setPending(action);
    try {
      const res = await fetch(`/api/offers/${offerId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          adminPrice: action === "APPROVE" ? parsedPrice : null,
          adminNote: adminNote.trim() || null,
          bandLow: low,
          bandHigh: high,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not save this review.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setPending(null);
    }
  }

  const busy = pending !== null;

  return (
    <div className="space-y-4">
      <FieldSet
        label="Fair-price band"
        hint="The benchmark range you're checking this offer against (Gate 3)."
      >
        <div className="flex items-center gap-2">
          <Input
            value={bandLow}
            onChange={(e) => setBandLow(e.target.value)}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="Low"
            aria-label="Fair-price band low"
          />
          <span className="text-sm text-muted-foreground">–</span>
          <Input
            value={bandHigh}
            onChange={(e) => setBandHigh(e.target.value)}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="High"
            aria-label="Fair-price band high"
          />
        </div>
      </FieldSet>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Adjusted price"
          optional
          hint={
            priceIsValid && parsedPrice
              ? `Buyer sees $${parsedPrice.toFixed(2)} instead of $${askingPrice}.`
              : `Leave empty to approve at $${askingPrice}.`
          }
        >
          <Input
            value={adminPrice}
            onChange={(e) => setAdminPrice(e.target.value)}
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            placeholder="450.00"
          />
        </Field>

        <Field
          label="Note to buyer & seller"
          hint="Required when rejecting."
        >
          <Textarea
            ref={noteRef}
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={2}
            className="min-h-10"
            placeholder="Why this price was adjusted or rejected"
          />
        </Field>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="flex flex-wrap items-center gap-2">
        <Button disabled={busy} onClick={() => review("APPROVE")}>
          <Check className="h-4 w-4" aria-hidden="true" />
          {pending === "APPROVE" ? "Approving…" : "Approve offer"}
        </Button>
        <Button
          variant="destructive"
          disabled={busy}
          onClick={() => review("REJECT")}
        >
          <X className="h-4 w-4" aria-hidden="true" />
          {pending === "REJECT" ? "Rejecting…" : "Reject"}
        </Button>
      </div>
    </div>
  );
}
