import { query } from "../db/pool.js";

const toUser = (r) =>
  r && { id: r.id, name: r.name, email: r.email, role: r.role, phone: r.phone, partnerId: r.partner_id, createdAt: r.created_at };

export async function findUserById(id) {
  const { rows } = await query("SELECT * FROM users WHERE id = $1", [id]);
  return toUser(rows[0]);
}

// Includes the password hash — only for the login check.
export async function findUserWithHashByEmail(email) {
  const { rows } = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
  return rows[0] ? { ...toUser(rows[0]), passwordHash: rows[0].password_hash } : null;
}

export async function createUser({ name, email, passwordHash, phone = null, role = "CUSTOMER", partnerId = null }, client = { query }) {
  const { rows } = await client.query(
    `INSERT INTO users (name, email, password_hash, phone, role, partner_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [name, email.toLowerCase(), passwordHash, phone, role, partnerId]
  );
  return toUser(rows[0]);
}

export async function updateUser(id, { name, phone }) {
  const { rows } = await query(
    "UPDATE users SET name = COALESCE($2, name), phone = COALESCE($3, phone) WHERE id = $1 RETURNING *",
    [id, name ?? null, phone ?? null]
  );
  return toUser(rows[0]);
}
