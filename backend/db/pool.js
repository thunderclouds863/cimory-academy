import pg from "pg";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Hitung path ke .env secara eksplisit
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env dari folder backend/ (naik 1 level dari db/)
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Log buat debugging (opsional, hapus kalau udah jalan)
console.log("[pool.js] PGUSER:", process.env.PGUSER);
console.log("[pool.js] PGDATABASE:", process.env.PGDATABASE);

// DATABASE_URL (mis. Neon/Render) diprioritaskan; kalau tidak ada pakai PG* vars
const connection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === "disable" ? false : { rejectUnauthorized: false }
    }
  : {};

export const pool = new pg.Pool({
  ...connection,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT || 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  max: 10,
  idleTimeoutMillis: 30000
});

pool.on("error", (err) => console.error("PG pool error:", err));

export const query = (text, params) => pool.query(text, params);