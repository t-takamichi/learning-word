import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes, pbkdf2Sync, randomUUID } from 'node:crypto';

export type DB = DatabaseSync;

const DB_PATH = process.env['DB_PATH'] ?? 'storage/data/learning.db';

type SeedWord = {
  english: string;
  vietnamese: string;
  japanese: string;
  example_en: string | null;
  example_vi: string | null;
  example_ja: string | null;
};

type SeedSet = {
  setName: string;
  levelTag: 'basic' | 'intermediate' | 'advanced';
  description: string;
  words: SeedWord[];
};

export function createDatabase(): DB {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  const schema = readFileSync('storage/db/schema.sql', 'utf-8');
  db.exec(schema);
  migrateColumns(db);
  seedIfEmpty(db);
  seedDictionaryIfEmpty(db);
  return db;
}

function migrateColumns(db: DB): void {
  try {
    const pragma = db.prepare('PRAGMA table_info(users)').all() as { name: string }[];
    const columns = pragma.map((c) => c.name);
    if (columns.length > 0) {
      let migrated = false;
      if (!columns.includes('pin_hash')) {
        db.exec("ALTER TABLE users ADD COLUMN pin_hash TEXT NOT NULL DEFAULT 'invalid'");
        migrated = true;
      }
      if (!columns.includes('token')) {
        db.exec("ALTER TABLE users ADD COLUMN token TEXT NOT NULL DEFAULT 'invalid_token'");
        migrated = true;
      }

      if (migrated) {
        // 安全に全員再登録してもらうため、移行対象の古いユーザーレコードをすべて削除（クリア）する
        db.exec('DELETE FROM users');
        db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_token ON users(token)');
      }
    }
  } catch (e) {
    console.error('Failed to migrate users table columns:', e);
  }
}

function seedIfEmpty(db: DB): void {
  const row = db.prepare('SELECT COUNT(*) as count FROM word_sets').get() as { count: number };
  if (row.count !== 0) return;

  const seedData = JSON.parse(readFileSync('storage/db/seed.json', 'utf-8')) as SeedSet[];
  const insertSetStmt = db.prepare(
    'INSERT INTO word_sets (name, level_tag, description) VALUES (?, ?, ?)'
  );
  const insertWordStmt = db.prepare(
    'INSERT INTO words (word_set_id, english, vietnamese, japanese, example_en, example_vi, example_ja) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  for (const set of seedData) {
    insertSetStmt.run(set.setName, set.levelTag, set.description);
    const lastIdRow = db.prepare('SELECT last_insert_rowid() AS id').get() as { id: number };
    const setId = lastIdRow.id;

    for (const w of set.words) {
      insertWordStmt.run(
        setId,
        w.english,
        w.vietnamese,
        w.japanese,
        w.example_en ?? null,
        w.example_vi ?? null,
        w.example_ja ?? null
      );
    }
  }
}

function seedDictionaryIfEmpty(db: DB): void {
  const row = db.prepare('SELECT COUNT(*) as count FROM dictionary_words').get() as { count: number };
  if (row.count !== 0) return;

  const seedData = JSON.parse(readFileSync('storage/db/dictionary_seed.json', 'utf-8')) as SeedWord[];
  const insertWordStmt = db.prepare(
    'INSERT OR IGNORE INTO dictionary_words (english, vietnamese, japanese, example_en, example_vi, example_ja) VALUES (?, ?, ?, ?, ?, ?)'
  );

  db.exec('BEGIN TRANSACTION');
  try {
    for (const w of seedData) {
      insertWordStmt.run(
        w.english,
        w.vietnamese,
        w.japanese,
        w.example_en ?? null,
        w.example_vi ?? null,
        w.example_ja ?? null
      );
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    console.error('Failed to seed dictionary words:', error);
  }
}
