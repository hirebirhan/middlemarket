# Production UI/UX Audit and Revamp Plan

This document records the first production-grade UI audit for MiddleMarket. It
is intentionally grounded in the current implementation, not in the full product
vision. The app currently supports a mediated request-for-quote workflow:
buyer request -> seller offer -> admin price review -> buyer acceptance -> order
status tracking.

This is not a decoration checklist. Production UI for MiddleMarket means the
screen makes the marketplace job obvious, protects the user's attention, and
does not make unsupported product claims.

## Scope of This Pass

Smallest shippable scope:

- Preserve the working buyer/seller/admin marketplace loop.
- Make the shared UI foundation safer for future shadcn registry updates.
- Give buyer request creation a focused route instead of hiding it in a
  dashboard rail.
- Make reviewed offers easier to compare with a dedicated offer card.
- Keep the seller dashboard as a quote-opportunity queue, with offer history on
  a separate route.
- Document the target audience, information architecture, design system, known
  gaps, and prioritized revamp plan.
- Avoid fake trust badges, fake reviews, fake payments, or mock-only features.

Deferred:

- New payment, messaging, review, dispute, upload, provider verification, and
  service milestone workflows. These need backend models before production UI
  can honestly represent them.
- Product/service taxonomy management. The UI can prepare for categories, but
  admin-managed category data must exist before category-driven browsing,
  filtering, or matching becomes production behavior.

## Lessons From Critical Review

The strongest lesson from review is that a UI can have decent components and
still fail the product. MiddleMarket pages must be judged by intention,
attention, and route boundaries before visual polish.

- One page, one dominant job. `/seller` is a quote queue; it should not become
  quote queue plus performance dashboard plus offer history because those
  records are available.
- The first viewport is sacred. Greetings, page labels, summary stats, repeated
  section headers, search, filters, and then finally the list is not hierarchy;
  it is delay.
- Every visible element must earn its place. Duplicate counts, repeated budgets,
  repeated statuses, generic helper text, and "popular now" style content are
  defects unless they change a decision.
- Scrolling is information architecture. If scrolling reveals a different job,
  such as offer history below seller opportunities, the route is carrying too
  much.
- "Cheap fouls" are production defects: two-line nav buttons, clipped badges,
  horizontal overflow, cards inside cards, repeated data, misaligned icon/text
  pairs, and empty spacing caused by unexamined layout.
- Auth state must be coherent everywhere. A signed-in user should not see
  Login/Register acquisition links in the global shell, and auth routes should
  redirect them to the correct role workspace instead of showing another form.
- The design must be inspected as a visitor or operator with a short attention
  span, not as the engineer who knows why every element was added.

## Product Taxonomy Decision

Products and services should be structured, but the actual buyer need should
remain open-ended.

Recommended request model:

- Type: selectable `Product` or `Service`.
- Category: admin-managed selectable category such as Phones, Laptops,
  Furniture, Cleaning, Repair, Delivery, or Installation.
- Specific request: open text such as "Samsung Galaxy A54 256GB" or "AC repair
  for a small office".
- Details: open description today; later, category-specific fields when the
  backend supports them.

Reasoning:

- Open text only creates messy search, weak seller matching, and no admin
  control.
- Fully fixed catalog selection blocks real marketplace requests that have not
  been modeled yet.
- The hybrid model gives enough structure for navigation, filtering, analytics,
  and seller relevance without forcing buyers into a brittle catalog.
- Public Products/Services heroes should set the request type and route the
  visitor to the focused request flow. They should not add an open-text hero
  form unless the page is explicitly the request-creation surface.

Navigation implication:

- Public navigation can include Products and Services as type-level request
  entry pages because `RequestType.PRODUCT` and `RequestType.SERVICE` exist.
- Category-led browsing, category filters, and category claims should wait for
  admin-managed category data.
- Signed-in dashboards should stay role/task focused: seller queue/offers,
  buyer requests/new request, admin review/orders/categories.

Admin implication:

- Admin needs a category management page before category-driven public nav is
  production: create, edit, archive, order, feature/unfeature, and eventually
  define category-specific fields.

## Existing Strengths

- The end-to-end transactional loop is real: buyers create requests, sellers
  submit offers, admins review prices, buyers accept approved offers, and orders
  are tracked through allowed transitions.
- The app uses Next.js App Router with mostly Server Components for data-heavy
  dashboard pages.
- Mutation routes validate input through `src/lib/api.ts` and protect actions
  through `requireUser`.
- Growing dashboard lists are paginated and preserve filter/search state in the
  URL through `src/lib/list-params.ts`.
- The admin review and buyer accept routes use conditional writes or
  transactions to avoid obvious race conditions.
