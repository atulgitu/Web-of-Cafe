# Coffee Cinnamon — Critique of the AI-assisted build

**Module:** CS-1 | The Café Website: Build, Launch, and Critique

The first version of Coffee Cinnamon was built with a lot of help from AI tools. It looked finished: consistent colours,
real-looking photos, a working cart and a full backend. But "looks finished" is exactly the problem with AI-generated work,
so before changing anything I tested it the way a customer, a café owner and a screen-reader user would.

Every issue below was **reproduced before it was fixed**. Before/after screenshots are in `docs/evidence/`, and
most fixes are now covered by automated tests, so they can't silently come back.

---

### Issue 1 — The homepage's "live numbers" were broken by a forecast that couldn't handle old data

**Original problem:**
The homepage showed *"Live numbers are unavailable right now — Something went wrong on our side. Please try again."*
Every live section (today's orders, the rescue list, the timeline, the forecast and the impact totals) was stuck on
grey loading boxes.

**Where it occurred:** Home page → `GET /api/overview` → `server/src/services/forecastRunner.js`

**Why it matters:** The homepage is the first thing the café owner and the examiner see. One broken feature took every
live number on the page down with it, and "try again" could never work, because the error wasn't temporary.

**How it was discovered:** I called the API directly. `/api/overview` returned HTTP 500, and the debug message said:
`Need four previous Saturdays of Coffee sales to forecast; found 3.` The demo sales data had been seeded on 27 October.
The forecast only looked back 35 days, so by 13 November one of the four Saturdays it needs had dropped out of that
window. The forecast then threw an error, and because the homepage loaded everything in one `Promise.all`, that single
error failed the whole response.

**Fix implemented:**
- Root cause: the forecast now looks back 70 days instead of 35, so a gap in sales entry doesn't break it.
- If there genuinely isn't enough history, the server returns a clear 503 ("not enough recent sales history") instead of a 500 crash.
- The homepage request treats the forecast as optional. If it's unavailable, everything else still loads and the forecast section explains why it's empty.
- The forecast now reports the last date it has sales for, and the page warns when that data is out of date.
- I did **not** hide the error or put fake numbers in. If the server really is down, the page now says so and offers a "Try again" button instead of loading forever.

**Result:** `/api/overview` returns 200 on the same stale database that broke it. The homepage shows real numbers, with
a note: *"Based on sales recorded up to 26 Oct — no newer sales data has been entered."* A new API test deletes all sales
history and checks that the homepage still loads.

---

### Issue 2 — Bad data in the browser's storage crashed the whole website

**Original problem:** The cart and an offline copy of the menu are saved in `localStorage`. If that saved data was in
an unexpected shape, the app didn't recover:
- a cart saved as an object instead of a list → **completely blank white page on every route**
- a cart line with a missing add-ons list → the Cart page crashed
- a corrupted menu cache → the Menu page crashed

**Where it occurred:** `src/context/CartContext.jsx`, `src/hooks/useMenu.js`, `src/pages/Cart.jsx`

**Why it matters:** Saved data goes bad in real life: an older version of the site, a half-written save, browser
extensions. The AI code assumed whatever it read back would always be perfect. A customer who hits this can't fix it,
because even reloading shows a white screen.

**How it was discovered:** Edge-case testing. I wrote deliberately bad values into `localStorage` with a script, then
reloaded. The console showed `TypeError: lines.reduce is not a function` (blank page) and `line.addons is not iterable`.

**Fix implemented:** The cart is cleaned when it's read: anything that isn't a list becomes an empty cart, broken lines
are dropped, and quantities are forced to whole numbers between 1 and 50 (the same limit the server uses). The menu
cache is ignored unless it's a list.

**Result:** All three bad-data cases now load normally. You get an empty cart, a working cart, and the live menu, with no
console errors.

---

### Issue 3 — Clicking "Place order" quickly created duplicate orders

**Original problem:** Clicking *Place order* three times quickly sent **three** order requests to the server.

**Where it occurred:** `src/pages/Checkout.jsx`

**Why it matters:** That means duplicate orders and, in a real shop, double charges. Impatient double-clicking is very
common, especially on slow mobile connections.

**How it was discovered:** In my automated checkout test I counted the `POST /api/orders` requests made after a fast
triple click. There were 3. The AI code did disable the button while placing the order, but React only applies that
after it re-renders, so clicks within the same moment all got through.

**Fix implemented:** A `useRef` flag is set synchronously on the first click and checked at the start of `placeOrder`.
It is cleared again if the order fails, so the customer can retry.

**Result:** The same triple click now sends exactly 1 request.

---

### Issue 4 — Unrealistic rules: "3 left" wasn't enforced, a weekend code worked on weekdays, and expired food could still be reserved

**Original problem:** Three places where the site said one thing and did another:
1. The croissant card said **"3 left today"**, but the server accepted an order for **50**.
2. The Offers page says **CINNAMON20** is for Saturdays and Sundays. On a Friday it applied the 20% discount anyway.
3. A Banana Bread rescue listing from 27 October, best-before 27 October, was still on the board as **Available** 17
   days later, and a partner account could reserve it.

**Where it occurred:** `server/src/services/pricingService.js`, `orderService.js`, `rescueService.js`, `models/rescueModel.js`

**Why it matters:** This is classic AI output. The text looks believable, but the logic behind it was never written.
For a café, overselling a batch means disappointed customers. For food rescue, offering expired food to a shelter is a
food-safety problem and would destroy the partners' trust.

**How it was discovered:** I compared what the pages *claim* with what the API *does*, using `curl`: a quote for
50 croissants, CINNAMON20 on a Friday, and a reservation of the 17-day-old listing. All three succeeded when they shouldn't have.

**Fix implemented:**
- Stock: the server rejects orders above the batch count ("Only 3 × Butter Croissant left today"), and placing an order reduces the count inside the same database transaction, so two people can't both buy the last one. The menu shows **"Sold out today"**, and the + button stops at the limit.
- Coupon: CINNAMON20 is marked weekend-only and rejected on weekdays with a clear message.
- Rescue: the board only shows earlier listings that are still before their best-before time. The server refuses to reserve expired food, and the card says *"Past its best-before time, so it can no longer be reserved."*

**Result:** All three are covered by unit and API tests. In the browser I ordered the last 3 croissants, and the card
then showed "Sold out today" with no Add button.

---

### Issue 5 — "How it works" timeline was squeezed into seven tiny columns on tablets

**Original problem:** The *One kitchen. Two outcomes.* timeline switched from vertical to a 7-column row at 768px.
On a tablet (768–1023px) each step was about 85px wide, so words like "Coffee, breakfast, a rajma bowl at lunch"
broke onto 6–8 lines and the steps were hard to follow.

**Where it occurred:** `src/pages/Home.jsx` (the `flow` section)

**Why it matters:** This section is the clearest explanation of what makes the café different. On a tablet it was the
least readable part of the page.

**How it was discovered:** Screenshots at 320, 375, 390, 768, 1024 and 1440px (`docs/evidence/before/home-768.png`).

**Fix implemented:** The vertical timeline is now used up to 1023px, with a sensible maximum width, and the horizontal
version only appears at 1024px and wider. This is a different layout for small screens, not the desktop one squashed down.

**Result:** At every tested width the steps read as full sentences, with no horizontal scrolling
(`docs/evidence/after/home-768.png`).

---

### Issue 6 — The contact form pretended to send messages

**Original problem:** Filling in the contact form showed *"Thanks — we usually reply within a day."*, but **nothing was
sent anywhere**. No network request was made and the message was simply discarded. Also, after a failed submit the
keyboard focus stayed on the button, and on phones Contact and About were only reachable from the footer.

**Where it occurred:** `src/pages/Contact.jsx`, `src/components/Navbar.jsx`

**Why it matters:** It's dishonest. A customer asking about catering would wait for a reply that could never come. The
brief specifically asks for working contact functionality.

**How it was discovered:** I watched the network requests while submitting. There were none. Reading the code confirmed
the success message was set without any `fetch`.

**Fix implemented:** A real `POST /api/contact` endpoint with validation, rate limiting and a database table. Staff can
read the messages on the kitchen dashboard. The success message is honest about this being a prototype: it's saved,
not emailed. On a failure, the form keeps what you typed and shows an error. Focus moves to the first invalid field.
I added a "Contact" link to the desktop navigation and a "More" menu to the mobile top bar (About, Contact, Offers,
Impact) instead of crowding the tab bar.

**Result:** Messages are actually stored (an API test checks this, and that only staff can read them). The form can
also be used with the keyboard alone.

---

### Issue 7 — Smaller accessibility problems found by automated checks

**Original problem / where:**
- The "Reserved" badge (Rescue page) had a contrast ratio of **4.27:1**, below the WCAG AA minimum of 4.5:1. The filter counts used 70% opacity text at **3.74:1**.
- The Rescue page jumped from `h1` straight to `h3`, so screen-reader heading navigation skipped a level.
- The empty Cart page had **no `h1`** at all. The Login page had **no `<main>` landmark**, so "skip to content" had nowhere to go.
- Long rescue listing names were cut off ("Butter & Chocolate Croiss…").
- Several text links were only 20px tall, below the 24px minimum tap target in WCAG 2.2.
- Prices or totals that failed to load were shown as nothing at all, or as an endless skeleton.

**How it was discovered:** I wrote a small script that loads every page at six widths and checks horizontal overflow,
heading order, missing labels and alt text, landmarks, target sizes and colour contrast (see TESTING_REPORT.md).

**Fix implemented:** Darker text colour on the badge and full-opacity counts; a "How a rescue works" `h2` and a
"Today's listings" `h2` above the cards; a visually hidden `h1` on the empty cart; `<main>` on Login; names wrap instead
of being cut off; 4px of padding on text links; error states instead of endless loading.

**Result:** The after-sweep reports no contrast, heading, landmark, label or overflow problems across 12 routes × 6 widths.

---

### Issue 8 — Demo numbers looked like real achievements

**Original problem:** The homepage said *"What's been rescued so far: 642 meals, 124 kg"* in large type. The only sign
that this was demo data was one small footer line.

**Where:** `src/pages/Home.jsx`, `src/pages/Impact.jsx`

**Why it matters:** Presenting invented impact as real is misleading, and the brief explicitly warns against unrealistic data.

**Fix:** A clearly visible **"Sample data"** label next to the figures on the homepage and the Impact page, explaining
that they are calculated from demo records, not a real café's history. The numbers themselves are unchanged: they are
genuinely calculated from the database, and they go up when you complete a pickup in the demo.

---

### Issue 9 — The "demo role switcher" published the staff password

**Original problem:** The navbar had a "Demo · Switch role" menu that signed you in as a customer, café staff member
or community partner with one click. To do that, the browser called a public endpoint, `GET /api/demo/accounts`,
which returned every sample account **and the shared password**.

**Where it occurred:** `src/components/DemoSwitcher.jsx`, `server/src/controllers/demoController.js`

**Why it matters:** Anyone could open that URL, read the password and sign in as café staff, which on the live site
means seeing real customers' names and phone numbers and changing their orders. The server's role checks were
correct, but they didn't help once the staff password was public. It also made the site feel like a demo.

**How it was discovered:** Reading the network requests made on page load while preparing the site for deployment.

**Fix implemented:** I removed the switcher and the endpoint. Sign-in is now a normal email and password form, and the
role comes only from the database. Public sign-up always creates a customer, even if `role: "STAFF"` is sent to the
API directly. In production the sample accounts' passwords come from environment variables, not from Git.

**Result:** `/api/demo/accounts` returns 404. Customers and partners get 403 on every staff endpoint. Tested in
TESTING_REPORT.md section 3b.

---

## Strongest five for the presentation

1. **Live numbers error** (Issue 1): a real root cause, found by tracing the request. A good story about not just hiding errors.
2. **Corrupted storage → blank site** (Issue 2): a simple test with a dramatic result.
3. **Duplicate orders on double click** (Issue 3): a real-money bug that the AI's "disabled button" looked like it handled.
4. **Unenforced business rules** (Issue 4): the text promised things the code never did.
5. **Tablet timeline layout** (Issue 5): a clear before/after screenshot.

Issues 6–8 are good backups. Issue 6 (the fake contact form) is the best one if you'd rather show a dishonest-UI example.

## What I learned about AI-generated code

The AI was good at the *visible* layer: layout, colours, component structure, even comments. Its mistakes were all in
places you only find by **using** the site in unexpected ways: time passing, bad saved data, fast clicks, and claims in
the copy that the code never backed up. None of these bugs showed up in a normal "click around and it works" demo.
