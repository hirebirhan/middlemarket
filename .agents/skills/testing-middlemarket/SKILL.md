---
name: testing-middlemarket
description: Test the MiddleMarket marketplace end-to-end (buyer request → seller offer → admin price review → accept → order tracking). Use when verifying UI or API changes in this repo.
---

# Testing MiddleMarket

## Setup

1. Start Postgres: `docker start marketplace-pg` (or create it: `docker run -d --name marketplace-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=marketplace -p 5432:5432 postgres:16`).
2. `cp .env.example .env` if `.env` is missing, then `npm install`, `npx prisma db push`, `npx tsx prisma/seed.ts` (seeds the admin).
3. Run `npm run dev` and verify `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` returns 200.

## Accounts

- Admin is seeded: `admin@middlemarket.local` / `admin123` (override via `ADMIN_EMAIL`/`ADMIN_PASSWORD`).
- Buyers/sellers: register fresh accounts via `/register?role=BUYER` or `?role=SELLER`. Use unique emails per run (e.g. timestamped) — emails are unique in the DB.

## Golden-path flow to verify

1. Buyer posts a request at `/buyer` (choose Product/Service, optional budget).
2. Seller sees it at `/seller` and submits an offer (price + pitch) → status PENDING_REVIEW.
3. Key mediation gate: the buyer must NOT see the offer until admin approves it.
4. Admin at `/admin` approves (optionally with adjusted price + note) or rejects.
5. Buyer sees the approved offer (adjusted price shown with original struck through) and accepts → order created, request MATCHED.
6. Admin advances the order status via the select in the Orders section; seller sees ACCEPTED + order status at `/seller`.

## Gotchas

- The login form has only email + password fields (no name field), so its field coordinates differ from the register form — take a screenshot before typing to avoid entering values into the wrong inputs.
- Dashboard pages are role-gated and redirect (`/buyer`, `/seller`, `/admin`); log out via the header before switching roles.
- Lint/build checks: `npm run lint` and `npm run build`.

## Devin Secrets Needed

- None — the app runs fully locally with the Docker Postgres and seeded admin credentials above.
