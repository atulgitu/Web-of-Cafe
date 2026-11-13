// Order statuses, in the order they normally happen.
export const ORDER_STATUSES = [
  { id: "pending", label: "Waiting for WhatsApp confirmation" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Preparing" },
  { id: "ready", label: "Ready for pickup" },
  { id: "completed", label: "Collected" },
  { id: "cancelled", label: "Cancelled" },
];

export const statusLabel = (id) => ORDER_STATUSES.find((s) => s.id === id)?.label ?? (id === "placed" ? "Placed" : id);

// Guests don't have an account, so the order they just placed is kept on this
// device. That lets the confirmation page survive a refresh without making
// orders readable by anyone who guesses an order number.
const KEY = "cc_recent_orders";

export function rememberOrder(order) {
  try {
    const others = recentOrders().filter((o) => o.id !== order.id);
    localStorage.setItem(KEY, JSON.stringify([order, ...others].slice(0, 10)));
  } catch {
    // storage blocked: the confirmation page still has the order in memory
  }
}

export function recentOrders() {
  try {
    const list = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(list) ? list.filter((o) => o && o.id && o.code && Array.isArray(o.items)) : [];
  } catch {
    return [];
  }
}

export const findRecentOrder = (id) => recentOrders().find((o) => String(o.id) === String(id)) ?? null;
