import { Router } from "express";
import bcrypt from "bcryptjs";
import { query } from "../db/pool.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { recomputeBadges } from "../services/badge.js";

const r = Router();
r.use(requireAuth);

r.get("/me", async (req, res) => {
  const modules = (await query(
    "SELECT module_id, completed_at FROM user_module_progress WHERE user_id=$1",
    [req.user.id]
  )).rows;

  const quizzes = (await query(
    `SELECT q.chapter_id, MAX(a.correct) AS best_correct, MAX(a.total) AS total
     FROM quiz_attempts a JOIN quizzes q ON q.id=a.quiz_id
     WHERE a.user_id=$1 GROUP BY q.chapter_id`,
    [req.user.id]
  )).rows;

  const cards = (await query(
    "SELECT flashcard_id FROM user_flashcard_views WHERE user_id=$1",
    [req.user.id]
  )).rows;

  const user = (await query(
    "SELECT xp, streak FROM users WHERE id=$1",
    [req.user.id]
  )).rows[0];

  res.json({
    completed: modules.map((m) => m.module_id),
    quiz: Object.fromEntries(quizzes.map((q) => [q.chapter_id, { best: q.best_correct, total: q.total }])),
    flashcards: cards.map((c) => c.flashcard_id),
    xp: user?.xp || 0,
    streak: user?.streak || 0
  });
});

r.post("/modules/:id/complete", async (req, res) => {
  const { id } = req.params;

  const mod = (await query(
    "SELECT id, chapter_id, no, sort_order FROM modules WHERE id=$1",
    [id]
  )).rows[0];
  if (!mod) return res.status(404).json({ error: "Modul tidak ditemukan" });

  const prevMod = (await query(
    `SELECT id, title FROM modules
     WHERE chapter_id=$1
       AND (sort_order < $2 OR (sort_order = $2 AND no < $3))
     ORDER BY sort_order DESC, no DESC
     LIMIT 1`,
    [mod.chapter_id, mod.sort_order, mod.no]
  )).rows[0];

  if (prevMod) {
    const prevDone = await query(
      "SELECT 1 FROM user_module_progress WHERE user_id=$1 AND module_id=$2",
      [req.user.id, prevMod.id]
    );
    if (prevDone.rowCount === 0) {
      return res.status(403).json({
        error: `Modul terkunci. Selesaikan "${prevMod.title}" terlebih dahulu.`
      });
    }
  }

  const chapter = (await query(
    "SELECT id, no FROM chapters WHERE id=$1",
    [mod.chapter_id]
  )).rows[0];

  if (chapter && chapter.no > 1) {
    const prevChapter = (await query(
      "SELECT id, title FROM chapters WHERE no < $1 ORDER BY no DESC LIMIT 1",
      [chapter.no]
    )).rows[0];

    if (prevChapter) {
      const totalModsPrev = (await query(
        "SELECT COUNT(*)::int AS c FROM modules WHERE chapter_id=$1",
        [prevChapter.id]
      )).rows[0].c;

      const doneModsPrev = (await query(
        `SELECT COUNT(*)::int AS c FROM user_module_progress p
         JOIN modules m ON m.id = p.module_id
         WHERE p.user_id=$1 AND m.chapter_id=$2`,
        [req.user.id, prevChapter.id]
      )).rows[0].c;

      if (doneModsPrev < totalModsPrev) {
        return res.status(403).json({
          error: `Chapter terkunci. Selesaikan semua modul di "${prevChapter.title}" terlebih dahulu.`
        });
      }
    }
  }

  const exists = await query(
    "SELECT 1 FROM user_module_progress WHERE user_id=$1 AND module_id=$2",
    [req.user.id, id]
  );

  let gained = 0;
  if (exists.rowCount === 0) {
    await query(
      "INSERT INTO user_module_progress (user_id, module_id) VALUES ($1,$2)",
      [req.user.id, id]
    );
    gained = 50;
    await query("UPDATE users SET xp = xp + $1 WHERE id=$2", [gained, req.user.id]);
    await query(
      `UPDATE users SET
         streak = CASE
           WHEN last_active = CURRENT_DATE THEN streak
           WHEN last_active = CURRENT_DATE - INTERVAL '1 day' THEN streak + 1
           ELSE 1
         END,
         last_active = CURRENT_DATE
       WHERE id=$1`,
      [req.user.id]
    );
  }

  const newBadges = await recomputeBadges(req.user.id);
  res.json({ gained, newBadges });
});

