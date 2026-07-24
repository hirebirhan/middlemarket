import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, AuthError } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireUser("ADMIN");
    const { action, adminPrice, adminNote } = await req.json();
    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
    const offer = await prisma.offer.findUnique({ where: { id: params.id } });
    if (!offer || offer.status !== "PENDING_REVIEW") {
      return NextResponse.json({ error: "Offer not pending review" }, { status: 400 });
    }
    const updated = await prisma.offer.update({
      where: { id: params.id },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "REJECTED",
        adminPrice: adminPrice || null,
        adminNote: adminNote || null,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof AuthError) return NextResponse.json({ error: e.message }, { status: e.status });
    throw e;
  }
}
