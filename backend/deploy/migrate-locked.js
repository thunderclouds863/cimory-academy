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
const client = new pg.Client({
  connectionString: url,
  ssl: process.env.PGSSL === "disable" ? false : { rejectUnauthorized: false }
});
const LOCK_ID = 7350002;

await client.connect();
await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
try {
  for (const script of ["db/migrate.js", "db/seed.js"]) {
    execFileSync(process.execPath, [script], { cwd: root, stdio: "inherit", env: process.env });
  }
} finally {
  await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]);
  await client.end();
}
