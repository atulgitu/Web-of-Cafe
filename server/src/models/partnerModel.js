import { query } from "../db/pool.js";

export const toPartner = (r) => ({
  id: r.id,
  name: r.name,
  type: r.type,
  area: r.area,
  distanceKm: r.distance_km,
  needsPerDay: r.needs_per_day,
  capacity: r.capacity,
  windowStart: r.window_start,
  windowEnd: r.window_end,
  vegOnly: r.veg_only,
  contact: r.contact,
  note: r.note,
});

export async function listPartners() {
  const { rows } = await query("SELECT * FROM partners ORDER BY distance_km");
  return rows.map(toPartner);
}

export async function getPartner(id) {
  const { rows } = await query("SELECT * FROM partners WHERE id = $1", [id]);
  return rows[0] ? toPartner(rows[0]) : null;
}

// Portions each partner has reserved or collected since `since` (usually today 00:00).
export async function partnerLoads(since) {
  const { rows } = await query(
    `SELECT partner_id, SUM(portions) AS portions FROM pickups
     WHERE status IN ('reserved', 'completed') AND reserved_at >= $1 GROUP BY partner_id`,
    [since]
  );
  return new Map(rows.map((r) => [r.partner_id, r.portions]));
}
