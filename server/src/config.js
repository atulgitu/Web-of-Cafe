import "dotenv/config";

// All configuration comes from environment variables (see .env.example).
// The café runs on Indian time; setting TZ here keeps "today" and pickup
// windows correct even when the server itself runs in UTC (as on Render).
process.env.TZ = process.env.TZ || "Asia/Kolkata";

const required = (name) => {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable ${name}. See server/.env.example.`);
  return value;
};

export const config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5000,
  databaseUrl: required("DATABASE_URL"),
  databaseSsl: process.env.DATABASE_SSL === "true",
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  // Comma-separated list of allowed frontend origins.
  corsOrigins: (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((s) => s.trim()),
  // Enables the staff-only "reset demo data" endpoint. Leave off in a real deployment.
  demoMode: process.env.DEMO_MODE === "true",
};

export const isProduction = config.env === "production";
