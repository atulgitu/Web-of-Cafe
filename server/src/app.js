import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

export function createApp() {
  const app = express();
  app.set("trust proxy", 1); // Render sits behind a proxy; needed for correct client IPs in rate limiting
  app.disable("x-powered-by");

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin tools (no Origin header) and the configured frontends.
        if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
        callback(null, false);
      },
    })
  );
  app.use(express.json({ limit: "50kb" }));

  app.get("/", (_req, res) => res.json({ name: "Coffee Cinnamon API", docs: "See README.md → API" }));
  app.use("/api", routes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
