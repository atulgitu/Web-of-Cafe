import { formatTime } from "./format";

// Surplus → partner matching. A weighted score over a few things a café
// coordinator would check by hand anyway:
//
//   quantity  40%  how much of this listing the partner can still use today
//   timing    25%  overlap between their collection window and the pickup deadline
//   distance  20%  closer is better (8 km or more scores zero)
//   urgency   15%  for food close to its best-before, prefer whoever can come soonest
//
// Dietary rules are a hard filter, not a weight. The weights are hand-tuned for the
// prototype; with real pickup outcomes they could be learned instead.

const WEIGHTS = { quantity: 0.4, timing: 0.25, distance: 0.2, urgency: 0.15 };
const clamp01 = (x) => Math.min(1, Math.max(0, x));

// Portions already reserved or collected by a partner today.
export function partnerLoad(partnerId, listings) {
  return listings
    .filter((l) => l.partnerId === partnerId && (l.status === "reserved" || l.status === "collected"))
    .reduce((s, l) => s + l.portions, 0);
}

export function scorePartner(listing, partner, { now, listings }) {
  const load = partnerLoad(partner.id, listings);
  const remainingNeed = Math.max(0, partner.needsToday - load);
  const capacityLeft = Math.max(0, partner.capacity - load);
  const canTake = Math.min(listing.portions, remainingNeed, capacityLeft);

  const deadline = Math.min(listing.pickupEnd, listing.bestBefore);
  const earliest = Math.max(now, listing.pickupStart, partner.window.start);
  const latest = Math.min(deadline, partner.window.end);
  const overlap = latest - earliest;

  const base = { partner, canTake, remainingNeed, earliest };

  if (!listing.veg && partner.vegOnly) {
    return { ...base, eligible: false, score: 0, reasons: [], blockers: ["Vegetarian-only kitchen"] };
  }
  if (overlap <= 0) {
    return { ...base, eligible: false, score: 0, reasons: [], blockers: [`Collects ${formatTime(partner.window.start)}–${formatTime(partner.window.end)}, outside the pickup window`] };
  }
  if (canTake === 0) {
    return { ...base, eligible: false, score: 0, reasons: [], blockers: ["Already has enough food for today"] };
  }

  const minutesLeft = deadline - now;
  const parts = {
    quantity: canTake / listing.portions,
    timing: clamp01(overlap / 30),
    distance: clamp01(1 - partner.distanceKm / 8),
    urgency: minutesLeft < 150 ? clamp01(1 - (earliest - now) / 120) : 0.7,
  };
  const score = Object.entries(WEIGHTS).reduce((s, [k, w]) => s + w * parts[k], 0);

  const reasons = [
    `Can collect from ${formatTime(earliest)}`,
    `Still needs ${remainingNeed} meals today`,
    `${partner.distanceKm} km away`,
  ];
  if (canTake < listing.portions) reasons.push(`Can only take ${canTake} of ${listing.portions}`);

  return { ...base, eligible: true, score: Math.round(score * 100), parts, reasons, blockers: [] };
}

export function rankPartners(listing, partners, context) {
  return partners
    .map((p) => scorePartner(listing, p, context))
    .sort((a, b) => Number(b.eligible) - Number(a.eligible) || b.score - a.score);
}
