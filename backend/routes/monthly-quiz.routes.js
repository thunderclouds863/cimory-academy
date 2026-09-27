import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { recomputeBadges } from "../services/badge.js";

const r = Router();
r.use(requireAuth);

const MONTH_NAMES = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthTitle(monthKey) {
  const [y, m] = monthKey.split("-").map(Number);
  return `Quiz ${MONTH_NAMES[m - 1]} ${y}`;
}

function mapQuestion(x, isAdmin) {
  const base = { id: x.id, q: x.q, options: x.options_json, answer: x.answer_idx };
  if (isAdmin) base.explain = x.explain;
  return base;
}

async function loadMonthlyDetail(monthlyId, user) {
  const m = (await query("SELECT * FROM monthly_quizzes WHERE id=$1", [monthlyId])).rows[0];
  if (!m) return null;

  const qs = (await query(
    "SELECT * FROM monthly_quiz_questions WHERE monthly_id=$1 ORDER BY sort_order",
    [monthlyId]
  )).rows;

  const isAdmin = user.role === "admin";
  const attempt = (await query(
    "SELECT * FROM monthly_quiz_attempts WHERE monthly_id=$1 AND user_id=$2",
    [monthlyId, user.id]
  )).rows[0];

  let attemptPayload = null;
  if (attempt) {
    const answers = Array.isArray(attempt.answers_json) ? attempt.answers_json : [];

    let details = [];
    if (answers.length > 0) {
      details = qs.map((question) => {
        const picked = answers.find((a) => Number(a.questionId) === question.id);
        const chosen = picked ? picked.chosen : -1;
        const ok = chosen === question.answer_idx;
        return {
          questionId: question.id,
          chosen,
          correct: ok,
          rightAnswer: question.answer_idx,
          explain: question.explain
        };
      });
    } else {
      details = qs.map((question) => ({
        questionId: question.id,
        chosen: null,
        correct: null,
        rightAnswer: question.answer_idx,
        explain: question.explain
      }));
    }

    attemptPayload = {
      correct: attempt.correct,
      total: attempt.total,
      durationSec: attempt.duration_sec,
      duration_sec: attempt.duration_sec,
      passed: attempt.passed,
      createdAt: attempt.created_at,
      details
    };
  }

  return {
    id: m.id,
    monthKey: m.month_key,
    title: m.title,
    description: m.description,
    minScorePct: m.min_score_pct,
    timeLimitSec: m.time_limit_sec,
    isActive: m.is_active,
    isCurrentMonth: m.month_key === currentMonthKey(),
    totalQuestions: qs.length,
    questions: qs.map((x) => mapQuestion(x, isAdmin)),
    attempt: attemptPayload,
    myAttempt: attemptPayload,
    locked: !!attempt && !isAdmin
  };
}

r.get("/current", async (req, res) => {
  const mk = currentMonthKey();
  const m = (await query(
    "SELECT id FROM monthly_quizzes WHERE month_key=$1 AND is_active=TRUE",
    [mk]
  )).rows[0];

  if (!m) return res.json(null);

  const detail = await loadMonthlyDetail(m.id, req.user);
  res.json(detail);
});

r.get("/archive", async (req, res) => {
  const mk = currentMonthKey();
  const list = (await query(
    `SELECT m.*,
      (SELECT json_build_object(
        'correct', a.correct,
        'total', a.total,
        'duration_sec', a.duration_sec,
        'passed', a.passed
      ) FROM monthly_quiz_attempts a WHERE a.monthly_id=m.id AND a.user_id=$1) AS my_attempt,
      (SELECT COUNT(*)::int FROM monthly_quiz_questions WHERE monthly_id=m.id) AS total_questions
     FROM monthly_quizzes m
     WHERE m.month_key < $2
     ORDER BY m.month_key DESC`,
    [req.user.id, mk]
  )).rows;

  res.json(list.map((x) => ({
    id: x.id,
    monthKey: x.month_key,
    title: x.title,
    totalQuestions: x.total_questions,
    minScorePct: x.min_score_pct,
    myAttempt: x.my_attempt === null ? null : x.my_attempt
  })));
});

r.get("/admin/list", requireAdmin, async (_req, res) => {
  const list = (await query(`
    SELECT m.*,
      (SELECT COUNT(*)::int FROM monthly_quiz_questions WHERE monthly_id=m.id) AS total_questions,
      (SELECT COUNT(*)::int FROM monthly_quiz_attempts WHERE monthly_id=m.id) AS attempts_count,
      (SELECT COUNT(*)::int FROM users WHERE role='user') AS total_users
    FROM monthly_quizzes m
    ORDER BY m.month_key DESC
  `)).rows;
  res.json(list);
});

r.post("/admin", requireAdmin, async (req, res) => {
  const { monthKey, title, description, minScorePct = 60, timeLimitSec = 600 } = req.body || {};
  if (!monthKey || !/^\d{4}-\d{2}$/.test(monthKey)) {
    return res.status(400).json({ error: "Format bulan harus YYYY-MM" });
  }
  const exists = await query("SELECT 1 FROM monthly_quizzes WHERE month_key=$1", [monthKey]);
  if (exists.rowCount) return res.status(409).json({ error: "Quiz bulan ini sudah ada" });

  const autoTitle = title || monthTitle(monthKey);
  const info = await query(
    `INSERT INTO monthly_quizzes (month_key, title, description, min_score_pct, time_limit_sec, is_active)
     VALUES ($1,$2,$3,$4,$5,TRUE) RETURNING id`,
    [monthKey, autoTitle, description || null, minScorePct, timeLimitSec]
  );
  res.json({ id: info.rows[0].id });
});

