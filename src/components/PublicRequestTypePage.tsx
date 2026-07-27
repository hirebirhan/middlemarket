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
  XCircle,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Eyebrow } from "@/components/Typography";
import type { RequestIntentType } from "@/lib/request-intent";

type Detail = {
  title: string;
  body: string;
  icon: LucideIcon;
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
}: PublicRequestTypePageProps) {
  const buyerHref = `/register?role=BUYER&type=${type}`;

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
          className="absolute inset-0 -z-10 bg-background/88 sm:bg-gradient-to-r sm:from-background sm:via-background/82 sm:to-background/24"
          aria-hidden="true"
        />

        <div className="mx-auto flex min-h-[28rem] max-w-page items-center px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[31rem]">
          <div className="max-w-3xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="mt-3 font-display text-hero font-semibold">
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
                  className: "h-12 w-full rounded-lg px-5 sm:w-auto",
                })}
              >
                {ctaLabel}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
              <p className="text-sm font-medium text-muted-foreground">
                Write the exact brief in the request form after signup.
              </p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-card/80 px-3 py-1.5">
                <ShieldCheck className="size-3.5 text-brand" aria-hidden="true" />
                Price reviewed before comparison
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-card/80 px-3 py-1.5">
                <CheckCircle2 className="size-3.5 text-brand" aria-hidden="true" />
                Free to ask
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-page gap-8 px-4 py-section sm:px-6 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <div>
          <Eyebrow>Request Quality</Eyebrow>
          <h2 className="mt-3 font-display text-title font-semibold">
            {includeTitle}
          </h2>
          <p className="mt-3 max-w-prose text-lead text-muted-foreground">
            {includeDescription}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {includeItems.map((item) => (
            <div
              key={item.title}
              className="rounded-card border border-border bg-card p-4 shadow-sm"
            >
              <span className="grid size-10 place-items-center rounded-lg bg-muted text-muted-foreground">
                <item.icon className="size-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/50">
        <div className="mx-auto max-w-page px-4 py-section sm:px-6">
          <div className="max-w-2xl">
            <Eyebrow>How It Works</Eyebrow>
            <h2 className="mt-3 font-display text-title font-semibold">
              One request, one reviewed decision path.
            </h2>
          </div>

          <ol className="mt-8 grid gap-3 md:grid-cols-3">
            {FLOW.map((step, index) => (
              <li
                key={step.title}
                className="rounded-card border border-border bg-card p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                    <step.icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-semibold text-brand">
                    Step {index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-page gap-4 px-4 py-section sm:px-6 lg:grid-cols-2">
        <div className="rounded-card border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-5 text-brand" aria-hidden="true" />
            <h2 className="font-display text-title font-semibold">
              Strong fit
            </h2>
          </div>
          <ul className="mt-5 grid gap-3 text-sm text-muted-foreground">
            {bestFor.map((item) => (
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
              Not built for yet
            </h2>
          </div>
          <ul className="mt-5 grid gap-3 text-sm text-muted-foreground">
            {notFor.map((item) => (
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

      <section className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-page flex-col gap-4 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>For Shops</Eyebrow>
            <h2 className="mt-2 font-display text-title font-semibold">
              Quote buyers who already wrote the brief.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sellers respond to open requests and track each offer through
              review, approval, decline, or acceptance.
            </p>
          </div>
          <Link
            href="/register?role=SELLER"
            className={buttonVariants({
              variant: "outline",
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
