# MiddleMarket

MiddleMarket is a mediated request-for-quote marketplace built as a Next.js application. Buyers post product or service requests, sellers submit offers, an admin reviews each offer before the buyer sees it, and accepting an approved offer creates an order that the admin can move through a simple fulfillment lifecycle.

## Project Status

**MVP in progress.** The repository contains a working buyer-seller-admin transaction loop, database models, API routes, dashboards, seed scripts, and unit tests for shared utility logic. It is not production-ready: payments, messaging, file uploads, notifications, dispute handling, reviews, provider onboarding, and deployment automation are not implemented in the current codebase.

| Area | Status | Notes |
| --- | --- | --- |
| Authentication | Implemented | Email/password registration and login use bcrypt hashes and an HTTP-only JWT cookie in `src/lib/auth.ts` and `src/app/api/auth`. |
| Authorization | Implemented | Role checks gate buyer, seller, and admin dashboards plus mutation routes through `getCurrentUser` and `requireUser`. |
| Product marketplace | Partial | Product requests, SKU capture, seller offer condition, admin price review, buyer acceptance, and orders exist. There is no product catalog, inventory, shipping integration, or seller product management. |
| Service marketplace | Partial | `RequestType.SERVICE` exists and buyers can post service requests; sellers can offer on them. There are no service provider profiles, scheduling, milestones, or service-specific completion records. |
| Buyer requests | Implemented | Buyers create requests with title, description, type, optional SKU, and optional budget. |
| Seller quotations | Implemented | Sellers submit one live offer per open request, with price and pitch. Product offers require condition. |
| Admin price review | Implemented | Admins approve, adjust, or reject offers and can store fair-price band values and notes. |
| Orders or engagements | Partial | Accepting an approved offer creates an `Order`; admins can move it through fixed statuses. There is no payment, delivery proof, service milestone, or contract document workflow. |
| Payments | Not found | No payment provider, escrow, invoicing, wallet, or transaction settlement code was found. |
| Reviews | Not found | No rating or review models, routes, or UI were found. |
| Messaging | Not found | No buyer-seller chat, admin messaging, or notification inbox was found. |
| Notifications | UI-only toast feedback | Client-side toasts exist for immediate form feedback. No persisted notifications or external email/SMS/push delivery were found. |
| Administration | Implemented | Admin overview, review queue, decisions/audit list, and order tracking pages exist under `src/app/admin`. |
| Search and filtering | Partial | Dashboard lists support query-string search, tabs, and pagination. There is no public sitewide search engine or product discovery index. |
| File uploads | Not found | No upload routes, storage configuration, or file/image models were found. |

## Marketplace Model

### Products

The implemented product workflow is request-led rather than catalog-led:

1. A buyer posts a `PRODUCT` request from the buyer dashboard.
2. The request can include an exact model/SKU, description, and budget.
3. Sellers browse open requests and submit offers.
4. Product offers require a condition: `NEW`, `OPEN_BOX`, `REFURBISHED`, or `USED`.
5. Admins review offers before buyers see them. They can approve at the seller price, set an adjusted `adminPrice`, reject the offer with a note, and optionally store a fair-price band.
6. Buyers see approved or accepted offers for their own requests and can accept an approved offer.
7. Accepting an offer marks the request as `MATCHED`, marks the winning offer as `ACCEPTED`, rejects other pending/approved offers for that request, and creates an `Order`.
8. Admins move orders through `PENDING`, `IN_PROGRESS`, `DELIVERED`, `COMPLETED`, or `CANCELLED`.

Not implemented for products: product catalog pages, stock counts, product images, seller storefronts, delivery carriers, payment collection, warranties as structured data, returns, and disputes.

### Services

The code supports service requests at a basic RFQ level:

1. A buyer can create a `SERVICE` request.
2. Sellers can view open service requests.
3. Sellers can submit a price and pitch for a service request.
4. Admin review, buyer acceptance, and order creation reuse the same generic offer/order workflow as products.

