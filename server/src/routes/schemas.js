// Request body schemas (zod). Anything not matching is rejected with a 400 before
// it reaches a controller.
import { z } from "zod";
import { MAX_CONTRIBUTION } from "../services/constants.js";

const trimmed = (max) => z.string().trim().min(1).max(max);

export const registerSchema = z.object({
  name: trimmed(80),
  email: z.email().max(120),
  password: z.string().min(8, "Use at least 8 characters.").max(100),
  phone: z.string().trim().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(100),
});

export const updateMeSchema = z.object({
  name: trimmed(80).optional(),
  phone: z.string().trim().max(20).optional(),
});

const orderLine = z.object({
  menuItemId: z.string().max(20),
  size: z.string().max(40).nullish(),
  addons: z.array(z.string().max(60)).max(10).default([]),
  quantity: z.number().int().min(1).max(50),
  instructions: z.string().trim().max(200).optional(),
});

export const quoteSchema = z.object({
  lines: z.array(orderLine).min(1, "Your cart is empty.").max(40),
  couponCode: z.string().trim().max(20).nullish(),
  contribution: z.number().int().min(0).max(MAX_CONTRIBUTION).default(0),
});

// Indian mobile number: 10 digits starting 6–9, optionally with +91 / 91 / 0 in front.
// Spaces and dashes are allowed while typing and removed before saving.
export const INDIAN_MOBILE = /^(?:\+?91|0)?[6-9]\d{9}$/;
const mobile = z
  .string()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => INDIAN_MOBILE.test(v), "Enter a 10-digit mobile number, like 98765 43210.")
  .transform((v) => `+91 ${v.slice(-10, -5)} ${v.slice(-5)}`);

// Orders are pickup-only and paid at the counter. Confirmation happens on WhatsApp.
export const orderSchema = quoteSchema.extend({
  fulfilment: z.literal("pickup").default("pickup"),
  paymentMethod: z.literal("counter").default("counter"),
  customer: z.object({
    name: z.string().trim().min(1, "Please enter your name.").max(80),
    phone: mobile,
  }),
  pickupAt: z.coerce.date().nullish(), // null = as soon as possible
  notes: z.string().trim().max(300, "Please keep notes under 300 characters.").optional(),
});

export const orderStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "ready", "completed", "cancelled"]),
});

export const contributionSchema = z.object({
  amount: z.number().int().min(1).max(MAX_CONTRIBUTION),
});

const when = z.coerce.date();

export const listingSchema = z.object({
  item: trimmed(80),
  category: z.enum(["Meals", "Sandwiches", "Bakery", "Snacks"]),
  portions: z.number().int().min(1).max(200),
  kgPerPortion: z.number().min(0.01).max(2),
  veg: z.boolean(),
  dietary: z.array(z.string().max(40)).max(6).default([]),
  preparedNote: z.string().trim().max(80).optional(),
  pickupStart: when,
  pickupEnd: when,
  bestBefore: when,
});

export const listingUpdateSchema = z
  .object({
    item: trimmed(80),
    portions: z.number().int().min(1).max(200),
    preparedNote: z.string().trim().max(80),
    pickupStart: when,
    pickupEnd: when,
    bestBefore: when,
  })
  .partial();

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Please tell us your name.").max(80),
  email: z.email("Enter a valid email address.").max(120),
  topic: trimmed(60),
  message: z.string().trim().min(10, "Please write at least 10 characters.").max(2000, "Please keep it under 2,000 characters."),
});

export const reserveSchema = z.object({ partnerId: z.string().max(20).optional() }).default({});
