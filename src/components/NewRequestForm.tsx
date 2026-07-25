"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Field, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Segmented } from "@/components/ui/segmented";

const TYPES = [
  { value: "PRODUCT", label: "Product" },
  { value: "SERVICE", label: "Service" },
] as const;

type RequestType = (typeof TYPES)[number]["value"];

export default function NewRequestForm() {
  const router = useRouter();
  const [type, setType] = useState<RequestType>("PRODUCT");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: String(data.get("title")),
          description: String(data.get("description")),
          budget: data.get("budget") ? Number(data.get("budget")) : null,
          type,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error || "Could not post this request.");
        return;
      }
      form.reset();
      setType("PRODUCT");
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
      <Button className="w-full" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" aria-hidden="true" />
        New request
      </Button>
    );
  }

  return (
    <div className="rounded-card border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">New request</h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          aria-label="Close request form"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
      <form onSubmit={onSubmit} className="space-y-3">
        <FieldSet label="I need a">
          <Segmented
            label="Request type"
            value={type}
            onChange={setType}
            options={TYPES}
          />
        </FieldSet>
        <Field label="What do you need?">
          <Input
            name="title"
            required
            maxLength={120}
            placeholder="iPhone 15, plumbing repair…"
          />
        </Field>
        <Field label="Details">
          <Textarea
            name="description"
            required
            rows={3}
            placeholder="Quantity, timing, location, anything a seller should know."
          />
        </Field>
        <Field
          label="Budget"
          optional
          hint="Sellers see this and bid against it."
        >
          <Input
            name="budget"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0.00"
          />
        </Field>
        {error && <Alert variant="danger">{error}</Alert>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Posting…" : "Post request"}
        </Button>
      </form>
    </div>
  );
}
