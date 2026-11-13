// Unit tests for the pure business logic. No database needed:  npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { forecastCategory } from "../src/services/forecastService.js";
import { scorePartner, rankPartners } from "../src/services/matchingService.js";
import { priceOrder } from "../src/services/pricingService.js";

// --- Pricing ---
const menu = new Map([
  ["c1", { id: "c1", name: "Filter Coffee", price: 120, available: true, sizes: [{ label: "Regular", extra: 0 }, { label: "Large", extra: 30 }], addons: [{ label: "Oat milk", extra: 30 }] }],
]);

test("pricing uses menu prices, not anything from the client", () => {
  const q = priceOrder({ lines: [{ menuItemId: "c1", size: "Large", addons: ["Oat milk"], quantity: 2, unitPrice: 1 }] }, menu);
  assert.equal(q.lines[0].unitPrice, 180);
  assert.equal(q.subtotal, 360);
  assert.equal(q.tax, 18);
  assert.equal(q.total, 378);
});

test("coupons, tax and contribution combine correctly", () => {
  const q = priceOrder({ lines: [{ menuItemId: "c1", quantity: 5 }], couponCode: " student10 ", contribution: 50 }, menu);
  assert.equal(q.subtotal, 600);
  assert.equal(q.discount, 60);
  assert.equal(q.tax, 27); // 5% of 540
  assert.equal(q.total, 600 - 60 + 27 + 50);
});

test("unknown coupon is reported, not silently applied", () => {
  const q = priceOrder({ lines: [{ menuItemId: "c1", quantity: 1 }], couponCode: "FREE100" }, menu);
  assert.equal(q.discount, 0);
  assert.match(q.couponError, /isn't valid/);
});

test("the weekend coupon is refused on a weekday and accepted on a Saturday", () => {
  const order = { lines: [{ menuItemId: "c1", quantity: 1 }], couponCode: "CINNAMON20" };
  const friday = priceOrder(order, menu, new Date(2026, 10, 13));
  assert.equal(friday.discount, 0);
  assert.match(friday.couponError, /Saturdays and Sundays/);
  assert.equal(priceOrder(order, menu, new Date(2026, 10, 14)).discount, 24);
});

test("limited-batch items can't be ordered beyond what's left", () => {
  const withBatch = new Map([["d5", { id: "d5", name: "Butter Croissant", price: 130, available: true, sizes: [], addons: [], batch: { left: 3 } }]]);
  assert.equal(priceOrder({ lines: [{ menuItemId: "d5", quantity: 3 }] }, withBatch).subtotal, 390);
  assert.throws(() => priceOrder({ lines: [{ menuItemId: "d5", quantity: 4 }] }, withBatch), /Only 3/);
  // two cart lines for the same item are added together
  assert.throws(() => priceOrder({ lines: [{ menuItemId: "d5", quantity: 2 }, { menuItemId: "d5", quantity: 2 }] }, withBatch), /Only 3/);
  withBatch.get("d5").batch.left = 0;
  assert.throws(() => priceOrder({ lines: [{ menuItemId: "d5", quantity: 1 }] }, withBatch), /sold out/);
});

test("unknown add-on is rejected", () => {
  assert.throws(() => priceOrder({ lines: [{ menuItemId: "c1", addons: ["Gold flakes"], quantity: 1 }] }, menu), /isn't an option/);
});

// --- Forecast ---
const day = (n) => new Date(2026, 9, n); // October 2026, local time
function historyFor(values) {
  // 28 days, Wed 30 Sep → Tue 27 Oct; the target is Wed 28 Oct. Wednesdays get `values`, other days 50.
  const rows = [];
  let w = 0;
  for (let i = 0; i < 28; i++) {
    const date = new Date(2026, 8, 30 + i);
    rows.push({ date, sold: date.getDay() === 3 ? values[w++] : 50, prepared: 60 });
  }
  return rows;
}

test("forecast is deterministic and weights recent weeks more", () => {
  const cat = { id: "x", label: "Meals", unit: "bowls", madeToOrder: false };
  const history = historyFor([30, 32, 34, 36]);
  const a = forecastCategory(cat, history, day(28), "Wednesday");
  const b = forecastCategory(cat, history, day(28), "Wednesday");
  assert.deepEqual(a, b);
  // weighted = 30×.1 + 32×.2 + 34×.3 + 36×.4 = 34; trend 1 (flat other days) → 34
  assert.equal(a.predicted, 34);
  assert.ok(a.low < a.predicted && a.high > a.predicted);
  assert.ok(a.recommendedPrep > a.predicted);
});

test("forecast still works when the newest sales data is two weeks old", () => {
  const cat = { id: "x", label: "Meals", unit: "bowls", madeToOrder: false };
  // Same history, but the target Wednesday is 14 days after the data ends.
  const f = forecastCategory(cat, historyFor([30, 32, 34, 36]), new Date(2026, 10, 11), "Wednesday");
  assert.equal(f.predicted, 34);
});

test("forecast refuses to guess without four same-weekday values", () => {
  const cat = { id: "x", label: "Meals", unit: "bowls", madeToOrder: false };
  assert.throws(() => forecastCategory(cat, historyFor([30, 32, 34, 36]).slice(10), day(28), "Wednesday"), /four previous/);
});

// --- Matching ---
const at = (h, m = 0) => new Date(2026, 9, 27, h, m);
const listing = { portions: 8, veg: false, pickupStart: at(19), pickupEnd: at(20, 30), bestBefore: at(21, 30) };
const partnerA = { id: "a", name: "A", distanceKm: 2, needsPerDay: 20, capacity: 30, windowStart: 19 * 60, windowEnd: 21 * 60, vegOnly: false };
const vegOnly = { ...partnerA, id: "v", name: "V", vegOnly: true };
const late = { ...partnerA, id: "l", name: "L", windowStart: 22 * 60, windowEnd: 23 * 60 };

test("matching never sends non-veg food to a vegetarian-only partner", () => {
  const r = scorePartner(listing, vegOnly, { now: at(18, 50) });
  assert.equal(r.eligible, false);
  assert.match(r.blockers[0], /Vegetarian/);
});

test("matching excludes partners who can't collect in time", () => {
  assert.equal(scorePartner(listing, late, { now: at(18, 50) }).eligible, false);
});

test("matching ranks eligible partners first, with reasons", () => {
  const ranked = rankPartners(listing, [vegOnly, late, partnerA], at(18, 50), new Map());
  assert.equal(ranked[0].partnerId, "a");
  assert.ok(ranked[0].score > 0 && ranked[0].score <= 100);
  assert.ok(ranked[0].reasons.some((r) => r.includes("km away")));
});
