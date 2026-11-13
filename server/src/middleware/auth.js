import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { findUserById } from "../models/userModel.js";
import { forbidden, unauthorized } from "../utils/errors.js";

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

// Reads "Authorization: Bearer <token>". The user (and role) is always loaded
// from the database, so a tampered or stale role in the token can't grant access.
async function loadUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    return await findUserById(payload.sub);
  } catch {
    return null;
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    req.user = await loadUser(req);
    next();
  } catch (err) {
    next(err);
  }
}

export async function requireAuth(req, _res, next) {
  try {
    req.user = await loadUser(req);
    if (!req.user) return next(unauthorized());
    next();
  } catch (err) {
    next(err);
  }
}

// Use after requireAuth: requireRole("STAFF") or requireRole("STAFF", "PARTNER").
export const requireRole =
  (...roles) =>
  (req, _res, next) =>
    roles.includes(req.user?.role) ? next() : next(forbidden());
