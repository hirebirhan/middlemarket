import Link from "next/link";
import { ArrowRight, Scale, ShieldCheck, Eye, TrendingDown, CheckCircle2, Sparkles } from "lucide-react";

const STEPS = [
  { n: "01", title: "Post a request", body: "Describe what you need — product or service, with details and an optional budget.", icon: Eye },
  { n: "02", title: "Sellers compete", body: "Verified sellers submit their best price with a pitch: timeline, quality, what's included.", icon: TrendingDown },
  { n: "03", title: "We mediate", body: "Every offer is reviewed. Overpriced ones get adjusted or rejected before you see them.", icon: Scale },
  { n: "04", title: "Accept & track", body: "Accept the offer you like. We track the order from pending to delivered.", icon: CheckCircle2 },
];

export default function Home() {
  return (
    <div>
      {/* ─── Hero — split layout ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-dots" aria-hidden="true" />
        <div className="relative grid lg:grid-cols-2 gap-12 items-center py-section">
          {/* Left: copy */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3" aria-hidden="true" />
              Every price reviewed by a human
            </div>
            <h1 className="text-display font-semibold">
              Get what you need at a fair, mediated price
            </h1>
            <p className="max-w-prose text-lead text-muted-foreground">
              Post a request, sellers compete, and our team reviews every offer
              before it reaches you. No haggling, no overpaying.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/register?role=BUYER"
                className="group inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-opacity hover:opacity-90"
              >
                I want to buy
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/register?role=SELLER"
                className="inline-flex h-11 items-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent"
              >
                I want to sell
              </Link>
            </div>
            <div className="flex items-center gap-6 pt-4">
              {[
                ["100%", "price-reviewed"],
                ["2 min", "to post"],
                ["$0", "buyer fees"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold tracking-tight">{v}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: visual mockup */}
          <div className="relative hidden lg:block">
            <div className="rounded-card border border-border bg-card shadow-lg overflow-hidden">
              {/* Mock browser bar */}
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3 bg-secondary/30">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                <div className="ml-3 flex-1 h-5 rounded bg-secondary/50" />
              </div>
              {/* Mock content */}
              <div className="p-5 space-y-4">
                {/* Mock request */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-3 w-32 rounded bg-secondary" />
                    <div className="h-5 w-16 rounded-full bg-secondary" />
                  </div>
                  <div className="h-2 w-full rounded bg-secondary/60 mb-1.5" />
                  <div className="h-2 w-3/4 rounded bg-secondary/60" />
                </div>
                {/* Mock offer */}
                <div className="rounded-lg border border-border bg-accent/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-secondary" />
                      <div className="h-2.5 w-20 rounded bg-secondary" />
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">$420</p>
                      <p className="text-xs text-muted-foreground line-through">$580</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 rounded-full bg-emerald-500/15" />
                    <div className="h-2 w-24 rounded bg-secondary/60" />
                  </div>
                </div>
                {/* Mock second offer */}
                <div className="rounded-lg border border-border p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-secondary" />
                      <div className="h-2.5 w-24 rounded bg-secondary" />
                    </div>
                    <div className="h-5 w-12 rounded bg-secondary" />
                  </div>
                </div>
              </div>
            </div>
            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 rounded-lg border border-border bg-card shadow-lg px-3 py-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-medium">Price verified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Bento features — asymmetric grid ─── */}
      <section className="border-t border-border py-20">
        <div className="max-w-2xl mb-10">
          <h2 className="text-title font-semibold mb-3">
            A human in the loop, not an algorithm
          </h2>
          <p className="text-muted-foreground text-lg">
            Most marketplaces optimize for volume. We optimize for fair deals.
          </p>
        </div>
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Large feature */}
          <div className="lg:col-span-2 lg:row-span-2 rounded-card border border-border bg-accent/30 p-8 flex flex-col justify-between min-h-[280px]">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary mb-4">
                <Scale className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="text-heading font-semibold mb-2">Every price reviewed</h3>
              <p className="text-muted-foreground leading-relaxed max-w-md">
                Our team checks every offer against market rates before it reaches you.
                Overpriced? Adjusted. Unreasonable? Rejected. What you see is competitive —
                guaranteed.
              </p>
            </div>
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-border">
              <div>
                <p className="text-title font-semibold">100%</p>
                <p className="text-xs text-muted-foreground">offers reviewed</p>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <p className="text-title font-semibold">0</p>
                <p className="text-xs text-muted-foreground">hidden fees</p>
              </div>
            </div>
          </div>

          {/* Small features */}
          <div className="rounded-card border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary mb-3">
              <TrendingDown className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Sellers compete</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Multiple sellers see your request and submit their best price.
            </p>
          </div>

          <div className="rounded-card border border-border bg-card p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary mb-3">
              <Eye className="h-5 w-5 text-foreground" />
            </div>
            <h3 className="font-semibold mb-1">Full transparency</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              See original price, adjusted price, and the reasoning behind it.
            </p>
          </div>

          <div className="rounded-card border border-border bg-card p-6 lg:col-span-2">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary shrink-0">
                <CheckCircle2 className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Tracked end-to-end</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  From request to delivery, track every step with clear status updates.
                  No black boxes, no guessing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works — horizontal timeline ─── */}
      <section className="border-t border-border py-20">
        <div className="text-center mb-12">
          <h2 className="text-title font-semibold mb-3">How it works</h2>
          <p className="text-muted-foreground text-lg">Four steps from request to delivery.</p>
        </div>
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-8 left-0 right-0 h-px bg-border hidden lg:block" />
          <div className="grid lg:grid-cols-4 gap-8">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-card">
                    <s.icon className="h-6 w-6 text-foreground" />
                  </div>
                  <span className="text-4xl font-bold text-border tabular-nums">{s.n}</span>
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA — full-width banner ─── */}
      <section className="border-t border-border">
        {/* Every colour here is derived from --primary rather than hardcoded
            white: --primary is near-black in light mode and near-white in dark,
            so literal white text on it disappeared entirely in dark mode. */}
        <div className="my-12 overflow-hidden rounded-card bg-primary px-8 py-16 text-center">
          <div>
            <h2 className="text-title font-semibold text-primary-foreground mb-4">
              Ready to experience fair pricing?
            </h2>
            <p className="text-primary-foreground/80 max-w-prose mx-auto mb-8">
              Join MiddleMarket today — free for buyers, and sellers only pay when they win.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/register?role=BUYER"
                className="group inline-flex h-11 items-center gap-2 rounded-md bg-primary-foreground px-6 text-sm font-medium text-primary shadow-sm transition-opacity hover:opacity-90"
              >
                Start buying
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
              <Link
                href="/register?role=SELLER"
                className="inline-flex h-11 items-center rounded-md border border-primary-foreground/40 px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                Start selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer — multi-column ─── */}
      <footer className="border-t border-border pt-12 pb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Scale className="h-4 w-4 text-primary-foreground" strokeWidth={2.2} />
              </div>
              <span className="font-bold">MiddleMarket</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting what people want with who can offer it, at a rational price.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">For buyers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register?role=BUYER" className="hover:text-foreground transition-colors">Sign up</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Log in</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">For sellers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/register?role=SELLER" className="hover:text-foreground transition-colors">Sign up</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Log in</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">How it works</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Post a request</li>
              <li>Sellers compete</li>
              <li>We mediate the price</li>
              <li>Accept and track</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MiddleMarket. All rights reserved.</p>
          <p>Built for fair deals.</p>
        </div>
      </footer>
    </div>
  );
}