- Empty states, loading skeletons, route metadata, and role redirects are
  already present on the main dashboard surfaces.
- Money formatting is centralized in `src/lib/money.ts` and uses ETB.
- The current UI has wrapper components outside `src/components/ui` for custom
  behavior such as `LoadingButton`, `MoneyInput`, `LabeledField`, `Identity`,
  `ListPagination`, and `SkeletonText`.
- Buyer request creation now has a dedicated `/buyer/new` route that carries
  landing-page intent through signup and explains the marketplace sequence
  before commitment.
- Seller opportunities and seller offer history are now separate concepts:
  `/seller` should remain the action queue and `/seller/offers` should carry the
  review/won/declined history.

## Major UX Problems

| Area | Evidence | Impact | Priority |
| --- | --- | --- | --- |
| Request creation is cramped | Previously, `NewRequestForm` lived in the buyer sidebar, including a textarea and several fields. | Fixed in this pass by routing the primary request flow to `/buyer/new`; keep the dashboard as monitoring and decision space. | Done |
| Seller page mixed jobs | The seller surface previously combined greeting, stats, open requests, offer performance, and offer history. | Keep `/seller` as the quote queue. Put offer history on `/seller/offers`; do not reveal a second job by scrolling. | Done |
| Services are underspecified | `RequestType.SERVICE` exists, but service requests use the same form and order lifecycle as products. | Users can post services, but the UI cannot capture timing, location, scope, provider type, or completion expectations. | High |
| Product/service taxonomy is missing | Requests currently capture type and open text, but not an admin-managed category. | Public Products/Services pages can route by type, but category browsing, matching, and filters should wait for admin-managed categories. | High |
| Combined requests are not modeled | Prisma has only `PRODUCT` and `SERVICE`. | The UI must not promise supply-and-install or materials-plus-labor workflows yet. | High |
| Offer comparison has limited decision data | Offer rows show seller name, condition, message, admin note, and reviewed price only. | Buyers cannot compare warranty, timing, ratings, completed jobs, or provider verification because the backend does not store them. | High |
| Trust indicators are limited | No verification, rating, response-rate, or completion-rate model exists. | The UI should emphasize admin price review as the real trust signal instead of inventing badges. | High |
| Status copy is scattered | `StatusBadge`, `OrderProgress`, and page copy each explain parts of the lifecycle. | Future status changes can become inconsistent unless centralized. | Medium |
| Admin metrics are count-heavy | Admin pages run several count/group queries per request. | Fine for the current MVP, but may become expensive at larger row counts without indexes/materialized summaries. | Medium |
| Landing page contains illustrative claims and noise risk | Public page has static metrics such as average savings and turnaround, and can easily accumulate sections that do not change visitor action. | Production UI should calculate claims from real data or remove them. Keep first-viewport attention on the offer and route to Product/Service intent. | High |

## Inconsistent Design Patterns and Technical Debt

- Before this pass, several marketplace/domain components lived in
  `src/components/ui`, including layout containers, record lists, stats, logo,
  typography, empty states, and order progress. That violates the project rule
  that `ui` remains stock shadcn source.
- Some UI modules are still custom registry-style primitives (`toast`,
  `pagination`, `segmented`). These may stay in `ui` only if they remain stock
  registry components.
- The project rules previously said SQLite, but `prisma/schema.prisma` uses
  PostgreSQL.
- `components.json` says `base-maia`; project rules must not claim another
  shadcn style without changing the actual config.
- The current dashboard cards are readable, but dense marketplace comparison
  would benefit from domain components such as `RequestSummary`,
  `OfferComparison`, `PriceReviewSummary`, and `TransactionStatus`.

## Mobile Usability Issues

- Buyer request creation is now a dedicated route; keep it mobile-first as more
  category/type fields are added.
- Dashboard rails work on desktop but become stacked blocks on mobile; primary
  actions should appear before metrics when the user intent is action-first.
- Offer rows are mobile-friendly stacks, but the buyer's offer comparison still
  mixes seller identity, pitch, price, admin note, and order progress in one row.
- Search and filters are server-backed and shareable, which is good; mobile
  filter controls should wrap or fit cleanly. Hidden filters and horizontal
  document overflow are production defects.
- Record-list utilities must be verified at mobile widths; desktop table
  templates must not leak into stacked mobile rows.

## Accessibility Issues and Risks

- Core forms use visible labels through wrapper components, which is a strong
  base.
- Confirmation patterns exist for buyer acceptance and terminal order status
  moves.
