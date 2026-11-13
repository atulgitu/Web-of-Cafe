# Coffee Cinnamon — Testing report

Tested 13 November 2026 (a Friday), on Windows 11 with Node 24 and Chrome (headless, driven by scripts through the
Chrome DevTools Protocol). After the fixes, testing used a **freshly seeded copy** of the database so the rescue board
had current listings.

**Key:** **PASS** worked first time · **FIXED** failed, fixed, then re-tested and passed · **KNOWN LIMITATION** not fixed (reason given)

Not done: no testing on physical phones, no manual screen-reader session (NVDA/VoiceOver), no Safari or Firefox.
Mobile results come from Chrome's device emulation.

## 1. Automated checks

| Check | Command | Result |
| --- | --- | --- |
| Lint | `npm run lint` | PASS, no warnings |
| Production build | `npm run build` | PASS (413 kB JS, 123 kB gzipped) |
| Unit tests (pricing, forecast, matching) | `cd server && npm test` | PASS, 12/12 (4 new tests added) |
| End-to-end API test | `cd server && npm run test:api` | PASS, 22/22 (6 new checks added) |

## 2. Layout sweep: 12 routes × 6 widths

Routes: `/`, `/menu`, `/rescue`, `/impact`, `/about`, `/contact`, `/cart`, `/offers`, `/login`, `/dashboard`,
`/partner`, and an unknown URL (404). Widths: 320, 375, 390, 768, 1024, 1440px.

For every page and width, a script checked: horizontal page overflow, elements going off-screen, text cut off by its
box, exactly one `h1`, skipped heading levels, one `<main>`, buttons/links without a name, inputs without labels,
images without `alt`, targets under 24×24px, and text contrast below WCAG AA.

| Finding | Before | After |
| --- | --- | --- |
| Horizontal overflow at any width | none found | PASS, none |
| "How it works" timeline squeezed into 7 columns at 768px | found (visual) | FIXED, stacked below 1024px |
| Rescue: "Reserved" badge contrast 4.27:1, filter counts 3.74:1 | found | FIXED |
| Rescue: `h1` → `h3` heading skip | found | FIXED |
| Rescue: long listing names cut off | found at 768–1440 | FIXED, they wrap |
| Cart (empty): no `h1` | found | FIXED |
| Login: no `<main>` | found | FIXED |
| Text links 20px tall | found on 5 pages | FIXED, now 28px |
| Login: "low contrast" on the logo and heading | reported | KNOWN LIMITATION (false positive): light text sits on a dark photo, which the script can't see. Checked by eye. |
| Menu card titles under 24px tall | reported | KNOWN LIMITATION (false positive): the title button stretches over the whole card, so the real tap area is the full card |

## 3. Pages and features

