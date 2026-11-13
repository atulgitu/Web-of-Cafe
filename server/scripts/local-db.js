// Local development only: runs a real PostgreSQL server from the binaries in
// node_modules (the `embedded-postgres` dev dependency), so you don't need to
// install Postgres or Docker. Production uses Render's managed PostgreSQL.
//
//   npm run db:local          start (initialises ./.pgdata on first run)
//   npm run db:local -- stop  stop it
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import pg from "pg";

const PORT = 5433;
const USER = "postgres";
const PASSWORD = "postgres";
const DB_NAME = "coffee_cinnamon";
const dataDir = path.resolve(".pgdata");

const platformPkg = {
  win32: "@embedded-postgres/windows-x64",
  darwin: process.arch === "arm64" ? "@embedded-postgres/darwin-arm64" : "@embedded-postgres/darwin-x64",
  linux: process.arch === "arm64" ? "@embedded-postgres/linux-arm64" : "@embedded-postgres/linux-x64",
}[process.platform];

const binDir = path.resolve("node_modules", platformPkg, "native", "bin");
const exe = (name) => path.join(binDir, process.platform === "win32" ? `${name}.exe` : name);
const run = (name, args) => execFileSync(exe(name), args, { stdio: "inherit" });

if (process.argv[2] === "stop") {
  run("pg_ctl", ["-D", dataDir, "stop", "-m", "fast"]);
  process.exit(0);
}

if (!existsSync(path.join(dataDir, "PG_VERSION"))) {
  const pwFile = path.join(os.tmpdir(), "cc-pg-pw.txt");
  writeFileSync(pwFile, PASSWORD);
  run("initdb", ["-D", dataDir, "-U", USER, `--pwfile=${pwFile}`, "-A", "scram-sha-256", "-E", "UTF8", "--locale=C"]);
  rmSync(pwFile);
}

try {
  execFileSync(exe("pg_ctl"), ["-D", dataDir, "status"], { stdio: "ignore" });
  console.log("PostgreSQL is already running.");
} catch {
  // stdio "ignore": the server outlives this script, and must not hold our terminal's pipes open.
  execFileSync(exe("pg_ctl"), ["-D", dataDir, "-l", path.join(dataDir, "server.log"), "-o", `-p ${PORT}`, "-w", "start"], {
    stdio: "ignore",
  });
  console.log(`PostgreSQL started on port ${PORT}.`);
}

const admin = new pg.Client({ host: "localhost", port: PORT, user: USER, password: PASSWORD, database: "postgres" });
await admin.connect();
const { rowCount } = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
if (!rowCount) await admin.query(`CREATE DATABASE ${DB_NAME}`);
await admin.end();

console.log(`\nLocal PostgreSQL ready:\n  DATABASE_URL=postgres://${USER}:${PASSWORD}@localhost:${PORT}/${DB_NAME}\n`);
