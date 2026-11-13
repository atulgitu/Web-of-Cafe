import { getOrderById, listOrdersForStaff, listOrdersForUser, setOrderStatus } from "../models/orderModel.js";
import { placeOrder, quote } from "../services/orderService.js";
import { forbidden, notFound } from "../utils/errors.js";
import { startOfDay } from "../utils/time.js";

export async function getQuote(req, res) {
  res.json(await quote(req.body));
}

export async function create(req, res) {
  // req.user is set if the customer is logged in; guests can order too.
  res.status(201).json({ order: await placeOrder(req.user, req.body) });
}

export async function mine(req, res) {
  res.json({ orders: await listOrdersForUser(req.user.id) });
}

export async function getOne(req, res) {
  const order = await getOrderById(Number(req.params.id));
  if (!order) throw notFound("We couldn't find that order.");
  if ((order.userId === null || order.userId !== req.user.id) && req.user.role !== "STAFF") throw forbidden();
  res.json({ order });
}

export async function today(_req, res) {
  res.json({ orders: await listOrdersForStaff(startOfDay()) });
}

export async function updateStatus(req, res) {
  const order = await getOrderById(Number(req.params.id));
  if (!order) throw notFound("We couldn't find that order.");
  await setOrderStatus(order.id, req.body.status);
  res.json({ order: await getOrderById(order.id) });
}
