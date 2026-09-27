import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);

r.get("/", async (req, res) => {
  const all = (await query("SELECT * FROM badges ORDER BY id")).rows;
  const mine = (await query("SELECT badge_id FROM user_badges WHERE user_id=$1", [req.user.id])).rows;
  const ownedIds = new Set(mine.map((x) => x.badge_id));

  res.json(all.map((b) => ({
    id: b.id,
    emoji: b.emoji,
    title: b.title,
    desc: b.descr,
    type: b.type,
    threshold: b.threshold,
    owned: ownedIds.has(b.id)
  })));
});

r.get("/admin/list", requireAdmin, async (_req, res) => {
  const rows = (await query(`
    SELECT b.*,
      (SELECT COUNT(*)::int FROM user_badges WHERE badge_id=b.id) AS earned_count,
      (SELECT COUNT(*)::int FROM users WHERE role='user') AS total_users
    FROM badges b
    ORDER BY b.id
  `)).rows;
  res.json(rows);
});

r.post("/admin", requireAdmin, async (req, res) => {
  const { id, emoji, title, desc, type, threshold = 1 } = req.body || {};
  if (!id || !title || !type) {
    return res.status(400).json({ error: "ID, judul, dan type wajib" });
  }

  const validTypes = ["modules", "streak", "chapter", "perfectQuiz", "flashcards", "allModules"];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ error: `Type harus salah satu dari: ${validTypes.join(", ")}` });
  }

  const exists = await query("SELECT 1 FROM badges WHERE id=$1", [id]);
  if (exists.rowCount) return res.status(409).json({ error: "ID badge sudah dipakai" });

  await query(
    `INSERT INTO badges (id, emoji, title, descr, type, threshold)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, emoji || "🏅", title, desc || "", type, threshold]
  );
  res.json({ ok: true });
});

r.put("/admin/:id", requireAdmin, async (req, res) => {
  const { emoji, title, desc, type, threshold } = req.body || {};
  const fields = [];
  const params = [];
  let i = 1;

  if (emoji !== undefined)     { fields.push(`emoji=$${i++}`);     params.push(emoji); }
  if (title !== undefined)     { fields.push(`title=$${i++}`);     params.push(title); }
  if (desc !== undefined)      { fields.push(`descr=$${i++}`);     params.push(desc); }
  if (type !== undefined) {
    const validTypes = ["modules", "streak", "chapter", "perfectQuiz", "flashcards", "allModules"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: `Type harus salah satu dari: ${validTypes.join(", ")}` });
    }
    fields.push(`type=$${i++}`); params.push(type);
  }
  if (threshold !== undefined) { fields.push(`threshold=$${i++}`); params.push(threshold); }

  if (!fields.length) return res.status(400).json({ error: "Tidak ada yang diubah" });
  params.push(req.params.id);

  await query(`UPDATE badges SET ${fields.join(", ")} WHERE id=$${i}`, params);
  res.json({ ok: true });
});

r.delete("/admin/:id", requireAdmin, async (req, res) => {
  const earned = await query(
    "SELECT COUNT(*)::int AS c FROM user_badges WHERE badge_id=$1",
    [req.params.id]
  );
  const count = earned.rows[0].c;

  if (count > 0) {
    const force = req.query.force === "1";
    if (!force) {
      return res.status(409).json({
        error: `Badge ini sudah didapat oleh ${count} user. Kirim ?force=1 untuk hapus paksa (progress user akan hilang).`,
        earned_count: count
      });
    }
  }

  await query("DELETE FROM badges WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

r.get("/admin/:id/owners", requireAdmin, async (req, res) => {
  const rows = (await query(`
    SELECT u.id, u.name, u.email, ub.earned_at
    FROM user_badges ub
    JOIN users u ON u.id = ub.user_id
    WHERE ub.badge_id = $1
    ORDER BY ub.earned_at DESC
  `, [req.params.id])).rows;
  res.json(rows);
});

export default r;