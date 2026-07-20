import fs from 'fs';
import path from 'path';
import { createDatabase } from '../src/server/db';

const DB_PATH = process.env['DB_PATH'] ?? 'storage/data/learning.db';

/**
 * DBファイルを物理削除したうえで、マイグレーション適用＋シード投入をやり直す。
 * スキーマ適用・シードのロジックは createDatabase() に集約し、ここでは「消して作り直す」責務のみを持つ。
 */
function resetDatabase(): void {
  console.log(`Resetting database at: ${DB_PATH}`);

  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Deleted database file.');
  }

  // WAL / SHM / Journal の残骸も削除してクリーンな状態にする
  for (const suffix of ['-wal', '-shm', '-journal']) {
    const f = `${DB_PATH}${suffix}`;
    if (fs.existsSync(f)) {
      try {
        fs.unlinkSync(f);
      } catch {
        // 残骸削除の失敗は致命的ではないため無視する
      }
    }
  }

  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // マイグレーション適用 + シード投入（createDatabase が一括で担う）
  const db = createDatabase();
  db.close();

  console.log('Database reset & seeding completed successfully!');
}

try {
  resetDatabase();
} catch (error) {
  console.error('Failed to reset database:', error);
  process.exit(1);
}
