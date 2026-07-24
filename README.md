# MiddleMarket

A mediated marketplace MVP: buyers post requests for products or services, sellers make offers, and the marketplace admin reviews every offer's price (approving, adjusting, or rejecting) before the buyer can accept. Accepting an offer creates an order the admin tracks through fulfillment.

## Stack

- Next.js 14 (App Router, TypeScript, Tailwind CSS)
- PostgreSQL with Prisma ORM
- JWT session cookies (bcrypt-hashed passwords)

## Roles & Flow

1. **Buyer** signs up, posts a request (title, description, product/service, optional budget).
2. **Seller** signs up, browses open requests, submits an offer (price + pitch).
3. **Admin** reviews pending offers: approve (optionally with an adjusted price and note) or reject.
4. **Buyer** sees only approved offers and accepts one → an order is created and the request is marked matched.
5. **Admin** updates order status: pending → in progress → delivered → completed (or cancelled).

## Local setup

```bash
# 1. Start Postgres (e.g. with Docker)
docker run -d --name marketplace-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=marketplace -p 5432:5432 postgres:16

# 2. Configure env
cp .env.example .env

# 3. Install, migrate, seed admin
npm install
npx prisma db push
npx tsx prisma/seed.ts   # creates admin@middlemarket.local / admin123

# 4. Run
npm run dev
```

Log in as the admin at `/login` with `admin@middlemarket.local` / `admin123` (change via `ADMIN_EMAIL`/`ADMIN_PASSWORD`).
