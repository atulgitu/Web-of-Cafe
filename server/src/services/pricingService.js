// Server-side pricing. The browser only sends *what* was ordered (item ids, size,
// add-on labels, quantity); every price is looked up here from the menu table.
import { COUPONS, MAX_CONTRIBUTION, TAX_RATE } from "./constants.js";
import { badRequest } from "../utils/errors.js";

export function priceLine(menuItem, { size, addons = [], quantity }) {
  if (!menuItem || !menuItem.available) throw badRequest("One of the items in your cart is no longer on the menu.");

  const sizeOption = size ? menuItem.sizes.find((s) => s.label === size) : menuItem.sizes[0];
  if (menuItem.sizes.length && !sizeOption) throw badRequest(`"${size}" isn't a size for ${menuItem.name}.`);

  const addonOptions = addons.map((label) => {
    const option = menuItem.addons.find((a) => a.label === label);
    if (!option) throw badRequest(`"${label}" isn't an option for ${menuItem.name}.`);
    return option;
  });

  const unitPrice = menuItem.price + (sizeOption?.extra || 0) + addonOptions.reduce((s, a) => s + a.extra, 0);
  return {
    menuItemId: menuItem.id,
    name: menuItem.name,
    size: sizeOption?.label || null,
    addons: addonOptions.map((a) => a.label),
    quantity,
    unitPrice,
    lineTotal: unitPrice * quantity,
  };
}

// A few items are baked in small daily batches (menu item `batch.left`). The same item
// can be in the cart twice (two sizes), so add the quantities up before comparing.
function checkStock(pricedLines, menuById) {
  const wanted = new Map();
  for (const l of pricedLines) wanted.set(l.menuItemId, (wanted.get(l.menuItemId) || 0) + l.quantity);
  for (const [id, quantity] of wanted) {
    const item = menuById.get(id);
    if (!item.batch || quantity <= item.batch.left) continue;
    throw badRequest(
      item.batch.left === 0
        ? `${item.name} is sold out for today. Please remove it from your cart.`
        : `Only ${item.batch.left} × ${item.name} left today. Please reduce the quantity.`
    );
  }
}

// lines: [{ menuItemId, size, addons, quantity, instructions }]
// menuById: Map of id → menu item row
// now: passed in so the weekend-only coupon can be tested for any day
export function priceOrder({ lines, couponCode, contribution = 0 }, menuById, now = new Date()) {
  const priced = lines.map((l) => ({ ...priceLine(menuById.get(l.menuItemId), l), instructions: l.instructions || null }));
  checkStock(priced, menuById);
  const subtotal = priced.reduce((s, l) => s + l.lineTotal, 0);

  let coupon = null;
  let couponError = null;
  if (couponCode) {
    const code = couponCode.trim().toUpperCase();
    const isWeekend = now.getDay() === 0 || now.getDay() === 6;
    if (!COUPONS[code]) couponError = "That code isn't valid. Try STUDENT10 or CINNAMON20.";
    else if (COUPONS[code].weekendOnly && !isWeekend) couponError = "This code only works on Saturdays and Sundays.";
    else coupon = { code, ...COUPONS[code] };
  }

  const discount = coupon ? Math.round(subtotal * coupon.rate) : 0;
  const tax = Math.round((subtotal - discount) * TAX_RATE);
  const safeContribution = Math.max(0, Math.min(MAX_CONTRIBUTION, Math.round(contribution || 0)));

  return {
    lines: priced,
    subtotal,
    coupon: coupon && { code: coupon.code, description: coupon.description },
    couponError,
    discount,
    tax,
    contribution: safeContribution,
    total: subtotal - discount + tax + safeContribution,
  };
}
