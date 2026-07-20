import { openConnection, runMigrations } from '../src/server/migrate';

/**
 * 未適用のマイグレーションだけを順番に適用する（データは消さない）。
 * 本番デプロイ時に `yarn db:migrate` として実行することを想定。
 */
function migrate(): void {
  const db = openConnection();
  try {
    runMigrations(db);
    console.log('Migrations up to date.');
  } finally {
    db.close();
  }
}

try {
  migrate();
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
