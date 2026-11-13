import { query } from "../db/pool.js";

const toPickup = (r) => ({
  id: r.id,
  listingId: r.listing_id,
  partnerId: r.partner_id,
  item: r.item ?? null,
  portions: r.portions,
  kg: r.kg,
  status: r.status,
  matchScore: r.match_score,
  reservedAt: r.reserved_at,
  completedAt: r.completed_at,
});

export async function createPickup({ listingId, partnerId, portions, kg, matchScore = null, reservedAt = null }, client = { query }) {
  const { rows } = await client.query(
    `INSERT INTO pickups (listing_id, partner_id, portions, kg, match_score, reserved_at)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6, now())) RETURNING *`,
    [listingId, partnerId, portions, kg, matchScore, reservedAt]
  );
  return toPickup(rows[0]);
}

export async function findActivePickup(listingId, client = { query }) {
  const { rows } = await client.query("SELECT * FROM pickups WHERE listing_id = $1 AND status <> 'cancelled'", [listingId]);
  return rows[0] ? toPickup(rows[0]) : null;
}

export async function setPickupStatus(id, status, client = { query }, at = null) {
  await client.query(
    `UPDATE pickups SET status = $2, completed_at = CASE WHEN $2 = 'completed' THEN COALESCE($3, now()) ELSE completed_at END WHERE id = $1`,
    [id, status, at]
  );
}

export async function completedPickupsForPartner(partnerId, limit = 30) {
  const { rows } = await query(
    `SELECT pk.*, l.item FROM pickups pk JOIN rescue_listings l ON l.id = pk.listing_id
     WHERE pk.partner_id = $1 AND pk.status = 'completed' ORDER BY pk.completed_at DESC LIMIT $2`,
    [partnerId, limit]
  );
  return rows.map(toPickup);
}