Service-specific functionality is not implemented. There are no provider profile fields, service categories, booking or scheduling records, milestones, completion evidence, scope documents, or service reviews.

### Product and Service Packages

Combined product-and-service packages are **not directly implemented**. The data model has `RequestType.PRODUCT` and `RequestType.SERVICE` only, with no combined type. A buyer could describe a combined need in free text, such as "TV plus installation", but the code does not model package line items, materials and labor, installation milestones, or mixed fulfillment steps.

## User Roles

| Role | Implemented capabilities |
| --- | --- |
| `BUYER` | Register or log in, create product/service requests, search and filter their own requests, see approved/accepted offers, accept an approved offer, and see order progress for accepted offers. |
| `SELLER` | Register or log in, browse open buyer requests, search and filter request lists, submit offers, resubmit after rejection, view offer statuses, and see whether an accepted offer has an order. |
| `ADMIN` | Seeded through `prisma/seed.ts`, not open registration. Admins can view marketplace metrics, review pending offers, store price bands and notes, inspect prior decisions, and move orders through allowed status transitions. |

No `RESELLER`, `SERVICE_PROVIDER`, `MODERATOR`, or separate operator roles were found in code or seed data.

## Current Features

### Authentication and Account Management

- Buyer and seller self-registration at `/register`.
- Login at `/login`.
- Logout through `/api/auth/logout`.
- Passwords are hashed with `bcryptjs`.
- Sessions are signed JWTs stored in the `mp_session` HTTP-only cookie.
- Admin account creation is handled by the seed script, not public registration.

Not implemented: email verification, password reset, refresh tokens, MFA, account deletion, account settings, or normalized email migration.

### Buyer Requests

- Buyers create requests with type, title, description, optional exact model/SKU for products, and optional budget.
- Buyer request creation has a dedicated `/buyer/new` flow, and the dashboard shows request status, approved/accepted offers, adjusted prices, admin notes, and order progress.
- Buyer dashboard supports search, status filters, pagination, and saved-by-mediation metrics.

### Seller Offers

- Sellers browse open requests.
- Sellers submit price and pitch.
- Product offers require item condition.
- One seller can have only one live offer per request; rejected offers can be resubmitted.
- Sellers can filter their own offers by review, approved, won, and declined states.

### Admin Review

- Pending offers appear in an admin queue, oldest first.
- Admins approve or reject offers.
- Admins can set an adjusted buyer-visible price.
- Admins can enter fair-price band low/high values.
- Rejections require a note.
- Reviewed offers appear in the decisions view.

### Orders

- Buyer acceptance creates exactly one order for a request.
- Losing pending or approved offers are rejected automatically after buyer acceptance.
- Admins can move orders through validated transitions:
  - `PENDING` to `IN_PROGRESS` or `CANCELLED`
  - `IN_PROGRESS` to `DELIVERED` or `CANCELLED`
  - `DELIVERED` to `COMPLETED` or back to `IN_PROGRESS`
  - `COMPLETED` and `CANCELLED` are terminal
- Buyer and seller dashboards display order status when an order exists.

### UI and Developer Experience

- Next.js App Router pages for landing, auth, buyer, seller, and admin workflows.
- Stock shadcn UI primitives under `src/components/ui`, with marketplace wrappers under `src/components`.
- Theme support through `next-themes`.
- Query-string search/filter/page state helpers.
- Per-route loading states and error pages.
- Unit tests for API validation, money formatting, list parameters, and order transitions.

## Feature Implementation Matrix

