// Seeds a coherent demo day. Everything is deterministic (fixed data and a fixed
// pseudo-random seed), and times are placed relative to *now*, so running it at
// any time of day gives a believable "today" with the same numbers.
//
//   npm run seed     wipes all tables and re-creates the demo
import bcrypt from "bcryptjs";
import { fileURLToPath } from "node:url";
import { pool, transaction } from "./pool.js";
import { migrate } from "./migrate.js";
import { menuItems as menuSeed } from "./seed-data/menu.js";
import * as demo from "./seed-data/demo.js";
import { insertContribution } from "../models/contributionModel.js";
import { insertEvent } from "../models/impactModel.js";
import { insertOrder } from "../models/orderModel.js";
import { createPickup } from "../models/pickupModel.js";
import { insertListing } from "../models/rescueModel.js";
import { createUser } from "../models/userModel.js";
import { CAFE_LOCATION } from "../services/constants.js";
import { generateForecast } from "../services/forecastRunner.js";
import { priceOrder } from "../services/pricingService.js";
import { addDays, addMinutes, isoDate, startOfDay, startOfWeek } from "../utils/time.js";

export const { DEMO_ACCOUNTS, DEMO_PASSWORD } = demo;

// Small deterministic PRNG (mulberry32) so "random-looking" demo data is identical every run.
function prng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// "Oat milk (+₹30)" → { label: "Oat milk", extra: 30 }. Large/Full sizes cost ₹30 more.
function option(text) {
  const match = text.match(/^(.*?)\s*\(\+₹(\d+)\)$/);
  if (match) return { label: match[1], extra: Number(match[2]) };
  return { label: text, extra: text === "Large" || text === "Full" ? 30 : 0 };
}

const TABLES = ["impact_events", "pickups", "rescue_listings", "contributions", "order_items", "orders", "forecasts", "demand_history", "users", "menu_items", "partners"];

