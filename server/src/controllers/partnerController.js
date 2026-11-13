import { getPartner, listPartners, partnerLoads } from "../models/partnerModel.js";
import { completedPickupsForPartner } from "../models/pickupModel.js";
import { notFound } from "../utils/errors.js";
import { startOfDay } from "../utils/time.js";

// Contact details are only shown to signed-in staff and partners.
const publicView = ({ contact: _c, ...p }) => p;

export async function list(req, res) {
  const partners = await listPartners();
  const canSeeContacts = ["STAFF", "PARTNER"].includes(req.user?.role);
  res.json({ partners: canSeeContacts ? partners : partners.map(publicView) });
}

export async function getOne(req, res) {
  const partner = await getPartner(req.params.id);
  if (!partner) throw notFound("That partner doesn't exist.");
  res.json({ partner: ["STAFF", "PARTNER"].includes(req.user?.role) ? partner : publicView(partner) });
}

// The signed-in partner's own page: who they are, today's load, and pickup history.
export async function me(req, res) {
  const partner = await getPartner(req.user.partnerId);
  const [loads, history] = await Promise.all([partnerLoads(startOfDay()), completedPickupsForPartner(partner.id)]);
  const loadToday = loads.get(partner.id) || 0;
  res.json({ partner, today: { loadToday, stillNeeded: Math.max(0, partner.needsPerDay - loadToday) }, history });
}