| Feature | Status | Relevant location | Notes |
| --- | --- | --- | --- |
| User registration | Implemented | `src/app/api/auth/register/route.ts`, `src/components/AuthForm.tsx` | Buyer and seller only. Admin signup is deliberately excluded. |
| Login/logout | Implemented | `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts` | JWT session cookie. |
| Role-gated dashboards | Implemented | `src/app/buyer/page.tsx`, `src/app/seller/page.tsx`, `src/app/admin/layout.tsx` | Redirects users to the correct dashboard. |
| Buyer product requests | Implemented | `src/app/buyer/new/page.tsx`, `src/components/NewRequestForm.tsx`, `src/app/api/requests/route.ts` | Product requests can include SKU and budget. |
| Buyer service requests | Partial | `RequestType.SERVICE`, `NewRequestForm` | Uses generic request/offer/order flow; no service-specific lifecycle. |
| Seller quotations | Implemented | `src/components/OfferForm.tsx`, `src/app/api/requests/[id]/offers/route.ts` | Includes duplicate live-offer prevention. |
| Product condition capture | Implemented | `Condition` enum, `Offer.condition`, `OfferForm` | Required for product offers only. |
| Admin price mediation | Implemented | `src/components/ReviewOfferForm.tsx`, `src/app/api/offers/[id]/review/route.ts` | Captures adjusted price, note, and fair-price band. |
| Buyer offer acceptance | Implemented | `src/components/AcceptOfferButton.tsx`, `src/app/api/offers/[id]/accept/route.ts` | Creates an order in a transaction. |
| Order status tracking | Partial | `Order`, `src/lib/orders.ts`, `src/app/api/orders/[id]/status/route.ts` | Tracks high-level status only. No delivery proof or payment status. |
| Decision audit list | Implemented | `src/app/admin/decisions/page.tsx` | Lists reviewed offers with outcome and band values. |
| Dashboard search/filtering | Implemented | `src/lib/list-params.ts`, dashboard pages | Server-rendered query-string filters and pagination. |
| Demo seed data | Implemented | `prisma/seed-demo.ts` | Fictional electronics pilot data. |
| Payments/escrow | Not found | Not confirmed from the current repository | No payment code or schema. |
| Reviews/ratings | Not found | Not confirmed from the current repository | No models, routes, or UI. |
| Messaging/chat | Not found | Not confirmed from the current repository | No models, routes, or UI. |
| File/image uploads | Not found | Not confirmed from the current repository | No storage provider or upload endpoint. |
| Docker support | Not found | Not confirmed from the current repository | No Dockerfile or compose file was found. |
| CI/CD | Not found | Not confirmed from the current repository | No `.github/workflows` or other CI config was found. |

## User Workflows

### Product Transaction

1. Buyer registers or logs in as `BUYER`.
2. Buyer posts a `PRODUCT` request from `/buyer/new` with title, details, optional SKU, and optional budget.
3. Seller registers or logs in as `SELLER`.
4. Seller opens the seller dashboard, finds the open request, enters condition, price, and pitch.
5. Platform stores the offer as `PENDING_REVIEW`.
6. Admin reviews the offer, optionally records a price band, approves or adjusts the price, or rejects with a note.
7. Buyer sees approved offers and accepts one.
8. Platform creates an order and marks the request as `MATCHED`.
9. Admin advances the order status through fulfillment.

This workflow stops at status tracking. Payment, delivery confirmation, and post-order reviews are not implemented.

### Service Engagement

1. Buyer posts a `SERVICE` request.
2. Seller submits a price and pitch.
3. Admin reviews the offer.
4. Buyer accepts an approved offer.
5. Platform creates a generic order.

This workflow stops at the same generic order status lifecycle. Service scheduling, milestones, completion forms, and provider-specific records are not implemented.

### Combined Product and Service Request

Not implemented as a structured workflow. A buyer can describe a combined need in a request description, but the database and UI do not distinguish product lines from service lines or track package-specific fulfillment.

## Architecture

The application is a single Next.js project. The frontend and backend live in the same repository: App Router pages render dashboards, and API route handlers perform authenticated mutations against PostgreSQL through Prisma.

