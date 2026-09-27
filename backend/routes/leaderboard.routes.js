import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

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

function validPeriod(p) {
  return typeof p === "string" && /^\d{4}-\d{2}$/.test(p);
}

function periodLabel(period) {
  const [y, m] = period.split("-").map(Number);
  return `${MONTH_NAMES[m - 1]} ${y}`;
}

function badgeForRank(rank) {
  if (rank === 1) return { badge: "gold",   emoji: "🥇", label: "Gold" };
  if (rank === 2) return { badge: "silver", emoji: "🥈", label: "Silver" };
  if (rank === 3) return { badge: "bronze", emoji: "🥉", label: "Bronze" };
  return { badge: null, emoji: "🏅", label: "Top" };
}

async function computeLeaderboard(period) {
  const rows = (await query(`
    WITH monthly_attempts AS (
      SELECT
        a.user_id,
        a.quiz_id,
        q.chapter_id,
        a.correct,
        a.total,
        a.duration_sec,
        a.passed,
        a.created_at,
        ROW_NUMBER() OVER (
          PARTITION BY a.user_id, q.chapter_id
          ORDER BY a.correct DESC, a.duration_sec ASC, a.created_at ASC
        ) AS rn
      FROM quiz_attempts a
      JOIN quizzes q ON q.id = a.quiz_id
      WHERE date_trunc('month', a.created_at) = $1::date
    ),
    best_per_chapter AS (
      SELECT * FROM monthly_attempts WHERE rn = 1
    )
    SELECT
      u.id, u.name, u.email, u.xp, u.streak,
      COALESCE(SUM(b.correct), 0)::int         AS total_score,
      COALESCE(SUM(b.duration_sec), 0)::int    AS total_duration,
      COUNT(b.chapter_id)::int                 AS chapters_played,
      COUNT(*) FILTER (WHERE b.passed)::int    AS quizzes_passed
    FROM users u
    LEFT JOIN best_per_chapter b ON b.user_id = u.id
    WHERE u.role = 'user'
    GROUP BY u.id, u.name, u.email, u.xp, u.streak
    HAVING COUNT(b.chapter_id) > 0
    ORDER BY total_score DESC, total_duration ASC, u.xp DESC, u.name ASC
    LIMIT 200
  `, [`${period}-01`])).rows;

  return rows.map((x, i) => {
    const rank = i + 1;
    const b = badgeForRank(rank);
    return { ...x, rank, badge: b.badge, badge_emoji: b.emoji, badge_label: b.label };
  });
}

r.get("/progress", async (req, res) => {
  const period = req.query.period || req.query.month || currentMonthKey();
  if (!validPeriod(period)) return res.status(400).json({ error: "Format: YYYY-MM" });

  const list = await computeLeaderboard(period);

  const prizes = (await query(
    `SELECT rank, title, prize, emoji FROM leaderboard_prizes
     WHERE period=$1 ORDER BY rank`,
    [period]
  )).rows;

  const winners = (await query(`
    SELECT w.rank, w.total_score, w.total_duration, w.badge,
           w.prize_title, w.prize_desc, w.prize_emoji,
           u.id AS user_id, u.name, u.email
    FROM leaderboard_winners w
    JOIN users u ON u.id = w.user_id
    WHERE w.period = $1
    ORDER BY w.rank
  `, [period])).rows;

  const config = (await query(
    "SELECT * FROM leaderboard_config WHERE period=$1",
    [period]
  )).rows[0] || { period, top_n: 3, ranking_type: "posttest", announcement: null };

  res.json({
    period,
    periodLabel: periodLabel(period),
    list,
    prizes,
    winners,
    config
  });
});

