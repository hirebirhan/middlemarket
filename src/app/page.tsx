import Link from "next/link";
import {
  ArrowRight,
  Scale,
  ShieldCheck,
  Search,
  BadgeCheck,
  ScanSearch,
  Gavel,
  Truck,
  Smartphone,
  Laptop,
  Tv,
  Camera,
  Headphones,
  Gamepad2,
} from "lucide-react";

/** Popular starting points — these seed the request box, they are not listings. */
const SUGGESTIONS = [
  "iPhone 15 128GB",
  "MacBook Air M2",
  "Samsung A54",
  "65\" smart TV",
];

const CATEGORIES = [
  { label: "Phones", icon: Smartphone },
  { label: "Laptops", icon: Laptop },
  { label: "TVs", icon: Tv },
  { label: "Cameras", icon: Camera },
  { label: "Audio", icon: Headphones },
  { label: "Gaming", icon: Gamepad2 },
];

const STEPS = [
  {
    n: "01",
    title: "Say what you need",
    body: "Name the exact model. Takes a minute — no account needed to look around.",
    icon: Search,
  },
  {
    n: "02",
    title: "Verified shops quote",
    body: "Your request goes to shops we've checked. They compete for it.",
    icon: Gavel,
  },
  {
    n: "03",
    title: "We check the price",
    body: "Every quote is checked against the real market rate for that exact model — and that it's genuine, not a copy.",
    icon: ScanSearch,
  },
  {
    n: "04",
    title: "You pay the fair price",
    body: "Accept the quote you like. We track it through to delivery.",
    icon: Truck,
  },
];