```mermaid
flowchart LR
    Browser["Browser / Next.js UI"] --> Pages["App Router pages"]
    Browser --> Routes["Next.js API routes"]
    Pages --> Auth["JWT cookie session helpers"]
    Routes --> Auth
    Pages --> Prisma["Prisma Client"]
    Routes --> Prisma
    Prisma --> DB[("PostgreSQL")]
```

| Concern | Current implementation |
| --- | --- |
| Frontend technology | Next.js App Router, React, TypeScript, Tailwind CSS |
| Backend technology | Next.js API route handlers in `src/app/api` |
| Database | PostgreSQL through Prisma Client |
| Authentication mechanism | HTTP-only JWT cookie named `mp_session`; bcrypt password hashing |
| API style | JSON route handlers, no API version prefix |
| State management | Mostly server-rendered data; local React state in client forms; URL query strings for dashboard search/filter/page state |
| File storage | Not confirmed from the current repository |
| Messaging/event system | Not confirmed from the current repository |
| External integrations | Google fonts via `next/font/google`; no payment, email, SMS, storage, or search integration found |
| Testing frameworks | Vitest for unit tests |
| Deployment approach | Not confirmed from the current repository |

## Repository Structure

```text
.
|-- docs/
|   |-- electronics-pilot.md
|   |-- production-ui-audit.md
|   `-- ui-review.md
|-- prisma/
|   |-- schema.prisma
|   |-- seed.ts
|   `-- seed-demo.ts
|-- src/
|   |-- app/
|   |   |-- admin/
|   |   |-- api/
|   |   |-- buyer/
|   |   |   `-- new/
|   |   |-- login/
|   |   |-- register/
|   |   |-- seller/
|   |   |-- layout.tsx
|   |   `-- page.tsx
|   |-- components/
|   |   |-- admin/
|   |   `-- ui/
|   `-- lib/
|-- eslint.config.mjs
|-- next.config.mjs
|-- package.json
|-- package-lock.json
|-- postcss.config.mjs
|-- tsconfig.json
|-- vitest.config.ts
`-- README.md
```

Important directories:

- `src/app`: Next.js App Router pages, layouts, loading states, error pages, and API routes.
- `src/components`: Form components, dashboard controls, navigation, and marketplace-specific wrapper components.
- `src/components/ui`: Stock shadcn UI primitives.
- `src/lib`: Prisma client, authentication helpers, validation helpers, money formatting, pagination helpers, and order transition rules.
- `prisma`: Prisma schema and seed scripts.
- `docs`: Product and UI review notes that describe the electronics pilot and past UI audit.

## Technology Stack

| Category | Technology |
| --- | --- |
| Runtime/package manager | Node.js with npm (`package-lock.json` is present) |
| Frontend | Next.js `^16.2.11`, React `^19.2.0`, TypeScript `^5` |
| Backend | Next.js API route handlers |
| Database/ORM | PostgreSQL, Prisma `^6.19.3`, `@prisma/client` `^6.19.3` |
| Authentication | `jsonwebtoken` `^9.0.3`, `bcryptjs` `^3.0.3` |
| Styling/UI | Tailwind CSS `^4.3.3`, `@tailwindcss/postcss`, `next-themes`, `lucide-react` |
| Testing | Vitest `^4.1.10` |
| Linting | ESLint `^9`, `eslint-config-next` `^16.2.11` |
| Containerization | Not confirmed from the current repository |
| CI/CD | Not confirmed from the current repository |
| Cloud services | Not confirmed from the current repository |

## Prerequisites

Confirmed prerequisites:

- Node.js and npm.
- A PostgreSQL database reachable by `DATABASE_URL`.

Not confirmed from the current repository:

- A pinned Node.js version.
- Docker configuration.
- A managed deployment platform.

## Local Development Setup

1. Clone the repository.

```bash
git clone <repository-url>
cd middlemarket
```

2. Install dependencies.

```bash
npm install
```

3. Create a local environment file.

```bash
cp .env.example .env
```

4. Edit `.env` and set safe local values.

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/marketplace"
JWT_SECRET="your-local-development-secret"
ADMIN_EMAIL="admin@example.local"
ADMIN_PASSWORD="your-admin-password"
```

