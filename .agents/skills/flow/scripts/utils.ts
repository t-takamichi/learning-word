import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Git のステータスがクリーン（未コミットの変更がない）かどうかをチェックする。
 * @returns クリーンであれば true, そうでなければ false
 */
export function isGitClean(): boolean {
  try {
    // まず git 管理下にあるか確認
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  } catch (e) {
    console.warn('[Backup] Warning: Not a git repository. Skipping git clean check.');
    return true; // git管理下でない場合は常にクリーンとみなす
  }

  try {
    const output = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    return output === '';
  } catch (error) {
    console.error('Failed to run git status:', error);
    return false;
  }
}


/**
 * 現在の未コミットの変更を git stash に退避させる。
 * @returns stash 名
 */
export function stashBackup(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const stashName = `flow-auto-backup-${timestamp}`;
  try {
    execSync(`git stash save "${stashName}"`, { stdio: 'inherit' });
    console.log(`[Backup] Successfully stashed changes as: ${stashName}`);
    return stashName;
  } catch (error) {
    console.error('[Backup] Failed to stash changes:', error);
    throw error;
  }
}

/**
 * 退避させた stash を復元する。
 */
export function stashPop(): void {
  try {
    execSync('git stash pop', { stdio: 'inherit' });
    console.log('[Backup] Successfully restored stashed changes.');
  } catch (error) {
    console.warn('[Backup] Warning: Failed to pop stash. It may need manual resolution.', error);
  }
}

/**
 * 指定ディレクトリ内のすべての Markdown ファイルを再帰的に検索する。
 * @param dirPath 検索対象ディレクトリの絶対パス
 */
export function findMarkdownFiles(dirPath: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dirPath)) {
    return results;
  }

  const list = fs.readdirSync(dirPath);
  for (const file of list) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(findMarkdownFiles(filePath));
    } else if (filePath.endsWith('.md')) {
      results.push(filePath);
    }
  }
  return results;
}

import { fileURLToPath } from 'url';

// 直接実行された場合のテスト用ロジック
const isMain = process.argv[1] && fs.existsSync(process.argv[1]) && 
  fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url));

if (isMain) {
  console.log('Testing utils.ts...');
  console.log('Is Git Clean?:', isGitClean());
  try {
    const designFiles = findMarkdownFiles(path.join(process.cwd(), 'docs/spec/design'));
    console.log('Found Design Files:', designFiles);
  } catch (e) {
    console.error('Error finding design files:', e);
  }
}