export async function seed({ log = console.log, now = new Date() } = {}) {
  await migrate({ log: () => {} });
  const today = startOfDay(now);
  const rand = prng(20261027);
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  // On the live site the staff account sees real customers' names and phone numbers,
  // so it gets its own password from STAFF_PASSWORD instead of the public demo one.
  const staffHash = process.env.STAFF_PASSWORD ? await bcrypt.hash(process.env.STAFF_PASSWORD, 10) : passwordHash;
  const menu = menuSeed.map((m) => ({ ...m, sizes: m.sizes.map(option), addons: m.addons.map(option) }));
  const menuById = new Map(menu.map((m) => [m.id, { ...m, available: true }]));

  await transaction(async (db) => {
    await db.query(`TRUNCATE ${TABLES.join(", ")} RESTART IDENTITY CASCADE`);

    for (const p of demo.partners) {
      await db.query(
        `INSERT INTO partners (id, name, type, area, distance_km, needs_per_day, capacity, window_start, window_end, veg_only, contact, note)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [p.id, p.name, p.type, p.area, p.distance_km, p.needs_per_day, p.capacity, p.window_start, p.window_end, p.veg_only, p.contact, p.note]
      );
    }

    for (const m of menu) {
      await db.query(
        `INSERT INTO menu_items (id, name, category, description, price, veg, rating, popularity, image, sizes, addons, tags, low_waste_note, batch_note, batch_left)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
        [m.id, m.name, m.category, m.description, m.price, m.veg, m.rating, m.popularity, m.image, JSON.stringify(m.sizes),
          JSON.stringify(m.addons), m.tags, m.lowWasteNote, m.batch?.note ?? null, m.batch?.left ?? null]
      );
    }

    const users = {};
    for (const a of demo.DEMO_ACCOUNTS) {
      users[a.role + (a.partner_id || "")] = await createUser({ ...a, passwordHash: a.role === "STAFF" ? staffHash : passwordHash, partnerId: a.partner_id }, db);
    }
    const background = [];
    for (const [i, name] of demo.backgroundCustomers.entries()) {
      background.push(await createUser({ name, email: `guest${i + 1}@coffeecinnamon.in`, passwordHash }, db));
    }

    // --- Demand history: the 28 days before today ---
    for (let daysAgo = 28; daysAgo >= 1; daysAgo--) {
      const date = addDays(today, -daysAgo);
      const week = 3 - Math.floor((daysAgo - 1) / 7);
      for (const [category, d] of Object.entries(demo.demand)) {
        await db.query("INSERT INTO demand_history (date, category, sold, prepared) VALUES ($1,$2,$3,$4)", [
          isoDate(date), category, d.sold[week][date.getDay()], d.prepared ? d.prepared[date.getDay()] : null,
        ]);
      }
    }

    // --- Past rescues: split each week's total into individual pickups ---
    const thisWeek = startOfWeek(now);
    let itemIndex = 0;
    for (const w of demo.pastWeeks) {
      const weekStart = addDays(thisWeek, -7 * w.weeksAgo);
      for (let j = 0; j < w.pickups; j++) {
        const portions = Math.floor(w.meals / w.pickups) + (j < w.meals % w.pickups ? 1 : 0);
        const surplus = demo.surplusItems[itemIndex++ % demo.surplusItems.length];
        const eligible = demo.partners.filter((p) => surplus.veg || !p.veg_only);
        const partner = eligible[(itemIndex + j) % eligible.length];
        const listedAt = addMinutes(addDays(weekStart, (j * 2) % 7), j % 2 ? 18 * 60 + 20 : 14 * 60 + 40);
        await pastRescue(db, { surplus, portions, partner, listedAt });
      }
    }
    // Earlier days of the current week, so "this week" isn't empty on a Tuesday.
    for (let d = 0; addDays(thisWeek, d) < today; d++) {
      const surplus = demo.surplusItems[(d * 3) % demo.surplusItems.length];
      await pastRescue(db, { surplus, portions: 9 + ((d * 5) % 6), partner: demo.partners[d % 2], listedAt: addMinutes(addDays(thisWeek, d), 18 * 60) });
    }

    // --- Past contributions (before online ordering) ---
    for (let i = 0; i < demo.PAST_CONTRIBUTION_COUNT; i++) {
      const at = addMinutes(addDays(thisWeek, -84 + Math.floor((i * 84) / demo.PAST_CONTRIBUTION_COUNT)), 9 * 60 + ((i * 37) % 600));
      await insertContribution({ amount: demo.pastContributionAmounts[i % demo.pastContributionAmounts.length], createdAt: at }, db);
    }

    // --- Orders: the demo customer's history, then today's orders up to now ---
    const customer = users.CUSTOMER;
    const pastOrders = [
      { daysAgo: 5, lines: [{ menuItemId: "c1", quantity: 1 }, { menuItemId: "d1", quantity: 1 }], contribution: 20 },
      { daysAgo: 13, lines: [{ menuItemId: "c4", quantity: 1 }, { menuItemId: "m1", quantity: 1 }], contribution: 50 },
    ];
    for (const o of pastOrders) {
      await seedOrder(db, { user: customer, lines: o.lines, contribution: o.contribution, at: addMinutes(addDays(today, -o.daysAgo), 13 * 60 + 10), status: "completed" });
    }

    const popular = menu.filter((m) => m.popularity >= 70);
    let at = addMinutes(today, 7 * 60 + 40);
    for (let n = 0; at < now && n < 120; n++) {
      const lines = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => ({
        menuItemId: popular[Math.floor(rand() * popular.length)].id,
        quantity: 1 + (rand() < 0.2 ? 1 : 0),
      }));
      const user = background[n % background.length];
      await seedOrder(db, { user, lines, contribution: n % 7 === 3 ? 20 : 0, at, status: addMinutes(at, 30) < now ? "completed" : "preparing" });
      at = addMinutes(at, 6 + Math.floor(rand() * 9));
    }

    // --- Today's rescue board ---
    const minutesAgo = (m) => addMinutes(now, -m);
    const later = (m) => addMinutes(now, m);
    const [sandwich, croissant, rajma, , wraps] = demo.surplusItems;

    // Collected after lunch.
    const lunchListing = await listing(db, { surplus: wraps, portions: 8, prepared: "Made for lunch", createdAt: minutesAgo(235), start: minutesAgo(230), end: minutesAgo(170), bestBefore: minutesAgo(120) });
    await insertEvent({ type: "listing_created", listingId: lunchListing, portions: 8, message: "8 × paneer tikka wraps marked as surplus after the lunch rush", createdAt: minutesAgo(235) }, db);
    await reserveAndMaybeComplete(db, { listingId: lunchListing, partner: demo.partners[1], portions: 8, kg: 8 * wraps.kg, item: wraps.item, reservedAt: minutesAgo(220), completedAt: minutesAgo(190) });

    // Reserved for this evening.
    const croissantListing = await listing(db, { surplus: croissant, portions: 10, prepared: "Baked this morning", createdAt: minutesAgo(45), start: later(40), end: later(130), bestBefore: addMinutes(addDays(today, 1), 10 * 60) });
    await insertEvent({ type: "listing_created", listingId: croissantListing, portions: 10, message: "10 × butter & chocolate croissants marked as surplus", createdAt: minutesAgo(45) }, db);
    await reserveAndMaybeComplete(db, { listingId: croissantListing, partner: demo.partners[0], portions: 10, kg: 10 * croissant.kg, item: croissant.item, reservedAt: minutesAgo(30) });

    // Still available.
    const rajmaListing = await listing(db, { surplus: rajma, portions: 4, prepared: "Cooked this afternoon", createdAt: minutesAgo(35), start: later(10), end: later(100), bestBefore: later(130) });
    await insertEvent({ type: "listing_created", listingId: rajmaListing, portions: 4, message: "4 × rajma chawal bowls marked as surplus", createdAt: minutesAgo(35) }, db);
    const sandwichListing = await listing(db, { surplus: sandwich, portions: 8, prepared: "Made this afternoon", createdAt: minutesAgo(8), start: later(10), end: later(100), bestBefore: later(160) });
    await insertEvent({ type: "listing_created", listingId: sandwichListing, portions: 8, message: "8 × veg grilled sandwiches marked as surplus — evening orders came in under forecast", createdAt: minutesAgo(8) }, db);
  });

  // Today's forecast run, stamped at 7:12 AM (or just now, if it's earlier than that).
  const morningRun = addMinutes(today, 7 * 60 + 12);
  await generateForecast({ now, at: morningRun < now ? morningRun : now });

  log(`Seeded demo data. Demo password for all accounts: ${DEMO_PASSWORD}`);
  for (const a of DEMO_ACCOUNTS) log(`  ${a.role.padEnd(9)} ${a.email}`);

  async function seedOrder(db, { user, lines, contribution, at, status }) {
    const priced = priceOrder({ lines, contribution }, menuById);
    const order = await insertOrder(db, {
      userId: user.id,
      customer: { name: user.name, phone: user.phone || "+91 90000 00000" },
      notes: null,
      fulfilment: "pickup",
      paymentMethod: "upi",
      priced,
      createdAt: at,
      status,
    });
    if (contribution) {
      await insertContribution({ userId: user.id, orderId: order.id, amount: contribution, createdAt: at }, db);
      await insertEvent({ type: "contribution", amount: contribution, message: `₹${contribution} added for community meals with an order`, createdAt: at }, db);
    }
  }
}

