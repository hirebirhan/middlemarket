import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";
import { canTransition, isOrderStatus, ORDER_TRANSITIONS } from "@/lib/orders";

const label = (status: string) => status.replace(/_/g, " ").toLowerCase();

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireUser("ADMIN");
    const { status } = await req.json();

    if (!isOrderStatus(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (order.status === status) {
      return NextResponse.json(order);
    }

    // Without this an order can jump straight from pending to completed, or
    // climb back out of cancelled.
    if (!canTransition(order.status, status)) {
      const allowed = ORDER_TRANSITIONS[order.status];
      return NextResponse.json(
        {
          error: allowed.length
            ? `An order that is ${label(order.status)} can only move to ${allowed.map(label).join(" or ")}.`
            : `This order is ${label(order.status)} and can no longer change.`,
        },
        { status: 409 }
      );
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
