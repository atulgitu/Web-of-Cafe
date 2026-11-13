import { query } from "../db/pool.js";

export async function insertContribution({ userId = null, orderId = null, amount, createdAt = null }, client = { query }) {
  const { rows } = await client.query(
    "INSERT INTO contributions (user_id, order_id, amount, created_at) VALUES ($1, $2, $3, COALESCE($4, now())) RETURNING *",
    [userId, orderId, amount, createdAt]
  );
  return rows[0];
}

export async function contributionsForUser(userId) {
  const { rows } = await query(
    `SELECT c.id, c.amount, c.created_at, o.code AS order_code FROM contributions c
     LEFT JOIN orders o ON o.id = c.order_id WHERE c.user_id = $1 ORDER BY c.created_at DESC`,
    [userId]
  );
  return rows.map((r) => ({ id: r.id, amount: r.amount, createdAt: r.created_at, orderCode: r.order_code }));
}

export async function contributionTotals(since = null) {
  const { rows } = await query(
    "SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount FROM contributions WHERE $1::timestamptz IS NULL OR created_at >= $1",
    [since]
  );
  return rows[0];
}
