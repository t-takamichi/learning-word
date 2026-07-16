import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { Readable } from 'stream';

const BIN_DIR = path.resolve(process.cwd(), 'storage', 'bin');
const DATA_DIR = path.resolve(process.cwd(), 'storage', 'data');
const VOICES_DIR = path.resolve(DATA_DIR, 'voices');

const PIPER_BIN_PATH = process.env.PIPER_BIN_PATH 
  ? path.resolve(process.cwd(), process.env.PIPER_BIN_PATH)
  : path.resolve(BIN_DIR, 'piper', 'piper');

const MODEL_NAME = 'en_US-ljspeech-medium';
const PIPER_MODEL_PATH = process.env.PIPER_MODEL_PATH
  ? path.resolve(process.cwd(), process.env.PIPER_MODEL_PATH)
  : path.resolve(VOICES_DIR, `${MODEL_NAME}.onnx`);

const PIPER_CONFIG_PATH = `${PIPER_MODEL_PATH}.json`;

let usePythonFallback = false;

interface TTSJob {
  text: string;
  lengthScale: number;
  resolve: (stream: Readable) => void;
  reject: (err: any) => void;
}

const ttsQueue: TTSJob[] = [];
let activeProcesses = 0;
const MAX_CONCURRENT_PROCESSES = 2; // 同時に実行する最大プロセス数
const MIN_LAUNCH_INTERVAL_MS = 333; // 毎秒3リクエストまでに制限するため、起動間隔を最低333ms空ける
const MAX_QUEUE_SIZE = 30; // キューの最大長
let lastLaunchTime = 0;
let queueTimeout: NodeJS.Timeout | null = null;

/**
 * required な Piper 実行アセットが存在することを確認する。
 * 不足している場合は、ユーザーに 'yarn setup:piper' を実行するように促す例外をスローする。
 */
export async function ensurePiperReady(): Promise<void> {
  const platform = os.platform();

  if (platform === 'darwin') {
    // macOS: Check if python3 and piper module are available
    try {
      execSync('python3 -m piper --help', { stdio: 'ignore' });
      usePythonFallback = true;
      console.log('Using python3 -m piper on macOS');
    } catch {
      usePythonFallback = false;
    }
  }

  // Pythonフォールバックが使えない（macOSでパッケージ未導入、もしくはLinux）場合はスタンドアロンバイナリが必要
  if (!usePythonFallback) {
    const hasBin = fs.existsSync(PIPER_BIN_PATH);
    if (!hasBin) {
      throw new Error(
        `Piper standalone binary not found at ${PIPER_BIN_PATH}. Please run 'yarn setup:piper' to download required assets.`
      );
    }
  }

  // 音声モデルと設定ファイルの存在チェック
  const hasModel = fs.existsSync(PIPER_MODEL_PATH);
  const hasConfig = fs.existsSync(PIPER_CONFIG_PATH);

  if (!hasModel || !hasConfig) {
    throw new Error(
      `Piper voice model or config not found in ${VOICES_DIR}. Please run 'yarn setup:piper' to download required assets.`
    );
  }

  console.log('Piper TTS is ready.');
}

function processQueue() {
  if (queueTimeout) {
    clearTimeout(queueTimeout);
    queueTimeout = null;
  }

  if (ttsQueue.length === 0) {
    return;
  }

  if (activeProcesses >= MAX_CONCURRENT_PROCESSES) {
    console.log(`[TTS Queue] Max concurrent processes reached (${activeProcesses}/${MAX_CONCURRENT_PROCESSES}). Waiting...`);
    return;
  }

  const now = Date.now();
  const timeSinceLastLaunch = now - lastLaunchTime;
  if (timeSinceLastLaunch < MIN_LAUNCH_INTERVAL_MS) {
    const delay = MIN_LAUNCH_INTERVAL_MS - timeSinceLastLaunch;
    console.log(`[TTS Queue] Launching too fast. Delaying next process by ${delay}ms...`);
    queueTimeout = setTimeout(() => {
      queueTimeout = null;
      processQueue();
    }, delay);
    return;
  }

  const job = ttsQueue.shift();
  if (!job) return;

  activeProcesses++;
  lastLaunchTime = Date.now();
  console.log(`[TTS Queue] Starting Piper process. Active: ${activeProcesses}/${MAX_CONCURRENT_PROCESSES}, Queue: ${ttsQueue.length}`);

  try {
    const stream = startPiperProcess(job.text, job.lengthScale);
    job.resolve(stream);
  } catch (err) {
    activeProcesses = Math.max(0, activeProcesses - 1);
    console.error(`[TTS Queue] Failed to start process:`, err);
    job.reject(err);
    processQueue();
  }

  if (ttsQueue.length > 0 && activeProcesses < MAX_CONCURRENT_PROCESSES) {
    queueTimeout = setTimeout(() => {
      queueTimeout = null;
      processQueue();
    }, MIN_LAUNCH_INTERVAL_MS);
  }
}

