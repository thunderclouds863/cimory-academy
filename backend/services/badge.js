import { query } from "../db/pool.js";

export async function recomputeBadges(userId) {
  const badges = (await query("SELECT * FROM badges")).rows;
  const owned = new Set(
    (await query("SELECT badge_id FROM user_badges WHERE user_id=$1", [userId])).rows.map(r => r.badge_id)
  );

  const stats = (await query(
    `SELECT
       (SELECT COUNT(*)::int FROM user_module_progress WHERE user_id=$1) AS done_modules,
       (SELECT COUNT(*)::int FROM user_flashcard_views WHERE user_id=$1) AS seen_cards,
       (SELECT COUNT(*)::int FROM modules) AS total_modules,
       (SELECT COUNT(*)::int FROM flashcards) AS total_cards,
       (SELECT streak FROM users WHERE id=$1) AS streak,
       (SELECT COUNT(*)::int FROM quiz_attempts WHERE user_id=$1 AND passed=TRUE AND correct=total AND total>0) AS perfect_quizzes
    `, [userId]
  )).rows[0];

  const fullChapters = (await query(
    `SELECT c.id FROM chapters c
     WHERE (SELECT COUNT(*) FROM modules WHERE chapter_id=c.id) =
           (SELECT COUNT(*) FROM modules m JOIN user_module_progress p ON p.module_id=m.id
            WHERE m.chapter_id=c.id AND p.user_id=$1)`, [userId]
  )).rowCount;

  const newBadges = [];
  for (const b of badges) {
    if (owned.has(b.id)) continue;
    let earned = false;
    switch (b.type) {
      case "modules":     earned = stats.done_modules >= b.threshold; break;
      case "streak":      earned = stats.streak >= b.threshold; break;
      case "flashcards":  earned = stats.seen_cards >= b.threshold; break;
      case "perfectQuiz": earned = stats.perfect_quizzes >= b.threshold; break;
      case "chapter":     earned = fullChapters >= b.threshold; break;
      case "allModules":  earned = stats.total_modules > 0 && stats.done_modules >= stats.total_modules; break;
    }
    if (earned) {
      await query("INSERT INTO user_badges (user_id, badge_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [userId, b.id]);
      newBadges.push(b);
    }
  }
  return newBadges;
}