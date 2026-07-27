# Project Rules

These rules are the primary tool-agnostic instruction source for this
repository. Keep tool-specific rule files out of the repo unless the tool is
actually used by the team; avoid duplicating or contradicting this file.

## General Engineering

- Inspect the relevant workflow, data model, and existing components before
  modifying code.
- Preserve working behavior unless a change is required to fix a proven
  product, accessibility, security, or maintainability problem.
- Keep changes small, reviewable, and tied to a user need, business objective,
  technical requirement, or accessibility requirement.
- Reuse existing routes, components, helpers, and patterns before creating new
  abstractions.
- Do not invent APIs, database fields, roles, provider metrics, reviews,
  payments, or verification states that the backend does not support.
- Do not add dependencies without a clear need and a short justification.
- Remove dead code introduced by the change.
- Use strict TypeScript. Avoid `any`, broad type assertions, and client-side
  access to server-only modules.
- Handle errors explicitly and keep user-facing error text human-readable.
- Add or update tests for business-critical logic and workflow changes.
- Document non-obvious product or architecture decisions.

## Product and UX Standards

- UI work must start from an explicit product intention, not from available
  components. Before changing a page, identify the primary user, the job they
  came to do, the one action the first screen should make easier, and the
  information needed to support that action.
- The first viewport must have a clear hierarchy. Do not put secondary metrics,
  navigation clutter, examples, or explanatory decoration above the user's main
  job unless those elements directly help the next action.
- Every visible element must earn its place. Remove duplicate signals such as a
  count shown twice, a budget repeated inside an action panel, a status repeated
  in two labels, or example links that duplicate an input placeholder.
- One surface, one dominant decision. A page section should not ask users to
  read metrics, choose filters, inspect records, and complete a form all at the
  same visual priority.
- Cards are for records, repeated items, modals/dialog bodies, or deliberately
  framed tools. Do not put decorative cards inside other cards, and do not use
  nested panels to compensate for weak hierarchy.
- Forms that are longer than a compact inline control must not explode a record
  card or push the list away. Use a dialog, sheet, drawer, or clearly separated
  expansion that preserves list scanability.
- Header and navigation controls must be treated as production UI. Text must not
  wrap into two lines, icon-only controls need labels, and authenticated headers
  must stay usable at mobile widths.
- Avoid "cheap fouls": clipped text, accidental two-line buttons, horizontal
  document overflow, hidden filter options, misaligned icon/text pairs, repeated
  facts, unexplained badges, and empty spacing that only exists because the
  layout was not reconsidered.
- Design for attention span. On dashboards, the first screen should answer
  "what needs my attention now?" before "how am I performing overall?"
- Mobile-first implementation is mandatory. Check layouts from about 320px
  upward.
- Accessibility is mandatory: semantic HTML, visible focus, labelled controls,
  keyboard access, useful headings, and understandable errors.
- Every significant page or workflow needs loading, empty, error, and success
  states appropriate to that workflow.
- Primary actions must be visually obvious and not compete with several other
  primary buttons.
- Copy must use clear marketplace language for non-technical users.
- Do not use decorative UI without product value. Avoid fake metrics, fake
  testimonials, fake verification badges, and fake activity.
- Do not present planned functionality as implemented.
- Trust indicators must be backed by real backend state.
- Pricing UI must distinguish what is actually stored today from future
  product/service/delivery/tax/payment breakdowns.
- Consequential or terminal actions need confirmation or carefully designed
  friction.
- Dashboard collections that can grow must be paginated or otherwise bounded.
- A UI change is not done until it has been inspected in-browser at desktop and
  mobile widths. Verify no horizontal overflow, no unintended wrapping, no
  overlapping text, no duplicated content, no card-inside-card smell, and no
  first-screen distraction from the main job.

## UI Components — Non-Negotiable

### No custom variants or props inside `src/components/ui/`

