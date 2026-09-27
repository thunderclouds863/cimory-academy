import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./pool.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

(async () => {
  try {
    await pool.query(sql);
    console.log("✅ Schema siap");
  } catch (e) {
    console.error("❌ Migrate gagal:", e.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();