r.get("/winners", async (req, res) => {
  const period = req.query.period || req.query.month || currentMonthKey();
  if (!validPeriod(period)) return res.status(400).json({ error: "Format: YYYY-MM" });

  let winners = (await query(`
    SELECT w.rank, w.total_score, w.total_duration, w.badge,
           w.prize_title, w.prize_desc, w.prize_emoji,
           u.id AS user_id, u.name, u.email,
           COALESCE(p.title, w.prize_title, '') AS prize_title_resolved,
           COALESCE(p.prize, w.prize_desc, '')  AS prize_resolved,
           COALESCE(p.emoji, w.prize_emoji, '🏆') AS prize_emoji_resolved
    FROM leaderboard_winners w
    JOIN users u ON u.id = w.user_id
    LEFT JOIN leaderboard_prizes p ON p.period = w.period AND p.rank = w.rank
    WHERE w.period = $1
    ORDER BY w.rank
  `, [period])).rows;

  if (winners.length === 0) {
    const computed = await computeLeaderboard(period);
    const topN = 3;
    const top = computed.slice(0, topN);
    const prizes = (await query(
      "SELECT rank, title, prize, emoji FROM leaderboard_prizes WHERE period=$1",
      [period]
    )).rows;
    const prizeByRank = Object.fromEntries(prizes.map((p) => [p.rank, p]));

    for (const row of top) {
      const b = badgeForRank(row.rank);
      const prize = prizeByRank[row.rank];
      await query(`
        INSERT INTO leaderboard_winners
          (period, rank, user_id, total_score, total_duration,
           badge, prize_title, prize_desc, prize_emoji)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (period, rank) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          total_score = EXCLUDED.total_score,
          total_duration = EXCLUDED.total_duration,
          badge = EXCLUDED.badge,
          prize_title = EXCLUDED.prize_title,
          prize_desc = EXCLUDED.prize_desc,
          prize_emoji = EXCLUDED.prize_emoji,
          computed_at = NOW()
      `, [
        period, row.rank, row.id, row.total_score, row.total_duration,
        b.badge,
        prize?.title || null,
        prize?.prize || null,
        prize?.emoji || b.emoji
      ]);
    }

    winners = (await query(`
      SELECT w.rank, w.total_score, w.total_duration, w.badge,
             w.prize_title, w.prize_desc, w.prize_emoji,
             u.id AS user_id, u.name, u.email
      FROM leaderboard_winners w
      JOIN users u ON u.id = w.user_id
      WHERE w.period = $1
      ORDER BY w.rank
    `, [period])).rows;
  }

  const prizes = (await query(
    "SELECT rank, title, prize, emoji FROM leaderboard_prizes WHERE period=$1 ORDER BY rank",
    [period]
  )).rows;

  const myWin = winners.find((w) => w.user_id === req.user.id) || null;

  res.json({ period, periodLabel: periodLabel(period), winners, prizes, myWin });
});

r.get("/prizes", async (req, res) => {
  const period = req.query.period || req.query.month || currentMonthKey();
  if (!validPeriod(period)) return res.status(400).json({ error: "Format: YYYY-MM" });
  const prizes = (await query(
    "SELECT rank, title, prize, emoji FROM leaderboard_prizes WHERE period=$1 ORDER BY rank",
    [period]
  )).rows;
  res.json({ period, prizes });
});

r.post("/prizes", async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Khusus admin" });
  const { period, prizes } = req.body || {};
  if (!validPeriod(period)) return res.status(400).json({ error: "Format period: YYYY-MM" });
  if (!Array.isArray(prizes)) return res.status(400).json({ error: "prizes[] wajib" });

  await query("DELETE FROM leaderboard_prizes WHERE period=$1", [period]);

  for (const p of prizes) {
    const rank = Number(p.rank);
    if (!Number.isFinite(rank) || rank < 1) continue;
    const title = (p.title || "").trim();
    const prize = (p.prize || "").trim();
    const emoji = (p.emoji || "🏆").trim();
    if (!title && !prize) continue;
    await query(`
      INSERT INTO leaderboard_prizes (period, rank, title, prize, emoji)
      VALUES ($1,$2,$3,$4,$5)
      ON CONFLICT (period, rank) DO UPDATE SET
        title = EXCLUDED.title,
        prize = EXCLUDED.prize,
        emoji = EXCLUDED.emoji
    `, [period, rank, title || `Juara ${rank}`, prize, emoji]);
  }

  await query(`
    UPDATE leaderboard_winners w
    SET prize_title = p.title,
        prize_desc  = p.prize,
        prize_emoji = p.emoji
    FROM leaderboard_prizes p
    WHERE p.period = w.period AND p.rank = w.rank AND w.period = $1
  `, [period]);

  res.json({ ok: true });
});

