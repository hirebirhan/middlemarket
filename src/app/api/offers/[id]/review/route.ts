import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await requireUser("ADMIN");
    const { action, adminPrice, adminNote } = await req.json();

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const note = typeof adminNote === "string" ? adminNote.trim() : "";

    // A rejection the seller cannot understand is a dead end for them — the
    // offer just disappears with no way to learn what to fix.
    if (action === "REJECT" && !note) {
      return NextResponse.json(
        { error: "Tell the seller why this offer was rejected." },
        { status: 400 }
      );
    }

    let price: number | null = null;
    if (action === "APPROVE" && adminPrice !== null && adminPrice !== undefined) {
      price = Number(adminPrice);
      if (!Number.isFinite(price) || price <= 0) {
        return NextResponse.json(
          { error: "Adjusted price must be greater than 0." },
          { status: 400 }
        );
      }
    }

    const offer = await prisma.offer.findUnique({ where: { id } });
    if (!offer || offer.status !== "PENDING_REVIEW") {
      return NextResponse.json({ error: "Offer not pending review" }, { status: 400 });
    }

    // An adjusted price is only meaningful on an approval; storing one on a
    // rejected offer leaves a price nobody can act on.
    const updated = await prisma.offer.update({
      where: { id },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        adminPrice: price,
        adminNote: note || null,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
