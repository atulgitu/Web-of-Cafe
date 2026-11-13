// Rescue workflow: available → reserved → collected (or released back to available).
// Every step is one transaction that updates the listing, the pickup row and the
// impact_events log together, so the board, history and impact totals always agree.
import { transaction } from "../db/pool.js";
import { getPartner, listPartners, partnerLoads } from "../models/partnerModel.js";
import { createPickup, findActivePickup, setPickupStatus } from "../models/pickupModel.js";
import { getListing, insertListing, setListingStatus, updateListingFields } from "../models/rescueModel.js";
import { insertEvent } from "../models/impactModel.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/errors.js";
import { startOfDay } from "../utils/time.js";
import { CAFE_LOCATION } from "./constants.js";
import { rankPartners, scorePartner } from "./matchingService.js";

const round2 = (n) => Math.round(n * 100) / 100;

function assertTimes({ pickupStart, pickupEnd, bestBefore }) {
  if (pickupEnd <= pickupStart) throw badRequest("Pickup must end after it starts.");
  if (bestBefore < pickupEnd) throw badRequest("Best-before should be after the pickup window closes.");
}

export async function createListing(data, user) {
  assertTimes(data);
  return transaction(async (db) => {
    const id = await insertListing({ ...data, location: CAFE_LOCATION, createdBy: user.id }, db);
    await insertEvent(
      { type: "listing_created", listingId: id, portions: data.portions, message: `${data.portions} × ${data.item.toLowerCase()} marked as surplus` },
      db
    );
    return getListing(id, db);
  });
}

export async function updateListing(id, changes) {
  return transaction(async (db) => {
    const listing = await getListing(id, db, { forUpdate: true });
    if (!listing) throw notFound("That listing doesn't exist.");
    if (listing.status !== "available") throw conflict("Only listings that haven't been reserved can be edited.");
    const merged = { ...listing, ...Object.fromEntries(Object.entries(changes).filter(([, v]) => v !== undefined)) };
    assertTimes(merged);
    await updateListingFields(id, changes, db);
    await insertEvent({ type: "listing_updated", listingId: id, message: `${merged.item} listing updated (${merged.portions} portions)` }, db);
    return getListing(id, db);
  });
}

// A partner reserves for themselves; staff can assign a listing to any partner.
export async function reserveListing(id, { user, partnerId, matchScore = null }) {
  const targetPartnerId = user.role === "PARTNER" ? user.partnerId : partnerId;
  if (!targetPartnerId) throw badRequest("Choose a partner to assign this pickup to.");
  const partner = await getPartner(targetPartnerId);
  if (!partner) throw notFound("That partner doesn't exist.");

  return transaction(async (db) => {
    const listing = await getListing(id, db, { forUpdate: true });
    if (!listing) throw notFound("That listing doesn't exist.");
    if (listing.status !== "available") throw conflict("Someone has already reserved this. Refresh to see what's still available.");
    if (listing.bestBefore <= new Date()) throw conflict("This food is past its best-before time, so it can't be reserved any more.");
    if (!listing.veg && partner.vegOnly) throw badRequest(`${partner.name} only accepts vegetarian food.`);

    await createPickup(
      { listingId: id, partnerId: partner.id, portions: listing.portions, kg: round2(listing.portions * listing.kgPerPortion), matchScore },
      db
    );
    await setListingStatus(id, "reserved", partner.id, db);
    await insertEvent(
      {
        type: "pickup_reserved",
        listingId: id,
        partnerId: partner.id,
        portions: listing.portions,
        message: `${partner.name} reserved ${listing.portions} × ${listing.item.toLowerCase()}`,
      },
      db
    );
    return getListing(id, db);
  });
}

async function loadActivePickup(db, id, user) {
  const listing = await getListing(id, db, { forUpdate: true });
  if (!listing) throw notFound("That listing doesn't exist.");
  if (listing.status !== "reserved") throw conflict("This listing isn't currently reserved.");
  if (user.role === "PARTNER" && listing.partnerId !== user.partnerId) throw forbidden("This pickup is reserved by another partner.");
  const pickup = await findActivePickup(id, db);
  return { listing, pickup };
}

export async function releaseListing(id, user) {
  return transaction(async (db) => {
    const { listing, pickup } = await loadActivePickup(db, id, user);
    await setPickupStatus(pickup.id, "cancelled", db);
    await setListingStatus(id, "available", null, db);
    await insertEvent(
      { type: "pickup_released", listingId: id, partnerId: listing.partnerId, message: `${listing.partnerName} released the ${listing.item.toLowerCase()} — available again` },
      db
    );
    return getListing(id, db);
  });
}

export async function completePickup(id, user) {
  return transaction(async (db) => {
    const { listing, pickup } = await loadActivePickup(db, id, user);
    await setPickupStatus(pickup.id, "completed", db);
    await setListingStatus(id, "collected", listing.partnerId, db);
    await insertEvent(
      {
        type: "pickup_completed",
        listingId: id,
        partnerId: listing.partnerId,
        portions: pickup.portions,
        kg: pickup.kg,
        message: `Pickup completed — ${pickup.portions} portions collected by ${listing.partnerName}`,
      },
      db
    );
    return getListing(id, db);
  });
}

export async function matchesForListing(id, now = new Date()) {
  const listing = await getListing(id);
  if (!listing) throw notFound("That listing doesn't exist.");
  const [partners, loads] = await Promise.all([listPartners(), partnerLoads(startOfDay(now))]);
  return { listingId: id, generatedAt: now, matches: rankPartners(listing, partners, now, loads) };
}

export async function scoreFor(listing, partnerId, now = new Date()) {
  const [partner, loads] = await Promise.all([getPartner(partnerId), partnerLoads(startOfDay(now))]);
  return partner ? scorePartner(listing, partner, { now, loadToday: loads.get(partnerId) || 0 }).score : null;
}