r.post("/generate-winners", async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Khusus admin" });
  const period = req.body?.period || currentMonthKey();
  if (!validPeriod(period)) return res.status(400).json({ error: "Format: YYYY-MM" });

  const topN = Math.max(1, Math.min(20, Number(req.body?.topN) || 3));

  const config = (await query(
    "SELECT * FROM leaderboard_config WHERE period=$1",
    [period]
  )).rows[0];

  const computed = await computeLeaderboard(period);
  const top = computed.slice(0, topN);
  const prizes = (await query(
    "SELECT rank, title, prize, emoji FROM leaderboard_prizes WHERE period=$1",
    [period]
  )).rows;
  const prizeByRank = Object.fromEntries(prizes.map((p) => [p.rank, p]));

  await query("DELETE FROM leaderboard_winners WHERE period=$1", [period]);

  for (const row of top) {
    const b = badgeForRank(row.rank);
    const prize = prizeByRank[row.rank];
    await query(`
      INSERT INTO leaderboard_winners
        (period, rank, user_id, total_score, total_duration,
         badge, prize_title, prize_desc, prize_emoji)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    `, [
      period, row.rank, row.id, row.total_score, row.total_duration,
      b.badge,
      prize?.title || null,
      prize?.prize || null,
      prize?.emoji || b.emoji
    ]);
  }

  await query(`
    INSERT INTO leaderboard_config (period, top_n, updated_at)
    VALUES ($1,$2,NOW())
    ON CONFLICT (period) DO UPDATE SET
      top_n = EXCLUDED.top_n,
      updated_at = NOW()
  `, [period, topN]);

  res.json({ ok: true, period, count: top.length, topN });
});

r.get("/announcement", async (req, res) => {
  const period = req.query.period || req.query.month || currentMonthKey();
  if (!validPeriod(period)) return res.status(400).json({ error: "Format: YYYY-MM" });

  const config = (await query(
    `SELECT announcement, announcement_emoji, announcement_title,
            announcement_image, announcement_start, announcement_end,
            announcement_active
     FROM leaderboard_config WHERE period=$1`,
    [period]
  )).rows[0] || {};

  res.json({
    period,
    announcement: config.announcement || null,
    emoji: config.announcement_emoji || "📢",
    title: config.announcement_title || null,
    image: config.announcement_image || null,
    start: config.announcement_start || null,
    end: config.announcement_end || null,
    active: config.announcement_active !== false
  });
});

r.post("/announcement", async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Khusus admin" });
  const {
    period, announcement, emoji = "📢", title = "Pengumuman",
    image = null, start = null, end = null, active = true
  } = req.body || {};

  if (!validPeriod(period)) return res.status(400).json({ error: "Format period: YYYY-MM" });

  await query(`
    INSERT INTO leaderboard_config
      (period, announcement, announcement_emoji, announcement_title,
       announcement_image, announcement_start, announcement_end,
       announcement_active, updated_at)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())
    ON CONFLICT (period) DO UPDATE SET
      announcement = EXCLUDED.announcement,
      announcement_emoji = EXCLUDED.announcement_emoji,
      announcement_title = EXCLUDED.announcement_title,
      announcement_image = EXCLUDED.announcement_image,
      announcement_start = EXCLUDED.announcement_start,
      announcement_end = EXCLUDED.announcement_end,
      announcement_active = EXCLUDED.announcement_active,
      updated_at = NOW()
  `, [
    period, announcement || null, emoji, title,
    image || null, start || null, end || null, active
  ]);

  res.json({ ok: true });
});

r.get("/config", async (req, res) => {
  const period = req.query.period || req.query.month || currentMonthKey();
  if (!validPeriod(period)) return res.status(400).json({ error: "Format: YYYY-MM" });
  const config = (await query(
    "SELECT * FROM leaderboard_config WHERE period=$1",
    [period]
  )).rows[0] || { period, top_n: 3, ranking_type: "posttest", announcement: null };
  res.json(config);
});

r.post("/config", async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Khusus admin" });
  const { period, top_n, ranking_type } = req.body || {};
  if (!validPeriod(period)) return res.status(400).json({ error: "Format period: YYYY-MM" });

  await query(`
    INSERT INTO leaderboard_config (period, top_n, ranking_type, updated_at)
    VALUES ($1,$2,$3,NOW())
    ON CONFLICT (period) DO UPDATE SET
      top_n = EXCLUDED.top_n,
      ranking_type = EXCLUDED.ranking_type,
      updated_at = NOW()
  `, [period, Number(top_n) || 3, ranking_type || "posttest"]);

  res.json({ ok: true });
});

