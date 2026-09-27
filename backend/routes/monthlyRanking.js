import { query } from "../db/pool.js";

const MONTH_NAMES = [
  "Januari","Februari","Maret","April","Mei","Juni",
  "Juli","Agustus","September","Oktober","November","Desember"
];

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function prevMonthKey() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function computeMonthlyRanking(monthKey) {
  const rows = (await query(`
    SELECT
      u.id, u.name, u.email,
      COALESCE(SUM(a.correct), 0)::int       AS total_points,
      COALESCE(SUM(a.total), 0)::int         AS total_questions,
      COALESCE(SUM(a.duration_sec), 0)::int  AS total_duration,
      COUNT(a.id)::int                       AS attempts_count
    FROM users u
    LEFT JOIN quiz_attempts a
      ON a.user_id = u.id
      AND a.is_reward_month = $1
    WHERE u.role = 'user'
    GROUP BY u.id, u.name, u.email
    HAVING COUNT(a.id) > 0
    ORDER BY total_points DESC, total_duration ASC, u.name ASC
  `, [monthKey])).rows;

  return rows;
}

export async function snapshotWinners(monthKey, topN = 3) {
  const ranking = await computeMonthlyRanking(monthKey);
  if (ranking.length === 0) return { ok: true, count: 0, ranking: [] };

  const rewards = (await query(
    "SELECT rank, prize_text, prize_emoji FROM monthly_rewards WHERE month_key=$1",
    [monthKey]
  )).rows;

  const rewardMap = Object.fromEntries(rewards.map((r) => [r.rank, r]));

  await query("BEGIN");
  try {
    await query("DELETE FROM monthly_winners WHERE month_key=$1", [monthKey]);

    const winners = [];
    for (let i = 0; i < Math.min(topN, ranking.length); i++) {
      const rank = i + 1;
      const user = ranking[i];
      const reward = rewardMap[rank] || { prize_text: null, prize_emoji: "🎁" };

      await query(
        `INSERT INTO monthly_winners
           (month_key, rank, user_id, total_points, total_duration, prize_text, prize_emoji)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [monthKey, rank, user.id, user.total_points, user.total_duration,
         reward.prize_text, reward.prize_emoji]
      );

      const badgeId = rank === 1 ? "rank-gold" : rank === 2 ? "rank-silver" : rank === 3 ? "rank-bronze" : null;
      if (badgeId) {
        await query(
          "INSERT INTO user_badges (user_id, badge_id) VALUES ($1,$2) ON CONFLICT DO NOTHING",
          [user.id, badgeId]
        );
      }

      winners.push({ ...user, rank, prize_text: reward.prize_text, prize_emoji: reward.prize_emoji });
    }

    await query("COMMIT");
    return { ok: true, count: winners.length, ranking, winners };
  } catch (e) {
    await query("ROLLBACK");
    throw e;
  }
}

export async function getUnseenWinnerNotification(userId) {
  const mk = prevMonthKey();
  const winners = (await query(
    `SELECT w.rank, w.total_points, w.total_duration, w.prize_text, w.prize_emoji,
            u.id AS user_id, u.name
     FROM monthly_winners w
     JOIN users u ON u.id = w.user_id
     WHERE w.month_key = $1
     ORDER BY w.rank ASC`,
    [mk]
  )).rows;

  if (winners.length === 0) return null;

  const seen = await query(
    "SELECT 1 FROM user_reward_views WHERE user_id=$1 AND month_key=$2",
    [userId, mk]
  );
  if (seen.rowCount > 0) return null;

  const me = winners.find((w) => w.user_id === userId) || null;

  return {
    monthKey: mk,
    monthLabel: `${MONTH_NAMES[Number(mk.split("-")[1]) - 1]} ${mk.split("-")[0]}`,
    winners: winners.map((w) => ({
      rank: w.rank, name: w.name, userId: w.user_id,
      totalPoints: w.total_points,
      prizeText: w.prize_text, prizeEmoji: w.prize_emoji || "🎁"
    })),
    iWon: !!me,
    myRank: me ? me.rank : null,
    myPrize: me ? { text: me.prize_text, emoji: me.prize_emoji } : null
  };
}

export async function markWinnerNotificationSeen(userId, monthKey) {
  await query(
    "INSERT INTO user_reward_views (user_id, month_key) VALUES ($1,$2) ON CONFLICT DO NOTHING",
    [userId, monthKey]
  );
}

export { currentMonthKey, prevMonthKey };