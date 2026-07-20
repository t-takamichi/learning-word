-- 0001_baseline: 既存スキーマのベースライン
-- すべて IF NOT EXISTS のため、マイグレーション導入前の既存DBに再適用しても安全（べき等）。
-- PRAGMA（journal_mode / foreign_keys）は接続確立時に設定するため、ここには含めない。

-- 1. ユーザーテーブル (複数ユーザー対応)
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  username    TEXT NOT NULL UNIQUE,
  pin_hash    TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL DEFAULT 'user',
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 単語セット/レベルテーブル
CREATE TABLE IF NOT EXISTS word_sets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  level_tag   TEXT NOT NULL CHECK(level_tag IN ('basic', 'intermediate', 'advanced')),
  description TEXT,
  created_by  INTEGER,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. 単語テーブル (word_set_id との紐付けを追加)
CREATE TABLE IF NOT EXISTS words (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  word_set_id INTEGER NOT NULL,
  english     TEXT NOT NULL,
  vietnamese  TEXT NOT NULL,
  japanese    TEXT NOT NULL,
  example_en  TEXT,
  example_vi  TEXT,
  example_ja  TEXT,
  created_by  INTEGER,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (word_set_id) REFERENCES word_sets(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. 学習進捗テーブル (ユーザーIDを追加し、複合UNIQUEに変更)
CREATE TABLE IF NOT EXISTS learning_progress (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL,
  word_id         INTEGER NOT NULL,
  status          TEXT NOT NULL CHECK(status IN ('new', 'weak', 'mastered')) DEFAULT 'new',
  review_count    INTEGER NOT NULL DEFAULT 0,
  incorrect_count INTEGER NOT NULL DEFAULT 0,
  last_reviewed_at DATETIME,
  UNIQUE(user_id, word_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
);

-- 5. ユーザーごとの継続学習（ストリーク）管理
CREATE TABLE IF NOT EXISTS user_streaks (
  user_id          INTEGER PRIMARY KEY,
  streak_count     INTEGER NOT NULL DEFAULT 0,
  last_learned_at  DATE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. 辞書データテーブル (オートコンプリート用)
CREATE TABLE IF NOT EXISTS dictionary_words (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  english     TEXT NOT NULL UNIQUE,
  vietnamese  TEXT NOT NULL,
  japanese    TEXT NOT NULL,
  example_en  TEXT,
  example_vi  TEXT,
  example_ja  TEXT
);

CREATE INDEX IF NOT EXISTS idx_dictionary_words_english ON dictionary_words(english);

-- users(token) の UNIQUE インデックス（旧DBの後方互換保険。列定義の UNIQUE と重複しても IF NOT EXISTS で安全）
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_token ON users(token);