5. Start PostgreSQL.

The repository does not include Docker or compose configuration. Use any local or managed PostgreSQL instance and make sure `DATABASE_URL` points to it.

6. Create or update the database schema.

```bash
npm run db:push
```

This project currently uses `prisma db push`; no Prisma migration files were found.

7. Seed an admin user.

```bash
npm run seed
```

8. Optionally load fictional demo data.

```bash
npm run seed:demo
```

To remove the demo data:

```bash
npm run seed:demo -- --clean
```

9. Start the development server.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Port `3000` is the default Next.js development port; no custom port is configured in the repository.

10. Run validation.

```bash
npm run typecheck
npm run lint
npm test
```

Or run the combined check:

```bash
npm run check
```

## Environment Variables

Create `.env` for local development. Use placeholders for secrets and replace them before running the app.

| Variable | Required | Purpose | Safe example |
| --- | ---: | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma | `postgresql://postgres:postgres@localhost:5432/marketplace` |
| `JWT_SECRET` | Yes for non-demo use | Signs JWT session cookies. The code falls back to `dev-secret` if unset, which should not be used outside local experiments. | `your-secret-key` |
| `ADMIN_EMAIL` | No | Email used by `npm run seed` when creating the admin account. | `admin@example.local` |
| `ADMIN_PASSWORD` | No | Password used by `npm run seed` when creating the admin account. | `your-admin-password` |
| `DEMO_PASSWORD` | No | Password used by `npm run seed:demo` for all fictional demo accounts. | `your-demo-password` |
| `NEXT_PUBLIC_SITE_URL` | No | Public origin used for metadata base, canonical, and social URLs. | `http://localhost:3000` |
| `NODE_ENV` | Managed by tooling | Used by Prisma client singleton logic in development. | `development` |

## Database Setup

Database engine: PostgreSQL.

Schema source: `prisma/schema.prisma`.

Schema command:

```bash
npm run db:push
```

Seed commands:

```bash
npm run seed
npm run seed:demo
```

Database reset command: Not confirmed from the current repository. Prisma's general reset command may exist through the Prisma CLI, but no project script wraps it.

Major entities:

- `User`: account with email, password hash, name, and `Role`.
- `Request`: buyer request with type, budget, SKU, status, and offers.
- `Offer`: seller quotation with seller price, optional admin price, fair-price band, condition, status, and notes.
- `Order`: one-to-one order created from an accepted offer.

```mermaid
erDiagram
    User ||--o{ Request : "creates"
    User ||--o{ Offer : "submits"
    Request ||--o{ Offer : "receives"
    Offer ||--o| Order : "creates"

    User {
        string id
        string email
        string password
        string name
        Role role
        datetime createdAt
    }
    Request {
        string id
        string title
        string description
        string sku
        RequestType type
        decimal budget
        RequestStatus status
        string buyerId
        datetime createdAt
    }
    Offer {
        string id
        decimal price
        decimal adminPrice
        decimal bandLow
        decimal bandHigh
        string message
        Condition condition
        OfferStatus status
        string adminNote
        string requestId
        string sellerId
        datetime createdAt
    }
    Order {
        string id
        string offerId
        OrderStatus status
        datetime createdAt
        datetime updatedAt
    }
```

Enums:

- `Role`: `BUYER`, `SELLER`, `ADMIN`
- `RequestType`: `PRODUCT`, `SERVICE`
- `RequestStatus`: `OPEN`, `MATCHED`, `CLOSED`
- `OfferStatus`: `PENDING_REVIEW`, `APPROVED`, `REJECTED`, `ACCEPTED`
- `OrderStatus`: `PENDING`, `IN_PROGRESS`, `DELIVERED`, `COMPLETED`, `CANCELLED`
- `Condition`: `NEW`, `OPEN_BOX`, `REFURBISHED`, `USED`

