import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Search,
  ShieldCheck,
  Store,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicRequestStarter } from "@/components/PublicRequestStarter";
import { PlatformActivity } from "@/components/PlatformActivity";
import { Eyebrow, Money } from "@/components/Typography";
import { formatMoney } from "@/lib/money";

const REVIEW_EXAMPLE = {
  sellerAsk: 62000,
  buyerPrice: 54500,
  item: "iPhone 15 128GB",
  note: "Adjusted to the top of the reviewed price band for this model.",
} as const;

const HERO_PREVIEW = {
  item: "Office chairs",
  detail: "4 ergonomic mesh chairs · Addis Ababa · delivery this week",
  sellerOffer: 38500,
  buyerVisible: 36800,
  note: "Lower local matches found. Delivery included.",
} as const;

const STEPS = [
  {
    title: "Share the exact need",
    body: "Add the item, model, quantity, location, timing, and budget if you have one.",
    icon: Search,
  },
  {
    title: "Shops quote the same brief",
    body: "Every seller responds to the same details, so offers are easier to compare.",
    icon: Store,
  },
  {
    title: "The price gets checked",
    body: "MiddleMarket reviews each offer and adds a note when a price needs context.",
    icon: ClipboardCheck,
  },
  {
    title: "Choose or walk away",
    body: "Accept the reviewed offer that makes sense. Until then, you have not committed.",
    icon: CheckCircle2,
  },
] as const;

const REVIEW_POINTS = [
  "Item match: model, quantity, condition, scope, and timing.",
  "Price reviewed against comparable local options.",
  "Buyer-visible price confirmed or adjusted before display.",
  "A plain review note when the offer needs context.",
] as const;

const GOOD_FIT = [
  "Specific products where model, condition, or warranty matters.",
  "Services where scope and timing need to be quoted before you choose.",
  "Purchases where you want another person to check whether the price is fair.",
] as const;

const NOT_YET = [
  "Instant cart checkout for stocked products.",
  "In-app payments and escrow.",
  "Complex procurement with many separate line items.",
] as const;

