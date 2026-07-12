import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

interface RunResult {
  command: string;
  success: boolean;
  code: number;
  stdout: string;
  stderr: string;
  error?: string;
}

/**
 * 指定したコマンドを実行し、結果を返す
 */
export function runCommand(command: string): RunResult {
  try {
    const stdout = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'] // stdin, stdout, stderr をキャプチャ
    });
    return {
      command,
      success: true,
      code: 0,
      stdout,
      stderr: ''
    };
  } catch (error: any) {
    return {
      command,
      success: false,
      code: error.status ?? 1,
      stdout: error.stdout ?? '',
      stderr: error.stderr ?? '',
      error: error.message ?? 'Unknown error'
    };
  }
}

// 直接実行された場合
const isMain = process.argv[1] && 
  (process.argv[1].endsWith('runner.ts') || process.argv[1].endsWith('runner.js'));

if (isMain) {
  const defaultCommand = 'yarn typecheck';
  const command = process.argv[2] || defaultCommand;
  
  console.log(`Running verification command: "${command}"...`);
  const result = runCommand(command);
  
  console.log(JSON.stringify(result, null, 2));
  
  if (!result.success) {
    process.exit(1);
  }
}
