import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

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
  seedIfEmpty(db);
  seedDictionaryIfEmpty(db);
  return db;
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