function startPiperProcess(text: string, lengthScale: number): Readable {
  const sanitizedText = text.replace(/\n/g, ' ').trim();

  // `--length_scale` は音素の長さを伸縮させる（>1 で発音が遅くなる）。再生速度を
  // 落とすクライアント側の playbackRate と違い、ピッチを変えずにゆっくり読ませられる。
  // アンダースコア表記は本番の旧C++バイナリと python 版の双方が受け付ける共通形式。
  const lengthScaleArg = ['--length_scale', String(lengthScale)];

  let cmd: string;
  let args: string[];

  if (usePythonFallback) {
    cmd = 'python3';
    args = ['-m', 'piper', '--model', PIPER_MODEL_PATH, ...lengthScaleArg, '-f', '-'];
  } else {
    if (!fs.existsSync(PIPER_BIN_PATH)) {
      throw new Error(`Piper binary not found at ${PIPER_BIN_PATH}. Run ensurePiperReady() first.`);
    }
    cmd = PIPER_BIN_PATH;
    args = ['-m', PIPER_MODEL_PATH, ...lengthScaleArg, '-f', '-'];
  }

  if (!fs.existsSync(PIPER_MODEL_PATH)) {
    throw new Error(`Piper model not found at ${PIPER_MODEL_PATH}. Run ensurePiperReady() first.`);
  }

  const binDir = path.dirname(PIPER_BIN_PATH);

  const child = spawn(cmd, args, {
    env: {
      ...process.env,
      LD_LIBRARY_PATH: binDir + (process.env.LD_LIBRARY_PATH ? `:${process.env.LD_LIBRARY_PATH}` : ''),
      DYLD_LIBRARY_PATH: `${binDir}:/opt/homebrew/lib` + (process.env.DYLD_LIBRARY_PATH ? `:${process.env.DYLD_LIBRARY_PATH}` : ''),
    }
  });

  child.stdin.write(sanitizedText + '\n');
  child.stdin.end();

  child.stderr.on('data', (data) => {
    console.log(`[Piper log] ${data.toString().trim()}`);
  });

  let processDecremented = false;
  const decrementActiveProcesses = () => {
    if (!processDecremented) {
      processDecremented = true;
      activeProcesses = Math.max(0, activeProcesses - 1);
      console.log(`[TTS Queue] Piper process ended. Active: ${activeProcesses}/${MAX_CONCURRENT_PROCESSES}`);
      processQueue();
    }
  };

  child.on('close', (code) => {
    console.log(`[TTS Queue] Piper process closed with code ${code}`);
    decrementActiveProcesses();
  });

  child.on('exit', (code) => {
    console.log(`[TTS Queue] Piper process exited with code ${code}`);
    decrementActiveProcesses();
  });

  child.on('error', (err) => {
    console.error(`[TTS Queue] Piper process error:`, err);
    decrementActiveProcesses();
  });

  child.stdout.on('close', () => {
    if (child.exitCode === null && child.killed === false) {
      console.log('[TTS Queue] Stream closed by client, killing Piper process');
      child.kill();
    }
    decrementActiveProcesses();
  });

  return child.stdout;
}

/**
 * 指定したテキストの音声データをストリームとして生成する（キューで制御）
 */
export function generateSpeechStream(text: string, lengthScale: number = 1.0): Promise<Readable> {
  if (ttsQueue.length >= MAX_QUEUE_SIZE) {
    return Promise.reject(new Error('TTS server is busy. Please try again later.'));
  }

  return new Promise<Readable>((resolve, reject) => {
    ttsQueue.push({ text, lengthScale, resolve, reject });
    processQueue();
  });
}
