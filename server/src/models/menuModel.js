import { query } from "../db/pool.js";

export const toMenuItem = (r) => ({
  id: r.id,
  name: r.name,
  category: r.category,
  description: r.description,
  price: r.price,
  veg: r.veg,
  rating: r.rating,
  popularity: r.popularity,
  image: r.image,
  imageAlt: r.image_alt,
  sizes: r.sizes,
  addons: r.addons,
  tags: r.tags,
  lowWasteNote: r.low_waste_note,
  batch: r.batch_left != null ? { left: r.batch_left, note: r.batch_note } : null,
  available: r.available,
});

export async function listMenu() {
  const { rows } = await query("SELECT * FROM menu_items WHERE available ORDER BY category, popularity DESC");
  return rows.map(toMenuItem);
}

export async function getMenuItem(id) {
  const { rows } = await query("SELECT * FROM menu_items WHERE id = $1", [id]);
  return rows[0] ? toMenuItem(rows[0]) : null;
}

// Takes `quantity` from an item's daily batch. Returns false if there isn't enough left
// (someone else ordered the last ones a moment ago). Items without a batch always succeed.
export async function takeFromBatch(id, quantity, client = { query }) {
  const { rowCount } = await client.query(
    "UPDATE menu_items SET batch_left = batch_left - $2 WHERE id = $1 AND (batch_left IS NULL OR batch_left >= $2)",
    [id, quantity]
  );
  return rowCount === 1;
}

export async function getMenuItemsByIds(ids) {
  const { rows } = await query("SELECT * FROM menu_items WHERE id = ANY($1)", [ids]);
  return new Map(rows.map((r) => [r.id, toMenuItem(r)]));
}
