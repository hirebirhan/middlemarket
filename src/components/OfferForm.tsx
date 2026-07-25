"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Select } from "@/components/ui/select";

export default function OfferForm({
  requestId,
  budget,
  requestType,
  label = "Make an offer",
}: {
  requestId: string;
  budget?: string | null;
  /** Product offers capture item condition; services don't. */
  requestType?: "PRODUCT" | "SERVICE";
  /** Lets the seller page say "Offer again" after a rejection. */
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch(`/api/requests/${requestId}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price: Number(form.get("price")),
          message: String(form.get("message")),
          condition: form.get("condition") || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not submit this offer.");
        return;
      }
      setOpen(false);
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="mt-4"
        onClick={() => setOpen(true)}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        {label}
      </Button>
    );
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-sm font-semibold">Your offer</h4>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Close offer form"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <Field
          label="Your price"
          hint={
            // `budget` arrives already formatted by formatMoney, which includes
            // the currency symbol — prefixing another "$" rendered "$$3,000.00".
            budget
              ? `The buyer budgeted ${budget}.`
              : "The buyer did not set a budget."
          }
        >
          <Input
            name="price"
            type="number"
            min="0.01"
            step="0.01"
            inputMode="decimal"
            required
            placeholder="0.00"
          />
        </Field>
        {requestType === "PRODUCT" && (
          <Field label="Condition">
            <Select name="condition" required defaultValue="">
              <option value="" disabled>
                Select condition…
              </option>
              <option value="NEW">New</option>
              <option value="OPEN_BOX">Open box</option>
              <option value="REFURBISHED">Refurbished</option>
              <option value="USED">Used</option>
            </Select>
          </Field>
        )}
        <Field label="Your pitch">
          <Textarea
            name="message"
            required
            rows={3}
            placeholder="What you are offering, timeline, quality, what's included…"
          />
        </Field>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit offer"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Reviewed before the buyer sees it.
          </p>
        </div>
      </form>
    </div>
  );
}