Components in `src/components/ui/` are **stock shadcn/ui** using the style and
primitive base configured in `components.json` (currently base-maia with
`@base-ui/react`). They MUST stay exactly as the registry ships them.

**NEVER do any of these inside `src/components/ui/`:**

- Add a custom `variant` to a component's `cva` config (e.g. `brand`, `success`, `warning`, `info`, `danger`, `neutral`).
- Add a custom prop that doesn't exist on the stock component (e.g. `loading` on `Button`, `dot` on `Badge`, `name` on `Avatar`, `label`/`hint`/`tooltip`/`optional` on `Field`, `as` on `CardTitle`).
- Re-export a custom type from a `ui/` module (e.g. `BadgeProps`, `SkeletonText`, `MoneyInput`, `controlClassName`, `Identity`).
- Wrap or extend a stock component inside `ui/` to add convenience behavior.

**When you need behavior the stock component doesn't provide:**

1. Create a **wrapper component** in `src/components/` (NOT in `src/components/ui/`). Examples: `LoadingButton`, `MoneyInput`, `LabeledField`, `Identity`, `ListPagination`, `SkeletonText`.
2. Compose the stock `ui/` primitives inside the wrapper — pass through props, add the extra prop, render children.
3. Import the wrapper from consumer code, never the stock component directly if the wrapper exists.

**When `shadcn add` overwrites a `ui/` file:**

- Accept the stock version. Do NOT patch custom variants back in.
- Migrate every consumer that relied on the old custom API to either a wrapper component (outside `ui/`) or the stock API.
- If a wrapper already exists, point consumers at it.

**Why:** Custom variants in `ui/` are silently destroyed every time `shadcn add --overwrite` runs. Keeping `ui/` stock means the registry can refresh at any time without breaking the app. Custom behavior lives in wrappers that the registry never touches.

## Tailwind and Design System

- Use semantic tokens from `src/app/globals.css`; do not scatter raw hex values
  or one-off arbitrary colors in feature components.
- Keep responsive classes mobile-first.
- Avoid fixed heights for variable content and prevent horizontal overflow.
- Use existing wrapper components for repeated domain UI such as identity,
  money input, pagination, section headers, record lists, status badges, and
  loading buttons.
- Do not introduce multiple competing button, input, badge, table/list, or
  toast systems.
- Use lucide icons already present in the repo. Icons in icon-only controls need
  accessible labels.

## Next.js

- Use the App Router architecture already in place.
- Prefer Server Components for data-driven UI; keep `"use client"` boundaries
  small and local to interactive forms/controls.
- Fetch independent server data concurrently when practical.
- Keep auth and authorization checks on the server.
- Use route-level `loading`, `error`, and `not-found` states where appropriate.
- Do not cache user-specific or sensitive data incorrectly.

## Prisma

- Database provider: PostgreSQL, as defined in `prisma/schema.prisma`.
- Keep Prisma access server-side.
- Select only fields needed for the screen or mutation.
- Use pagination for growing collections.
- Use transactions for multi-record state changes such as accepting an offer.
- Prevent race conditions around offer acceptance and order status changes.
- Handle database errors without exposing internal details.
- Review indexes before adding new high-volume query patterns.

## Tech Stack

- **Framework:** Next.js 16 App Router (Server Components by default, `"use client"` only where needed)
- **UI:** shadcn/ui + Tailwind CSS v4 (`@import "tailwindcss"`, `@theme` in `src/app/globals.css`)
- **Primitives:** `@base-ui/react`
- **Icons:** `lucide-react`
- **DB:** Prisma + PostgreSQL (`npm run db:push`, `npm run seed` / `npm run seed:demo`)
- **Auth:** JWT in cookies (`src/lib/auth.ts`)

## Commands

- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run test` — Vitest
- `npm run check` — typecheck + lint + test
- `npm run db:push` — push Prisma schema
- `npm run seed` — seed admin user
- `npm run seed:demo` — seed demo data