- Remaining risks:
  - Some dense dashboard content uses small secondary text; keep body-supporting
    copy at readable sizes.
  - Any future dialog/sheet must include accessible title/description and must
    fit a 320px viewport.
  - Any future icon-only action must keep an accessible name and touch target.
  - Dynamic validation should eventually move focus to the first invalid field.

## Performance and Scalability Risks

- Dashboard lists are paginated; this is appropriate for growth.
- Search uses `contains` filters over text fields. For larger PostgreSQL tables,
  this will need indexes or a proper search strategy.
- Admin overview and dashboards run multiple count queries per request. This is
  acceptable for MVP, but 50,000 registered users will likely require query
  tuning, indexes, and possibly precomputed summary tables.
- No file/image upload pipeline exists; adding one later must include
  compression, limits, storage, and CDN strategy.
- No rate limiting, audit logging, or background notification delivery exists.

## Reusable Components

Keep and continue consolidating around these wrappers:

- `src/components/Container.tsx`
- `src/components/EmptyState.tsx`
- `src/components/FilterTabs.tsx`
- `src/components/Identity.tsx`
- `src/components/LabeledField.tsx`
- `src/components/ListPagination.tsx`
- `src/components/LoadingButton.tsx`
- `src/components/MoneyInput.tsx`
- `src/components/OrderProgress.tsx`
- `src/components/ResponsiveRecordList.tsx`
- `src/components/SectionHeader.tsx`
- `src/components/SkeletonText.tsx`
- `src/components/StatCard.tsx`
- `src/components/StatusBadge.tsx`
- `src/components/Typography.tsx`
- `src/components/BuyerOfferCard.tsx`

Components to keep stock-only:

- Everything under `src/components/ui`.

Components to consolidate next:

- Buyer/seller request cards into `RequestCard` or `RequestSummary`.
- Buyer offer rows into `OfferComparisonCard`.
- Status badge/progress copy into `TransactionStatus`.
- Admin review price fields into `PriceReviewSummary`.

## Pages Requiring Redesign

| Page | Recommended treatment |
| --- | --- |
| `/buyer` | Request creation now links to `/buyer/new`; offer comparison now uses `BuyerOfferCard`. Continue by centralizing status next-step copy. |
| `/seller` | Keep as seller quote queue only. Desktop should use compact request tiles in a 2-up grid, moving to 3-up only on very wide screens; mobile stays stacked. First viewport should show request count, search/filter, and multiple actionable requests. Do not place offer history or performance summaries below it. |
| `/seller/offers` | Dedicated offer history and performance route. It may show in-review/won/revenue metrics because the page job is tracking sent offers. |
| `/admin/queue` | Keep the oldest-first review queue, but make price review criteria more structured as the backend grows. |
| `/admin/categories` | Future route for product/service category management before public Products/Services nav becomes data-backed. |
| `/products` and `/services` | Use as type-level public entry pages that carry request type into signup and `/buyer/new`. Do not present category directories until admin taxonomy exists, and do not put exact-need input fields in the hero. |
| `/` | Remove or qualify static marketing metrics unless they become real aggregates. Route visitors toward buyer/seller intent and the type-level Products/Services pages without adding noisy examples. |

Pages needing minor refinement:

- `/login` and `/register`: already simple and labelled; improve only as
  onboarding requirements grow. Logged-in users should be redirected to their
  role workspace, with buyer request intent preserved when relevant.
- `/admin/orders` and `/admin/decisions`: list/table wrappers are adequate for
  current data volume; add richer status detail later.

## Target Audience and Workflow Analysis

Primary users are likely mobile-first, price-sensitive buyers and small sellers
or providers. They may use mid-range Android phones, have inconsistent network
connections, and care more about clear commitments than polished visuals.

Design implications:

- Use familiar words: request, offer, price, order, declined, completed.
- Keep forms short and contextual.
- Show what the platform actually verifies today: admin-reviewed pricing.
- Avoid provider trust claims that require missing backend fields.
- Preserve user-entered values on failure.
- Make next steps visible beside every status.

## Refined Information Architecture

Current IA:

- Public: `/`, `/products`, `/services`
- Auth: `/login`, `/register`
- Buyer: `/buyer`
- Buyer request creation: `/buyer/new`
- Seller: `/seller`
- Seller offers: `/seller/offers`
- Admin: `/admin`, `/admin/queue`, `/admin/orders`, `/admin/decisions`

Recommended IA for the next implementation phase, using only supported
workflows:

- Buyer
  - Dashboard: summary and urgent decisions.
  - New request: dedicated request creation flow at `/buyer/new`.
  - Requests: posted requests and reviewed offers.
  - Orders: accepted offers with status tracking.
