import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { recomputeBadges } from "../services/badge.js";

const r = Router();
r.use(requireAuth);

r.get("/", async (req, res) => {
  const quizzes = (await query("SELECT * FROM quizzes")).rows;
  const questions = (await query("SELECT * FROM quiz_questions ORDER BY quiz_id, sort_order")).rows;
  const isAdmin = req.user.role === "admin";

  const out = quizzes.map((q) => ({
    id: q.id,
    chapterId: q.chapter_id,
    title: q.title,
    minScorePct: q.min_score_pct,
    timeLimitSec: q.time_limit_sec,
    questions: questions
      .filter((x) => x.quiz_id === q.id)
      .map((x) => {
        const base = { id: x.id, q: x.q, options: x.options_json, answer: x.answer_idx };
        if (isAdmin) base.explain = x.explain;
        return base;
      })
  }));
  res.json(out);
});

r.get("/:chapterId", async (req, res) => {
  const q = (await query("SELECT * FROM quizzes WHERE chapter_id=$1", [req.params.chapterId])).rows[0];
  if (!q) return res.status(404).json({ error: "Quiz belum ada" });
  const qs = (await query("SELECT * FROM quiz_questions WHERE quiz_id=$1 ORDER BY sort_order", [q.id])).rows;
  const isAdmin = req.user.role === "admin";
  res.json({
    id: q.id,
    chapterId: q.chapter_id,
    title: q.title,
    minScorePct: q.min_score_pct,
    timeLimitSec: q.time_limit_sec,
    questions: qs.map((x) => {
      const base = { id: x.id, q: x.q, options: x.options_json, answer: x.answer_idx };
      if (isAdmin) base.explain = x.explain;
      return base;
    })
  });
});

r.post("/:chapterId/submit", async (req, res) => {
  const { answers = [], durationSec = 0 } = req.body || {};

  if (req.user.role !== "admin") {
    const totalMods = (await query(
      "SELECT COUNT(*)::int AS c FROM modules WHERE chapter_id=$1",
      [req.params.chapterId]
    )).rows[0].c;

    const doneMods = (await query(
      `SELECT COUNT(*)::int AS c
       FROM user_module_progress p
       JOIN modules m ON m.id = p.module_id
       WHERE p.user_id=$1 AND m.chapter_id=$2`,
      [req.user.id, req.params.chapterId]
    )).rows[0].c;

    if (doneMods < totalMods) {
      return res.status(403).json({
        error: `Kuis terkunci. Selesaikan ${totalMods - doneMods} modul lagi di chapter ini dulu.`
      });
    }
  }

  const q = (await query("SELECT * FROM quizzes WHERE chapter_id=$1", [req.params.chapterId])).rows[0];
  if (!q) return res.status(404).json({ error: "Quiz tidak ditemukan" });
  const qs = (await query("SELECT * FROM quiz_questions WHERE quiz_id=$1", [q.id])).rows;

  let correct = 0;
  let firstTimeCorrect = 0;
  const details = [];

  for (const question of qs) {
    const picked = answers.find((a) => a.questionId === question.id);
    const chosen = picked ? picked.chosen : -1;
    const ok = chosen === question.answer_idx;

    if (ok) {
      correct++;
      const existing = await query(
        "SELECT 1 FROM user_question_answered WHERE user_id=$1 AND question_id=$2",
        [req.user.id, question.id]
      );
      if (existing.rowCount === 0) {
        await query(
          "INSERT INTO user_question_answered (user_id, question_id) VALUES ($1, $2)",
          [req.user.id, question.id]
        );
        firstTimeCorrect++;
      }
    }

    details.push({
      questionId: question.id,
      chosen,
      correct: ok,
      rightAnswer: question.answer_idx,
      explain: question.explain
    });
  }

  const total = qs.length;
  const pct = total ? Math.round((correct / total) * 100) : 0;
  const passed = pct >= q.min_score_pct;

  const attemptInfo = await query(
    `INSERT INTO quiz_attempts (user_id, quiz_id, correct, total, duration_sec, passed)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [req.user.id, q.id, correct, total, durationSec, passed]
  );

  const gained = firstTimeCorrect * 10;
  if (gained) await query("UPDATE users SET xp = xp + $1 WHERE id=$2", [gained, req.user.id]);

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

  const newBadges = await recomputeBadges(req.user.id);

  res.json({
    attemptId: attemptInfo.rows[0].id,
    correct, total, pct, passed,
    firstTimeCorrect,
    minScorePct: q.min_score_pct,
    gainedXp: gained,
    newBadges,
    details: passed
      ? details
      : details.map((d) => ({ questionId: d.questionId, chosen: d.chosen, correct: d.correct }))
  });
});

r.post("/", requireAdmin, async (req, res) => {
  const { chapterId, title, minScorePct = 60, timeLimitSec = 300 } = req.body || {};
  const info = await query(
    `INSERT INTO quizzes (chapter_id, title, min_score_pct, time_limit_sec)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [chapterId, title, minScorePct, timeLimitSec]
  );
  res.json({ id: info.rows[0].id });
});

r.post("/:quizId/questions", requireAdmin, async (req, res) => {
  const { q, options, answer, explain } = req.body || {};
  const info = await query(
    `INSERT INTO quiz_questions (quiz_id, q, options_json, answer_idx, explain, sort_order)
     VALUES ($1,$2,$3::jsonb,$4,$5,
       COALESCE((SELECT MAX(sort_order)+1 FROM quiz_questions WHERE quiz_id=$1), 0))
     RETURNING id`,
    [req.params.quizId, q, JSON.stringify(options), answer, explain || ""]
  );
  res.json({ id: info.rows[0].id });
});

r.delete("/questions/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM quiz_questions WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

r.delete("/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM quizzes WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

export default r;