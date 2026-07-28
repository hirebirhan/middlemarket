import Image from "next/image";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Search,
  ShieldCheck,
  Store,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlatformActivity } from "@/components/PlatformActivity";
import { Eyebrow, Money } from "@/components/Typography";
import { formatMoney } from "@/lib/money";
import type { RequestIntentType } from "@/lib/request-intent";

type Detail = {
  title: string;
  body: string;
  icon: LucideIcon;
};

type ExampleOffer = {
  title: string;
  detail: string;
  sellerAsk: number;
  reviewed: number;
  note: string;
};

type PublicRequestTypePageProps = {
  type: RequestIntentType;
  eyebrow: string;
  title: string;
  headline: string;
  description: string;
  ctaLabel: string;
  includeTitle: string;
  includeDescription: string;
  includeItems: Detail[];
  bestFor: string[];
  notFor: string[];
  example: ExampleOffer;
};

const FLOW = [
  {
    title: "Post one clear request",
    body: "The brief carries through signup and into your buyer request form.",
    icon: Search,
  },
  {
    title: "Sellers quote the same brief",
    body: "Every offer is attached to the request details, so comparison stays grounded.",
    icon: Store,
  },
  {
    title: "MiddleMarket reviews the price",
    body: "The buyer-visible price is checked before you decide whether to accept.",
    icon: ClipboardCheck,
  },
] as const;

export function PublicRequestTypePage({
  type,
  eyebrow,
  title,
  headline,
  description,
  ctaLabel,
  includeTitle,
  includeDescription,
  includeItems,
  bestFor,
  notFor,
  example,
}: PublicRequestTypePageProps) {
  const buyerHref = `/register?role=BUYER&type=${type}`;
  const exampleSaved = example.sellerAsk - example.reviewed;
  const reviewedBarWidth = Math.round(
    (example.reviewed / example.sellerAsk) * 100
  );

  return (
    <div>
      {/* ── Hero: one CTA, flat receipt example on desktop. ── */}
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

        <div className="mx-auto grid max-w-page items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.62fr)]">
          <div className="max-w-3xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-3 font-display text-display font-semibold sm:text-hero">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-title font-semibold leading-snug">
              {headline}
            </p>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
              {description}
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={buyerHref}
                className={buttonVariants({
                  variant: "default",
                  size: "lg",
                  className: "h-12 w-full px-5 sm:w-auto",
                })}
              >
                {ctaLabel}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
              <p className="text-sm font-medium text-muted-foreground">
                Write the exact brief in the request form after signup.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-brand" aria-hidden="true" />
                Price reviewed before comparison
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-brand" aria-hidden="true" />
                Free to ask
              </span>
            </div>
          </div>

          <div className="relative z-10 hidden lg:block">
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
                <p className="text-xs font-semibold text-brand">
                  Example reviewed offer
                </p>
                <Badge variant="outline">Reviewed</Badge>
              </div>

              <div className="px-5 py-4">
                <p className="font-semibold">{example.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {example.detail}
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Seller quote
                      </span>
                      <Money className="text-muted-foreground line-through">
                        {formatMoney(example.sellerAsk)}
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
                        {formatMoney(example.reviewed)}
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
                  {formatMoney(exampleSaved)} below the asking price
                </p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {example.note}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PlatformActivity />

      {/* ── Request quality: hairline cells, no cards. ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-12">
          <div className="max-w-2xl">
            <Eyebrow>Request quality</Eyebrow>
            <h2 className="mt-2 font-display text-title font-semibold">
              {includeTitle}
            </h2>
            <p className="mt-3 max-w-prose text-lead text-muted-foreground">
              {includeDescription}
            </p>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
            {includeItems.map((item) => (
              <div key={item.title} className="bg-card p-5">
                <item.icon
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flow: numbered hairline cells on the grey page. ── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-page px-4 py-10 sm:px-6 sm:py-12">
          <div className="max-w-2xl">
            <Eyebrow>How it works</Eyebrow>
            <h2 className="mt-2 font-display text-title font-semibold">
              One request, one reviewed decision path.
            </h2>
          </div>

          <ol className="mt-8 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3">
            {FLOW.map((step, index) => (
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

      {/* ── Fit: two plain columns, hairline rows. ── */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-page gap-10 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 font-display text-title font-semibold">
              <CheckCircle2 className="size-5 text-brand" aria-hidden="true" />
              Strong fit
            </h2>
            <ul className="mt-5 divide-y divide-border border-y border-border text-sm">
              {bestFor.map((item) => (
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
              Not built for yet
            </h2>
            <ul className="mt-5 divide-y divide-border border-y border-border text-sm">
              {notFor.map((item) => (
                <li key={item} className="py-3 text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Seller acquisition: solid dark band. ── */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-page flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <p className="text-eyebrow font-semibold uppercase text-primary-foreground/70">
              For shops
            </p>
            <h2 className="mt-2 font-display text-title font-semibold">
              Quote buyers who already wrote the brief.
            </h2>
            <p className="mt-2 text-sm text-primary-foreground/80">
              Sellers respond to open requests and track each offer through
              review, approval, decline, or acceptance.
            </p>
          </div>
          <Link
            href="/register?role=SELLER"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
              className: "w-full md:w-auto",
            })}
          >
            Start selling
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
