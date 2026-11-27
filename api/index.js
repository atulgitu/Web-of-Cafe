// Vercel runs this file for every request to /api/* (vercel.json rewrites them here; req.url keeps the original path).
// It is the same Express app that `npm run dev` starts locally in server/, so
// there's only one copy of the API code.
import { createApp } from "../server/src/app.js";

export default createApp();
