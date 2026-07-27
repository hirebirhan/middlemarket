import type { Metadata } from "next";
import Link from "next/link";
import {
  Clock,
  PackageOpen,
  ShoppingCart,
  Users,
  ArrowRight,
  TrendingDown,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney } from "@/lib/money";
import { OPEN_ORDER_STATUSES } from "@/lib/admin";
import { StatGrid } from "@/components/StatCard";
import { Container } from "@/components/Container";
import { PageHeader, Money } from "@/components/Typography";
import { SectionHeader } from "@/components/SectionHeader";
import { buttonVariants } from "@/components/ui/button";
import { Identity } from "@/components/Identity";
import { EmptyState } from "@/components/EmptyState";

export const metadata: Metadata = {
  title: "Control room",
  description: "What needs a decision, and what the mediation is worth.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * The console's landing screen: what needs you, then the numbers that say
 * whether the thing is working. It is deliberately short — every real task
 * lives on its own route, and an overview that tries to also be the queue is
 * just the old single-page dashboard with extra steps.
 */
export default async function AdminOverviewPage() {
  // The layout has already guarded the role; this is only for the greeting.
  const user = await getCurrentUser();

  const [pending, activeOrders, openRequests, totalUsers, oldest, adjusted] =
    await Promise.all([
      prisma.offer.count({ where: { status: "PENDING_REVIEW" } }),
      prisma.order.count({ where: { status: { in: OPEN_ORDER_STATUSES } } }),
      prisma.request.count({ where: { status: "OPEN" } }),
      prisma.user.count(),
      prisma.offer.findMany({
        where: { status: "PENDING_REVIEW" },
        include: { seller: true, request: true },
        orderBy: { createdAt: "asc" },
        take: 3,
      }),
      // What the review has actually taken off prices the buyer went on to
      // accept — the one number that says whether mediation is doing anything.
      prisma.offer.findMany({
        where: { status: "ACCEPTED", adminPrice: { not: null } },
        select: { price: true, adminPrice: true },
      }),
    ]);

  const savedTotal = adjusted.reduce((sum, o) => {
    const diff = Number(o.price) - Number(o.adminPrice);
    return diff > 0 ? sum + diff : sum;
  }, 0);
  const savedOn = adjusted.filter(
    (o) => Number(o.price) - Number(o.adminPrice) > 0
  ).length;

  return (
    <Container className="py-4 sm:py-5 space-y-5">
      <PageHeader
        eyebrow="Admin"
        title={`Hi, ${user?.name.split(" ")[0] ?? "there"}`}
        description={
          pending > 0
            ? `${pending} offer${pending === 1 ? "" : "s"} need a decision before any buyer can see them.`
            : "Nothing is waiting on you. Every offer submitted so far has been reviewed."
        }
        action={
          pending > 0 ? (
            <Link
              href="/admin/queue"
              className={buttonVariants({ variant: "default", className: "group" })}
            >
              Start reviewing
              <ArrowRight
                className="size-4 transition-transform duration-150 ease-soft group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          ) : null
        }
      />

      <StatGrid
        className="grid-cols-2 lg:grid-cols-4"
        stats={[
          {
            label: "Awaiting review",
            value: pending,
            icon: Clock,
            href: "/admin/queue",
            tone: pending ? "warning" : "neutral",
          },
          {
            label: "Active orders",
            value: activeOrders,
            icon: ShoppingCart,
            href: "/admin/orders",
            tone: activeOrders ? "success" : "neutral",
          },
          { label: "Open requests", value: openRequests, icon: PackageOpen },
          { label: "People", value: totalUsers, icon: Users },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <SectionHeader
            title="Next in the queue"
            description="Oldest first — whoever has waited longest."
            action={
              pending > 3 ? (
                <Link
                  href="/admin/queue"
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  See all {pending}
                </Link>
              ) : null
            }
          />

          {oldest.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="Queue is empty"
              description="Offers appear here the moment a shop sends a price."
            />
          ) : (
            <ul className="divide-y divide-border overflow-hidden rounded-card border border-border bg-card">
              {oldest.map((offer) => (
                <li key={offer.id}>
                  <Link
                    href="/admin/queue"
                    className="flex items-center gap-4 px-5 py-4 transition-colors duration-150 ease-soft hover:bg-accent"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">
                        {offer.request.title}
                      </p>
                      <div className="mt-1 text-xs text-muted-foreground">
                        <Identity name={offer.seller.name} />
                      </div>
                    </div>
                    <Money className="shrink-0 font-semibold">
                      {formatMoney(offer.price)}
                    </Money>
                    <ArrowRight
                      className="size-4 shrink-0 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <SectionHeader
            title="Mediation to date"
            description="What review has taken off accepted prices."
          />
          <div className="rounded-card border border-brand-border/50 bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingDown className="size-4 text-brand" aria-hidden="true" />
              Saved for buyers
            </div>
            <p className="mt-3 font-mono text-metric font-semibold break-words tabular-nums text-brand">
              {formatMoney(savedTotal) ?? "—"}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {savedOn > 0
                ? `Across ${savedOn} accepted offer${savedOn === 1 ? "" : "s"} where your review brought the price down.`
                : "Adjust a price on an offer a buyer then accepts, and it shows up here."}
            </p>
          </div>
        </section>
      </div>
    </Container>
  );
}