- Seller
  - Queue: open buyer requests that need a quote.
  - Offers: review/approved/won/declined offers at `/seller/offers`.
  - Orders: won offers with fulfillment status.
- Admin
  - Overview: counts and next actions.
  - Review queue: pending offers.
  - Orders: active and closed orders.
  - Decisions: reviewed offer audit trail.
  - Categories: product/service category taxonomy and display order.
- Public
  - Home: concise marketplace offer and buyer/seller routing.
  - Products: type-level product request entry page today; category-led product
    browsing later after taxonomy exists.
  - Services: type-level service request entry page today; category-led service
    browsing later after taxonomy exists.

Do not add Messages, Payments, Reviews, Saved Providers, or Verification pages
until backend support exists.

## Design System Direction

Current foundation:

- Tailwind CSS v4 tokens in `src/app/globals.css`.
- Semantic colors for background, foreground, card, muted, border, primary,
  success, warning, info, destructive, and brand.
- Restrained type scale with display type reserved for heroes/page titles and
  monospace reserved for money.
- Shared radius, elevation, container, and motion tokens.
- Strong global focus-visible style and reduced-motion handling.

Production rules:

- Use stock shadcn primitives from `src/components/ui`.
- Put domain behavior and custom props in wrappers under `src/components`.
- Use semantic tokens; avoid raw color classes and arbitrary styling.
- Keep cards for records, tools, and forms. Do not nest cards inside cards.
- Keep mobile touch targets around 44px where practical.
- Prefer server-rendered lists with URL state over client-only dashboard state.
- Start every UI change by naming the page job, primary user, first-viewport
  action, and supporting facts.
- Do not add secondary metrics/history above or below a queue unless they support
  the same job. Move different jobs to explicit routes.
- Treat every duplicate count, repeated budget, repeated status, clipped badge,
  wrapped button, or unexplained empty gap as a defect.

## Prioritized Revamp Plan

### Phase 1: Foundation

- Keep `src/components/ui` stock-only.
- Move marketplace/layout wrappers to `src/components`.
- Correct project rules and document production UI standards.
- Add `/buyer/new` for focused request creation.
- Add `BuyerOfferCard` for reviewed offer comparison.
- Verify typecheck, lint, and tests.

### Phase 2: Buyer Flow

- Keep `/buyer/new` as the primary request creation route.
- Add Product/Service type and admin-managed category selection while keeping
  the specific request as open text.
- Add a review step before publishing if the backend remains immediate-submit.
- Create an offer comparison component using only stored fields.
- Centralize order status text and next-step guidance.

### Phase 3: Seller Flow

- Keep `/seller` as a single-purpose quote queue.
- Use compact 2/3-up desktop request tiles with clamped copy and bottom-aligned
  actions; avoid full-width cards that waste the queue viewport.
- Keep `/seller/offers` as the offer-history route.
- Keep offer submission progressive and compact.
- Show rejection feedback and resubmission path consistently.
- Add seller category coverage only after admin-managed categories exist.

### Phase 4: Admin Flow

- Turn the review form into a structured checklist as backend fields for gate 1
  and gate 2 become real.
- Add category management for Products and Services: create, edit, archive,
  order, feature/unfeature, and later category-specific fields.
- Add scalable query/index review before larger launch data.

### Phase 5: Production Hardening

- Add route/integration tests for critical marketplace mutations.
- Add basic accessibility and responsive checks, including 320-390px mobile
  overflow checks for record lists, filter tabs, headers, and dialogs.
- Add deployment-backed environment documentation.
- Replace static landing metrics with real aggregates or remove them.

## Acceptance Criteria for Future UI Work

- The page has one dominant job and the route does not switch jobs when the user
  scrolls.
- The first viewport makes the next useful action obvious before secondary
  metrics, history, or explanatory content.
- Works at approximately 320px without horizontal overflow.
- Role-aware navigation remains consistent.
- Footer and auth routes reflect the current session; no signed-in surface shows
  Login/Register as the next action.
- Primary action is clear on every page.
- Forms have visible labels and preserve user work on recoverable failures.
- Trust indicators are factual.
- Transaction statuses are human-readable and explain the next step.
- Large lists remain paginated.
- No new custom behavior is added to `src/components/ui`.
- No duplicated signals: counts, budgets, statuses, and helper text appear only
  where they change a decision.
- No card-inside-card layouts for record actions.
- Header/nav controls do not wrap or clip at common desktop and mobile widths.
- Public type-entry pages use a single primary CTA in the hero. Exact item or
  service wording belongs in the focused request form, not in another hero
  input field.
- Visual changes are inspected in-browser at desktop and mobile widths before
  being called production-ready.
- `npm run check` passes.