| Area | Test | Result |
| --- | --- | --- |
| Home | Loads with live numbers | FIXED (was HTTP 500 → "Live numbers are unavailable") |
| Home | API completely unreachable | FIXED: error message and "Try again" instead of endless loading boxes |
| Home | Forecast has no sales history at all | FIXED: rest of page loads, forecast explains why it's empty (API test) |
| Home | "Order now" / "See today's rescue" go to the right pages | PASS |
| Menu | Category, vegetarian and low-waste filters; search; sort; filters kept in URL after refresh | PASS |
| Menu | Search with no matches → "Nothing matches that" + Clear filters | PASS |
| Menu | API down with no saved copy | PASS: "We couldn't load the menu" + Try again |
| Menu | Item with "3 left": + button stops at 3 | FIXED |
| Menu | After the last 3 are ordered → "Sold out today", no Add button | FIXED |
| Menu | Broken image URL falls back to a placeholder | PASS (by code review of `FoodImage`; not forced in the browser) |
| Product dialog | Opens with focus on Close, Tab stays inside (25 presses), Escape closes, focus returns to the item | PASS |
| Cart | Empty cart message + link to menu | PASS |
| Cart | Add 2 items, change quantity, remove, totals recalculated by server | PASS |
| Cart | Invalid coupon / weekend coupon on a Friday | FIXED: weekend code was accepted; now "only works on Saturdays and Sundays" |
| Cart | Pricing error while an older total is showing | FIXED: the error was hidden; now shown and checkout disabled |
| Checkout | Signed-out user is sent to login and back | PASS |
| Checkout | Invalid phone → message shown, focus moves to the field | FIXED (focus didn't move before) |
| Checkout | Triple-click "Place order" | FIXED: 3 orders sent → now 1 |
| Checkout | Order confirmation page with order code and items; refresh still works | PASS |
| Rescue | "How a rescue works", quantity, pickup window, best-before, who can reserve | FIXED (steps section added) |
| Rescue | Partner reserves → toast, numbers update | PASS |
| Rescue | Listing past its best-before | FIXED: shown as available for 17 days and reservable → hidden from board, reserve refused |
| Rescue | Nothing listed → explains when surplus is usually posted | PASS (code + text reviewed) |
| Rescue | Customer view explains only registered partners can reserve | PASS |
| Impact | Period switch (week/month/all), chart, partner list | PASS |
| Impact | Demo figures labelled as sample data | FIXED |
| Contact | Empty submit → three errors, focus on Name | FIXED (focus) |
| Contact | Valid submit is actually saved | FIXED: it was never sent anywhere |
| Contact | Staff can read messages; customers can't (403) | PASS (new) |
| About | Describes the café in plain language; links to menu and contact | FIXED (was project-only text) |
| Navigation | Contact reachable from the header on desktop and via "More" on phones | FIXED |
| Navigation | Direct URL / refresh on every route, unknown URL → 404 page | PASS (dev server and `vercel.json` rewrite) |
| Storage | Corrupted cart / cart line / menu cache in localStorage | FIXED: blank site or page crash → loads normally |
| Staff dashboard | Loads; forecast warns about old sales data; contact messages listed | PASS |

## 3b. Sign-in and roles

Tested in Chrome against the local API after the demo role switcher was removed.

| Test | Result |
| --- | --- |
| No "Demo", "Switch role" or seeded-account text anywhere on the home page or navbar | PASS |
| Old `GET /api/demo/accounts` (listed every sample account with its password) | FIXED: removed, now 404 |
| Empty sign-in → "Please enter your email address." / "Please enter your password.", focus on Email | PASS |
| Invalid email → specific message, no request sent | PASS |
| Wrong password and unknown email give the **same** message ("That email and password don't match.") | PASS |
| Keyboard only: Tab to Email, type, Tab to Password, Enter signs in | FIXED: "Forgot password?" used to sit between the two fields |
| Show/Hide password button toggles the field and `aria-pressed` | PASS |
| Refresh while signed in keeps the session | PASS |
| Sign out from the account menu clears the token and the navbar shows "Sign in" | PASS |
| Customer → `/dashboard` and `/partner`: "This page is for … accounts", no data shown; staff API with a customer token → 403 | PASS |
| Partner → `/dashboard`: refused; partner sign-in lands on `/partner` | PASS |
| Staff sign-in lands on `/dashboard` with the order list | PASS |
| Signed out → `/dashboard` → Sign in → returns to `/dashboard` | PASS |
| Signed out → `/profile` redirects to sign in | PASS |
| Account menus only list pages that exist for that role (customer: My orders, Account details; staff: Orders & kitchen, Rescue board; partner: My pickups, Available food) | PASS |
| Register: mismatched confirm password, password under 8 characters | PASS |
| Register succeeds and the new account is a CUSTOMER, even when `role: "STAFF"` is sent to the API directly | PASS |
| "Forgot password?" opens a page that carries over the email and prepares a WhatsApp/email message to the café | PASS |
| `/login` at 320, 375, 390, 768, 1024, 1440px: no overflow, labels on every input, one h1, one main | PASS |
| API test: customers and partners get 403 on staff endpoints (`/dashboard`, `/orders/today`, `/contact`, `/demo/reset`) | PASS (27/27 API checks) |

## 4. Keyboard

| Test | Result |
| --- | --- |
| First Tab shows "Skip to content"; focus order follows the page | PASS |
| Visible focus ring (2px caramel outline) on links, buttons and inputs | PASS (`docs/evidence/after/focus-ring-1280.png`) |
| Mobile "More" menu: opens with Enter, closes with Escape | PASS |
| Product dialog focus trap and return | PASS |
| Forms: errors linked with `aria-describedby`, focus moves to the first error | FIXED |

## 5. Browser console

After the fixes, no console errors or failed requests on any route across the full sweep and the flow tests (apart
from the requests I blocked on purpose to simulate the API being down).

## 6. Remaining limitations

- **Payment is simulated.** Nothing is charged, and card details are not collected.
- **Demo data is dated.** It is placed around the time you run `npm run seed`. On old data the rescue board is empty and the forecast is based on old sales (the site now says so instead of breaking).
- **Contact messages are stored, not emailed.** Staff read them on the dashboard.
- **Daily batch counts don't reset automatically.** Re-seeding resets them; a real café would reset them each morning.
- **No real-device or screen-reader testing** (see the top of this report).
- **Delivery** is accepted as an option, but there's no delivery area check or courier integration.
