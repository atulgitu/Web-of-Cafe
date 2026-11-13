import { getListing, listBoard } from "../models/rescueModel.js";
import { boardSummary } from "../services/impactService.js";
import * as rescue from "../services/rescueService.js";
import { notFound } from "../utils/errors.js";
import { startOfDay } from "../utils/time.js";

export async function board(_req, res) {
  const now = new Date();
  const listings = await listBoard(startOfDay(now));
  res.json({ now, summary: boardSummary(listings, now), listings });
}

export async function getOne(req, res) {
  const listing = await getListing(Number(req.params.id));
  if (!listing) throw notFound("That listing doesn't exist.");
  res.json({ listing });
}

export async function create(req, res) {
  res.status(201).json({ listing: await rescue.createListing(req.body, req.user) });
}

export async function update(req, res) {
  res.json({ listing: await rescue.updateListing(Number(req.params.id), req.body) });
}

export async function reserve(req, res) {
  const id = Number(req.params.id);
  const partnerId = req.body?.partnerId;
  const listing = await getListing(id);
  // Record the score the staff member saw when assigning, so the decision can be reviewed later.
  const matchScore = req.user.role === "STAFF" && listing && partnerId ? await rescue.scoreFor(listing, partnerId) : null;
  res.json({ listing: await rescue.reserveListing(id, { user: req.user, partnerId, matchScore }) });
}

export async function release(req, res) {
  res.json({ listing: await rescue.releaseListing(Number(req.params.id), req.user) });
}

export async function complete(req, res) {
  res.json({ listing: await rescue.completePickup(Number(req.params.id), req.user) });
}

export async function matches(req, res) {
  res.json(await rescue.matchesForListing(Number(req.params.id)));
}
