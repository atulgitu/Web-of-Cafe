// Every API route in one readable table. Middleware runs left to right:
// auth check → role check → body validation → controller.
import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as auth from "../controllers/authController.js";
import * as contact from "../controllers/contactController.js";
import * as contributions from "../controllers/contributionController.js";
import * as insights from "../controllers/insightController.js";
import * as menu from "../controllers/menuController.js";
import * as orders from "../controllers/orderController.js";
import * as partners from "../controllers/partnerController.js";
import * as rescue from "../controllers/rescueController.js";
import * as demo from "../controllers/demoController.js";
import { optionalAuth, requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { notFound } from "../utils/errors.js";
import * as s from "./schemas.js";

const router = Router();

// Orders and rescue listings have numeric ids. A link like /rescue/abc used to reach the
// database and come back as a 500; now it is simply "not found".
const numericId = (req, res, next) => next(/^\d{1,9}$/.test(req.params.id) ? undefined : notFound());
const staff = [requireAuth, requireRole("STAFF")];
const partner = [requireAuth, requireRole("PARTNER")];
const staffOrPartner = [requireAuth, requireRole("STAFF", "PARTNER")];

// Slow down password guessing.
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: "draft-8", legacyHeaders: false });

// Stop the contact form being used to flood the database.
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "You've sent several messages already. Please try again in a few minutes." },
});

// Guests can place orders, so limit how fast one address can create them.
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: { error: "Too many orders from this connection. Please wait a few minutes or message us on WhatsApp." },
});

router.get("/health", (_req, res) => res.json({ ok: true }));

// Auth
router.post("/auth/register", authLimiter, validate(s.registerSchema), auth.register);
router.post("/auth/login", authLimiter, validate(s.loginSchema), auth.login);
router.get("/auth/me", requireAuth, auth.me);
router.patch("/auth/me", requireAuth, validate(s.updateMeSchema), auth.updateMe);
router.post("/auth/logout", auth.logout);

// Menu
router.get("/menu", menu.list);
router.get("/menu/:id", menu.get);

// Orders
router.post("/orders/quote", validate(s.quoteSchema), orders.getQuote);
router.post("/orders", orderLimiter, optionalAuth, validate(s.orderSchema), orders.create);
router.get("/orders/my", requireAuth, orders.mine);
router.get("/orders/today", ...staff, orders.today);
router.get("/orders/:id", numericId, requireAuth, orders.getOne);
router.patch("/orders/:id/status", numericId, ...staff, validate(s.orderStatusSchema), orders.updateStatus);

// Contributions
router.post("/contributions", requireAuth, validate(s.contributionSchema), contributions.create);
router.get("/contributions/my", requireAuth, contributions.mine);

// Contact
router.post("/contact", contactLimiter, validate(s.contactSchema), contact.create);
router.get("/contact", ...staff, contact.list);

// Rescue
router.get("/rescue", rescue.board);
router.get("/rescue/:id", numericId, rescue.getOne);
router.post("/rescue", ...staff, validate(s.listingSchema), rescue.create);
router.patch("/rescue/:id", numericId, ...staff, validate(s.listingUpdateSchema), rescue.update);
router.get("/rescue/:id/matches", numericId, ...staff, rescue.matches);
router.post("/rescue/:id/reserve", numericId, ...staffOrPartner, validate(s.reserveSchema), rescue.reserve);
router.post("/rescue/:id/release", numericId, ...staffOrPartner, rescue.release);
router.post("/rescue/:id/complete", numericId, ...staffOrPartner, rescue.complete);

// Partners
router.get("/partners", optionalAuth, partners.list);
router.get("/partners/me", ...partner, partners.me);
router.get("/partners/:id", optionalAuth, partners.getOne);

// Forecast (read is public so the homepage can show it; regenerating is staff-only)
router.get("/forecast", insights.forecast);
router.post("/forecast/generate", ...staff, insights.regenerateForecast);

// Impact and overviews
router.get("/impact", insights.impact);
router.get("/impact/activity", insights.activity);
router.get("/overview", insights.home);
router.get("/dashboard", ...staff, insights.dashboard);

// Staff-only: reset the sample data (only when DEMO_MODE=true)
router.post("/demo/reset", ...staff, demo.reset);

export default router;
