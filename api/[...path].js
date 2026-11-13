// Vercel runs this file as a serverless function for every request to /api/*.
// It is the same Express app that `npm run dev` starts locally in server/, so
// there's only one copy of the API code.
import { createApp } from "../server/src/app.js";

export default createApp();
