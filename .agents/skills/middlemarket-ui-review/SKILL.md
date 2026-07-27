---
name: middlemarket-ui-review
description: "Enterprise-grade UI/UX review and implementation discipline for MiddleMarket. Use when changing, redesigning, or reviewing any MiddleMarket user interface: landing page, buyer/seller/admin dashboards, navigation, auth shell, footer, product/service taxonomy, forms, request/offer/order cards, responsive layouts, visual hierarchy, production-readiness audits, or when the user challenges whether a screen is production-grade. Enforces docs/production-ui-audit.md, role-aware IA, first-viewport hierarchy, attention economy, evidence-backed trust, no duplicate signals, no card-inside-card layouts, no cheap fouls, and browser verification at desktop and mobile widths."
---

# MiddleMarket UI Review

Operate as a product designer, UX/HCI reviewer, frontend engineer, and launch
quality owner for MiddleMarket. Do not treat UI as styling. Treat UI as a
marketplace operating system where every visible element must help a buyer,
seller, admin, or public visitor make the next correct decision.

## Required Context

Before giving UI feedback or editing UI, read:

- `AGENTS.md`
- `docs/production-ui-audit.md`
- The route, layout, and component files for the workflow being changed
- Data/auth helpers when the UI depends on session, role, status, counts, or
  backend-supported trust claims

If code and the audit disagree, update the audit with the new product decision
or explicitly explain why the requested change should not proceed.

## Enterprise Review Contract

Start every UI task by stating the contract, even briefly:

- Primary user: public visitor, buyer, seller, admin, or signed-in shell user.
- Page job: the single dominant task this screen exists to support.
- First-viewport action: what should be understood or done before scrolling.
- Supporting facts: the minimum facts needed to make that action safe.
- Non-goals: what this page must not try to do.

If the page has two unrelated jobs, split the route, move the secondary job
behind a deliberate link, or demote it below the decision surface. Do not make a
mixed dashboard just because related records are easy to query.

## MiddleMarket Product Decisions

- Public navigation may treat Products and Services as first-class request-type
  entry pages because `RequestType` exists. Category-led browsing, category
  filters, and category claims must wait for admin-managed taxonomy.
- Buyer request creation must be hybrid: selectable type/category plus open text
  for the exact need. Never make it rigid catalog-only or unstructured text-only.
- Public Products/Services hero sections should route by type with a single
  primary CTA. Do not place exact-need input fields in those heroes unless the
  route itself is the focused request creation surface.
- Admin must own product/service categories before public category navigation is
  production: create, edit, archive, order, feature/unfeature, and later define
  category-specific fields.
- `/seller` is a quote-opportunity queue. Offer history, performance, and won
  work belong on explicit routes such as `/seller/offers`.
- Seller queue desktop layout uses compact request tiles: 2-up at normal desktop
  widths, 3-up only on very wide screens, stacked on mobile.
- Admin pages are operational queues. Prefer dense, oldest/urgent-first,
  scan-friendly interfaces over marketing-style composition.
- Auth state must be coherent everywhere. Signed-in users must not see
  Login/Register acquisition links, and `/login` or `/register` must redirect to
  the correct role workspace.
- Trust claims must be backed by stored backend state. Admin price review is
  real; ratings, verification, savings, response rates, payments, and reviews
  are not real unless the data model supports them.

## Non-Negotiable Gates

Reject, redesign, or fix the UI when any gate fails:

- Intention: one page, one dominant job, one obvious next action.
- First viewport: useful records/actions appear early; greetings, redundant
  headers, generic helper copy, decorative stats, and noisy examples do not
  delay the main job.
- Attention budget: every visible item earns its place. Duplicate counts,
  repeated budgets, repeated statuses, repeated auth links, and vague badges are
  defects.
- Route boundary: scrolling must not reveal a different product job.
- Information density: desktop screens should use the available width for
  scanning and comparison, not one oversized record per row unless the decision
  genuinely requires row-level comparison.
- Record composition: cards are for records, tools, dialogs, or repeated items.
  Do not put decorative cards/panels inside record cards.
- Actions: inline actions stay compact; longer forms use dialogs, sheets,
  drawers, or dedicated routes without destroying list scanability.
- Auth and role coherence: header, footer, redirects, empty states, and calls to
  action must match the current user role and session.
- Data truth: do not invent metrics, activity, savings, popularity, trust badges,
  rankings, payment states, or operational promises.
- Accessibility: semantic landmarks/headings, labelled controls, visible focus,
  keyboard access, useful errors, and no icon-only action without an accessible
  name.
- Responsive quality: no horizontal document overflow, clipped text, hidden
  filters, overlapping content, accidental two-line nav controls, or broken
  touch targets around 320-390px.
- State completeness: loading, empty, error, success, disabled, rejected, and
  already-acted states must match the page job.

## Screen Standards

### Landing Page

- Optimize for a short-attention public visitor.
- The first viewport must communicate the product offer and route the visitor
  toward buyer or seller intent without visual noise.