## API Documentation

Base URL in local development: `http://localhost:3000`.

API versioning: Not implemented.

Generated OpenAPI/Swagger documentation: Not confirmed from the current repository.

Authentication method: HTTP-only `mp_session` JWT cookie set by login/register routes.

Endpoint overview:

| Method | Path | Role | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create a buyer or seller account and set a session cookie. |
| `POST` | `/api/auth/login` | Public | Authenticate by email/password and set a session cookie. |
| `POST` | `/api/auth/logout` | Any logged-in user | Clear the session cookie. |
| `POST` | `/api/requests` | `BUYER` | Create a buyer request. |
| `POST` | `/api/requests/[id]/offers` | `SELLER` | Submit an offer on an open request. |
| `POST` | `/api/offers/[id]/review` | `ADMIN` | Approve, adjust, or reject a pending offer. |
| `POST` | `/api/offers/[id]/accept` | `BUYER` | Accept an approved offer on one of the buyer's requests and create an order. |
| `POST` | `/api/orders/[id]/status` | `ADMIN` | Move an order through an allowed status transition. |

## Authentication and Authorization

- Registration accepts `BUYER` and `SELLER` only.
- Admin users are created by `prisma/seed.ts`.
- Login compares the submitted password to the bcrypt hash stored on `User.password`.
- `signSession` creates a JWT with `userId` and `role`, expiring in 7 days.
- `setSessionCookie` stores the token in an HTTP-only cookie named `mp_session` with `sameSite: "lax"` and path `/`.
- `getCurrentUser` verifies the cookie and loads the user from the database.
- `requireUser(role)` protects API routes and returns `401` or `403` errors for unauthenticated or unauthorized access.
- Page-level redirects protect buyer, seller, and admin dashboards.

Not implemented: refresh tokens, email verification, phone verification, password reset, MFA, account lockout, rate limiting, audit logging, or a permissions system beyond the three role enum values.

## Testing

Run unit tests:

```bash
npm test
```

Run watch mode:

```bash
npm run test:watch
```

Run all configured checks:

```bash
npm run check
```

Current test files:

- `src/lib/api.test.ts`: JSON parsing, validation, amount parsing, enum validation, and error status behavior.
- `src/lib/list-params.test.ts`: query param parsing, pagination, and list URL generation.
- `src/lib/money.test.ts`: ETB money formatting and compact formatting.
- `src/lib/orders.test.ts`: order status transition rules.

Testing gaps:

- No route handler integration tests were found.
- No database integration tests were found.
- No component tests were found.
- No end-to-end test suite is committed to the repository.
- No tests directly cover authentication cookie behavior or the full buyer-seller-admin workflow.

## Deployment

Not confirmed from the current repository.

No Dockerfile, `docker-compose.yml`, Vercel project files, Netlify config, Kubernetes manifests, GitHub Actions workflows, or other deployment automation were found. The standard scripts available are:

```bash
npm run build
npm start
```

Any deployment target would need to provide:

- Node.js and npm support.
- A PostgreSQL database.
- `DATABASE_URL`.
- A strong `JWT_SECRET`.
- Admin seed credentials for the first admin account.
- A one-time schema setup step using `npm run db:push` or a future migration workflow.

## Security Considerations

Visible safeguards:

- Passwords are hashed with bcrypt before storage.
- Sessions use signed JWTs.
- Session cookies are HTTP-only and `sameSite: "lax"`.
- API handlers validate JSON bodies and common text, enum, and amount fields.
- Admin signup is not publicly exposed.
- Role checks protect mutation routes.
- API error handling avoids returning internal error messages for unexpected failures.
- Buyer offer acceptance checks request ownership before allowing acceptance.
- Order transitions are validated server-side.

Important visible gaps:

