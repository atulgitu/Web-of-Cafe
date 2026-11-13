// End-to-end API check against a real database. Re-seeds first, so only run it
// against a local/dev database:   npm run test:api
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { pool } from "../src/db/pool.js";
import { DEV_PASSWORD, seed } from "../src/db/seed.js";

await seed({ log: () => {} });
const server = createApp().listen(0);
const base = `http://localhost:${server.address().port}/api`;
let passed = 0;

async function call(method, path, { token, body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}
async function check(name, fn) {
  try {
    await fn();
    passed++;
    console.log(`  ✔ ${name}`);
  } catch (err) {
    console.log(`  ✘ ${name}\n    ${err.message}`);
    process.exitCode = 1;
  }
}
const login = async (email) => (await call("POST", "/auth/login", { body: { email, password: process.env.SAMPLE_ACCOUNT_PASSWORD || DEV_PASSWORD } })).body.token;

try {
  const customer = await login("aarav@coffeecinnamon.in");
  const staff = await login("rohan@coffeecinnamon.in");
  const partner = await login("priya@coffeecinnamon.in");
  const hope = await login("aditya@coffeecinnamon.in");

  await check("register always creates a CUSTOMER, even if a role is sent", async () => {
    const r = await call("POST", "/auth/register", { body: { name: "Test", email: "new@example.com", password: "longpassword", role: "STAFF" } });
    assert.equal(r.status, 201);
    assert.equal(r.body.user.role, "CUSTOMER");
    assert.equal(r.body.user.passwordHash, undefined);
  });
  await check("duplicate email and wrong password are rejected", async () => {
    assert.equal((await call("POST", "/auth/register", { body: { name: "T", email: "new@example.com", password: "longpassword" } })).status, 409);
    assert.equal((await call("POST", "/auth/login", { body: { email: "new@example.com", password: "nope" } })).status, 401);
  });
  await check("the old public demo-accounts endpoint is gone", async () => {
    assert.equal((await call("GET", "/demo/accounts")).status, 404);
  });
  await check("login errors don't reveal whether the email exists", async () => {
    const unknown = await call("POST", "/auth/login", { body: { email: "nobody@example.com", password: "whatever1" } });
    const wrong = await call("POST", "/auth/login", { body: { email: "aarav@coffeecinnamon.in", password: "whatever1" } });
    assert.equal(unknown.status, 401);
    assert.equal(wrong.status, 401);
    assert.equal(unknown.body.error, wrong.body.error);
  });
  await check("partners and customers can't use staff endpoints; customers can't use partner ones", async () => {
    for (const token of [customer, partner]) {
      assert.equal((await call("GET", "/dashboard", { token })).status, 403);
      assert.equal((await call("GET", "/orders/today", { token })).status, 403);
      assert.equal((await call("GET", "/contact", { token })).status, 403);
      assert.equal((await call("POST", "/demo/reset", { token })).status, 403);
    }
    assert.equal((await call("GET", "/partners/me", { token: customer })).status, 403);
  });
  await check("/auth/me needs a valid token", async () => {
    assert.equal((await call("GET", "/auth/me")).status, 401);
    assert.equal((await call("GET", "/auth/me", { token: "garbage" })).status, 401);
    assert.equal((await call("GET", "/auth/me", { token: customer })).body.user.role, "CUSTOMER");
  });
  await check("role checks: customers can't use staff or partner endpoints", async () => {
    assert.equal((await call("GET", "/dashboard", { token: customer })).status, 403);
    assert.equal((await call("POST", "/forecast/generate", { token: customer })).status, 403);
    assert.equal((await call("GET", "/partners/me", { token: staff })).status, 403);
  });

  let menu;
  await check("menu loads", async () => {
    menu = (await call("GET", "/menu")).body.items;
    assert.ok(menu.length > 50);
  });

  await check("quote ignores client prices and validates options", async () => {
    const latte = menu.find((m) => m.id === "c4");
    const r = await call("POST", "/orders/quote", { body: { lines: [{ menuItemId: "c4", size: "Large", quantity: 2, unitPrice: 1 }], couponCode: "STUDENT10", contribution: 50 } });
    const sub = (latte.price + 30) * 2;
    assert.equal(r.body.subtotal, sub);
    assert.equal(r.body.total, sub - Math.round(sub * 0.1) + Math.round((sub - Math.round(sub * 0.1)) * 0.05) + 50);
    assert.equal((await call("POST", "/orders/quote", { body: { lines: [{ menuItemId: "c4", addons: ["Gold"], quantity: 1 }] } })).status, 400);
  });

  let order;
  const impactBefore = (await call("GET", "/impact")).body.measured;
  await check("placing an order saves it, with the contribution", async () => {
    const r = await call("POST", "/orders", {
      token: customer,
      body: { lines: [{ menuItemId: "m1", quantity: 1 }], contribution: 50, customer: { name: "Aarav", phone: "9876543210" } },
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    order = r.body.order;
    assert.match(order.code, /^CC-\d+$/);
    assert.equal(order.contribution, 50);
    assert.equal(order.items[0].name, "Rajma Chawal Bowl");
  });
  await check("order history and contributions include it; others can't read it", async () => {
    const mine = (await call("GET", "/orders/my", { token: customer })).body.orders;
    assert.equal(mine[0].code, order.code);
    assert.equal((await call("GET", `/orders/${order.id}`, { token: hope })).status, 403);
    const c = (await call("GET", "/contributions/my", { token: customer })).body;
    assert.equal(c.contributions[0].orderCode, order.code);
    const after = (await call("GET", "/impact")).body.measured;
    assert.equal(after.contributionsAmount, impactBefore.contributionsAmount + 50);
  });
  await check("guest order: saved as pending, phone normalised, notes and pickup time kept", async () => {
    const pickupAt = new Date(Date.now() + 45 * 60000);
    const r = await call("POST", "/orders", {
      body: { lines: [{ menuItemId: "c1", quantity: 2 }], customer: { name: " Ravi ", phone: "098765-43210" }, pickupAt, notes: "Less sugar" },
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    assert.equal(r.body.order.status, "pending");
    assert.equal(r.body.order.userId, null);
    assert.equal(r.body.order.customerName, "Ravi");
    assert.equal(r.body.order.phone, "+91 98765 43210");
    assert.equal(r.body.order.notes, "Less sugar");
    assert.equal(new Date(r.body.order.pickupAt).getTime(), pickupAt.getTime());
    // a guest order can't be read back by id, even by another customer
    assert.equal((await call("GET", `/orders/${r.body.order.id}`)).status, 401);
    assert.equal((await call("GET", `/orders/${r.body.order.id}`, { token: customer })).status, 403);
  });
  await check("bad orders are rejected: phone, empty cart, delivery, past pickup time, unknown item", async () => {
    const ok = { lines: [{ menuItemId: "c1", quantity: 1 }], customer: { name: "A", phone: "9876543210" } };
    const bad = async (body) => (await call("POST", "/orders", { body })).status;
    assert.equal(await bad({ ...ok, customer: { name: "A", phone: "12345" } }), 400);
    assert.equal(await bad({ ...ok, customer: { name: "", phone: "9876543210" } }), 400);
    assert.equal(await bad({ ...ok, lines: [] }), 400);
    assert.equal(await bad({ ...ok, fulfilment: "delivery" }), 400);
    assert.equal(await bad({ ...ok, pickupAt: new Date(Date.now() - 60000) }), 400);
    assert.equal(await bad({ ...ok, lines: [{ menuItemId: "zz9", quantity: 1 }] }), 400);
    assert.equal(await bad({ ...ok, lines: [{ menuItemId: "c1", quantity: 0 }] }), 400);
  });
  await check("staff see open orders and can confirm one; customers can't", async () => {
    assert.equal((await call("GET", "/orders/today", { token: customer })).status, 403);
    const list = (await call("GET", "/orders/today", { token: staff })).body.orders;
    const pending = list.find((o) => o.status === "pending");
    assert.ok(pending, "a pending order is listed");
    const r = await call("PATCH", `/orders/${pending.id}/status`, { token: staff, body: { status: "confirmed" } });
    assert.equal(r.body.order.status, "confirmed");
  });

  let listing;
  await check("staff can create and edit a rescue listing", async () => {
    const start = new Date(Date.now() + 15 * 60000);
    const r = await call("POST", "/rescue", {
      token: staff,
      body: { item: "Club Sandwiches", category: "Sandwiches", portions: 6, kgPerPortion: 0.22, veg: false, dietary: ["Contains chicken"],
        pickupStart: start, pickupEnd: new Date(start.getTime() + 90 * 60000), bestBefore: new Date(start.getTime() + 150 * 60000) },
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    listing = r.body.listing;
    const e = await call("PATCH", `/rescue/${listing.id}`, { token: staff, body: { portions: 7 } });
    assert.equal(e.body.listing.portions, 7);
    assert.equal((await call("POST", "/rescue", { token: partner, body: {} })).status, 403);
  });
  await check("matching excludes the vegetarian-only partner for chicken", async () => {
    const m = (await call("GET", `/rescue/${listing.id}/matches`, { token: staff })).body.matches;
    const hopeMatch = m.find((x) => x.partnerId === "p2");
    assert.equal(hopeMatch.eligible, false);
    assert.equal(m[0].eligible || m.every((x) => !x.eligible), true);
  });
  await check("veg-only partner can't reserve non-veg food", async () => {
    assert.equal((await call("POST", `/rescue/${listing.id}/reserve`, { token: hope })).status, 400);
  });
  await check("partner reserves, another partner can't complete it, then it's completed", async () => {
    const r = await call("POST", `/rescue/${listing.id}/reserve`, { token: partner });
    assert.equal(r.body.listing.status, "reserved");
    assert.equal((await call("POST", `/rescue/${listing.id}/reserve`, { token: partner })).status, 409);
    assert.equal((await call("POST", `/rescue/${listing.id}/complete`, { token: hope })).status, 403);
    const before = (await call("GET", "/impact?period=week")).body.measured;
    const c = await call("POST", `/rescue/${listing.id}/complete`, { token: partner });
    assert.equal(c.body.listing.status, "collected");
    const after = (await call("GET", "/impact?period=week")).body.measured;
    assert.equal(after.mealsRescued, before.mealsRescued + 7);
    assert.equal(after.pickups, before.pickups + 1);
    const history = (await call("GET", "/partners/me", { token: partner })).body.history;
    assert.equal(history[0].listingId, listing.id);
  });
  await check("staff can assign a pickup to a partner and release it", async () => {
    const board = (await call("GET", "/rescue")).body;
    const open = board.listings.find((l) => l.status === "available" && l.veg);
    const r = await call("POST", `/rescue/${open.id}/reserve`, { token: staff, body: { partnerId: "p4" } });
    assert.equal(r.body.listing.partnerId, "p4");
    const rel = await call("POST", `/rescue/${open.id}/release`, { token: staff });
    assert.equal(rel.body.listing.status, "available");
  });
  await check("forecast is stable and regenerates on request", async () => {
    const a = (await call("GET", "/forecast")).body;
    const b = (await call("POST", "/forecast/generate", { token: staff })).body;
    assert.equal(a.items.length, 4);
    assert.deepEqual(a.items.map((i) => i.predicted), b.items.map((i) => i.predicted));
    assert.ok(a.items.every((i) => i.explanation.length > 20));
  });
  await check("overview, dashboard and activity respond", async () => {
    const o = (await call("GET", "/overview")).body;
    assert.ok(o.ordersToday >= 1);
    assert.ok(o.impact.estimates.co2eKg > 0);
    const d = (await call("GET", "/dashboard", { token: staff })).body;
    assert.ok(d.orders.revenue > 0);
    assert.ok((await call("GET", "/impact/activity")).body.activity.length > 0);
  });
  await check("the weekend coupon only works on Saturday and Sunday", async () => {
    const r = (await call("POST", "/orders/quote", { body: { lines: [{ menuItemId: "c1", quantity: 1 }], couponCode: "CINNAMON20" } })).body;
    const isWeekend = [0, 6].includes(new Date().getDay());
    assert.equal(r.discount > 0, isWeekend);
    assert.equal(Boolean(r.couponError), !isWeekend);
  });
  await check("limited batches: can't order more than is left, and ordering uses them up", async () => {
    const croissant = menu.find((m) => m.id === "d5"); // seeded with 3 left
    const tooMany = await call("POST", "/orders/quote", { body: { lines: [{ menuItemId: "d5", quantity: croissant.batch.left + 1 }] } });
    assert.equal(tooMany.status, 400);
    assert.match(tooMany.body.error, /Only 3/);
    const body = { lines: [{ menuItemId: "d5", quantity: croissant.batch.left }], customer: { name: "Aarav", phone: "9876543210" } };
    assert.equal((await call("POST", "/orders", { token: customer, body })).status, 201);
    assert.equal((await call("GET", "/menu/d5")).body.item.batch.left, 0);
    const again = await call("POST", "/orders", { token: customer, body: { ...body, lines: [{ menuItemId: "d5", quantity: 1 }] } });
    assert.equal(again.status, 400);
    assert.match(again.body.error, /sold out/);
  });
  await check("food past its best-before can't be reserved and leaves the board summary", async () => {
    const past = (minutes) => new Date(Date.now() - minutes * 60000);
    const r = await call("POST", "/rescue", {
      token: staff,
      body: { item: "Veg Pulao", category: "Meals", portions: 5, kgPerPortion: 0.3, veg: true, pickupStart: past(180), pickupEnd: past(90), bestBefore: past(30) },
    });
    assert.equal(r.status, 201, JSON.stringify(r.body));
    const before = (await call("GET", "/rescue")).body.summary.availablePortions;
    const reserve = await call("POST", `/rescue/${r.body.listing.id}/reserve`, { token: partner });
    assert.equal(reserve.status, 409);
    assert.match(reserve.body.error, /best-before/);
    // the expired 5 portions were never counted as available
    assert.equal(before, (await call("GET", "/rescue")).body.listings.filter((l) => l.status === "available" && new Date(l.bestBefore) > new Date()).reduce((s, l) => s + l.portions, 0));
  });
  await check("contact form: validates, saves, and only staff can read messages", async () => {
    const bad = await call("POST", "/contact", { body: { name: "", email: "nope", topic: "Something else", message: "hi" } });
    assert.equal(bad.status, 400);
    assert.ok(bad.body.fields.name && bad.body.fields.email && bad.body.fields.message);
    const ok = await call("POST", "/contact", { body: { name: "Meera", email: "meera@example.com", topic: "Catering or bulk orders", message: "Do you cater for 40 people?" } });
    assert.equal(ok.status, 201);
    assert.equal((await call("GET", "/contact")).status, 401);
    assert.equal((await call("GET", "/contact", { token: customer })).status, 403);
    assert.equal((await call("GET", "/contact", { token: staff })).body.messages[0].name, "Meera");
  });
  await check("the homepage still loads when there is no sales history to forecast from", async () => {
    await pool.query("DELETE FROM forecasts");
    await pool.query("DELETE FROM demand_history");
    const f = await call("GET", "/forecast");
    assert.equal(f.status, 503);
    assert.match(f.body.error, /sales history/);
    const o = await call("GET", "/overview");
    assert.equal(o.status, 200);
    assert.equal(o.body.forecast, null);
    assert.ok(o.body.impact.measured.mealsRescued > 0); // the rest of the page is intact
  });
  await check("unknown routes and bad JSON give clean errors", async () => {
    assert.equal((await call("GET", "/nope")).status, 404);
    const r = await fetch(base + "/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{bad" });
    assert.equal(r.status, 400);
  });
} finally {
  console.log(`\n${passed} checks passed${process.exitCode ? ", some FAILED" : ""}.`);
  server.close();
  await seed({ log: () => {} }); // leave a fresh demo behind
  await pool.end();
}
