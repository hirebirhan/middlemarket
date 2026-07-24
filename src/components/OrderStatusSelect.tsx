"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["PENDING", "IN_PROGRESS", "DELIVERED", "COMPLETED", "CANCELLED"];

export default function OrderStatusSelect({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <select
      disabled={loading}
      value={current}
      onChange={async (e) => {
        setLoading(true);
        await fetch(`/api/orders/${orderId}/status`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: e.target.value }),
        });
        setLoading(false);
        router.refresh();
      }}
      className="border rounded px-2 py-1.5 text-sm bg-white"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace("_", " ")}
        </option>
      ))}
    </select>
  );
}
