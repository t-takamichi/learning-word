import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

export type DB = DatabaseSync;

const DB_PATH = process.env['DB_PATH'] ?? 'storage/data/learning.db';
const MIGRATIONS_DIR = 'storage/db/migrations';

/**
 * DBへの接続を開き、接続単位のPRAGMAを適用する。
 * journal_mode / foreign_keys は接続ごとの設定のため、マイグレーションSQLではなくここで適用する
 * （journal_mode の変更はトランザクション内で実行できないため、マイグレーションのトランザクションと分離する意味もある）。
 */
export function openConnection(): DB {
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  return db;
}

/**
 * storage/db/migrations/ 配下の番号付きSQLを、未適用のものだけ昇順で適用する。
 * 適用済みバージョンは schema_migrations テーブルに記録する。
 */
export function runMigrations(db: DB): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    TEXT PRIMARY KEY,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  const appliedRows = db.prepare('SELECT version FROM schema_migrations').all() as { version: string }[];
  const applied = new Set(appliedRows.map((r) => r.version));

  // マイグレーション導入前から存在するDBに対する後方互換。
  // 旧方式（schema.sql + migrateColumns）で作られたDBは schema_migrations を持たないため、
  // 不足カラムの追記を一度だけ実施してから 0001_baseline を適用する。
  if (applied.size === 0 && tableExists(db, 'users')) {
    backfillLegacyColumns(db);
  }

  const files = listMigrationFiles();
  for (const file of files) {
    const version = file.replace(/\.sql$/, '');
    if (applied.has(version)) continue;

    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf-8');
    db.exec('BEGIN');
    try {
      db.exec(sql);
      db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(version);
      db.exec('COMMIT');
      console.log(`Applied migration: ${version}`);
    } catch (error) {
      db.exec('ROLLBACK');
      console.error(`Failed to apply migration ${version}:`, error);
      throw error;
    }
  }
}

function listMigrationFiles(): readonly string[] {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

function tableExists(db: DB, name: string): boolean {
  const row = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(name) as { name: string } | undefined;
  return row !== undefined;
}

/**
 * マイグレーション導入前のDB向けの一度きりの互換処理。
 * 旧 migrateColumns() 相当。既存の列を追記するのみで、以降の変更は番号付きマイグレーションで管理する。
 * ※ 破壊的な DELETE/DROP は原則行わない（pin_hash/token は初回付与時のみ、無効な既定値での再登録を促すため空にする）。
 */
function backfillLegacyColumns(db: DB): void {
  try {
    const userColumns = columnNames(db, 'users');
    if (userColumns.length > 0) {
      let clearUsers = false;
      if (!userColumns.includes('pin_hash')) {
        db.exec("ALTER TABLE users ADD COLUMN pin_hash TEXT NOT NULL DEFAULT 'invalid'");
        clearUsers = true;
      }
      if (!userColumns.includes('token')) {
        db.exec("ALTER TABLE users ADD COLUMN token TEXT NOT NULL DEFAULT 'invalid_token'");
        clearUsers = true;
      }
      if (!userColumns.includes('role')) {
        db.exec("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'");
      }
      if (clearUsers) {
        // 認証に必須な列を後付けした場合、既定値のままでは安全にログインできないため、
        // 移行対象の古いユーザーレコードを削除し再登録を促す。
        db.exec('DELETE FROM users');
        db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_token ON users(token)');
      }
    }

    const wordSetColumns = columnNames(db, 'word_sets');
    if (wordSetColumns.length > 0 && !wordSetColumns.includes('created_by')) {
      db.exec('ALTER TABLE word_sets ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE CASCADE');
    }

    const wordColumns = columnNames(db, 'words');
    if (wordColumns.length > 0 && !wordColumns.includes('created_by')) {
      db.exec('ALTER TABLE words ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE CASCADE');
    }
  } catch (error) {
    console.error('Failed to backfill legacy columns:', error);
  }
}

function columnNames(db: DB, table: string): readonly string[] {
  const pragma = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  return pragma.map((c) => c.name);
}
