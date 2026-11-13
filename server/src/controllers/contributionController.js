import { transaction } from "../db/pool.js";
import { contributionsForUser, insertContribution } from "../models/contributionModel.js";
import { insertEvent } from "../models/impactModel.js";
import { ESTIMATES } from "../services/constants.js";

// A contribution made on its own, without an order (demo payment — nothing is charged).
export async function create(req, res) {
  const { amount } = req.body;
  const contribution = await transaction(async (db) => {
    const row = await insertContribution({ userId: req.user.id, amount }, db);
    await insertEvent({ type: "contribution", amount, message: `₹${amount} contributed for community meals` }, db);
    return row;
  });
  res.status(201).json({ contribution: { id: contribution.id, amount, createdAt: contribution.created_at } });
}

export async function mine(req, res) {
  const contributions = await contributionsForUser(req.user.id);
  const total = contributions.reduce((s, c) => s + c.amount, 0);
  res.json({
    contributions,
    total,
    estimates: { mealsFunded: Math.round((total / ESTIMATES.mealCostRupees) * 10) / 10, mealCostRupees: ESTIMATES.mealCostRupees },
  });
}
