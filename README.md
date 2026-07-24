# MiddleMarket 🏛

A **mediated marketplace**: buyers post requests for products or services, sellers compete with offers, and a marketplace admin reviews **every offer's price** — approving, adjusting, or rejecting it — before the buyer ever sees it. Accepting an offer creates an order the admin tracks through fulfillment.

> The idea: connect what people want with who can offer it, while a human in the middle keeps every price competitive and rational.

## ✨ Features

- **Buyer dashboard** — post requests (product/service, description, optional budget), see only admin-approved offers with the adjusted price and marketplace notes, accept an offer, and track the resulting order.
- **Seller dashboard** — browse open requests with buyer budgets, submit offers (price + pitch), see offer statuses and adjusted prices, and follow won orders.
- **Admin control room** — stats overview, queue of offers awaiting review (approve / reject / adjust price with a note), and order tracking (pending → in progress → delivered → completed / cancelled).
- **Auth & roles** — email/password signup with bcrypt-hashed passwords, JWT session cookies (httpOnly), and role-gated pages (`BUYER`, `SELLER`, `ADMIN`).

## 🧱 Tech stack

| Layer     | Technology                                    |
| --------- | --------------------------------------------- |
| Frontend  | Next.js 14 (App Router), React 18, Tailwind CSS |
| Backend   | Next.js API routes (TypeScript)                |
| Database  | PostgreSQL 16 + Prisma ORM                     |
| Auth      | JWT session cookie + bcryptjs                  |

## 📋 Prerequisites

- **Node.js 20+** and npm
- **Docker** (easiest way to run Postgres) — or any PostgreSQL 14+ server

## 🚀 Getting started

### 1. Clone and install

```bash
git clone https://github.com/hirebirhan/middlemarket.git
cd middlemarket
npm install
```

### 2. Start PostgreSQL

With Docker (recommended):

```bash
docker run -d --name marketplace-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=marketplace \
  -p 5432:5432 postgres:16
```

(If you already created the container before: `docker start marketplace-pg`.)

### 3. Configure environment variables

```bash
cp .env.example .env
```

| Variable         | Description                              | Default                                                    |
| ---------------- | ---------------------------------------- | ---------------------------------------------------------- |
| `DATABASE_URL`   | Postgres connection string               | `postgresql://postgres:postgres@localhost:5432/marketplace` |
| `JWT_SECRET`     | Secret for signing session tokens        | change it in production!                                   |
| `ADMIN_EMAIL`    | Seeded admin login                       | `admin@middlemarket.local`                                  |
| `ADMIN_PASSWORD` | Seeded admin password                    | `admin123`                                                  |

### 4. Create the schema and seed the admin

```bash
npx prisma db push        # creates tables
npx tsx prisma/seed.ts    # creates the admin user
```

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 👤 Trying it out (three roles)

1. **Admin** — log in at `/login` with `admin@middlemarket.local` / `admin123`.
2. **Buyer** — sign up via "I want to buy", post a request.
3. **Seller** — sign up via "I want to sell" (use another browser or log out first), make an offer on the request.
4. As **admin**, review the offer: approve as-is, adjust the price, or reject.
5. As **buyer**, accept the approved offer → an order is created.
6. As **admin**, advance the order status; buyer and seller both see it update.

## 🗄 Data model

```
User (BUYER | SELLER | ADMIN)
Request  buyer → title, description, PRODUCT|SERVICE, budget?, status OPEN|MATCHED|CLOSED
Offer    seller → price, message, adminPrice?, adminNote?, status PENDING_REVIEW|APPROVED|REJECTED|ACCEPTED
Order    offer (1:1) → status PENDING|IN_PROGRESS|DELIVERED|COMPLETED|CANCELLED
```

## 📜 Scripts

| Command                  | What it does                       |
| ------------------------ | ---------------------------------- |
| `npm run dev`            | Start the dev server (port 3000)   |
| `npm run build`          | Production build                   |
| `npm start`              | Run the production build           |
| `npm run lint`           | ESLint                             |
| `npx prisma db push`     | Sync schema to the database        |
| `npx prisma studio`      | Visual DB browser                  |
| `npx tsx prisma/seed.ts` | (Re)create the admin user          |

## 📁 Project structure

```
prisma/
  schema.prisma       # data model
  seed.ts             # admin user seeder
src/
  app/
    page.tsx          # landing page
    login/ register/  # auth pages
    buyer/ seller/ admin/   # role dashboards
    api/              # auth, requests, offers, orders endpoints
  components/         # forms, buttons, badges
  lib/
    prisma.ts         # Prisma client singleton
    auth.ts           # JWT session helpers
```

## 🚢 Deploying

Any Node host works (Vercel, Railway, Render, a VPS):

1. Provision a managed Postgres and set `DATABASE_URL`.
2. Set a strong `JWT_SECRET` and your own `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
3. Run `npx prisma db push && npx tsx prisma/seed.ts` once against the production DB.
4. `npm run build && npm start` (or let the platform build it).

## 🗺 Roadmap ideas

- Payments/escrow integration
- In-app messaging between buyer, seller, and admin
- Categories, search, and filtering for requests
- Email notifications on offer review and order updates
- Ratings & reviews after completed orders