async function listing(db, { surplus, portions, prepared, createdAt, start, end, bestBefore, status = "available", partnerId = null }) {
  return insertListing(
    {
      item: surplus.item, category: surplus.category, portions, kgPerPortion: surplus.kg, veg: surplus.veg, dietary: surplus.dietary,
      preparedNote: prepared, location: CAFE_LOCATION, pickupStart: start, pickupEnd: end, bestBefore, status, partnerId, createdAt,
    },
    db
  );
}

async function reserveAndMaybeComplete(db, { listingId, partner, portions, kg, item, reservedAt, completedAt = null }) {
  const pickup = await createPickup({ listingId, partnerId: partner.id, portions, kg: Math.round(kg * 100) / 100, reservedAt }, db);
  await insertEvent({ type: "pickup_reserved", listingId, partnerId: partner.id, portions, message: `${partner.name} reserved ${portions} × ${item.toLowerCase()}`, createdAt: reservedAt }, db);
  if (!completedAt) {
    await db.query("UPDATE rescue_listings SET status = 'reserved', partner_id = $2 WHERE id = $1", [listingId, partner.id]);
    return;
  }
  await db.query("UPDATE pickups SET status = 'completed', completed_at = $2 WHERE id = $1", [pickup.id, completedAt]);
  await db.query("UPDATE rescue_listings SET status = 'collected', partner_id = $2, updated_at = $3 WHERE id = $1", [listingId, partner.id, completedAt]);
  await insertEvent(
    { type: "pickup_completed", listingId, partnerId: partner.id, portions, kg: pickup.kg, message: `Pickup completed — ${portions} portions collected by ${partner.name}`, createdAt: completedAt },
    db
  );
}

async function pastRescue(db, { surplus, portions, partner, listedAt }) {
  const id = await listing(db, {
    surplus, portions, prepared: "End of service", createdAt: listedAt,
    start: addMinutes(listedAt, 20), end: addMinutes(listedAt, 110), bestBefore: addMinutes(listedAt, 180),
  });
  await reserveAndMaybeComplete(db, {
    listingId: id, partner, portions, kg: portions * surplus.kg, item: surplus.item,
    reservedAt: addMinutes(listedAt, 15), completedAt: addMinutes(listedAt, 75),
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
