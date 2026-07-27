"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { formatMoney } from "@/lib/money";
import { MoneyInput } from "@/components/MoneyInput";
import { LoadingButton } from "@/components/LoadingButton";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/components/ui/toast";

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
  // The whole card leaves the queue on refresh; staying busy until then
  // stops a second click landing on an offer that is already decided.
  const [refreshing, startRefresh] = useTransition();

  const parsedPrice = adminPrice.trim() === "" ? null : Number(adminPrice);
  const priceIsValid =
    parsedPrice === null || (Number.isFinite(parsedPrice) && parsedPrice > 0);

  const low = bandLow.trim() === "" ? null : Number(bandLow);
  const high = bandHigh.trim() === "" ? null : Number(bandHigh);

  async function review(action: "APPROVE" | "REJECT") {
    setError("");

    // Mirrors the server rule, so the admin finds out before the round trip.
    if (action === "REJECT" && !adminNote.trim()) {
      setError(
        "Add a note first — the shop only learns what to fix from what you write here."
      );
      noteRef.current?.focus();
      return;
    }
    if (action === "APPROVE" && !priceIsValid) {
      setError("The adjusted price has to be greater than 0.");
      return;
    }
    if (
      (low !== null && (!Number.isFinite(low) || low <= 0)) ||
      (high !== null && (!Number.isFinite(high) || high <= 0))
    ) {
      setError("Fair-price band values have to be greater than 0.");
      return;
    }
    if (low !== null && high !== null && low > high) {
      setError("The band's low value has to be less than or equal to its high.");
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
        setError(data.error || "We couldn't save this review. Please try again.");
        setPending(null);
        return;
      }
      // Deliberately left pending: the card is about to leave the queue, and
      // clearing it here would flash an idle, enabled form for the length of
      // the refresh — long enough to click Approve a second time.
      startRefresh(() => router.refresh());
      // The card disappears from the queue on refresh, so this is the only
      // record of which way the decision went.
      toast.add(
        action === "APPROVE"
          ? {
              type: "success",
              title: "Offer approved",
              description: parsedPrice
                ? `The buyer will see ${formatMoney(parsedPrice)}.`
                : `The buyer will see ${askingPrice}.`,
            }
          : {
              type: "info",
              title: "Offer declined",
              description: "The shop can read your note and send a new price.",
            }
      );
    } catch {
      setError("We couldn't reach the server. Check your connection.");
      setPending(null);
    }
  }

  const busy = pending !== null || refreshing;

  return (
    <div className="space-y-2.5">
      <div className="grid gap-3 sm:grid-cols-12 sm:items-end">
        {/* Fair-price band */}
        <div className="sm:col-span-4">
          <label className="text-2xs font-medium text-muted-foreground block mb-1">
            Fair-price band (Low – High)
          </label>
          <div className="flex items-center gap-1.5">
            <MoneyInput
              value={bandLow}
              onChange={(e) => setBandLow(e.target.value)}
              min="1"
              step="1"
              placeholder="Low"
              aria-label="Fair-price band low"
              className="h-9 text-xs"
            />
            <span className="text-xs text-muted-foreground" aria-hidden="true">
              –
            </span>
            <MoneyInput
              value={bandHigh}
              onChange={(e) => setBandHigh(e.target.value)}
              min="1"
              step="1"
              placeholder="High"
              aria-label="Fair-price band high"
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Adjusted price */}
        <div className="sm:col-span-3">
          <label className="text-2xs font-medium text-muted-foreground block mb-1">
            Adjusted price
            {priceIsValid && parsedPrice && (
              <span className="ml-1 text-brand font-mono">
                ({formatMoney(parsedPrice)})
              </span>
            )}
          </label>
          <MoneyInput
            value={adminPrice}
            onChange={(e) => setAdminPrice(e.target.value)}
            min="1"
            step="1"
            placeholder={askingPrice ? `Default: ${askingPrice}` : "Price"}
            className="h-9 text-xs"
          />
        </div>

        {/* Note to buyer & shop */}
        <div className="sm:col-span-5">
          <label className="text-2xs font-medium text-muted-foreground block mb-1">
            Note (Required to decline)
          </label>
          <input
            ref={noteRef as unknown as React.RefObject<HTMLInputElement>}
            type="text"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-ring"
            placeholder="Review note or decline reason"
          />
        </div>
      </div>

      {error && <Alert variant="destructive" className="py-1.5 text-xs">{error}</Alert>}

      <div className="flex items-center justify-end gap-2 pt-1">
        <LoadingButton
          size="sm"
          disabled={busy}
          loading={pending === "APPROVE"}
          onClick={() => review("APPROVE")}
          className="h-8 text-xs"
        >
          {pending !== "APPROVE" && (
            <Check className="size-3.5" aria-hidden="true" />
          )}
          {pending === "APPROVE" ? "Approving…" : "Approve offer"}
        </LoadingButton>
        <LoadingButton
          size="sm"
          variant="destructive"
          disabled={busy}
          loading={pending === "REJECT"}
          onClick={() => review("REJECT")}
          className="h-8 text-xs"
        >
          {pending !== "REJECT" && <X className="size-3.5" aria-hidden="true" />}
          {pending === "REJECT" ? "Declining…" : "Decline"}
        </LoadingButton>
      </div>
    </div>
  );
}