r.get("/my-popup", async (req, res) => {
  const period = currentMonthKey();
  const userId = req.user.id;
  const now = new Date();

  const popups = [];

  const cfg = (await query(
    `SELECT winners_popup_active, winners_popup_start, winners_popup_end,
            announcement, announcement_emoji, announcement_title,
            announcement_image, announcement_start, announcement_end,
            announcement_active
     FROM leaderboard_config WHERE period=$1`,
    [period]
  )).rows[0] || {};

  const winnersActive = cfg.winners_popup_active !== false;
  const winnersStartOk = !cfg.winners_popup_start || new Date(cfg.winners_popup_start) <= now;
  const winnersEndOk = !cfg.winners_popup_end || new Date(cfg.winners_popup_end) >= now;
  const winnersPopupShouldShow = winnersActive && winnersStartOk && winnersEndOk;

  if (winnersPopupShouldShow) {
    const myWin = (await query(`
      SELECT w.rank, w.total_score, w.total_duration, w.badge,
             w.prize_title, w.prize_desc, w.prize_emoji
      FROM leaderboard_winners w
      WHERE w.period = $1 AND w.user_id = $2
    `, [period, userId])).rows[0];

    if (myWin) {
      popups.push({
        key: `winner-${period}`,
        type: "winner",
        rank: myWin.rank,
        badge: myWin.badge,
        badgeEmoji: myWin.prize_emoji || badgeForRank(myWin.rank).emoji,
        totalScore: myWin.total_score,
        totalDuration: myWin.total_duration,
        prizeTitle: myWin.prize_title,
        prizeDesc: myWin.prize_desc,
        period,
        periodLabel: periodLabel(period)
      });
    } else {
      const winners = (await query(`
        SELECT w.rank, w.total_score, w.badge, w.prize_title, w.prize_desc, w.prize_emoji,
               u.name
        FROM leaderboard_winners w
        JOIN users u ON u.id = w.user_id
        WHERE w.period = $1
        ORDER BY w.rank
        LIMIT 3
      `, [period])).rows;

      if (winners.length > 0) {
        popups.push({
          key: `winners-${period}`,
          type: "winners-board",
          period,
          periodLabel: periodLabel(period),
          winners: winners.map((w) => ({
            rank: w.rank,
            name: w.name,
            badge: w.badge,
            badgeEmoji: w.prize_emoji || badgeForRank(w.rank).emoji,
            score: w.total_score,
            prizeTitle: w.prize_title,
            prizeDesc: w.prize_desc
          }))
        });
      }
    }
  }

  if (cfg.announcement) {
    const aActive = cfg.announcement_active !== false;
    const aStartOk = !cfg.announcement_start || new Date(cfg.announcement_start) <= now;
    const aEndOk = !cfg.announcement_end || new Date(cfg.announcement_end) >= now;

    if (aActive && aStartOk && aEndOk) {
      popups.push({
        key: `announce-${period}`,
        type: "announcement",
        period,
        title: cfg.announcement_title || "Pengumuman",
        emoji: cfg.announcement_emoji || "📢",
        message: cfg.announcement,
        image: cfg.announcement_image || null
      });
    }
  }

  res.json({ period, popups });
});

r.post("/mark-seen", async (req, res) => {
  const { popupKey } = req.body || {};
  if (!popupKey) return res.status(400).json({ error: "popupKey wajib" });
  await query(`
    INSERT INTO user_popup_seen (user_id, popup_key)
    VALUES ($1,$2)
    ON CONFLICT (user_id, popup_key) DO UPDATE SET seen_at = NOW()
  `, [req.user.id, String(popupKey).slice(0, 120)]);
  res.json({ ok: true });
});

