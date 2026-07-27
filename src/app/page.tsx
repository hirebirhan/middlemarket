import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  ClipboardCheck,
  FileSearch,
  Search,
  ShieldCheck,
  Store,
  XCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicRequestStarter } from "@/components/PublicRequestStarter";
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
  budget: 40000,
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
    icon: BadgeCheck,
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
  return (
    <div className="bg-background">
      <section className="relative isolate overflow-hidden border-b border-border">
        <Image
          src="/assets/middlemarket-quote-counter.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-20 object-cover object-center sm:object-right"
        />
        <div
          className="absolute inset-0 -z-10 bg-background/84 sm:bg-gradient-to-r sm:from-background sm:via-background/78 sm:to-background/18"
          aria-hidden="true"
        />

        <div className="relative mx-auto grid max-w-page gap-8 px-4 pt-7 pb-2 sm:px-6 sm:py-14 lg:min-h-[38rem] lg:grid-cols-[minmax(0,0.95fr)_minmax(22rem,0.75fr)] lg:items-center lg:gap-10 lg:py-16">
          <div className="relative z-10 max-w-xl xl:max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-pill border border-border bg-card/85 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-xs backdrop-blur">
              <ShieldCheck className="size-3.5 text-brand" aria-hidden="true" />
              For buyers in Addis Ababa
            </div>

            <h1 className="mt-4 max-w-2xl font-display text-display font-semibold sm:text-hero">
              Stop guessing if a shop price is fair.
            </h1>

            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
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

            <p className="mt-3 text-xs font-medium text-muted-foreground">
              Free to ask. Decide after review.
            </p>

            <div className="mt-4 rounded-xl border border-border bg-card/94 p-3 shadow-lg backdrop-blur lg:hidden">
              <p className="text-xs font-semibold text-brand">
                Reviewed price
              </p>
              <Money className="mt-1 block font-mono text-2xl font-semibold text-brand">
                {formatMoney(HERO_PREVIEW.buyerVisible)}
              </Money>
              <p className="mt-2 font-semibold">{HERO_PREVIEW.item}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Seller quoted{" "}
                <Money className="font-mono font-medium line-through">
                  {formatMoney(HERO_PREVIEW.sellerOffer)}
                </Money>
                . {HERO_PREVIEW.note}
              </p>
            </div>
          </div>

          <div className="relative z-10 hidden rounded-card border border-border bg-card/94 p-6 shadow-xl backdrop-blur lg:block">
            <p className="text-xs font-semibold text-brand">
              Reviewed price example
            </p>

            <Money className="mt-4 block font-mono text-hero font-semibold text-brand">
              {formatMoney(HERO_PREVIEW.buyerVisible)}
            </Money>
            <p className="mt-3 text-sm font-medium text-muted-foreground">
              {HERO_PREVIEW.detail}
            </p>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4">
              <span className="text-sm text-muted-foreground">
                Seller quote
              </span>
              <Money className="font-mono text-sm font-semibold text-muted-foreground line-through">
                {formatMoney(HERO_PREVIEW.sellerOffer)}
              </Money>
            </div>

            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              {HERO_PREVIEW.note}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-page gap-10 px-4 pt-8 pb-section sm:px-6 sm:py-section lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <Eyebrow>How It Works</Eyebrow>
          <h2 className="mt-3 max-w-xl font-display text-title font-semibold">
            From one request to prices you can compare.
          </h2>
          <p className="mt-3 max-w-prose text-lead text-muted-foreground">
            You keep the buying decision in one place: request details, seller
            offers, review notes, and the final choice.
          </p>
        </div>

        <ol className="grid gap-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="grid gap-4 rounded-card border border-border bg-card p-4 shadow-sm sm:grid-cols-[2.75rem_1fr]"
            >
              <span className="grid size-11 place-items-center rounded-lg bg-muted text-muted-foreground">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold text-brand">
                  Step {index + 1}
                </p>
                <h3 className="mt-1 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y border-border bg-muted/50">
        <div className="mx-auto grid max-w-page gap-8 px-4 py-section sm:px-6 lg:grid-cols-2 lg:items-start">
          <div>
            <Eyebrow>What Gets Reviewed</Eyebrow>
            <h2 className="mt-3 font-display text-title font-semibold">
              Every reviewed offer should make the price easier to trust.
            </h2>
            <ul className="mt-6 grid gap-3">
              {REVIEW_POINTS.map((point) => (
                <li key={point} className="flex gap-3 text-sm">
                  <FileSearch
                    className="mt-0.5 size-4 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-card border border-border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Example reviewed offer
                </p>
                <h3 className="mt-1 font-semibold">{REVIEW_EXAMPLE.item}</h3>
              </div>
              <Badge variant="outline">Reviewed</Badge>
            </div>

            <dl className="mt-5 grid gap-3 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">Seller asked</dt>
                <dd>
                  <Money className="text-muted-foreground line-through">
                    {formatMoney(REVIEW_EXAMPLE.sellerAsk)}
                  </Money>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="font-medium">Buyer sees</dt>
                <dd>
                  <Money className="text-metric font-semibold">
                    {formatMoney(REVIEW_EXAMPLE.buyerPrice)}
                  </Money>
                </dd>
              </div>
            </dl>

            <div className="mt-5 rounded-lg border border-brand-border bg-brand-muted p-3 text-sm text-brand">
              <p className="font-medium">Marketplace note</p>
              <p className="mt-1">{REVIEW_EXAMPLE.note}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-page gap-8 px-4 py-section sm:px-6 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-brand" aria-hidden="true" />
            <h2 className="font-display text-title font-semibold">
              Works best today
            </h2>
          </div>
          <ul className="mt-5 grid gap-3 text-sm text-muted-foreground">
            {GOOD_FIT.map((item) => (
              <li key={item} className="flex gap-2.5">
                <CheckCircle2
                  className="mt-0.5 size-4 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <XCircle className="size-5 text-muted-foreground" aria-hidden="true" />
            <h2 className="font-display text-title font-semibold">
              Coming later
            </h2>
          </div>
          <ul className="mt-5 grid gap-3 text-sm text-muted-foreground">
            {NOT_YET.map((item) => (
              <li key={item} className="flex gap-2.5">
                <XCircle
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto flex max-w-page flex-col gap-5 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>For Shops</Eyebrow>
            <h2 className="mt-2 font-display text-title font-semibold">
              Quote buyers who already know what they need.
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sellers respond to specific requests, submit one clear price, and
              track whether each offer is reviewed, declined, or accepted.
            </p>
          </div>
          <Link
            href="/register?role=SELLER"
            className={buttonVariants({
              variant: "outline",
              size: "lg",
              className: "self-start lg:self-auto",
            })}
          >
            Start selling
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-page px-4 py-section text-center sm:px-6">
        <div className="mx-auto max-w-2xl">
          <Eyebrow>Start With The Request</Eyebrow>
          <h2 className="mt-3 font-display text-display font-semibold">
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
