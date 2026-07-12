import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

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

function resetDatabase() {
  console.log(`Resetting database at: ${DB_PATH}`);

  // 1. Delete existing database file and WAL files to ensure clean state
  const dbDir = path.dirname(DB_PATH);
  if (fs.existsSync(DB_PATH)) {
    try {
      fs.unlinkSync(DB_PATH);
      console.log('Deleted database file.');
    } catch (e) {
      console.warn('Warning: Could not delete database file, attempting to drop tables instead.', e);
    }
  }
  
  // Also clean up WAL/Journal files if they exist
  const walPath = `${DB_PATH}-wal`;
  const shmPath = `${DB_PATH}-shm`;
  const journalPath = `${DB_PATH}-journal`;
  [walPath, shmPath, journalPath].forEach(f => {
    if (fs.existsSync(f)) {
      try {
        fs.unlinkSync(f);
      } catch {}
    }
  });

  // Ensure directory exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // 2. Open new database sync connection
  const db = new DatabaseSync(DB_PATH);

  // 3. Load and execute schema
  console.log('Applying schema...');
  const schemaPath = path.resolve(process.cwd(), 'storage', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  db.exec(schema);

  // 4. Seed new level-based data
  console.log('Seeding level-based word sets...');
  const seedPath = path.resolve(process.cwd(), 'storage', 'db', 'seed.json');
  if (!fs.existsSync(seedPath)) {
    console.error(`Error: Seed file not found at ${seedPath}`);
    process.exit(1);
  }

  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8')) as SeedSet[];

  const insertSetStmt = db.prepare(
    'INSERT INTO word_sets (name, level_tag, description) VALUES (?, ?, ?)'
  );
  
  const insertWordStmt = db.prepare(
    'INSERT INTO words (word_set_id, english, vietnamese, japanese, example_en, example_vi, example_ja) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  for (const set of seedData) {
    console.log(`Inserting word set: ${set.setName} (${set.levelTag})...`);
    // Insert word set metadata
    const setRes = insertSetStmt.run(set.setName, set.levelTag, set.description);
    
    // Get the last inserted row ID for this set
    // SQLite DatabaseSync doesn't directly return changes/lastInsertRowid easily on run(),
    // so we query last_insert_rowid()
    const lastIdRow = db.prepare('SELECT last_insert_rowid() AS id').get() as { id: number };
    const setId = lastIdRow.id;

    // Insert words belonging to this set
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

  console.log('Database reset & seeding completed successfully!');
}

try {
  resetDatabase();
} catch (error) {
  console.error('Failed to reset database:', error);
  process.exit(1);
}
