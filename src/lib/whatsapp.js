// WhatsApp ordering, using WhatsApp's official "click to chat" links:
//   https://wa.me/<number>?text=<message>
// The link opens a chat with the café with the message already typed in. The customer
// still has to press Send. Nothing here sends a message by itself, so the site never
// claims an order was "sent"; it says the order is ready to send.
import { CAFE } from "../data/site";
import { formatRupees, formatTime } from "./format";

// Digits only, country code first, no "+" (the format wa.me expects).
export const whatsappUrl = (text, number = CAFE.whatsappNumber) =>
  `https://wa.me/${number}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

// "Today, 4:15 PM" / "Tomorrow, 8:00 AM" / "15 Nov, 9:30 AM"
export function pickupText(order) {
  if (!order.pickupAt) return `As soon as possible (about ${CAFE.pickupMinutes} minutes)`;
  const t = formatTime(order.pickupAt);
  if (t.startsWith("Tomorrow ")) return t.replace("Tomorrow ", "Tomorrow, ");
  return /^\d{1,2}:/.test(t) ? `Today, ${t}` : t;
}

// Size and add-ons worth mentioning ("Regular" is the default, so it's left out).
export const lineOptions = (line) => [line.size && line.size !== "Regular" ? line.size : null, ...(line.addons || [])].filter(Boolean);

// Builds the message from the order exactly as the server saved and priced it.
export function orderMessage(order) {
  const items = order.items.map((line) => {
    const options = lineOptions(line);
    const extra = options.length ? ` (${options.join(", ")})` : "";
    const note = line.instructions ? `\n   Note: ${line.instructions}` : "";
    return `${line.quantity} × ${line.name}${extra} — ${formatRupees(line.lineTotal)}${note}`;
  });

  const money = [`Subtotal: ${formatRupees(order.subtotal)}`];
  if (order.discount > 0) money.push(`Discount (${order.couponCode}): −${formatRupees(order.discount)}`);
  money.push(`Tax (5%): ${formatRupees(order.tax)}`);
  if (order.contribution > 0) money.push(`Community meal contribution: ${formatRupees(order.contribution)}`);

  return [
    "☕ Coffee Cinnamon — New Order",
    "",
    `Order ID: ${order.code}`,
    "",
    `Customer: ${order.customerName}`,
    `Phone: ${order.phone}`,
    "",
    "Order:",
    ...items,
    "",
    ...money,
    `Total: ${formatRupees(order.total)}`,
    "",
    "Order type: Pickup",
    `Pickup time: ${pickupText(order)}`,
    "Payment: At the counter on pickup",
    "",
    "Notes:",
    order.notes || "None",
  ].join("\n");
}
