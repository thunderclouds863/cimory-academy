import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { recomputeBadges } from "../services/badge.js";

const r = Router();
r.use(requireAuth);

r.get("/", async (_req, res) => {
  const rows = (await query("SELECT * FROM flashcards ORDER BY sort_order")).rows;
  res.json(rows.map((x) => ({ id: x.id, emoji: x.emoji, front: x.front, back: x.back_json })));
});

r.post("/:id/view", async (req, res) => {
  await query(
    "INSERT INTO user_flashcard_views (user_id, flashcard_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [req.user.id, req.params.id]
  );
  const newBadges = await recomputeBadges(req.user.id);
  res.json({ ok: true, newBadges });
});

r.post("/", requireAdmin, async (req, res) => {
  const { id, emoji, front, back } = req.body || {};
  await query(
    "INSERT INTO flashcards (id, emoji, front, back_json) VALUES ($1,$2,$3,$4::jsonb)",
    [id, emoji || "💡", front, JSON.stringify(back || [])]
  );
  res.json({ ok: true });
});

r.put("/:id", requireAdmin, async (req, res) => {
  const { emoji, front, back } = req.body || {};
  await query(
    "UPDATE flashcards SET emoji=$1, front=$2, back_json=$3::jsonb WHERE id=$4",
    [emoji, front, JSON.stringify(back || []), req.params.id]
  );
  res.json({ ok: true });
});

r.delete("/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM flashcards WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

export default r;