- Do not use fake popularity, fake metrics, fake savings, or "popular now"
  content unless real data supports it and it changes the decision.
- Products/Services pages may route visitors by request type. Do not present
  them as category directories until category IA exists.
- Products/Services hero actions should be CTA-first, not search/form-first;
  the exact brief is captured in `/buyer/new` after intent is preserved.

### Buyer Screens

- Buyer dashboard should help buyers post a request, compare reviewed offers,
  and track accepted orders.
- Request creation belongs on a focused route when the form has multiple
  decisions.
- Offer comparison must show only facts available in the backend: seller,
  condition/message, reviewed price, admin note, and order state.

### Seller Screens

- `/seller` answers: "Which requests should I quote now?"
- The first viewport should show request count/search/filter plus multiple
  actionable requests.
- Use compact request tiles with clamped copy and bottom-aligned actions.
- Do not show offer history or performance summaries below the quote queue.
- "Make an offer" is a compact trigger; the actual offer form should be
  progressive and not explode every card.

### Admin Screens

- Admin is an operations console, not a marketing dashboard.
- Prioritize oldest pending work, exceptions, and consequence-bearing actions.
- Review forms must make the decision criteria explicit as backend fields grow.
- Category management is required before taxonomy-driven product/service public
  UX is production.

### Global Shell and Auth

- Keep the public header in a dedicated component, with signed-out and signed-in
  states deliberately composed rather than repeated in the root layout.
- Header controls must not wrap or clip at common desktop/mobile widths.
- Signed-in global navigation must point to the user's role workspace.
- Footer links must reflect signed-in state and current role.
- `/login` and `/register` must redirect signed-in users to role home.
- Auth pages should not compete with their form's primary action.

## Review Workflow

When reviewing without editing:

- Lead with findings, ordered by severity.
- Anchor each finding in a file/line or rendered behavior.
- For each finding, state the user harm, not only the visual issue.
- Separate product problems from implementation problems.
- If the design is below production bar, say so directly and name the top
  changes required to reach 8/10 or 9/10.

When implementing:

1. Inspect the existing workflow, data model, and components.
2. State the enterprise review contract.
3. Remove or demote noise before adding new UI.
4. Preserve backend truth; add UI only for supported product behavior.
5. Reuse existing wrappers and semantic tokens.
6. Keep `src/components/ui/` stock shadcn/base-ui only.
7. Add abstractions only for repeated marketplace patterns.
8. Verify desktop and mobile rendered output before calling the work done.
9. Update `docs/production-ui-audit.md` when a new durable product rule emerges.

## Implementation Rules

- Prefer Server Components for data-heavy pages and URL state for filters,
  search, and pagination.
- Keep custom behavior in `src/components/`, never inside `src/components/ui/`.
- Use semantic tokens from `src/app/globals.css`; avoid one-off raw colors.
- Use lucide icons in controls when an icon helps recognition; add labels or
  accessible names.
- Keep forms mobile-first with visible labels and preserved intent.
- Keep lists bounded with pagination or a clear growth strategy.
- Do not add dependencies or new design systems without a product reason.
- Do not hide product weaknesses with decoration.

## Verification Matrix

For visual changes, inspect real rendered pages:

- Desktop around 1366px wide.
- Very wide desktop around 1536-1600px when grid density changes.
- Mobile around 390px and, for risky layouts, around 320px.
- Signed-out and signed-in states when nav/footer/auth are touched.
- Empty/loading/error/success states when list or mutation UI changes.
- Keyboard/focus path when forms, dialogs, tabs, menus, or destructive actions
  are touched.

Check and report:

- No horizontal overflow.
- No clipped or overlapping text.
- No unintended two-line nav buttons.
- No hidden filters/tabs.
- No duplicate counts/statuses/budgets/auth links.
- First useful action or record is visible early.
- The page still has one dominant job after scrolling.

## Production Score Bar

Use this scoring bar when the user asks whether a UI is production-grade:

- 0-4: visually or structurally untrustworthy; basic hierarchy or auth/route
  coherence is broken.
- 5-6: understandable but noisy; component quality exists, product intention is
  weak.
- 7: usable MVP; still has attention, density, or state gaps.
- 8: production acceptable; clear job, coherent shell, responsive, truthful,
  no cheap fouls.
- 9: strong product UI; fast to understand, dense where appropriate, calm,
  role-aware, and backed by verified states.
- 10: launch-quality exemplar; every visible element supports the decision and
  the system scales cleanly across roles, states, and devices.

Do not call UI production-grade unless it reaches at least 8 by this bar and
has been verified in-browser.

## Stop Conditions

Pause or challenge the direction when:

- The requested UI depends on backend data that does not exist.
- The route is being asked to carry multiple unrelated jobs.
- The design would introduce fake trust, fake metrics, or unsupported workflow
  promises.
- The user asks for "production-grade" but verification is not possible; explain
  the remaining risk clearly.

## Final Response Requirements

For implemented UI changes, summarize:

- The product decision made.
- The files changed.
- The responsive/auth states verified.
- Any remaining risk or follow-up that blocks a true 9/10.
