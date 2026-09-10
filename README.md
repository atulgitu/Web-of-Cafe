# Brew & Bean — Café Ordering Website

A college AI Bootcamp project: a full café ordering website front-end built with React, React Router, and Tailwind CSS v4.

## Run locally

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to http://localhost:5173).

## Notes

- All data (menu, orders, auth) is mocked and stored in `localStorage`/`sessionStorage` — no backend is required.
- Login accepts any email/password (min 6 characters) and creates a demo account with sample order history.
- "Continue as Guest" skips login entirely.
- Checkout uses a safe mock payment form — no real transactions occur.
- Try coupon codes `STUDENT10` or `BREW20` in the cart.
