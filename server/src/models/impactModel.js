import { query } from "../db/pool.js";

export async function insertEvent(
  { type, listingId = null, partnerId = null, portions = null, kg = null, amount = null, message, createdAt = null },
  client = { query }
) {
  await client.query(
    `INSERT INTO impact_events (type, listing_id, partner_id, portions, kg, amount, message, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7, COALESCE($8, now()))`,
    [type, listingId, partnerId, portions, kg, amount, message, createdAt]
  );
}

// Measured rescue totals: summed from completed-pickup events only.
export async function rescueTotals(since = null) {
  const { rows } = await query(
    `SELECT COALESCE(SUM(portions), 0) AS meals, COALESCE(SUM(kg), 0) AS kg, COUNT(*) AS pickups
     FROM impact_events WHERE type = 'pickup_completed' AND ($1::timestamptz IS NULL OR created_at >= $1)`,
    [since]
  );
  return rows[0];
}

export async function weeklyRescue() {
  const { rows } = await query(
    `SELECT date_trunc('week', created_at AT TIME ZONE 'Asia/Kolkata')::date AS week,
            SUM(portions) AS meals, SUM(kg) AS kg, COUNT(*) AS pickups
     FROM impact_events WHERE type = 'pickup_completed' GROUP BY 1 ORDER BY 1`
  );
  return rows;
}

export async function rescueByPartner(since) {
  const { rows } = await query(
    `SELECT p.id, p.name, p.type, COALESCE(SUM(e.portions), 0) AS meals
     FROM partners p LEFT JOIN impact_events e ON e.partner_id = p.id AND e.type = 'pickup_completed' AND e.created_at >= $1
     GROUP BY p.id ORDER BY meals DESC`,
    [since]
  );
  return rows;
}

export async function activePartnerCount(since) {
  const { rows } = await query(
    "SELECT COUNT(DISTINCT partner_id) AS n FROM impact_events WHERE type = 'pickup_completed' AND created_at >= $1",
    [since]
  );
  return rows[0].n;
}

const PUBLIC_EVENT_TYPES = ["forecast_generated", "listing_created", "listing_updated", "pickup_reserved", "pickup_released", "pickup_completed", "note"];

export async function recentActivity({ since = null, limit = 20 } = {}) {
  const { rows } = await query(
    `SELECT id, type, message, portions, created_at FROM impact_events
     WHERE type = ANY($1) AND ($2::timestamptz IS NULL OR created_at >= $2) ORDER BY created_at DESC, id DESC LIMIT $3`,
    [PUBLIC_EVENT_TYPES, since, limit]
  );
  return rows.map((r) => ({ id: r.id, type: r.type, message: r.message, portions: r.portions, at: r.created_at }));
}
