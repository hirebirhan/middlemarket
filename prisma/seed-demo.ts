/**
 * Demo dataset for presenting MiddleMarket.
 *
 * Every record is fictional and labelled as such — these are illustrative
 * figures for a walkthrough, not real transactions. Re-running replaces the
 * demo rows only; accounts and data outside the demo set are left alone.
 *
 *   npm run seed:demo          # create / reset the demo data
 *   npm run seed:demo -- --clean   # remove it and stop
 */
import { PrismaClient, type Condition, type OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = process.env.DEMO_PASSWORD || "demo1234";

const BUYERS = [
  { email: "meron@demo.middlemarket", name: "Meron Tesfaye" },
  { email: "dawit@demo.middlemarket", name: "Dawit Alemu" },
];
const SELLERS = [
  { email: "bole.electronics@demo.middlemarket", name: "Bole Electronics" },
  { email: "piassa.mobile@demo.middlemarket", name: "Piassa Mobile" },
  { email: "kazanchis.tech@demo.middlemarket", name: "Kazanchis Tech" },
];

/** asked → reviewed, so the mediation saving is visible on the dashboard. */
const SCENARIOS = [
  {
    buyer: 0, title: "iPhone 15 128GB", sku: "iPhone 15 128GB",
    description: "Sealed, with official warranty. Needed this week.",
    budget: 60000,
    offers: [
      { seller: 0, price: 62000, adminPrice: 54500, band: [52000, 55000], condition: "NEW",
        message: "Sealed unit, 1 year warranty, free delivery in Addis.",
        adminNote: "Above the going rate for this model in Addis; adjusted to the top of band.",
        status: "ACCEPTED", order: "IN_PROGRESS" },
      { seller: 1, price: 58000, adminPrice: null, band: [52000, 55000], condition: "NEW",
        message: "New, shop warranty 6 months.",
        adminNote: "Still above band and no official warranty at this price.",
        status: "REJECTED", order: null },
    ],
  },
  {
    buyer: 0, title: "MacBook Air M2", sku: "MacBook Air M2 256GB",
    description: "For design work. Prefer official warranty.",
    budget: 95000,
    offers: [
      { seller: 2, price: 98000, adminPrice: 91000, band: [88000, 92000], condition: "NEW",
        message: "New, sealed. Includes charger and sleeve.",
        adminNote: "Trimmed to the top of band for this configuration.",
        status: "APPROVED", order: null },
    ],
  },
  {
    buyer: 1, title: "Samsung Galaxy A54", sku: "Samsung Galaxy A54 256GB",
    description: "Dual sim, for my sister. Any colour.",
    budget: 32000,
    offers: [
      { seller: 1, price: 41500, adminPrice: null, band: null, condition: "NEW",
        message: "Brand new, sealed box, shop warranty 6 months.",
        adminNote: null, status: "PENDING_REVIEW", order: null },
    ],
  },
  {
    buyer: 1, title: "65\" smart TV", sku: "Hisense 65A6K",
    description: "Wall mount included if possible.",
    budget: 70000,
    offers: [
      { seller: 0, price: 74000, adminPrice: 66000, band: [63000, 66000], condition: "NEW",
        message: "Includes wall mount and installation.",
        adminNote: "Adjusted to band; installation kept at no extra charge.",
        status: "ACCEPTED", order: "COMPLETED" },
    ],
  },
];

const demoEmails = [...BUYERS, ...SELLERS].map((u) => u.email);

async function clean() {
  const users = await prisma.user.findMany({
    where: { email: { in: demoEmails } },
    select: { id: true },
  });
  const ids = users.map((u) => u.id);
  if (ids.length === 0) return 0;

  const requests = await prisma.request.findMany({
    where: { buyerId: { in: ids } },
    select: { id: true },
  });
  const requestIds = requests.map((r) => r.id);
  const offers = await prisma.offer.findMany({
    where: { OR: [{ requestId: { in: requestIds } }, { sellerId: { in: ids } }] },
    select: { id: true },
  });
  const offerIds = offers.map((o) => o.id);

  await prisma.order.deleteMany({ where: { offerId: { in: offerIds } } });
  await prisma.offer.deleteMany({ where: { id: { in: offerIds } } });
  await prisma.request.deleteMany({ where: { id: { in: requestIds } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
  return ids.length;
}

async function main() {
  const removed = await clean();
  if (removed) console.log(`Cleared ${removed} existing demo account(s).`);

  if (process.argv.includes("--clean")) {
    console.log("Demo data removed.");
    return;
  }

  const password = await bcrypt.hash(PASSWORD, 10);
  const buyers = await Promise.all(
    BUYERS.map((u) =>
      prisma.user.create({ data: { ...u, role: "BUYER", password } })
    )
  );
  const sellers = await Promise.all(
    SELLERS.map((u) =>
      prisma.user.create({ data: { ...u, role: "SELLER", password } })
    )
  );

  for (const s of SCENARIOS) {
    // A request with an accepted offer is no longer open for bidding.
    const matched = s.offers.some((o) => o.status === "ACCEPTED");
    const request = await prisma.request.create({
      data: {
        title: s.title,
        sku: s.sku,
        description: s.description,
        type: "PRODUCT",
        budget: s.budget,
        status: matched ? "MATCHED" : "OPEN",
        buyerId: buyers[s.buyer].id,
      },
    });

    for (const o of s.offers) {
      const offer = await prisma.offer.create({
        data: {
          requestId: request.id,
          sellerId: sellers[o.seller].id,
          price: o.price,
          adminPrice: o.adminPrice,
          bandLow: o.band?.[0] ?? null,
          bandHigh: o.band?.[1] ?? null,
          condition: o.condition as Condition,
          status: o.status as never,
          message: o.message,
          adminNote: o.adminNote,
        },
      });
      if (o.order) {
        await prisma.order.create({
          data: { offerId: offer.id, status: o.order as OrderStatus },
        });
      }
    }
  }

  const saved = SCENARIOS.flatMap((s) => s.offers as { price: number; adminPrice: number | null; status: string }[])
    .filter((o) => o.status === "ACCEPTED" && o.adminPrice)
    .reduce((sum, o) => sum + (o.price - (o.adminPrice as number)), 0);

  console.log(`Demo data ready — ${buyers.length} buyers, ${sellers.length} shops.`);
  console.log(`Password for every demo account: ${PASSWORD}`);
  console.log(`Buyer "${BUYERS[0].name}" shows ${saved.toLocaleString()} saved by mediation.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
