// Jalankan db/migrate.js + db/seed.js di bawah Postgres advisory lock.
// Di Vercel beberapa instance bisa cold-start bersamaan; tanpa lock, CREATE TABLE IF NOT EXISTS paralel
// bisa bentrok (duplicate pg_type) dan seed bisa dobel. Lock lewat koneksi langsung (DATABASE_URL_UNPOOLED)
// karena advisory lock sesi tidak andal lewat PgBouncer.
import pg from "pg";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
const force = process.argv.includes("--force");
const client = new pg.Client({
  connectionString: url,
  ssl: process.env.PGSSL === "disable" ? false : { rejectUnauthorized: false }
});
const LOCK_ID = 7350002;

async function isSeeded(c) {
  const r = await c.query(
    "SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_demo_seeded'"
  );
  return r.rowCount > 0;
}

await client.connect();
try {
  if (!force && (await isSeeded(client))) {
    console.log("Demo DB already seeded; skipping migrate/seed for fast cold start");
    process.exit(0);
  }
  await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
  try {
    if (!force && (await isSeeded(client))) {
      console.log("Demo DB seeded by another instance");
      process.exit(0);
    }
    if (force) {
      console.log("Force reset: recreating public schema...");
      await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
    }
    for (const script of ["db/migrate.js", "db/seed.js"]) {
      execFileSync(process.execPath, [script], { cwd: root, stdio: "inherit", env: process.env });
    }
    await client.query("CREATE TABLE IF NOT EXISTS _demo_seeded (seeded_at TIMESTAMPTZ DEFAULT NOW())");
    await client.query("INSERT INTO _demo_seeded DEFAULT VALUES");
  } finally {
    await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]);
  }
} finally {
  await client.end();
}
