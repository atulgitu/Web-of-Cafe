import { transaction } from "../db/pool.js";
import { insertContribution } from "../models/contributionModel.js";
import { insertEvent } from "../models/impactModel.js";
import { getMenuItemsByIds, takeFromBatch } from "../models/menuModel.js";
import { getOrderById, insertOrder } from "../models/orderModel.js";
import { badRequest, conflict } from "../utils/errors.js";
import { priceOrder } from "./pricingService.js";

// Recalculates everything from the menu table. Used by the cart (quote) and checkout.
export async function quote({ lines, couponCode, contribution }) {
  const menuById = await getMenuItemsByIds([...new Set(lines.map((l) => l.menuItemId))]);
  return priceOrder({ lines, couponCode, contribution }, menuById);
}

const MINUTE = 60 * 1000;

// `user` is null for guest orders.
export async function placeOrder(user, { lines, couponCode, contribution, customer, fulfilment, paymentMethod, pickupAt = null, notes }) {
  if (pickupAt) {
    const fromNow = pickupAt - Date.now();
    if (fromNow < 10 * MINUTE) throw badRequest("Please choose a pickup time at least 15 minutes from now.");
    if (fromNow > 3 * 24 * 60 * MINUTE) throw badRequest("Pickup can be booked up to 3 days ahead.");
  }
  const priced = await quote({ lines, couponCode, contribution });
  if (priced.couponError) {
    // Don't silently drop a coupon the customer thinks they applied.
    throw badRequest(priced.couponError);
  }

  const orderId = await transaction(async (db) => {
    // Take limited-batch items off the shelf inside the same transaction, so two
    // customers can't both buy the last croissant.
    for (const line of priced.lines) {
      const taken = await takeFromBatch(line.menuItemId, line.quantity, db);
      if (!taken) throw conflict(`Sorry, ${line.name} just sold out. Please update your cart.`);
    }
    const order = await insertOrder(db, { userId: user?.id ?? null, customer, fulfilment, paymentMethod, priced, pickupAt, notes });
    if (priced.contribution > 0) {
      await insertContribution({ userId: user?.id ?? null, orderId: order.id, amount: priced.contribution }, db);
      await insertEvent({ type: "contribution", amount: priced.contribution, message: `₹${priced.contribution} added for community meals with an order` }, db);
    }
    return order.id;
  });
  return getOrderById(orderId);
}
