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

## Demo accounts

Seeded by `npm run seed`. The password for all of them is `cinnamon123`.

| Role | Email |
| --- | --- |
| Customer | customer@coffeecinnamon.in |
| Café staff | staff@coffeecinnamon.in |
| Community partner | partner@coffeecinnamon.in |
| Community partner (vegetarian kitchen) | hope@coffeecinnamon.in |

On a wide screen the **Demo** switcher in the top bar signs in as each role. On a phone it is on the Log in page.

Coupon codes: `STUDENT10` (any day) and `CINNAMON20` (Saturdays and Sundays only).

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
