import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/**
 * Public landing-page aggregates. Every figure is computed from real rows —
 * the audit's rule is that the public page never quotes a number the database
 * cannot back. Cached for an hour; these are trust signals, not tickers, and
 * an hour-old count changes no one's decision.
 */
export type PlatformStats = {
  requestsPosted: number;
  offersReviewed: number;
  savedByMediation: number;
};

async function computePlatformStats(): Promise<PlatformStats> {
  const [requestsPosted, reviewedOffers] = await Promise.all([
    prisma.request.count(),
    prisma.offer.findMany({
      where: {
        adminPrice: { not: null },
        status: { in: ["APPROVED", "ACCEPTED"] },
      },
      select: { price: true, adminPrice: true },
    }),
  ]);

  const savedByMediation = reviewedOffers.reduce((sum, offer) => {
    const diff = Number(offer.price) - Number(offer.adminPrice);
    return diff > 0 ? sum + diff : sum;
  }, 0);

  return {
    requestsPosted,
    offersReviewed: reviewedOffers.length,
    savedByMediation,
  };
}

export const getPlatformStats = unstable_cache(
  computePlatformStats,
  ["platform-stats"],
  { revalidate: 3600 }
);
