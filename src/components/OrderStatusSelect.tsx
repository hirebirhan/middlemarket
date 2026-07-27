"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Undo2, X } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { ORDER_TRANSITIONS } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "@/components/LoadingButton";
import { formatStatus } from "@/components/StatusBadge";
import { toast } from "@/components/ui/toast";

/**
 * Advancing an order.
 *
 * This was a `<select>` whose `onChange` posted immediately — so one mis-click
 * could cancel an order, which is terminal and has no undo. A select is also
 * the wrong control for an action: it reads as "choose a value", not as "do
 * this now".
 *
 * It is now explicit buttons for the one or two moves the server would accept,
 * and the moves that cannot be walked back ask first. Reversible moves still
 * apply on a single click — confirming everything trains people to confirm
 * nothing.
 */
export default function OrderStatusSelect({
  orderId,
  current,
  /** Named in the confirmation, so you know which order you are ending. */
  item,
}: {
  orderId: string;
  current: OrderStatus;
  item?: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<OrderStatus | null>(null);
  const [confirming, setConfirming] = useState<OrderStatus | null>(null);
  const [error, setError] = useState("");
  const [refreshing, startRefresh] = useTransition();

  const confirmRef = useRef<HTMLButtonElement>(null);
  const wasConfirming = useRef(false);

  // Focus follows the question, the same as the buyer's accept confirmation.
  useEffect(() => {
    if (confirming && !wasConfirming.current) confirmRef.current?.focus();
    wasConfirming.current = Boolean(confirming);
  }, [confirming]);

  const next = ORDER_TRANSITIONS[current];

  /** A move nobody can walk back: the order stops being changeable at all. */
  const isTerminal = (status: OrderStatus) =>
    ORDER_TRANSITIONS[status].length === 0;

  async function move(status: OrderStatus) {
    setError("");
    setPending(status);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "We couldn't update this order.");
        setPending(null);
        setConfirming(null);
        return;
      }
      startRefresh(() => router.refresh());
      toast.add({
        type: status === "CANCELLED" ? "info" : "success",
        title: `Order moved to ${formatStatus(status).toLowerCase()}`,
        description: isTerminal(status)
          ? "This order is now closed and can no longer change."
          : undefined,
      });
      setConfirming(null);
    } catch {
      setError("We couldn't reach the server. Check your connection.");
      setPending(null);
      setConfirming(null);
    }
  }

  const busy = pending !== null || refreshing;

  if (next.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">No further changes</span>
    );
  }

  if (confirming) {
    const label = formatStatus(confirming).toLowerCase();
    return (
      <div className="md:text-right">
        <p className="mb-2 text-xs text-muted-foreground">
          Move {item ? `“${item}”` : "this order"} to {label}? This is final —
          the order can&apos;t change afterwards.
        </p>
        <div className="flex flex-wrap gap-2 md:justify-end">
          <LoadingButton
            ref={confirmRef}
            size="sm"
            variant={confirming === "CANCELLED" ? "destructive" : "default"}
            loading={busy}
            onClick={() => move(confirming)}
          >
            {busy ? "Saving…" : `Yes, ${label}`}
          </LoadingButton>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => setConfirming(null)}
          >
            Keep as is
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

  return (
    <div className="md:text-right">
      <div className="flex flex-wrap gap-2 md:justify-end">
        {next.map((status) => {
          const terminal = isTerminal(status);
          const cancelling = status === "CANCELLED";
          // Stepping backwards (delivered → in progress) is a correction, not
          // progress, so it never takes the primary treatment.
          const backwards = current === "DELIVERED" && status === "IN_PROGRESS";

          return (
            <LoadingButton
              key={status}
              size="sm"
              variant={
                cancelling ? "destructive" : backwards ? "ghost" : "default"
              }
              disabled={busy}
              loading={pending === status}
              onClick={() => (terminal ? setConfirming(status) : move(status))}
            >
              {pending !== status &&
                (cancelling ? (
                  <X className="size-3.5" aria-hidden="true" />
                ) : backwards ? (
                  <Undo2 className="size-3.5" aria-hidden="true" />
                ) : (
                  <ArrowRight className="size-3.5" aria-hidden="true" />
                ))}
              {pending === status ? "Saving…" : formatStatus(status)}
            </LoadingButton>
          );
        })}
      </div>
      {error && (
        <p role="alert" className="mt-1.5 text-xs text-danger-foreground">
          {error}
        </p>
      )}
    </div>
  );
}