r.get("/admin/all", requireAdmin, async (_req, res) => {
  const rows = (await query(`
    SELECT
      u.id, u.email, u.name, u.role, u.xp, u.streak, u.last_active,
      COALESCE((SELECT COUNT(*)::int FROM user_module_progress WHERE user_id=u.id), 0) AS modules_done,
      (SELECT COUNT(*)::int FROM modules) AS modules_total,
      COALESCE((SELECT COUNT(*)::int FROM quiz_attempts WHERE user_id=u.id AND passed=TRUE), 0) AS quizzes_passed,
      COALESCE((SELECT COUNT(*)::int FROM user_badges WHERE user_id=u.id), 0) AS badges_earned,
      COALESCE((SELECT COUNT(*)::int FROM user_flashcard_views WHERE user_id=u.id), 0) AS cards_seen
    FROM users u
    ORDER BY u.name ASC
  `)).rows;
  res.json(rows);
});

r.get("/admin/users/:id", requireAdmin, async (req, res) => {
  const user = (await query(
    "SELECT id, email, name, role, xp, streak, last_active, created_at FROM users WHERE id=$1",
    [req.params.id]
  )).rows[0];
  if (!user) return res.status(404).json({ error: "User tidak ditemukan" });

  const modules = (await query(
    `SELECT m.id, m.title, m.chapter_id, p.completed_at
     FROM user_module_progress p
     JOIN modules m ON m.id = p.module_id
     WHERE p.user_id=$1
     ORDER BY p.completed_at DESC`,
    [req.params.id]
  )).rows;

  const attempts = (await query(
    `SELECT a.id, a.correct, a.total, a.duration_sec, a.passed, a.created_at,
            q.title AS quiz_title, q.chapter_id
     FROM quiz_attempts a
     JOIN quizzes q ON q.id = a.quiz_id
     WHERE a.user_id=$1
     ORDER BY a.created_at DESC
     LIMIT 50`,
    [req.params.id]
  )).rows;

  const badges = (await query(
    `SELECT b.id, b.emoji, b.title, ub.earned_at
     FROM user_badges ub
     JOIN badges b ON b.id = ub.badge_id
     WHERE ub.user_id=$1
     ORDER BY ub.earned_at DESC`,
    [req.params.id]
  )).rows;

  res.json({ user, modules, attempts, badges });
});

r.post("/admin/users", requireAdmin, async (req, res) => {
  const { name, email, password, role = "user" } = req.body || {};
  if (!name || !email || !password) return res.status(400).json({ error: "Nama, email, password wajib" });
  if (password.length < 6) return res.status(400).json({ error: "Password minimal 6 karakter" });
  if (!["user", "admin"].includes(role)) return res.status(400).json({ error: "Role tidak valid" });

  const exists = await query("SELECT 1 FROM users WHERE email=$1", [email.toLowerCase()]);
  if (exists.rowCount) return res.status(409).json({ error: "Email sudah terdaftar" });

  const hash = await bcrypt.hash(password, 10);
  const info = await query(
    "INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id, email, name, role",
    [email.toLowerCase(), hash, name, role]
  );
  res.json(info.rows[0]);
});

r.put("/admin/users/:id", requireAdmin, async (req, res) => {
  const { name, role, password } = req.body || {};
  const fields = [];
  const params = [];
  let i = 1;

  if (name) { fields.push(`name=$${i++}`); params.push(name); }
  if (role) {
    if (!["user", "admin"].includes(role)) return res.status(400).json({ error: "Role tidak valid" });
    fields.push(`role=$${i++}`); params.push(role);
  }
  if (password) {
    if (password.length < 6) return res.status(400).json({ error: "Password minimal 6 karakter" });
    fields.push(`password_hash=$${i++}`); params.push(await bcrypt.hash(password, 10));
  }
  if (!fields.length) return res.status(400).json({ error: "Tidak ada yang diubah" });

  params.push(req.params.id);
  await query(`UPDATE users SET ${fields.join(", ")} WHERE id=$${i}`, params);
  res.json({ ok: true });
});

r.post("/admin/users/:id/reset-password", requireAdmin, async (req, res) => {
  const { newPassword } = req.body || {};
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password minimal 6 karakter" });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  await query("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, req.params.id]);
  res.json({ ok: true });
});

r.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  const info = await query(
    "DELETE FROM users WHERE id=$1 RETURNING id",
    [req.params.id]
  );
  if (info.rowCount === 0) return res.status(404).json({ error: "User tidak ditemukan" });
  res.json({ ok: true });
});

export default r;