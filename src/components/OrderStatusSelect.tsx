"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";
import { ORDER_TRANSITIONS } from "@/lib/orders";
import { Select } from "@/components/ui/select";

export default function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: OrderStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Only the moves the server would accept. The current status is deliberately
  // absent — it is already shown as a badge in the Status column, and offering
  // it here made the row look like it displayed the same thing twice.
  const nextStatuses = ORDER_TRANSITIONS[current];

  if (nextStatuses.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">No further changes</span>
    );
  }

  async function onChange(status: string) {
    if (!status) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Could not update this order.");
        return;
      }
      router.refresh();
    } catch {
      setError("Could not reach the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="md:flex md:flex-col md:items-end">
      <Select
        aria-label="Move order to"
        value=""
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full md:w-40"
      >
        <option value="">{loading ? "Saving…" : "Move to…"}</option>
        {nextStatuses.map((status) => (
          <option key={status} value={status}>
            {status.replace(/_/g, " ").toLowerCase()}
          </option>
        ))}
      </Select>
      {error && (
        <p role="alert" className="mt-1 text-xs text-danger-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