export default function Home() {
  return (
    <div>
      {/* ─── Hero — the request box is the product's front door ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-dots" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl py-section text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            Every price checked by a human before you see it
          </div>

          <h1 className="mt-6 text-display font-semibold">
            Know you didn&apos;t overpay
          </h1>
          <p className="mx-auto mt-4 max-w-prose text-lead text-muted-foreground">
            Tell us what you want to buy in Addis. Verified shops send their best
            price — and we check every one against the real market rate before it
            reaches you.
          </p>

          {/* A plain GET form: works without JavaScript, and carries what the
              buyer typed into the request they'll post after signing up. */}
          <form
            action="/register"
            method="get"
            role="search"
            className="mx-auto mt-8 max-w-xl"
          >
            <input type="hidden" name="role" value="BUYER" />
            <label htmlFor="need" className="sr-only">
              What do you need?
            </label>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:rounded-lg sm:border sm:border-input sm:bg-card sm:p-1.5 sm:shadow-sm">
              <div className="flex flex-1 items-center gap-2.5 rounded-md border border-input bg-card px-3.5 sm:border-0 sm:bg-transparent sm:px-2.5">
                <Search
                  className="h-4.5 w-4.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="need"
                  name="need"
                  type="text"
                  required
                  maxLength={120}
                  autoComplete="off"
                  placeholder="What do you need? e.g. iPhone 15 128GB"
                  className="h-12 w-full bg-transparent text-base placeholder:text-muted-foreground focus:outline-none sm:h-11"
                />
              </div>
              <button
                type="submit"
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90 sm:h-11"
              >
                Get free quotes
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground">Popular:</span>
            {SUGGESTIONS.map((s) => (
              <Link
                key={s}
                href={`/register?role=BUYER&need=${encodeURIComponent(s)}`}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
              >
                {s}
              </Link>
            ))}
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            Free for buyers ·{" "}
            <Link href="/register?role=SELLER" className="font-medium text-foreground underline underline-offset-4 hover:text-brand">
              Selling instead?
            </Link>
          </p>
        </div>
      </section>

      {/* ─── The mechanic, shown rather than described ───
          Labelled as an illustration on purpose: these are not real
          transaction figures and must never be presented as if they were. */}
      <section className="border-t border-border py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-title font-semibold">
              The part other marketplaces don&apos;t do
            </h2>
            <p className="mt-3 max-w-prose text-muted-foreground">
              Everywhere else, the price you&apos;re shown is the price the seller
              chose. Here, a person checks it first — against what that exact
              model actually costs, and whether it&apos;s genuine.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Checked against the real rate for that exact model",
                "Genuine, refurbished or used — stated, never blurred",
                "Overpriced quotes are adjusted or rejected before you see them",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <BadgeCheck
                    className="mt-0.5 h-4.5 w-4.5 shrink-0 text-brand"
                    aria-hidden="true"
                  />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <figure className="rounded-card border border-border bg-card p-6 shadow-sm">
            <figcaption className="mb-5 flex items-center justify-between gap-3">
              <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Illustration
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                Price checked
              </span>
            </figcaption>

            <p className="font-semibold">iPhone 15 128GB</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              New · sealed · verified shop
            </p>

            <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">Shop asked</dt>
                <dd className="font-mono tabular-nums text-muted-foreground line-through">
                  ETB 62,000
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">Our adjustment</dt>
                <dd className="font-mono tabular-nums text-brand">− ETB 7,500</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 border-t border-border pt-3">
                <dt className="font-medium">You pay</dt>
                <dd className="font-mono text-title font-semibold tabular-nums">
                  ETB 54,500
                </dd>
              </div>
            </dl>

            <p className="mt-5 rounded-md bg-brand-muted px-3 py-2.5 text-xs text-brand">
              <span className="font-semibold">Why adjusted:</span> above the going
              rate for this model in Addis. Seller agreed to the reviewed price.
            </p>
          </figure>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className="border-t border-border py-20">
        <h2 className="text-title font-semibold">How it works</h2>
        <p className="mt-2 text-muted-foreground">
          Four steps from asking to delivered.
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <li key={s.n}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                  <s.icon className="h-4.5 w-4.5 text-brand" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {s.n}
                </span>
              </div>
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ─── Categories ─── */}
      <section className="border-t border-border py-20">
        <h2 className="text-title font-semibold">Start with electronics</h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          Where overpaying and fake goods hurt buyers in Addis the most. More
          categories follow.
        </p>
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {CATEGORIES.map((c) => (
            <li key={c.label}>
              <Link
                href={`/register?role=BUYER&need=${encodeURIComponent(c.label)}`}
                className="flex flex-col items-center gap-2.5 rounded-card border border-border bg-card px-4 py-6 text-center transition-colors hover:border-brand"
              >
                <c.icon className="h-5 w-5 text-brand" aria-hidden="true" />
                <span className="text-sm font-medium">{c.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ─── CTA ─── */}
      <section className="border-t border-border">
        <div className="my-12 rounded-card border border-border bg-card px-8 py-14 text-center">
          <h2 className="text-title font-semibold">
            Stop guessing what things should cost
          </h2>
          <p className="mx-auto mt-3 max-w-prose text-muted-foreground">
            Post what you need — it&apos;s free, and you only decide once
            you&apos;ve seen a checked price.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/register?role=BUYER"
              className="group inline-flex h-11 items-center gap-2 rounded-md bg-brand px-6 text-sm font-semibold text-brand-foreground transition-opacity hover:opacity-90"
            >
              Post a request
              <ArrowRight
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
            <Link
              href="/register?role=SELLER"
              className="inline-flex h-11 items-center rounded-md border border-input px-6 text-sm font-medium transition-colors hover:bg-accent"
            >
              Sell on MiddleMarket
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border pb-8 pt-12">
        <div className="mb-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand">
                <Scale
                  className="h-4 w-4 text-brand-foreground"
                  strokeWidth={2.2}
                />
              </div>
              <span className="font-bold">MiddleMarket</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              A mediated marketplace for Addis Ababa. We stand between you and a
              bad price.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">For buyers</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/register?role=BUYER" className="hover:text-foreground">
                  Post a request
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Log in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">For shops</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/register?role=SELLER" className="hover:text-foreground">
                  Sell with us
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-foreground">
                  Log in
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-sm font-semibold">How it works</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Say what you need</li>
              <li>Verified shops quote</li>
              <li>We check the price</li>
              <li>You pay the fair price</li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-6 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MiddleMarket.</p>
          <p>Addis Ababa, Ethiopia</p>
        </div>
      </footer>
    </div>
  );
}
