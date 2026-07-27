import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { canTransition, ORDER_STATUSES, ORDER_TRANSITIONS } from "@/lib/orders";
import { ApiError, handleApiError, readJson, requireEnum } from "@/lib/api";

const label = (status: string) => status.replace(/_/g, " ").toLowerCase();

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await requireUser("ADMIN");
    const body = await readJson(req);
    const status = requireEnum(body.status, ORDER_STATUSES, "Status");

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) throw new ApiError(404, "That order no longer exists.");
    if (order.status === status) return NextResponse.json(order);

    const allowed = ORDER_TRANSITIONS[order.status];

    // Checked before anything is written. Without this an order can jump
    // straight from pending to completed, or climb back out of cancelled.
    if (!canTransition(order.status, status)) {
      throw new ApiError(
        409,
        allowed.length
          ? `An order that is ${label(order.status)} can only move to ${allowed
              .map(label)
              .join(" or ")}.`
          : `This order is ${label(order.status)} and can no longer change.`
      );
    }

    // Conditional on the status we validated against, rather than a plain
    // update: if another admin moved this order in the meantime, the row no
    // longer matches and their change is not silently overwritten.
    const moved = await prisma.order.updateMany({
      where: { id, status: order.status },
      data: { status },
    });
    if (moved.count === 0) {
      throw new ApiError(
        409,
        "Someone else changed this order first. Reload to see where it is now."
      );
    }

    const updated = await prisma.order.findUnique({ where: { id } });
    return NextResponse.json(updated);
  } catch (e) {
    return handleApiError(e);
  }
}
