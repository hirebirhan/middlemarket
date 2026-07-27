"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { LabeledField, LabeledFieldSet } from "@/components/LabeledField";
import { Input } from "@/components/ui/input";
import { MoneyInput } from "@/components/MoneyInput";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/LoadingButton";
import { Alert } from "@/components/ui/alert";
import { Segmented } from "@/components/ui/segmented";
import { toast } from "@/components/ui/toast";
import type { RequestIntentType } from "@/lib/request-intent";

const TYPES = [
  { value: "PRODUCT", label: "Product" },
  { value: "SERVICE", label: "Service" },
] as const;

type RequestType = (typeof TYPES)[number]["value"];

export default function NewRequestForm({
  initialTitle,
  initialType = "PRODUCT",
  variant = "compact",
  redirectTo,
}: {
  /** Carried from the landing-page request box, so a new buyer lands with the
      form already open on what they came here to ask for. */
  initialTitle?: string | null;
  /** Carried from public Product/Service entry pages. */
  initialType?: RequestIntentType;
  /** Compact is the old inline panel; page is the primary request flow. */
  variant?: "compact" | "page";
  /** Where to go after a successful post. Defaults to refreshing in place. */
  redirectTo?: string;
}) {
  const router = useRouter();
  const [type, setType] = useState<RequestType>(initialType);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(variant === "page" || Boolean(initialTitle));
  // `router.refresh()` returns before the server has re-rendered the list.
  // Without this the button stops spinning while the page still shows the
  // old data, which reads as "nothing happened".
  const [refreshing, startRefresh] = useTransition();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title"));
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: String(data.get("description")),
          sku: data.get("sku") ? String(data.get("sku")) : null,
          budget: data.get("budget") ? Number(data.get("budget")) : null,
          type,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "We couldn't post this request. Please try again.");
        return;
      }
      form.reset();
      setType(initialType);
      if (redirectTo) {
        startRefresh(() => {
          router.push(redirectTo);
          router.refresh();
        });
      } else {
        setOpen(false);
        startRefresh(() => router.refresh());
      }
      // The list refreshes behind this panel as it closes, so without a word
      // here the only evidence your click worked is a row you have to go and
      // find for yourself.
      toast.add({
        type: "success",
        title: "Request posted",
        description: `Shops can now bid on "${title}". We'll check every price before you see it.`,
      });
    } catch {
      setError("We couldn't reach the server. Check your connection.");
    } finally {
      setLoading(false);
    }
  }

  if (!open && variant === "compact") {
    return (
      <Button className="w-full" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden="true" />
        Post a request
      </Button>
    );
  }

  return (
    <div
      className={
        variant === "page"
          ? "rounded-card border border-border bg-card p-5 shadow-sm sm:p-6"
          : "rounded-card border border-border bg-card p-4 shadow-sm"
      }
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div>
          <h2 className="font-semibold">New request</h2>
          {variant === "page" && (
            <p className="mt-1 max-w-prose text-sm text-muted-foreground">
              Give shops enough context to quote accurately. Our team reviews
              every offer before it reaches you.
            </p>
          )}
        </div>
        {variant === "compact" && (
          <Button
            variant="ghost"
            size="icon"
            className="-mr-2 size-8"
            aria-label="Close request form"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <form
        onSubmit={onSubmit}
        className={variant === "page" ? "grid gap-5" : "space-y-4"}
      >
        <LabeledFieldSet label="I need a">
          <Segmented
            label="Request type"
            value={type}
            onChange={setType}
            options={TYPES}
          />
        </LabeledFieldSet>
        <LabeledField
          label={type === "PRODUCT" ? "What product do you need?" : "What service do you need?"}
          hint={
            type === "PRODUCT"
              ? "Use the name a shop would recognize."
              : "Name the work clearly, such as installation, repair, cleaning, or setup."
          }
        >
          <Input
            name="title"
            required
            maxLength={120}
            defaultValue={initialTitle ?? undefined}
            placeholder={
              type === "PRODUCT" ? "iPhone 15, office chairs…" : "Plumbing repair, CCTV installation…"
            }
          />
        </LabeledField>
        {type === "PRODUCT" && (
          <LabeledField
            label="Exact model"
            optional
            tooltip="We benchmark the price against this exact item, so the more precise you are, the tighter the check."
            hint="Helps us price-check the right thing."
          >
            <Input
              name="sku"
              maxLength={120}
              placeholder="iPhone 15 128GB, MacBook Air M2…"
            />
          </LabeledField>
        )}
        <LabeledField label="Details">
          <Textarea
            name="description"
            required
            rows={variant === "page" ? 5 : 3}
            placeholder={
              type === "PRODUCT"
                ? "Quantity, delivery area, timing, warranty needs — anything a shop should know before quoting."
                : "Location, timing, scope, materials needed, and what a good result looks like."
            }
          />
        </LabeledField>
        <LabeledField
          label="Budget"
          optional
          hint="Shops see this and bid against it."
        >
          <MoneyInput name="budget" min="1" step="1" placeholder="60000" />
        </LabeledField>
        {error && <Alert variant="destructive">{error}</Alert>}
        <LoadingButton
          type="submit"
          className="w-full"
          loading={loading || refreshing}
        >
          {loading || refreshing ? "Posting…" : "Post request"}
        </LoadingButton>
      </form>
    </div>
  );
}
