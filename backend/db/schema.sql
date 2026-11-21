-- ========== USERS ==========
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(120) NOT NULL,
  role          VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  xp            INTEGER NOT NULL DEFAULT 0,
  streak        INTEGER NOT NULL DEFAULT 0,
  last_active   DATE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== CHAPTERS ==========
CREATE TABLE IF NOT EXISTS chapters (
  id          VARCHAR(30) PRIMARY KEY,
  no          INTEGER NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== MODULES ==========
CREATE TABLE IF NOT EXISTS modules (
  id          VARCHAR(40) PRIMARY KEY,
  chapter_id  VARCHAR(30) NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  no          INTEGER NOT NULL,
  title       TEXT NOT NULL,
  duration    VARCHAR(20),
  duration_sec INTEGER,
  video_path  TEXT,
  summary     TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_modules_chapter ON modules(chapter_id);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name='modules' AND column_name='duration_sec') THEN
    ALTER TABLE modules ADD COLUMN duration_sec INTEGER;
  END IF;
END $$;

-- ========== QUIZZES ==========
CREATE TABLE IF NOT EXISTS quizzes (
  id             SERIAL PRIMARY KEY,
  chapter_id     VARCHAR(30) NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  min_score_pct  INTEGER NOT NULL DEFAULT 60,
  time_limit_sec INTEGER NOT NULL DEFAULT 300
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id           SERIAL PRIMARY KEY,
  quiz_id      INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  q            TEXT NOT NULL,
  options_json JSONB NOT NULL,
  answer_idx   INTEGER NOT NULL,
  explain      TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_questions_quiz ON quiz_questions(quiz_id);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id       INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  correct       INTEGER NOT NULL,
  total         INTEGER NOT NULL,
  duration_sec  INTEGER NOT NULL,
  passed        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_month ON quiz_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_date
  ON quiz_attempts(user_id, created_at DESC);

-- ========== USER QUESTION HISTORY (XP pertama kali) ==========
CREATE TABLE IF NOT EXISTS user_question_answered (
  user_id          INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id      INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
  first_correct_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

-- ========== MONTHLY QUIZ ==========
CREATE TABLE IF NOT EXISTS monthly_quizzes (
  id             SERIAL PRIMARY KEY,
  month_key      VARCHAR(7) NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT,
  min_score_pct  INTEGER NOT NULL DEFAULT 60,
  time_limit_sec INTEGER NOT NULL DEFAULT 600,
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS monthly_quiz_questions (
  id           SERIAL PRIMARY KEY,
  monthly_id   INTEGER NOT NULL REFERENCES monthly_quizzes(id) ON DELETE CASCADE,
  q            TEXT NOT NULL,
  options_json JSONB NOT NULL,
  answer_idx   INTEGER NOT NULL,
  explain      TEXT,
  sort_order   INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_monthly_q_monthly ON monthly_quiz_questions(monthly_id);

CREATE TABLE IF NOT EXISTS monthly_quiz_attempts (
  id SERIAL PRIMARY KEY,
  monthly_id INTEGER NOT NULL REFERENCES monthly_quizzes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  correct INTEGER NOT NULL,
  total INTEGER NOT NULL,
  duration_sec INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  answers_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (monthly_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_monthly_attempts ON monthly_quiz_attempts(monthly_id);

-- ========== FLASHCARDS ==========
CREATE TABLE IF NOT EXISTS flashcards (
  id         VARCHAR(30) PRIMARY KEY,
  emoji      VARCHAR(10),
  front      TEXT NOT NULL,
  back_json  JSONB NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ========== BADGES ==========
CREATE TABLE IF NOT EXISTS badges (
  id         VARCHAR(40) PRIMARY KEY,
  emoji      VARCHAR(10),
  title      TEXT NOT NULL,
  descr      TEXT,
  type       VARCHAR(30) NOT NULL,
  threshold  INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_badges (
  user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id  VARCHAR(40) NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- ========== PROGRESS ==========
CREATE TABLE IF NOT EXISTS user_module_progress (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  module_id    VARCHAR(40) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, module_id)
);

CREATE TABLE IF NOT EXISTS user_flashcard_views (
  user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  flashcard_id VARCHAR(30) NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  seen_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, flashcard_id)
);

-- ========== LEADERBOARD PRIZES ==========
CREATE TABLE IF NOT EXISTS leaderboard_prizes (
  id           SERIAL PRIMARY KEY,
  period       VARCHAR(7) NOT NULL,
  rank         INTEGER NOT NULL,
  title        TEXT NOT NULL,
  prize        TEXT NOT NULL,
  emoji        VARCHAR(10) DEFAULT '🏆',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (period, rank)
);
CREATE INDEX IF NOT EXISTS idx_prizes_period ON leaderboard_prizes(period);

-- ========== LEADERBOARD WINNERS ==========
CREATE TABLE IF NOT EXISTS leaderboard_winners (
  id             SERIAL PRIMARY KEY,
  period         VARCHAR(7) NOT NULL,
  rank           INTEGER NOT NULL,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_score    INTEGER NOT NULL DEFAULT 0,
  total_duration INTEGER NOT NULL DEFAULT 0,
  badge          VARCHAR(10),
  prize_title    TEXT,
  prize_desc     TEXT,
  prize_emoji    VARCHAR(10) DEFAULT '🏆',
  computed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (period, rank)
);
CREATE INDEX IF NOT EXISTS idx_winners_period ON leaderboard_winners(period);
CREATE INDEX IF NOT EXISTS idx_winners_user ON leaderboard_winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_period_rank ON leaderboard_winners(period, rank);

-- ========== LEADERBOARD CONFIG ==========
CREATE TABLE IF NOT EXISTS leaderboard_config (
  period              VARCHAR(7) PRIMARY KEY,
  ranking_type        VARCHAR(20) NOT NULL DEFAULT 'posttest',
  top_n               INTEGER NOT NULL DEFAULT 3,
  announcement        TEXT,
  announcement_emoji  VARCHAR(10) DEFAULT '📢',
  announcement_title  TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ========== USER POPUP SEEN (analytics) ==========
CREATE TABLE IF NOT EXISTS user_popup_seen (
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  popup_key   VARCHAR(120) NOT NULL,
  seen_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, popup_key)
);
CREATE INDEX IF NOT EXISTS idx_popup_seen_user ON user_popup_seen(user_id);

ALTER TABLE leaderboard_config
  ADD COLUMN IF NOT EXISTS announcement_image TEXT;

ALTER TABLE leaderboard_config
  ADD COLUMN IF NOT EXISTS announcement_start TIMESTAMPTZ;

ALTER TABLE leaderboard_config
  ADD COLUMN IF NOT EXISTS announcement_end TIMESTAMPTZ;

ALTER TABLE leaderboard_config
  ADD COLUMN IF NOT EXISTS announcement_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_config_announcement_active
  ON leaderboard_config(period, announcement_active);

-- ========== WINNERS POPUP SETTING ==========
ALTER TABLE leaderboard_config
  ADD COLUMN IF NOT EXISTS winners_popup_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE leaderboard_config
  ADD COLUMN IF NOT EXISTS winners_popup_start TIMESTAMPTZ;

ALTER TABLE leaderboard_config
  ADD COLUMN IF NOT EXISTS winners_popup_end TIMESTAMPTZ;
-- ===== Power BI reports (sinkron dengan nestjs/prisma/schema.prisma) =====
CREATE TABLE IF NOT EXISTS reports (
  id          SERIAL PRIMARY KEY,
  slug        VARCHAR(80) UNIQUE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  embed_url   TEXT NOT NULL,
  icon        VARCHAR(10) DEFAULT '📊',
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  INT REFERENCES users(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_active ON reports(is_active);
CREATE INDEX IF NOT EXISTS idx_reports_slug ON reports(slug);

CREATE TABLE IF NOT EXISTS report_access (
  report_id  INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by INT REFERENCES users(id),
  PRIMARY KEY (report_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_report_access_user ON report_access(user_id);

CREATE TABLE IF NOT EXISTS report_views (
  id        SERIAL PRIMARY KEY,
  report_id INT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id   INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_report_views_report ON report_views(report_id);
CREATE INDEX IF NOT EXISTS idx_report_views_user ON report_views(user_id);
CREATE INDEX IF NOT EXISTS idx_report_views_time ON report_views(viewed_at DESC);