r.put("/admin/:id", requireAdmin, async (req, res) => {
  const { title, description, minScorePct, timeLimitSec } = req.body || {};
  const fields = [];
  const params = [];
  let i = 1;
  if (title) { fields.push(`title=$${i++}`); params.push(title); }
  if (description !== undefined) { fields.push(`description=$${i++}`); params.push(description); }
  if (minScorePct) { fields.push(`min_score_pct=$${i++}`); params.push(minScorePct); }
  if (timeLimitSec) { fields.push(`time_limit_sec=$${i++}`); params.push(timeLimitSec); }
  if (!fields.length) return res.status(400).json({ error: "Tidak ada yang diubah" });
  params.push(req.params.id);
  await query(`UPDATE monthly_quizzes SET ${fields.join(", ")} WHERE id=$${i}`, params);
  res.json({ ok: true });
});

r.post("/admin/:id/toggle-active", requireAdmin, async (req, res) => {
  await query("UPDATE monthly_quizzes SET is_active = NOT is_active WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

r.post("/admin/:id/toggle", requireAdmin, async (req, res) => {
  await query("UPDATE monthly_quizzes SET is_active = NOT is_active WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

r.delete("/admin/:id", requireAdmin, async (req, res) => {
  await query("DELETE FROM monthly_quizzes WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

r.post("/admin/:id/questions", requireAdmin, async (req, res) => {
  const { q, options, answer, explain } = req.body || {};
  const info = await query(
    `INSERT INTO monthly_quiz_questions (monthly_id, q, options_json, answer_idx, explain, sort_order)
     VALUES ($1,$2,$3::jsonb,$4,$5,
       COALESCE((SELECT MAX(sort_order)+1 FROM monthly_quiz_questions WHERE monthly_id=$1), 0))
     RETURNING id`,
    [req.params.id, q, JSON.stringify(options), answer, explain || ""]
  );
  res.json({ id: info.rows[0].id });
});

r.delete("/admin/questions/:qid", requireAdmin, async (req, res) => {
  await query("DELETE FROM monthly_quiz_questions WHERE id=$1", [req.params.qid]);
  res.json({ ok: true });
});

r.get("/admin/:id/attempts", requireAdmin, async (req, res) => {
  const rows = (await query(`
    SELECT a.id, a.correct, a.total, a.duration_sec, a.passed, a.created_at,
           u.id AS user_id, u.name, u.email
    FROM monthly_quiz_attempts a
    JOIN users u ON u.id = a.user_id
    WHERE a.monthly_id=$1
    ORDER BY a.correct DESC, a.duration_sec ASC
  `, [req.params.id])).rows;
  res.json(rows);
});

r.get("/:id", async (req, res) => {
  const idNum = Number(req.params.id);
  if (!Number.isFinite(idNum)) return res.status(400).json({ error: "ID tidak valid" });

  const detail = await loadMonthlyDetail(idNum, req.user);
  if (!detail) return res.status(404).json({ error: "Quiz bulanan tidak ditemukan" });

  if (detail.myAttempt && req.user.role !== "admin") {
    return res.json({
      ...detail,
      locked: true
    });
  }

  if (!detail.isCurrentMonth && !detail.myAttempt && req.user.role !== "admin") {
    return res.status(403).json({ error: "Quiz ini sudah tidak aktif" });
  }

  res.json(detail);
});

r.post("/:id/submit", async (req, res) => {
  const monthlyId = Number(req.params.id);
  const { answers = [], durationSec = 0 } = req.body || {};

  if (!Number.isFinite(monthlyId)) {
    return res.status(400).json({ error: "ID tidak valid" });
  }

  const existing = await query(
    "SELECT 1 FROM monthly_quiz_attempts WHERE monthly_id=$1 AND user_id=$2",
    [monthlyId, req.user.id]
  );
  if (existing.rowCount > 0) {
    return res.status(409).json({ error: "Kamu sudah mengerjakan quiz bulan ini. Tidak bisa mengulang." });
  }

  const m = (await query("SELECT * FROM monthly_quizzes WHERE id=$1", [monthlyId])).rows[0];
  if (!m) return res.status(404).json({ error: "Quiz tidak ditemukan" });
  if (!m.is_active && req.user.role !== "admin") {
    return res.status(403).json({ error: "Quiz ini sudah tidak aktif" });
  }
  if (m.month_key !== currentMonthKey() && req.user.role !== "admin") {
    return res.status(403).json({ error: "Quiz ini sudah bukan bulan aktif" });
  }

  const qs = (await query(
    "SELECT * FROM monthly_quiz_questions WHERE monthly_id=$1 ORDER BY sort_order",
    [monthlyId]
  )).rows;

  let correct = 0;
  const details = [];
  for (const question of qs) {
    const picked = answers.find((a) => a.questionId === question.id);
    const chosen = picked ? picked.chosen : -1;
    const ok = chosen === question.answer_idx;
    if (ok) correct++;
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
  const passed = pct >= m.min_score_pct;

  await query(
    `INSERT INTO monthly_quiz_attempts
       (monthly_id, user_id, correct, total, duration_sec, passed, answers_json)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
    [monthlyId, req.user.id, correct, total, durationSec, passed, JSON.stringify(answers)]
  );

  const gained = correct * 15;
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
    correct, total, pct, passed,
    minScorePct: m.min_score_pct,
    gainedXp: gained,
    durationSec,
    newBadges,
    details
  });
});

export default r;