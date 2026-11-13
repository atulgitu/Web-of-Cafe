import { getMenuItem, listMenu } from "../models/menuModel.js";
import { notFound } from "../utils/errors.js";

export async function list(_req, res) {
  // Menus change rarely; let browsers and the service worker reuse it briefly.
  res.set("Cache-Control", "public, max-age=60");
  res.json({ items: await listMenu() });
}

export async function get(req, res) {
  const item = await getMenuItem(req.params.id);
  if (!item) throw notFound("That item isn't on the menu.");
  res.json({ item });
}
