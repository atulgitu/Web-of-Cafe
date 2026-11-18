# Coffee Cinnamon — café website

College project for **CS-1 | The Café Website: Build, Launch, and Critique**.

Coffee Cinnamon is a (fictional) neighbourhood café that plans its cooking around expected demand and passes unsold food to
community partners instead of binning it. The site lets customers browse the menu and order, and lets café staff and
community partners run the food-rescue process.

Submission documents:

- [COLLEGE_CRITIQUE.md](COLLEGE_CRITIQUE.md) — what the AI-assisted first version got wrong, and how each problem was fixed
- [TESTING_REPORT.md](TESTING_REPORT.md) — what was tested and the results
- [OWNER_SUMMARY.md](OWNER_SUMMARY.md) — one-slide summary for the café owner
- `docs/evidence/` — before and after screenshots

## What's in the project

| Folder | What it is |
| --- | --- |
| `src/` | The website: React 19, React Router 7, Tailwind CSS 4, built with Vite |
| `server/` | The API: Node.js + Express, with a PostgreSQL database |

Pages: Home, Menu, Rescue, Impact, About, Contact, Offers, Cart, Checkout, order confirmation, account,
plus a kitchen dashboard (staff) and a pickups page (community partners).

## Run it locally

You need Node.js 20 or newer. No separate database install is needed: a development copy of PostgreSQL ships in
`server/node_modules`.

```bash
# 1. the API (first terminal)
cd server
npm install
cp .env.example .env        # then set JWT_SECRET to any long random string
npm run db:local            # starts PostgreSQL on port 5433
npm run seed                # creates the tables and a fresh demo day (wipes existing data)
npm run dev                 # API on http://localhost:5000

# 2. the website (second terminal, from the project root)
npm install
cp .env.example .env.local
npm run dev                 # site on http://localhost:5173
```

To stop the database: `npm run db:local -- stop` (inside `server/`).

**The demo data is tied to the day you seed it.** Orders, rescue listings and pickup times are placed around "now".
Run `npm run seed` again on the day of a demo so the rescue board has current listings. (The site still works on
old data; it simply shows an empty board, and the forecast says which date its sales data ends on.)

## Accounts and roles

Sign in at `/login` with an email and password. There is no role picker: each account's role is stored in the
database, and public sign-up always creates a **customer**. Staff and community-partner accounts can only be created
by the seed script (or directly in the database).

Sample accounts created by `npm run seed`, one per role, for development and testing:

| Role | Name | Email |
| --- | --- | --- |
| Customer | Aarav Sharma | aarav@coffeecinnamon.in |
| Café staff | Rohan Verma | rohan@coffeecinnamon.in |
| Community partner | Priya Singh | priya@coffeecinnamon.in |
| Community partner (vegetarian kitchen) | Aditya Kumar | aditya@coffeecinnamon.in |

Locally they all use the password `cinnamon123`. The production database is filled once, from a developer's machine,
with `SAMPLE_ACCOUNT_PASSWORD` and `STAFF_PASSWORD` given only to that one command. They are not stored in Git or in
Vercel, and the seed refuses to run against production without them, so the live accounts never use a password that
is in Git. (Staff and partner accounts can't be created any other way, which is why the seed needs them.)

After signing in, staff go to the kitchen dashboard (`/dashboard`), partners to their pickups (`/partner`), and
customers back to where they were.

Coupon codes: `STUDENT10` (any day) and `CINNAMON20` (Saturdays and Sundays only).

## Photos

Menu photos are stored in `public/menu/<product id>.webp` (640×480 WebP). The home and sign-in photos are in
`public/images/`. Sources and licences are listed in [IMAGE_CREDITS.md](IMAGE_CREDITS.md) and on the site's
/credits page. Each product's photo path and alt text live in `server/src/db/seed-data/menu.js`. On every
production build, `server/scripts/setup-db.js` copies the menu wording and photos onto the existing database,
without touching orders, prices or stock.

## Checks

```bash
npm run lint                # frontend lint (oxlint)
npm run build               # production build
cd server && npm test       # unit tests: pricing, forecast, partner matching (no database needed)
cd server && npm run test:api   # end-to-end API test. Re-seeds the database first!
```

## What is real and what is simulated

Real: accounts and login, server-side pricing, orders saved to the database, rescue listings, reservations and
pickups, impact totals calculated from pickup records, contact messages saved for staff.

Simulated: payment (nothing is charged), the partner organisations and all history (demo data), delivery, and email
(contact messages are stored, not emailed). The About page lists this in full.
