import { createApp } from "./app.js";
import { config } from "./config.js";
import { pool } from "./db/pool.js";

const app = createApp();
const server = app.listen(config.port, () => {
  console.log(`Coffee Cinnamon API listening on port ${config.port} (${config.env})`);
});

function shutdown() {
  server.close(() => pool.end().then(() => process.exit(0)));
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
