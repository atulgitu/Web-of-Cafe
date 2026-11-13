import { query } from "../db/pool.js";

// Saves a message from the Contact page. Nothing is emailed in this prototype;
// staff read the messages on the kitchen dashboard.
export async function create(req, res) {
  const { name, email, topic, message } = req.body;
  const { rows } = await query(
    "INSERT INTO contact_messages (name, email, topic, message) VALUES ($1, $2, $3, $4) RETURNING id, created_at",
    [name, email, topic, message]
  );
  res.status(201).json({ id: rows[0].id, receivedAt: rows[0].created_at });
}

// Staff only: the latest messages.
export async function list(_req, res) {
  const { rows } = await query("SELECT id, name, email, topic, message, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 20");
  res.json({ messages: rows.map((r) => ({ id: r.id, name: r.name, email: r.email, topic: r.topic, message: r.message, receivedAt: r.created_at })) });
}
