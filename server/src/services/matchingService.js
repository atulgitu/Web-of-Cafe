// Surplus → community partner matching. A transparent weighted score, run locally.
//
// Hard rule first: a vegetarian-only partner never gets non-veg food.
// Then four factors, each scored 0–1:
//
//   quantity  40%  share of this listing the partner can still use today
//                  = min(portions, still-needed today, capacity left) ÷ portions
//   timing    25%  overlap between their collection window and the time left to collect
//                  (30+ minutes of overlap scores 1)
//   distance  20%  1 − distance ÷ 8 km (8 km or more scores 0). Distances are approximate,
//                  entered by hand — there's no mapping service.
//   urgency   15%  if the food must be collected within 2.5 hours, prefer whoever can come
//                  soonest; otherwise everyone gets 0.7
//
// score = Σ weight × factor, shown as a percentage. Staff see the reasons and decide.
import { formatClock, minutesSince, startOfDay } from "../utils/time.js";

export const MATCH_WEIGHTS = { quantity: 0.4, timing: 0.25, distance: 0.2, urgency: 0.15 };
const MAX_DISTANCE_KM = 8;
const FULL_OVERLAP_MINUTES = 30;
const URGENT_WITHIN_MINUTES = 150;
const URGENCY_HORIZON_MINUTES = 120;
const NON_URGENT_SCORE = 0.7;

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const minutesToClock = (dayStart, minutes) => formatClock(new Date(dayStart.getTime() + minutes * 60000));

/**
 * @param listing  { portions, veg, pickupStart, pickupEnd, bestBefore }  (Dates)
 * @param partner  { id, name, distanceKm, needsPerDay, capacity, windowStart, windowEnd, vegOnly }
 * @param context  { now: Date, loadToday: portions already reserved/collected by this partner today }
 */
export function scorePartner(listing, partner, { now, loadToday = 0 }) {
  const day = startOfDay(now);
  const t = (date) => minutesSince(day, date);

  const remainingNeed = Math.max(0, partner.needsPerDay - loadToday);
  const capacityLeft = Math.max(0, partner.capacity - loadToday);
  const canTake = Math.min(listing.portions, remainingNeed, capacityLeft);

  const deadline = Math.min(t(listing.pickupEnd), t(listing.bestBefore));
  const earliest = Math.max(t(now), t(listing.pickupStart), partner.windowStart);
  const latest = Math.min(deadline, partner.windowEnd);
  const overlap = latest - earliest;

  const base = { partnerId: partner.id, partnerName: partner.name, canTake, remainingNeed, score: 0, reasons: [], blockers: [] };

  if (!listing.veg && partner.vegOnly) return { ...base, eligible: false, blockers: ["Vegetarian-only kitchen"] };
  if (overlap <= 0) {
    return {
      ...base,
      eligible: false,
      blockers: [`Collects ${minutesToClock(day, partner.windowStart)}–${minutesToClock(day, partner.windowEnd)}, outside the pickup window`],
    };
  }
  if (canTake === 0) return { ...base, eligible: false, blockers: ["Already has enough food for today"] };

  const minutesLeft = deadline - t(now);
  const factors = {
    quantity: canTake / listing.portions,
    timing: clamp01(overlap / FULL_OVERLAP_MINUTES),
    distance: clamp01(1 - partner.distanceKm / MAX_DISTANCE_KM),
    urgency: minutesLeft < URGENT_WITHIN_MINUTES ? clamp01(1 - (earliest - t(now)) / URGENCY_HORIZON_MINUTES) : NON_URGENT_SCORE,
  };
  const score = Math.round(100 * Object.entries(MATCH_WEIGHTS).reduce((s, [k, w]) => s + w * factors[k], 0));

  const reasons = [
    `${partner.distanceKm} km away`,
    `Can collect from ${minutesToClock(day, earliest)}`,
    `Still needs ${remainingNeed} portions today`,
    partner.vegOnly ? "Vegetarian kitchen" : "Accepts veg and non-veg",
  ];
  if (canTake < listing.portions) reasons.push(`Can only take ${canTake} of ${listing.portions}`);

  return { ...base, eligible: true, score, factors, reasons };
}

export function rankPartners(listing, partners, now, loadByPartner) {
  return partners
    .map((p) => scorePartner(listing, p, { now, loadToday: loadByPartner.get(p.id) || 0 }))
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score);
}
