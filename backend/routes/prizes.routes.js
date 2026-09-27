import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

r.get("/admin/list", requireAdmin, async (req, res) => {
  const period = req.query.month || currentMonthKey();
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return res.status(400).json({ error: "Format month harus YYYY-MM" });
  }
  const rows = (await query(
    "SELECT * FROM leaderboard_prizes WHERE period=$1 ORDER BY rank",
    [period]
  )).rows;
  res.json({ period, list: rows });
});

r.post("/admin", requireAdmin, async (req, res) => {
  const { period, rank, title, prize, emoji = "🏆" } = req.body || {};
  if (!period || !rank || !title || !prize) {
    return res.status(400).json({ error: "period, rank, title, prize wajib" });
  }
  if (!/^\d{4}-\d{2}$/.test(period)) {
    return res.status(400).json({ error: "Format period harus YYYY-MM" });
  }
  if (rank < 1 || rank > 10) {
    return res.status(400).json({ error: "Rank harus 1-10" });
  }

  const info = await query(`
    INSERT INTO leaderboard_prizes (period, rank, title, prize, emoji)
    VALUES ($1,$2,$3,$4,$5)
    ON CONFLICT (period, rank) DO UPDATE SET
      title = EXCLUDED.title,
      prize = EXCLUDED.prize,
      emoji = EXCLUDED.emoji
    RETURNING id
  `, [period, rank, title, prize, emoji]);

  res.json({ ok: true, id: info.rows[0].id });
});

r.delete("/admin/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM leaderboard_prizes WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

r.delete("/admin/period/:period", requireAdmin, async (req, res) => {
  await query("DELETE FROM leaderboard_prizes WHERE period=$1", [req.params.period]);
  res.json({ ok: true });
});

export default r;