r.get("/quiz-monthly", async (req, res) => {
  const period = req.query.month || currentMonthKey();

  const quizzes = (await query(
    "SELECT id, title, month_key FROM monthly_quizzes WHERE month_key=$1 ORDER BY id",
    [period]
  )).rows;

  if (quizzes.length === 0) {
    return res.json({ period, quizzes: [], list: [] });
  }

  const quizIds = quizzes.map((q) => q.id);

  const list = (await query(`
    WITH ranked AS (
      SELECT
        a.user_id, a.monthly_id, a.correct, a.total, a.duration_sec,
        a.passed, a.created_at,
        ROW_NUMBER() OVER (
          PARTITION BY a.user_id, a.monthly_id
          ORDER BY a.correct DESC, a.duration_sec ASC
        ) AS rn
      FROM monthly_quiz_attempts a
      WHERE a.monthly_id = ANY($1::int[])
    )
    SELECT
      u.id, u.name, u.email,
      r.monthly_id, r.correct, r.total, r.duration_sec, r.passed, r.created_at
    FROM ranked r
    JOIN users u ON u.id = r.user_id
    WHERE r.rn = 1
    ORDER BY r.correct DESC, r.duration_sec ASC
    LIMIT 200
  `, [quizIds])).rows;

  res.json({ period, quizzes, list });
});

r.get("/quiz-chapter", async (req, res) => {
  const { chapterId } = req.query;

  const chapters = (await query(
    "SELECT id, no, title FROM chapters ORDER BY sort_order, no"
  )).rows;

  if (!chapterId) {
    return res.json({ chapters, list: [], selectedChapterId: null });
  }

  const quiz = (await query(
    "SELECT id, title FROM quizzes WHERE chapter_id=$1",
    [chapterId]
  )).rows[0];

  if (!quiz) {
    return res.json({
      chapters, list: [], selectedChapterId: chapterId,
      quizTitle: null, message: "Chapter ini belum punya kuis"
    });
  }

  const list = (await query(`
    WITH ranked AS (
      SELECT
        a.user_id, a.correct, a.total, a.duration_sec, a.passed, a.created_at,
        ROW_NUMBER() OVER (
          PARTITION BY a.user_id
          ORDER BY a.correct DESC, a.duration_sec ASC, a.created_at ASC
        ) AS rn
      FROM quiz_attempts a
      WHERE a.quiz_id = $1
    )
    SELECT
      u.id, u.name, u.email,
      r.correct, r.total, r.duration_sec, r.passed, r.created_at
    FROM ranked r
    JOIN users u ON u.id = r.user_id
    WHERE r.rn = 1
    ORDER BY r.correct DESC, r.duration_sec ASC
    LIMIT 100
  `, [quiz.id])).rows;

  res.json({
    chapters,
    selectedChapterId: chapterId,
    quizTitle: quiz.title,
    quizId: quiz.id,
    list
  });
});

r.get("/popup-analytics", async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Khusus admin" });
  const period = req.query.period || currentMonthKey();
  const rows = (await query(`
    SELECT popup_key, COUNT(*)::int AS view_count, MAX(seen_at) AS last_seen
    FROM user_popup_seen
    WHERE popup_key LIKE $1
    GROUP BY popup_key
  `, [`%-${period}`])).rows;
  res.json({ period, analytics: rows });
});

r.get("/winners-popup-setting", async (req, res) => {
  const period = req.query.period || req.query.month || currentMonthKey();
  if (!validPeriod(period)) return res.status(400).json({ error: "Format: YYYY-MM" });

  const config = (await query(
    `SELECT winners_popup_active, winners_popup_start, winners_popup_end
     FROM leaderboard_config WHERE period=$1`,
    [period]
  )).rows[0] || {};

  res.json({
    period,
    active: config.winners_popup_active !== false,
    start: config.winners_popup_start || null,
    end: config.winners_popup_end || null
  });
});

r.post("/winners-popup-setting", async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ error: "Khusus admin" });
  const { period, active = true, start = null, end = null } = req.body || {};
  if (!validPeriod(period)) return res.status(400).json({ error: "Format period: YYYY-MM" });

  await query(`
    INSERT INTO leaderboard_config
      (period, winners_popup_active, winners_popup_start, winners_popup_end, updated_at)
    VALUES ($1,$2,$3,$4,NOW())
    ON CONFLICT (period) DO UPDATE SET
      winners_popup_active = EXCLUDED.winners_popup_active,
      winners_popup_start = EXCLUDED.winners_popup_start,
      winners_popup_end = EXCLUDED.winners_popup_end,
      updated_at = NOW()
  `, [period, active, start || null, end || null]);

  res.json({ ok: true });
});
export default r;