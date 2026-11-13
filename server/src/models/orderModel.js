import { query } from "../db/pool.js";

const toOrder = (r, items = []) => ({
  id: r.id,
  code: r.code,
  userId: r.user_id,
  fulfilment: r.fulfilment,
  customerName: r.customer_name,
  phone: r.phone,
  address: r.address,
  subtotal: r.subtotal,
  couponCode: r.coupon_code,
  discount: r.discount,
  tax: r.tax,
  contribution: r.contribution,
  total: r.total,
  paymentMethod: r.payment_method,
  pickupAt: r.pickup_at,
  notes: r.notes,
  status: r.status,
  createdAt: r.created_at,
  items,
});

const toItem = (r) => ({
  menuItemId: r.menu_item_id,
  name: r.name,
  size: r.size,
  addons: r.addons,
  instructions: r.instructions,
  quantity: r.quantity,
  unitPrice: r.unit_price,
  lineTotal: r.line_total,
});

// Inserts the order and its lines. Call inside a transaction.
// The order code comes from the same database sequence as the id, so two orders
// can never get the same code (the column is also UNIQUE).
export async function insertOrder(client, { userId = null, customer, fulfilment, paymentMethod, priced, pickupAt = null, notes = null, createdAt = null, status = "pending" }) {
  const { rows } = await client.query(
    `INSERT INTO orders (code, user_id, fulfilment, customer_name, phone, address, subtotal, coupon_code, discount,
                         tax, contribution, total, payment_method, status, created_at, pickup_at, notes)
     VALUES ('CC-' || (10000 + nextval('orders_id_seq'))::text, $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, COALESCE($14, now()), $15, $16)
     RETURNING *`,
    [
      userId, fulfilment, customer.name, customer.phone, customer.address || null, priced.subtotal,
      priced.coupon?.code || null, priced.discount, priced.tax, priced.contribution, priced.total, paymentMethod, status, createdAt,
      pickupAt, notes || null,
    ]
  );
  const order = rows[0];
  for (const l of priced.lines) {
    await client.query(
      `INSERT INTO order_items (order_id, menu_item_id, name, size, addons, instructions, quantity, unit_price, line_total)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [order.id, l.menuItemId, l.name, l.size, l.addons, l.instructions, l.quantity, l.unitPrice, l.lineTotal]
    );
  }
  return order;
}

async function attachItems(orderRows) {
  if (!orderRows.length) return [];
  const { rows } = await query("SELECT * FROM order_items WHERE order_id = ANY($1) ORDER BY id", [orderRows.map((o) => o.id)]);
  return orderRows.map((o) => toOrder(o, rows.filter((i) => i.order_id === o.id).map(toItem)));
}

export async function getOrderById(id) {
  const { rows } = await query("SELECT * FROM orders WHERE id = $1", [id]);
  return (await attachItems(rows))[0] || null;
}

export async function listOrdersForUser(userId) {
  const { rows } = await query("SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50", [userId]);
  return attachItems(rows);
}

export async function listOrdersSince(since, limit = 20) {
  const { rows } = await query("SELECT * FROM orders WHERE created_at >= $1 ORDER BY created_at DESC LIMIT $2", [since, limit]);
  return attachItems(rows);
}

// For the staff order list: anything still open, plus everything from today.
export async function listOrdersForStaff(since, limit = 40) {
  const { rows } = await query(
    `SELECT * FROM orders WHERE status NOT IN ('completed', 'cancelled') OR created_at >= $1
     ORDER BY created_at DESC LIMIT $2`,
    [since, limit]
  );
  return attachItems(rows);
}

export async function orderStatsSince(since) {
  const { rows } = await query(
    `SELECT COUNT(*) AS orders, COALESCE(SUM(total - contribution), 0) AS revenue, COALESCE(SUM(contribution), 0) AS contributions
     FROM orders WHERE created_at >= $1 AND status <> 'cancelled'`,
    [since]
  );
  return rows[0];
}

export async function setOrderStatus(id, status) {
  await query("UPDATE orders SET status = $2 WHERE id = $1", [id, status]);
}
