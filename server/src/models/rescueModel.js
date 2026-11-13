import { query } from "../db/pool.js";

export const toListing = (r) => ({
  id: r.id,
  item: r.item,
  category: r.category,
  portions: r.portions,
  kgPerPortion: r.kg_per_portion,
  veg: r.veg,
  dietary: r.dietary,
  preparedNote: r.prepared_note,
  location: r.location,
  pickupStart: r.pickup_start,
  pickupEnd: r.pickup_end,
  bestBefore: r.best_before,
  status: r.status,
  partnerId: r.partner_id,
  partnerName: r.partner_name ?? null,
  partnerDistanceKm: r.partner_distance_km ?? null,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const SELECT = `SELECT l.*, p.name AS partner_name, p.distance_km AS partner_distance_km
                FROM rescue_listings l LEFT JOIN partners p ON p.id = l.partner_id`;

// Today's board: anything created since `since`, plus anything from earlier that is
// still open AND still within its best-before time. (Without the best-before check,
// an uncollected listing stayed "available" for weeks.)
export async function listBoard(since) {
  const { rows } = await query(
    `${SELECT} WHERE l.status <> 'withdrawn' AND (l.created_at >= $1 OR (l.status IN ('available', 'reserved') AND l.best_before >= now()))
     ORDER BY CASE l.status WHEN 'available' THEN 0 WHEN 'reserved' THEN 1 ELSE 2 END, l.pickup_start`,
    [since]
  );
  return rows.map(toListing);
}

export async function getListing(id, client = { query }, { forUpdate = false } = {}) {
  const lock = forUpdate ? " FOR UPDATE OF l" : "";
  const { rows } = await client.query(`${SELECT} WHERE l.id = $1${lock}`, [id]);
  return rows[0] ? toListing(rows[0]) : null;
}

export async function insertListing(data, client = { query }) {
  const { rows } = await client.query(
    `INSERT INTO rescue_listings (item, category, portions, kg_per_portion, veg, dietary, prepared_note, location,
                                  pickup_start, pickup_end, best_before, created_by, status, partner_id, created_at, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,COALESCE($13,'available'),$14,COALESCE($15, now()),COALESCE($15, now()))
     RETURNING id`,
    [
      data.item, data.category, data.portions, data.kgPerPortion, data.veg, data.dietary, data.preparedNote ?? null,
      data.location, data.pickupStart, data.pickupEnd, data.bestBefore, data.createdBy ?? null,
      data.status ?? null, data.partnerId ?? null, data.createdAt ?? null,
    ]
  );
  return rows[0].id;
}

const editable = {
  item: "item",
  portions: "portions",
  veg: "veg",
  dietary: "dietary",
  preparedNote: "prepared_note",
  pickupStart: "pickup_start",
  pickupEnd: "pickup_end",
  bestBefore: "best_before",
};

export async function updateListingFields(id, changes, client = { query }) {
  const entries = Object.entries(changes).filter(([k, v]) => editable[k] && v !== undefined);
  if (!entries.length) return;
  const sets = entries.map(([k], i) => `${editable[k]} = $${i + 2}`);
  await client.query(`UPDATE rescue_listings SET ${sets.join(", ")}, updated_at = now() WHERE id = $1`, [id, ...entries.map(([, v]) => v)]);
}

export async function setListingStatus(id, status, partnerId, client = { query }) {
  await client.query("UPDATE rescue_listings SET status = $2, partner_id = $3, updated_at = now() WHERE id = $1", [id, status, partnerId]);
}
