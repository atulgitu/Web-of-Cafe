// Forecast, impact, homepage overview and staff dashboard — the read-mostly endpoints.
import { recentActivity } from "../models/impactModel.js";
import { generateForecast, getForecast } from "../services/forecastRunner.js";
import { impactDetails, impactSummary, overview, staffDashboard } from "../services/impactService.js";

export const forecast = async (_req, res) => res.json(await getForecast());

export const regenerateForecast = async (_req, res) => res.json(await generateForecast());

export async function impact(req, res) {
  const period = ["week", "month", "all"].includes(req.query.period) ? req.query.period : "all";
  const [summary, details] = await Promise.all([impactSummary(period), impactDetails()]);
  res.json({ ...summary, ...details });
}

export async function activity(req, res) {
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  res.json({ activity: await recentActivity({ limit }) });
}

export const home = async (_req, res) => res.json(await overview());

export const dashboard = async (_req, res) => res.json(await staffDashboard());
