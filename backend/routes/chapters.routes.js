import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);

function fmtDuration(sec) {
  if (!sec || sec < 1) return null;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

r.get("/", async (_req, res) => {
  const chapters = (await query("SELECT * FROM chapters ORDER BY sort_order, no")).rows;
  const modules = (await query("SELECT * FROM modules ORDER BY chapter_id, sort_order, no")).rows;
  const grouped = chapters.map((c) => ({
    id: c.id, no: c.no, title: c.title, description: c.description,
    modules: modules
      .filter((m) => m.chapter_id === c.id)
      .map((m) => ({
        id: m.id, no: m.no, title: m.title,
        duration: m.duration_sec ? fmtDuration(m.duration_sec) : (m.duration || ""),
        durationSec: m.duration_sec || null,
        video: m.video_path
          ? (/^https?:\/\//i.test(m.video_path) ? m.video_path : `/${m.video_path.replace(/^\/+/, "")}`)
          : "",
        summary: m.summary
      }))
  }));
  res.json(grouped);
});

r.post("/modules/:id/duration", async (req, res) => {
  const { durationSec } = req.body || {};
  if (!durationSec || durationSec < 1 || durationSec > 60 * 60 * 5) {
    return res.status(400).json({ error: "Durasi invalid" });
  }
  await query("UPDATE modules SET duration_sec=$1 WHERE id=$2", [durationSec, req.params.id]);
  res.json({ ok: true, duration: fmtDuration(durationSec), durationSec });
});

r.post("/", requireAdmin, async (req, res) => {
  const { id, no, title, description, sort_order = 0 } = req.body || {};
  if (!id || !no || !title) return res.status(400).json({ error: "id, no, title wajib" });
  await query(
    "INSERT INTO chapters (id, no, title, description, sort_order) VALUES ($1,$2,$3,$4,$5)",
    [id, no, title, description || null, sort_order]
  );
  res.json({ ok: true });
});

r.put("/:id", requireAdmin, async (req, res) => {
  const { title, description, sort_order } = req.body || {};
  await query(
    "UPDATE chapters SET title=$1, description=$2, sort_order=$3 WHERE id=$4",
    [title, description, sort_order ?? 0, req.params.id]
  );
  res.json({ ok: true });
});

r.delete("/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM chapters WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

r.post("/:chapterId/modules", requireAdmin, async (req, res) => {
  const { id, no, title, duration, summary, video_path = null } = req.body || {};
  await query(
    `INSERT INTO modules (id, chapter_id, no, title, duration, summary, video_path)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, req.params.chapterId, no, title, duration || "", summary || "", video_path]
  );
  res.json({ ok: true });
});

r.put("/modules/:id", requireAdmin, async (req, res) => {
  const { title, duration, summary, video_path } = req.body || {};
  await query(
    `UPDATE modules SET title=$1, duration=$2, summary=$3,
     video_path=COALESCE($4, video_path) WHERE id=$5`,
    [title, duration, summary, video_path, req.params.id]
  );
  res.json({ ok: true });
});

r.delete("/modules/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM modules WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

export default r;