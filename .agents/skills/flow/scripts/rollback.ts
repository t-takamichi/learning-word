import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Git が利用可能で、リポジトリ内であるか確認する
 */
function isGitAvailable(): boolean {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * ファイルのバックアップを作成する (Git非依存フォールバック用)
 */
export function backupFile(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const backupPath = filePath + '.flowbak';
  try {
    fs.copyFileSync(filePath, backupPath);
    return backupPath;
  } catch (error) {
    console.error(`[Rollback] Failed to backup file: ${filePath}`, error);
    return null;
  }
}

/**
 * バックアップからファイルを復元する
 */
export function restoreFile(filePath: string): boolean {
  const backupPath = filePath + '.flowbak';
  if (!fs.existsSync(backupPath)) return false;
  try {
    fs.copyFileSync(backupPath, filePath);
    fs.unlinkSync(backupPath); // バックアップを削除
    return true;
  } catch (error) {
    console.error(`[Rollback] Failed to restore file: ${filePath}`, error);
    return false;
  }
}

/**
 * バックアップファイルを削除する
 */
export function cleanBackup(filePath: string): void {
  const backupPath = filePath + '.flowbak';
  if (fs.existsSync(backupPath)) {
    try {
      fs.unlinkSync(backupPath);
    } catch (e) {
      // ignore
    }
  }
}

/**
 * Git stash を使ったバックアップ退避
 */
export function stashBackup(): string | null {
  if (!isGitAvailable()) {
    console.log('[Rollback] Git not available. Skipping git stash backup.');
    return null;
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const stashName = `flow-auto-backup-${timestamp}`;
  try {
    execSync(`git stash save "${stashName}"`, { stdio: 'inherit' });
    return stashName;
  } catch (error) {
    console.error('[Rollback] Failed to stash changes:', error);
    return null;
  }
}

/**
 * Git stash からの復元
 */
export function stashPop(): void {
  if (!isGitAvailable()) return;
  try {
    execSync('git stash pop', { stdio: 'inherit' });
    console.log('[Rollback] Successfully popped stash.');
  } catch (error) {
    console.warn('[Rollback] Warning: Failed to pop stash. Manual merge might be needed.', error);
  }
}

/**
 * 全体のロールバックを実行する (Git のリセットまたは退避ファイルの復元)
 */
export function rollbackAll(targetFiles: string[] = []): void {
  console.log('[Rollback] Executing rollback for targets:', targetFiles);
  
  if (isGitAvailable()) {
    try {
      // Git で強制リセット
      execSync('git reset --hard HEAD', { stdio: 'inherit' });
      execSync('git clean -fd', { stdio: 'inherit' });
      console.log('[Rollback] Successfully reset workspace using git.');
      return;
    } catch (error) {
      console.error('[Rollback] Git reset failed. Falling back to file-based rollback.', error);
    }
  }

  // Git が使えない、または失敗した場合は、ファイル単位のバックアップから復元
  let successCount = 0;
  for (const file of targetFiles) {
    const absolutePath = path.resolve(file);
    if (restoreFile(absolutePath)) {
      successCount++;
    }
  }
  console.log(`[Rollback] Restored ${successCount} files from backup.`);
}

// 直接実行された場合の動作
const isMain = process.argv[1] && 
  (process.argv[1].endsWith('rollback.ts') || process.argv[1].endsWith('rollback.js'));

if (isMain) {
  const action = process.argv[2];
  if (action === 'backup') {
    const files = process.argv.slice(3);
    files.forEach(f => backupFile(path.resolve(f)));
    console.log('Files backed up.');
  } else if (action === 'rollback') {
    const files = process.argv.slice(3);
    rollbackAll(files);
  }
}