export default function Home() {
  const heroSaved = HERO_PREVIEW.sellerOffer - HERO_PREVIEW.buyerVisible;
  const reviewedBarWidth = Math.round(
    (HERO_PREVIEW.buyerVisible / HERO_PREVIEW.sellerOffer) * 100
  );

  return (
    <div>
      {/* ── Hero: one job — start a request. White band on the grey page. ── */}
      <section className="relative isolate overflow-hidden border-b border-border bg-card">
        <Image
          src="/assets/middlemarket-quote-counter.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center sm:object-right"
        />
        <div
          className="absolute inset-0 -z-10 bg-card/88 sm:bg-gradient-to-r sm:from-card sm:via-card/82 sm:to-card/24"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-page gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.75fr)] lg:items-center lg:gap-12">
          <div className="relative z-10 max-w-xl xl:max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5 text-brand" aria-hidden="true" />
              For buyers in Addis Ababa
            </div>

            <h1 className="mt-4 max-w-2xl font-display text-display font-semibold">
              Stop guessing if a shop price is fair.
            </h1>

            <p className="mt-3 max-w-xl text-base leading-7 text-muted-foreground">
              Describe what you need once. Shops send prices. We review each
              offer before you compare or accept.
            </p>

            <PublicRequestStarter
              id="need"
              label="Start with the item or service"
              placeholder="Office chairs, iPhone, CCTV"
              buttonLabel="Check prices"
              className="mt-5 max-w-xl"
            />

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium">
              <Link
                href="/products"
                className="inline-flex items-center gap-1 text-brand hover:underline"
              >
                Product requests
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-1 text-brand hover:underline"
              >
                Service requests
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>

            {/* Mobile: the same example, compact and flat. */}
            <div className="mt-6 rounded-md border border-border bg-card p-4 lg:hidden">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-brand">
                  Example reviewed offer
                </p>
                <Badge variant="outline">Reviewed</Badge>
              </div>
              <p className="mt-2 font-semibold">{HERO_PREVIEW.item}</p>
              <div className="mt-2 flex items-baseline justify-between gap-4">
                <Money className="text-sm text-muted-foreground line-through">
                  {formatMoney(HERO_PREVIEW.sellerOffer)}
                </Money>
                <Money className="font-mono text-2xl font-semibold text-brand">
                  {formatMoney(HERO_PREVIEW.buyerVisible)}
                </Money>
              </div>
              <p className="mt-2 text-xs font-medium text-brand">
                {formatMoney(heroSaved)} below the asking price
              </p>
            </div>
          </div>

          {/* Desktop example: a flat receipt, not a floating card. */}
          <div className="relative z-10 hidden lg:block">
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                <p className="text-xs font-semibold text-brand">
                  Example reviewed offer
                </p>
                <Badge variant="outline">Reviewed</Badge>
              </div>

              <div className="px-5 py-4">
                <p className="font-semibold">{HERO_PREVIEW.item}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {HERO_PREVIEW.detail}
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Seller quote
                      </span>
                      <Money className="text-muted-foreground line-through">
                        {formatMoney(HERO_PREVIEW.sellerOffer)}
                      </Money>
                    </div>
                    <div
                      className="mt-1.5 h-2 rounded-pill bg-muted"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-sm font-medium">After review</span>
                      <Money className="text-metric font-semibold text-brand">
                        {formatMoney(HERO_PREVIEW.buyerVisible)}
                      </Money>
                    </div>
                    <div
                      className="mt-1.5 h-2 rounded-pill bg-brand"
                      style={{ width: `${reviewedBarWidth}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-border px-5 py-3.5">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand">
                  <TrendingDown className="size-3.5" aria-hidden="true" />
                  {formatMoney(heroSaved)} below the asking price
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {HERO_PREVIEW.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Real activity, or nothing. ── */}
      <PlatformActivity />

      {/* ── Process: numbered cells separated by hairlines, no cards. ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-12">
          <div className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-2 font-display text-title font-semibold">
              From one request to prices you can compare.
            </h2>
          </div>

          <ol className="mt-8 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-sm font-semibold text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <step.icon
                    className="size-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Review standard: checklist on the grey page, receipt example. ── */}
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-page gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-2 lg:items-start">
          <div>
            <Eyebrow>What gets reviewed</Eyebrow>
            <h2 className="mt-2 font-display text-title font-semibold">
              Every reviewed offer should make the price easier to trust.
            </h2>
            <ul className="mt-6 divide-y divide-border border-y border-border">
              {REVIEW_POINTS.map((point) => (
                <li key={point} className="flex gap-3 py-3 text-sm">
                  <FileSearch
                    className="mt-0.5 size-4 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="overflow-hidden rounded-md border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Example reviewed offer
                </p>
                <h3 className="mt-0.5 font-semibold">{REVIEW_EXAMPLE.item}</h3>
              </div>
              <Badge variant="outline">Reviewed</Badge>
            </div>

            <dl className="divide-y divide-border text-sm">
              <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                <dt className="text-muted-foreground">Seller asked</dt>
                <dd>
                  <Money className="text-muted-foreground line-through">
                    {formatMoney(REVIEW_EXAMPLE.sellerAsk)}
                  </Money>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                <dt className="font-medium">Buyer sees</dt>
                <dd>
                  <Money className="text-lg font-semibold text-brand">
                    {formatMoney(REVIEW_EXAMPLE.buyerPrice)}
                  </Money>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 px-5 py-3">
                <dt className="text-muted-foreground">Adjustment</dt>
                <dd>
                  <Money className="font-semibold text-brand">
                    −
                    {formatMoney(
                      REVIEW_EXAMPLE.sellerAsk - REVIEW_EXAMPLE.buyerPrice
                    )}
                  </Money>
                </dd>
              </div>
            </dl>

            <div className="border-t border-border bg-muted/60 px-5 py-3.5 text-sm">
              <p className="font-medium">Marketplace note</p>
              <p className="mt-1 text-muted-foreground">
                {REVIEW_EXAMPLE.note}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Fit: two plain columns, hairline rows. ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-page gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 font-display text-title font-semibold">
              <CheckCircle2 className="size-5 text-brand" aria-hidden="true" />
              Works best today
            </h2>
            <ul className="mt-5 divide-y divide-border border-y border-border text-sm">
              {GOOD_FIT.map((item) => (
                <li key={item} className="py-3 text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-display text-title font-semibold">
              <XCircle
                className="size-5 text-muted-foreground"
                aria-hidden="true"
              />
              Coming later
            </h2>
            <ul className="mt-5 divide-y divide-border border-y border-border text-sm">
              {NOT_YET.map((item) => (
                <li key={item} className="py-3 text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Seller acquisition: the one solid dark band on the page. ── */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-page flex-col gap-5 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-eyebrow font-semibold uppercase text-primary-foreground/70">
              For shops
            </p>
            <h2 className="mt-2 font-display text-title font-semibold">
              Quote buyers who already know what they need.
            </h2>
            <p className="mt-2 text-primary-foreground/80">
              Sellers respond to specific requests, submit one clear price, and
              track whether each offer is reviewed, declined, or accepted.
            </p>
          </div>
          <Link
            href="/register?role=SELLER"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
              className: "self-start lg:self-auto",
            })}
          >
            Start selling
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Final action: quiet, centred, no panel. ── */}
      <section className="mx-auto max-w-page px-4 py-14 text-center sm:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-display font-semibold">
            Ask once. Compare after review.
          </h2>
          <p className="mt-4 text-lead text-muted-foreground">
            Describe the item or service clearly. You commit only after reviewed
            offers come back.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/register?role=BUYER"
              className={buttonVariants({
                variant: "default",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              Post a request
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
            <Link
              href="/login"
              className={buttonVariants({
                variant: "ghost",
                size: "lg",
                className: "w-full sm:w-auto",
              })}
            >
              Log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
