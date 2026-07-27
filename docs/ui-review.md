# UI review — round one

What was found, what was changed, what was measured, and what is still wrong.

Round one was **correctness, scale, accessibility and states**. It did not
re-architect the dashboard information architecture, and that is where the
remaining problems are (see [Open design problems](#open-design-problems)).

---

## A. Audit — what was wrong

| Area | Problem | User impact | Severity | Status |
| --- | --- | --- | --- | --- |
| Money, everywhere | `formatMoney` used `currency: "USD"` on Birr data. A 62,000-birr phone rendered "$62,000.00" | Every price in the product was wrong by ~50×, next to landing copy saying ETB | **Critical** | Fixed |
| Tooling | `npm run lint` exited on `no such directory: lint`. Next 16 dropped `next lint`; ESLint 9 ignores `.eslintrc.json` | The lint gate had been dead — it looked like a path typo, not a broken gate | **Critical** | Fixed |
| API | Malformed JSON, empty login body, and 15-digit budgets all threw unhandled → 500 | Bad requests reported to the user as "something went wrong at our end" | **Critical** | Fixed |
| API | Negative budgets and whitespace-only titles saved successfully | Corrupt rows rendered into every list | High | Fixed |
| All dashboards | No pagination, search or filters. Every query unbounded | The seller page rendered *every* open request, each with an embedded form | High | Fixed |
| Admin | Decision history hard-capped at `take: 25` with no way past it | Not an audit trail — a recent-items list | High | Fixed |
| `/login`, `/register` | No `<h1>` on the page at all | No top-level heading for screen readers or search results | High | Fixed |
| Landing | Two section headings were styled `<p>` elements | Heading navigation jumped hero → CTA, skipping both explanatory sections | High | Fixed |
| Landing | Hero search input carried `focus:outline-none` | The page's primary control had no visible focus indicator | High | Fixed |
| `/admin` | CLS 0.213 — loading skeleton far shorter than the real page | Footer visibly jumped on every load | High | Fixed |
| Whole app | No `overflow-wrap`; user text is arbitrary | A long unbroken token pushed cards open | High | Fixed |
| App shell | No favicon, no per-route metadata, no OG tags, no `global-error` | Unbranded tab, blank link unfurls, unstyled crash screen | High | Fixed |
| Theme | `defaultTheme="dark"` alongside `enableSystem` — the explicit default wins | Light-mode users got a dark app on first paint | Medium | Fixed |
| Theme | No `color-scheme` | Dark pages opened white native `<select>` popups | Medium | Fixed |
| Mutations | `setLoading(false)` ran when `router.refresh()` was *called*, not when it resolved | Buttons stopped spinning while the list was still stale | Medium | Fixed |
| Accept offer | Inline confirm replaced the focused button | Keyboard focus fell to `<body>` | Medium | Fixed |
| Header | No current-page indication | Three roles, three dashboards, no "where am I" | Medium | Fixed |
| Footer | Stacked nav links 17px tall | Below the WCAG 2.2 target-size minimum | Low | Fixed |
| Landing | `role="search"` on a form that submits to `/register` | Announced as site search; there are no results | Low | Fixed |
| Seeds | `npm run seed:demo` failed — `tsx` was never a dependency | Documented command did not run | Low | Fixed |
| README | Claimed Next 14 / React 18 | Actually Next 16 / React 19 | Low | Fixed |

---

## B. Design system

Tokens live in `src/app/globals.css` and were largely sound already. Changes made:

- **Currency** — `src/lib/money.ts` is the single source. `ETB`, `en-US` locale,
  fraction digits only when the amount has them, U+00A0 between code and number
  so "ETB" never strands at a line end. `formatMoneyCompact` for sidebar tiles.
- **`color-scheme`** — declared per theme (`light` on `:root`, `dark` on `.dark`)
  rather than as `light dark`, so the app's own toggle beats the OS setting for
  native chrome.
- **`overflow-wrap: break-word`** on `body`. Inherited, so one declaration covers
  every string a stranger typed.
- **New primitives** — `MoneyInput` (currency shown inside the control),
  `Pagination`, `FilterTabs` (links, not state — no JS, survives reload),
  `SearchField` (the only new client component), `DashboardLink`.
- **`CardTitle` gained `as`** — defaults to `<div>`; auth screens pass `h1`.

Unchanged and still good: the warm neutral scale, green reserved for *fair price*
only, the four-step elevation, one `:focus-visible` outline system, the type
scale, `--radius-*`, `--ease-soft`.

---

## C. Interface states added

Every list now distinguishes **"nothing yet"** from **"nothing matches"** — they
need different words and different actions. A search that found nothing used to
say "check back shortly", which reads as a broken feature when you simply
mistyped a model number.

Also added: pending state held through the post-mutation refresh; focus moved to
and restored from the accept confirmation; `aria-live` on result counts;
route skeletons that match their page's real section structure.

---

## D. Technical validation (measured, not asserted)

| Check | Result |
| --- | --- |
| TypeScript | clean |
| ESLint | clean |
| Vitest | 48 passing across 4 files |
| Production build | succeeds |
| Responsive + a11y sweep | 72 route×viewport combinations clean at 320/360/390/768/1280/1680 |
| Horizontal overflow | none at any width |
| Duplicate IDs / heading jumps / unlabelled inputs / unnamed controls | none |
| Focus rings | present on every tab stop across `/`, `/login`, `/buyer`, `/seller`, `/admin` |
| Contrast | WCAG AA in both light and dark |
| CLS | 0 on every page (was 0.213 on `/admin`) |
| TTFB / LCP | 8–54ms / 128–472ms locally |
| Console errors | none |
| End-to-end golden path | passes, including the mediation gate |

Verification used a temporary Playwright install; it is **not** a dependency.
Test fixtures were removed and the demo dataset reseeded afterwards.

---

## Open design problems

These are real and were **not** addressed in round one. They are the difference
between "correct" and "good".

### 1. The buyer's primary action is in a 288px rail

Posting a request is the entire point of the buyer dashboard, and its form sits
in the sidebar under the stat tiles — a five-field form, including a textarea, in
a 288px column. Primary actions belong in the page header; a form this size
belongs in a dialog or its own route, not a rail.

### 2. Both dashboards are a feed of tall cards

A buyer request card carries title, SKU, description, badges, then a nested list
of offers with full pitch text, review notes and an order tracker — 300–500px
each. A seller's open-request card embeds an entire offer form. Pagination made
the wall shorter; it did not make it dense. The right shape is a compact row per
record with detail on demand (drawer, expandable row, or master–detail at
desktop width).

### 3. Consequential actions fire on a single interaction

- **Order status** is a `<select>` whose `onChange` POSTs immediately — including
  `CANCELLED`, which is terminal. No confirmation, no undo.
- **Decline** in the review queue is immediate and effectively irreversible for
  that offer.
- Only *accept offer* has a confirmation step.

A select is also the wrong control for an action: it does not read as "this will
do something". Both of these need explicit confirmation, and the terminal
transitions need stronger friction than the reversible ones.

### 4. Surfaces are too close in value

Page background sits at 98% lightness, cards at 100% — a 2% difference. Cards
therefore rely almost entirely on a hairline border to separate from the page,
which is why the interface reads flat and washed out rather than calm. Dark mode
has the same problem (8% vs 12%). This needs a real surface hierarchy, not more
shadow.

### 5. Smaller, still open

- Landing page is `ƒ` (dynamic) because the root layout reads cookies for the
  header. PPR would let the marketing shell be static — deliberately not enabled,
  as it is experimental.
- Email is case-sensitive at login. Normalising needs a data migration.
- No component or end-to-end tests in the repo; unit coverage only.
- `docs/electronics-pilot.md` describes a 3-gate review rubric; the admin form
  captures the band but does not structure gates 1 and 2.
