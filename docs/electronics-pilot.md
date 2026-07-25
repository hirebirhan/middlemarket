# MiddleMarket — Electronics Pilot (Addis Ababa)

**What MiddleMarket is:** a human-mediated request-for-quote marketplace. A buyer posts what they
need, sellers compete with offers, and a human reviews every price before the buyer sees it. The
wedge is not selection or lowest price — it's **"you won't get ripped off; a neutral party checks
the price before you commit."**

**What this pilot validates** (the two things code can't prove):
1. Will buyers route through a mediator at all?
2. Will sellers accept a mediated (lower) price for what they get back — demand, a Verified badge,
   fast payment?

Run it on the app as-is. No new code. Category: **Electronics.** Market: **Addis Ababa.**

Electronics is a strong wedge here: exact SKUs (an iPhone 15 128GB is the same everywhere) make the
fair-price benchmark sharp, and rip-off pain is high. The twist: in Addis the fraud is as much
**authenticity** (fakes, refurb sold as new, grey imports) as price — so the rubric checks *what it
is* before *what it costs*.

---

## Part 1 — Price-review rubric

The operational core, and your dataset schema. **Every offer passes 3 gates, in order.** Fail an
early gate and don't bother with the next.

| Gate | Check | Action if it fails |
|---|---|---|
| **1. Spec** | Exact model + storage + variant + condition (new / open-box / refurb / used) named? | Send back — never benchmark a vague "laptop" |
| **2. Authenticity** | Genuine vs clone · sealed vs refurb-as-new · warranty (official / shop / none) | Unverifiable → cap or reject. *This is the real Addis fraud.* |
| **3. Price** | Compare to benchmark for that exact SKU + condition | Over band → set `adminPrice` to top-of-band + note · Absurd → reject · *Below* band → recheck Gate 2 (too cheap = fake/stolen) |

**Benchmark (until you have data):** 2–3 reference points per SKU — official/reseller price + what
other pilot shops quote. Log every one. After ~50 offers per SKU you have your *own* band and stop
guessing.

**Record per offer** (this *is* the pricing oracle, seeded):
`SKU · condition · asked · adminPrice · band · reason · accepted?`

The app captures all of this as structured data — no spreadsheet needed:

| Rubric input | Where it's entered | Stored as |
|---|---|---|
| Exact model (Gate 1) | Buyer request form, "Exact model" | `Request.sku` |
| Condition (Gate 2) | Seller offer form, "Condition" | `Offer.condition` |
| Fair-price band (Gate 3) | Admin review form, "Fair-price band" | `Offer.bandLow` / `bandHigh` |
| Adjusted price + reason | Admin review form | `Offer.adminPrice` / `adminNote` |
| Outcome | Buyer accepts or not | `Offer.status` |

Every reviewed offer therefore lands as a queryable row: what the item was, what was asked, what
band it was judged against, what you set it to, and whether the buyer took it. That's the dataset
the pricing oracle is built from — start filling it from offer #1.

---

## Part 2 — Supplier recruiting script

Built to attract the *honest, fairly-priced* shops — the gougers won't join, which is the point.
Lead with demand and the badge; the fee comes last.

**Opening (WhatsApp or in person):**

> Hi [name] — I run MiddleMarket. We send you buyers who are ready to buy phones/laptops *today*.
> They post exactly what they want, we pass it to a few trusted shops like yours, you quote your
> price. No listing fee — you pay a small fee only when you close a sale. And genuine, fairly-priced
> shops get a **Verified** badge that buyers look for. Can I add you to the first group in Addis?

**The three objections you'll hit, and the answers:**

- **"Why would I let you control my price?"** → *"We don't — you quote your own price. We just
  filter out the shops that overcharge and the fakes, so buyers trust the quotes they see. Price
  fairly and you win the customers the cheaters used to steal with fake-low prices."*
- **"What does it cost me?"** → *"Nothing to join, nothing to quote. A small fee only when you
  actually sell. No sale, no cost."*
- **"How do I know the buyers are real?"** → *"You see the request — real person, real budget —
  before you quote. Start with 5 and judge for yourself."*

**The ask (keep it small):**

> Join the pilot — 20 shops in [district]. I'll send you the first buyer request this week.
> Reply **YES** and your shop name.

**The Verified badge is your real lever.** In a market full of fakes, honest shops are *desperate*
for a way to prove they're genuine. That flips them from "you'll squeeze my price" to "yes." Ties
straight back to Gate 2.

---

## Part 3 — Test scorecard

Set these numbers **before** you start, so the result can't be argued with afterward.

| # | Metric | Proves | ✅ Continue | ❌ Kill |
|---|---|---|---|---|
| 1 | **Buyers who accept a mediated offer** | Buyers trust the loop | ≥ 50% | < 25% |
| 2 | **Sellers who accept a price cut** | Supply survives squeezing | ≥ 60% | < 30% (mostly walk = no supply) |
| 3 | **Avg. $ saved vs. what buyer would've paid** | The value is real | ≥ 10% | ~0% (no savings = no reason to exist) |

**Sample before you judge:** ~20 real requests · ~15–30 shops · 2–3 weeks. Smaller and you're
reading noise.

**Also watch (soft signals):** did requests get **≥2 offers** each (liquidity)? Would buyers **use
it again** (retention)? Strong on the three but no repeat intent = a demo, not a business.

**How to read it:**
- All three green → build for real.
- Metric 2 red → your monetization/badge isn't worth the margin to sellers; fix the offer before code.
- Metric 1 red → buyers don't trust a mediator *for electronics*; wrong wedge, revisit category.
- Metric 3 red → prices weren't opaque enough to mediate; pick a category with more spread.

---

## Part 4 — Getting buyers (the demand side)

The supply script is only half the cold start. This is the other half: ~20 real buyer requests, by
hand, no code. Ethiopia runs on **Telegram** — that's where demand already lives.

**The buyer pitch (copy-paste):**

> Buying a phone or laptop? Tell me the exact model. I'll get you 2–3 quotes from *verified* shops
> and make sure you're not overpaying or sold a fake — free. Reply with what you want and your budget.

**Seed sources, ranked:**
1. **Your own network first** — the first 5 requests from friends / family / coworkers about to buy.
   Warm, and forgiving of rough edges.
2. **Telegram groups** — Addis buy/sell, university, and neighborhood channels. Intercept the "how
   much is [model]?" questions that already happen daily. Post the pitch; DM everyone who's shopping.
3. **Diaspora** — relatives abroad buying electronics for family in Addis. Highest rip-off fear,
   highest willingness to trust a mediator. Strong wedge.

**You are the interface.** The buyer never touches the app at first — they DM you the model, *you*
post it, run the rubric, hand back the mediated offer. Zero friction for them.

**One targeting rule:** cluster requests on a few popular SKUs (iPhone, Samsung A-series, common
laptops) and recruit shops that carry them — so every request draws **≥2 offers** (liquidity) and
SKUs repeat (your price bands build faster).