- `JWT_SECRET` has a development fallback if unset.
- Cookies do not set `secure: true` in the current code.
- No rate limiting was found.
- No CSRF protection beyond SameSite cookie behavior was found.
- No email verification or password reset flow was found.
- No audit log table was found.
- No structured logging or monitoring configuration was found.
- No file validation exists because file uploads are not implemented.
- No CORS policy configuration was found; route handlers are same-origin by default.

## Known Limitations

- The app is request/RFQ-based, not a full catalog marketplace.
- Services use the same generic request-offer-order flow as products.
- Combined product-and-service packages are not modeled.
- Payments, escrow, commissions, invoices, and refunds are not implemented.
- Delivery and fulfillment are tracked only as order statuses.
- No delivery proof, address, courier, or shipment records exist.
- No service milestones, scheduling, or completion approval flow exists.
- No ratings or reviews exist.
- No buyer-seller messaging exists.
- No persistent notifications or external notification delivery exists.
- No file or image uploads exist.
- No dispute workflow exists.
- No Docker, CI/CD, or production deployment configuration was found.
- Prisma schema changes are applied with `db:push`; no migration history exists in the repository.
- The landing page includes static marketing/demo metrics; those metrics are not computed from production data in the current code.
- Email addresses are not normalized in the auth code.
- Test coverage is limited to shared utilities.

## Roadmap

### Immediate Priorities

- Add integration tests for the buyer request, seller offer, admin review, buyer accept, and order status route handlers.
- Decide whether to keep `prisma db push` or introduce Prisma migrations for repeatable schema changes.
- Remove the development JWT fallback or fail fast when `JWT_SECRET` is missing outside local development.
- Normalize email addresses consistently for registration and login.
- Make service requests explicit in the UI and docs, or restrict the product if services are not ready for the MVP.
- Replace static landing metrics with real metrics or label them as illustrative in the UI.

### MVP Priorities

- Add payment or settlement flow if the platform will manage transactions.
- Add seller/provider profile and verification records.
- Add structured categories for products and services.
- Add delivery or fulfillment details beyond order status.
- Add service-specific milestones or completion confirmation.
- Add buyer and seller notifications for offer review, acceptance, and order updates.
- Add ratings/reviews after completed orders.
- Add dispute/cancellation handling beyond terminal order status.
- Add deployment and environment documentation backed by actual config.

### Later Enhancements

- Add product images or document uploads with validated storage.
- Add buyer-seller-admin messaging.
- Build a pricing oracle from accumulated `Offer` rows and fair-price bands.
- Add analytics dashboards for liquidity, savings, acceptance rate, and seller performance.
- Add public seller storefronts or catalogs if the marketplace evolves beyond RFQs.
- Add an OpenAPI specification or generated API documentation.

## Contributing

No project-specific contribution guide was found. A practical process for this repository is:

1. Create a focused feature branch.
2. Make the smallest coherent change.
3. Add or update tests when behavior changes.
4. Run `npm run check`.
5. Submit a pull request with a concise summary and any known gaps.

## Coding Standards

Confirmed standards and conventions:

- TypeScript strict mode is enabled in `tsconfig.json`.
- Path alias `@/*` maps to `src/*`.
- ESLint uses flat config in `eslint.config.mjs`.
- Vitest runs Node-environment unit tests matching `src/**/*.test.ts`.
- UI code is organized around reusable components in `src/components/ui`.
- Custom marketplace behavior is kept in wrapper components under `src/components`, not inside stock shadcn files.
- Mutation APIs use shared validation helpers in `src/lib/api.ts`.
- Order transition rules are centralized in `src/lib/orders.ts`.
- Dashboard list state is encoded in query strings through `src/lib/list-params.ts`.
- Money formatting is centralized in `src/lib/money.ts` and uses ETB.

Not confirmed from the current repository:

- A formatter such as Prettier.
- Commit hooks.
- Commit message conventions.
- Branch naming conventions.

## License

No license has currently been specified for this project.

## Contact or Maintainers

Not confirmed from the current repository.
