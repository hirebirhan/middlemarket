"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "@base-ui/react/dialog";
import { Plus, X, ShieldCheck } from "lucide-react";
import { LabeledField } from "@/components/LabeledField";
import { MoneyInput } from "@/components/MoneyInput";
import { Textarea } from "@/components/ui/textarea";
import { Button, buttonVariants } from "@/components/ui/button";
import { LoadingButton } from "@/components/LoadingButton";
import { Alert } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function OfferForm({
  requestId,
  budget,
  requestType,
  requestTitle,
  requestSummary,
  label = "Make an offer",
  buttonClassName,
}: {
  requestId: string;
  budget?: string | null;
  /** Product offers capture item condition; services don't. */
  requestType?: "PRODUCT" | "SERVICE";
  /** Names the request inside the quote dialog. */
  requestTitle?: string;
  /** Short request context shown inside the quote dialog. */
  requestSummary?: string | null;
  /** Lets the seller page say "Send a new price" after a rejection. */
  label?: string;
  /** Lets dense request cards place the trigger without changing form logic. */
  buttonClassName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Keeps the control busy until the refreshed list actually arrives.
  const [refreshing, startRefresh] = useTransition();

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
        setError(data.error || "We couldn't submit this offer. Please try again.");
        return;
      }
      setOpen(false);
      startRefresh(() => router.refresh());
      toast.add({
        type: "success",
        title: "Offer sent for review",
        description:
          "Our team checks it against the going rate before the buyer sees it. You'll see the outcome under Your offers.",
      });
    } catch {
      setError("We couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button
        variant="outline"
        size="sm"
        className={cn("mt-4", buttonClassName)}
        onClick={() => setOpen(true)}
      >
        <Plus data-icon="inline-start" aria-hidden="true" />
        {label}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className={cn("mt-4", buttonClassName)}
        aria-expanded="true"
        onClick={() => setOpen(true)}
      >
        <Plus data-icon="inline-start" aria-hidden="true" />
        {label}
      </Button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-background/75 backdrop-blur-sm" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
            <Dialog.Popup className="max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-card border border-border bg-card p-4 shadow-xl sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Dialog.Title className="font-display text-title font-semibold">
                    Quote {requestTitle ?? "this request"}
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                    {requestSummary ??
                      "Send the price, condition, and what is included."}
                  </Dialog.Description>
                </div>
                <Dialog.Close
                  className={buttonVariants({
                    variant: "ghost",
                    size: "icon-sm",
                    className: "-mr-1 text-muted-foreground hover:text-foreground",
                  })}
                  aria-label="Close quote form"
                >
                  <X aria-hidden="true" />
                </Dialog.Close>
              </div>

              <form onSubmit={onSubmit} className="mt-5">
                <FieldGroup className="gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <LabeledField
                      label="Your price"
                      hint={
                        // `budget` arrives already formatted by formatMoney,
                        // currency included — never prefix a second one here.
                        budget
                          ? `Buyer budget: ${budget}.`
                          : "The buyer didn't set a budget."
                      }
                    >
                      <MoneyInput
                        name="price"
                        min="1"
                        step="1"
                        required
                        placeholder="54500"
                      />
                    </LabeledField>

                    {requestType === "PRODUCT" && (
                      <LabeledField label="Condition">
                        <Select name="condition" required defaultValue={null}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="NEW">New</SelectItem>
                              <SelectItem value="OPEN_BOX">Open box</SelectItem>
                              <SelectItem value="REFURBISHED">
                                Refurbished
                              </SelectItem>
                              <SelectItem value="USED">Used</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </LabeledField>
                    )}
                  </div>

                  <LabeledField
                    label="Your pitch"
                    hint="What's included, delivery timing, warranty, or service scope."
                  >
                    <Textarea
                      name="message"
                      required
                      rows={3}
                      placeholder="Sealed unit, 1 year warranty, free delivery in Addis..."
                    />
                  </LabeledField>

                  {error && <Alert variant="destructive">{error}</Alert>}

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <LoadingButton
                      type="submit"
                      className="w-full sm:w-auto"
                      loading={loading || refreshing}
                    >
                      {loading || refreshing ? "Sending..." : "Send offer"}
                    </LoadingButton>
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
                      Checked before the buyer sees it.
                    </p>
                  </div>
                </FieldGroup>
              </form>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
