import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

// 設計ファイルから実装フェーズ・計画書へのマッピング定義
const MAPPING: Record<string, number[]> = {
  'README.md': [1, 2, 3, 4, 5],
  'architecture.md': [1],
  'flashcard.md': [1, 2, 3],
  'word-list.md': [3, 4],
  'admin.md': [4, 5],
  'risks.md': [1, 2, 3, 4, 5]
};

/**
 * git diff から変更された設計ファイルを自動検出する
 */
function getChangedDesignFilesFromGit(): string[] {
  try {
    // git 管理下にあるか確認
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    const output = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).trim();
    if (!output) return [];
    
    return output
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.startsWith('docs/spec/design/') && f.endsWith('.md'));
  } catch (e) {
    // git が使えない、または未管理の場合は空配列
    return [];
  }
}

/**
 * メインの解析処理
 */
export function analyze(files: string[]): { phase: string; plan: string; phaseNumber: number }[] {
  const affectedPhaseNumbers = new Set<number>();

  for (const file of files) {
    const filename = path.basename(file);
    const mappedPhases = MAPPING[filename];
    
    if (mappedPhases) {
      mappedPhases.forEach(p => affectedPhaseNumbers.add(p));
    } else {
      // 未定義の設計ファイル（新規追加機能など）の場合は、デフォルトで一番関連の近いフェーズ、
      // または新規フェーズ候補として最後のフェーズ（Phase 5など）にマッピング
      console.warn(`[Impact Analyzer] Warning: No explicit mapping for ${filename}. Defaulting to Phase 3.`);
      affectedPhaseNumbers.add(3);
    }
  }

  // 結果をオブジェクトの配列として整形
  return Array.from(affectedPhaseNumbers)
    .sort((a, b) => a - b)
    .map(p => {
      const workspaceRoot = process.cwd();
      const phasePath = path.join(workspaceRoot, `docs/spec/impl/phase/phase-${p}.md`);
      const planPath = path.join(workspaceRoot, `docs/spec/impl/steps/${p}/plan.md`);
      return {
        phaseNumber: p,
        phase: fs.existsSync(phasePath) ? `docs/spec/impl/phase/phase-${p}.md` : '',
        plan: fs.existsSync(planPath) ? `docs/spec/impl/steps/${p}/plan.md` : ''
      };
    })
    .filter(item => item.phase !== '' || item.plan !== '');
}

// 直接実行された場合
const isMain = process.argv[1] && 
  (process.argv[1].endsWith('impact-analyzer.ts') || process.argv[1].endsWith('impact-analyzer.js'));

if (isMain) {
  let targets = process.argv.slice(2);
  
  if (targets.length === 0) {
    // 引数がない場合は git diff から自動検出を試みる
    targets = getChangedDesignFilesFromGit();
  }

  if (targets.length === 0) {
    console.log(JSON.stringify([], null, 2));
    process.exit(0);
  }

  const results = analyze(targets);
  console.log(JSON.stringify(results, null, 2));
}
