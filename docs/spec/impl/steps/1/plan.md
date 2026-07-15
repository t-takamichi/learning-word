# Phase 1 実装計画書: Walking Skeleton

## 1. 参照

- フェーズ定義: [phase-1.md](../../phase/phase-1.md)
- 設計（アーキテクチャ）: [architecture.md](../../../design/architecture.md)
- 設計（フラッシュカード）: [flashcard.md](../../../design/flashcard.md)

---

## 2. このフェーズのゴール

- Bun + Hono + React + Vite が起動し、ブラウザからアクセスできる
- `GET /api/session` が SQLite から単語10件を返す
- React で FlashCard の表面（英語のみ）が表示される
- 🔊 ボタンをタップすると英語音声が再生される（iOS Safari で動作確認済み）
- 高×高リスク（R1/R2: iOS Web Speech API）の技術スパイクが完了する

---

## 3. 前提・依存

- 依存フェーズ: なし（最初のフェーズ）
- 事前準備:
  - Bun がインストール済みであること（`bun --version` で確認）
  - iOS Safari で動作確認できるデバイスまたはシミュレータが手元にあること

---

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|----|---------|-----------|
| T1 | `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html` | プロジェクト初期化・依存パッケージ・ビルド設定 | 共通 | `bun install` 成功 / `bun run typecheck` 通過 | TypeScript.md |
| T2 | `src/shared/types.ts` | 共有型定義（Word / LearningProgress 等） | 共通 | `tsc --noEmit` 通過 | TypeScript.md |
| T3 | `db/schema.sql`, `db/seed.json` | テーブル定義・WAL pragma・初期単語データ | Infrastructure | SQLite で直接実行して確認 | architecture.md |
| T4 | `src/server/db.ts` | SQLite 接続・スキーマ適用・シード投入・WAL設定 | Infrastructure | `bun src/server/db.ts` でエラーなし起動 | architecture.md |
| T5 | `src/server/domain/word.ts` | IWordRepository インターフェース定義 | Domain | `tsc --noEmit` 通過 | architecture.md, TypeScript.md |
| T6 | `src/server/repositories/wordRepository.ts` | WordRepository（IWordRepository 実装・セッション取得クエリ） | Infrastructure | `bun -e` でクエリ結果 10件確認 | architecture.md, TypeScript.md |
| T7 | `src/server/usecases/getSession.ts` | GetSessionUseCase（IWordRepository 依存注入） | Application | 単体動作確認（引数に WordRepository を渡して実行） | architecture.md, TypeScript.md |
| T8 | `src/server/routes/session.ts` | `GET /api/session` Hono ハンドラ・AppType export | Presentation | `curl http://localhost:3000/api/session` で Word[] 返却確認 | hono.md, TypeScript.md |
| T9 | `src/server/index.ts` | Hono アプリ本体・DI配線・静的ファイル配信・Bun serve | Presentation | `bun run server` で起動確認 | hono.md, architecture.md |
| T10 | `src/client/hooks/useSpeech.ts` | Web Speech API ラッパー（条件付き cancel・voice 明示選択・iOS/Chrome/Safari 対応） | Frontend | Chrome/Safari/Firefox で speak() 呼び出し確認 | react.md, TypeScript.md |
| T11 | `src/client/components/AudioButton/AudioButton.tsx`, `AudioButton.module.css` | 音声再生ボタン（タップイベント起点・非対応時グレーアウト） | Frontend | ブラウザでタップして音声再生確認 | react.md, TypeScript.md |
| T12 | `src/client/hooks/useSession.ts` | hc<AppType> クライアント・GET /api/session・TanStack Query | Frontend | Network タブで `/api/session` 呼び出し確認 | react.md, hono.md |
| T13 | `src/client/components/FlashCard/FlashCard.tsx`, `FlashCard.module.css` | FlashCard 表面（英語表示・AudioButton 埋め込み・100dvh対応） | Frontend | ブラウザで英単語カード表示確認 | react.md, TypeScript.md |
| T14 | `src/client/pages/StudyPage.tsx` | 学習ページ（useSession + FlashCard・ローディング/エラー表示） | Frontend | ブラウザで単語カード表示確認 | react.md |
| T15 | `src/client/App.tsx`, `src/client/main.tsx` | React エントリポイント・QueryClientProvider | Frontend | `bun run dev` で画面表示確認 | react.md, TypeScript.md |

---

## 5. 各タスク詳細

### T1: プロジェクト初期化

- **ファイル**: `package.json`（新規）, `tsconfig.json`（新規）, `vite.config.ts`（新規）, `index.html`（新規）
- **やること**:

  **package.json 主要依存**:
  ```json
  {
    "dependencies": {
      "hono": "^4",
      "react": "^18",
      "react-dom": "^18",
      "@tanstack/react-query": "^5",
      "zod": "^3"
    },
    "devDependencies": {
      "@hono/zod-validator": "^0.4",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      "typescript": "^5",
      "vite": "^5",
      "@vitejs/plugin-react": "^4",
      "concurrently": "^9"
    },
    "scripts": {
      "dev": "concurrently \"bun run server\" \"vite\"",
      "server": "bun --hot src/server/index.ts",
      "build": "vite build",
      "start": "bun src/server/index.ts",
      "typecheck": "tsc --noEmit"
    }
  }
  ```

  **tsconfig.json 重要設定**:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "target": "ESNext",
      "module": "ESNext",
      "moduleResolution": "bundler",
      "jsx": "react-jsx",
      "paths": {
        "@shared/*": ["./src/shared/*"],
        "@server/*": ["./src/server/*"],
        "@client/*": ["./src/client/*"]
      }
    }
  }
  ```

  **vite.config.ts 重要設定**:
  ```typescript
  export default defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': 'http://localhost:3000'  // Hono dev server へプロキシ
      }
    },
    build: {
      outDir: 'dist/client'
    }
  });
  ```

- **検証**: `bun install` 成功。`bun run typecheck` でエラーなし。
- **注意**: `moduleResolution: "bundler"` は Vite + Bun 環境での推奨設定。パスエイリアスを tsconfig と vite.config の両方に定義する。

---

### T2: 共有型定義

- **ファイル**: `src/shared/types.ts`（新規）
- **やること**:
  ```typescript
  export type Word = {
    readonly id: number;
    readonly english: string;
    readonly vietnamese: string;
    readonly japanese: string;
    readonly example_en: string | null;
    readonly example_vi: string | null;
    readonly example_ja: string | null;
    readonly created_at: string;
  };

  export type LearningProgress = {
    readonly word_id: number;
    readonly status: 'new' | 'weak' | 'mastered';
    readonly review_count: number;
    readonly incorrect_count: number;
    readonly last_reviewed_at: string | null;
  };

  export type WordWithProgress = Word & {
    readonly progress: LearningProgress | null;
  };

  export type ReviewInput = {
    readonly wordId: number;
    readonly result: 'good' | 'again';
  };

  export type WordInput = Omit<Word, 'id' | 'created_at'>;

  export type WordsResponse = {
    readonly words: readonly WordWithProgress[];
    readonly total: number;
    readonly page: number;
    readonly limit: number;
    readonly totalPages: number;
  };
  ```
- **検証**: `bun run typecheck` でエラーなし。
- **注意**: TypeScript.md 準拠 — `readonly` を使い immutability を保証。`any` は使用しない。

---

### T3: DBスキーマ・シードデータ

- **ファイル**: `db/schema.sql`（新規）, `db/seed.json`（新規）
- **やること**:

  **schema.sql**:
  ```sql
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS words (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    english     TEXT NOT NULL,
    vietnamese  TEXT NOT NULL,
    japanese    TEXT NOT NULL,
    example_en  TEXT,
    example_vi  TEXT,
    example_ja  TEXT,
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS learning_progress (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    word_id         INTEGER NOT NULL UNIQUE,
    status          TEXT NOT NULL CHECK(status IN ('new', 'weak', 'mastered')) DEFAULT 'new',
    review_count    INTEGER NOT NULL DEFAULT 0,
    incorrect_count INTEGER NOT NULL DEFAULT 0,
    last_reviewed_at DATETIME,
    FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
  );
  ```

  **seed.json**: 英語 → ベトナム語 / 日本語の単語データ 10件
  ```json
  [
    { "english": "apple", "vietnamese": "quả táo", "japanese": "りんご", "example_en": "I ate an apple.", "example_vi": "Tôi đã ăn một quả táo.", "example_ja": "私はりんごを食べた。" },
    { "english": "beautiful", "vietnamese": "đẹp", "japanese": "美しい", "example_en": "She is beautiful.", "example_vi": "Cô ấy rất đẹp.", "example_ja": "彼女は美しい。" },
    ... (10件)
  ]
  ```

- **検証**: `bun -e "import { Database } from 'bun:sqlite'; const db = new Database(':memory:'); db.run(require('fs').readFileSync('db/schema.sql','utf-8')); console.log('OK')"` でエラーなし。
- **注意**: `PRAGMA foreign_keys = ON` と `ON DELETE CASCADE` により learning_progress の孤立レコードを防ぐ。WAL モードは schema.sql 先頭に置く（R4対策）。

---

### T4: SQLite 接続・初期化

- **ファイル**: `src/server/db.ts`（新規）
- **やること**:
  ```typescript
  import { Database } from 'bun:sqlite';
  import { readFileSync } from 'fs';
  import seedData from '../../db/seed.json';

  const DB_PATH = process.env['DB_PATH'] ?? 'data/learning.db';

  export function createDatabase(): Database {
    const db = new Database(DB_PATH, { create: true });
    const schema = readFileSync('db/schema.sql', 'utf-8');
    db.run(schema);
    seedIfEmpty(db);
    return db;
  }

  function seedIfEmpty(db: Database): void {
    const count = db.query<{ count: number }, []>('SELECT COUNT(*) as count FROM words').get();
    if (count && count.count === 0) {
      const stmt = db.prepare(
        'INSERT INTO words (english, vietnamese, japanese, example_en, example_vi, example_ja) VALUES (?, ?, ?, ?, ?, ?)'
      );
      for (const w of seedData) {
        stmt.run(w.english, w.vietnamese, w.japanese, w.example_en ?? null, w.example_vi ?? null, w.example_ja ?? null);
      }
    }
  }

  export type DB = Database;
  ```
- **検証**: `bun src/server/db.ts` でエラーなし。`data/learning.db` が生成され、words テーブルにシードデータが入っていること（`bun -e "import { Database } from 'bun:sqlite'; const db = new Database('data/learning.db'); console.log(db.query('SELECT count(*) from words').get())"`）。
- **注意**: `data/` ディレクトリを `.gitignore` に追加する。`seedIfEmpty` により二重投入を防ぐ。

---

### T5: IWordRepository インターフェース（Domain）

- **ファイル**: `src/server/domain/word.ts`（新規）
- **やること**:
  ```typescript
  import type { Word } from '@shared/types';

  export interface IWordRepository {
    getSession(): readonly Word[];
  }
  ```
- **検証**: `tsc --noEmit` でエラーなし。
- **注意**: Domain 層は zero third-party framework dependencies。型定義のみ。Infrastructure は絶対に import しない。

---

### T6: WordRepository（Infrastructure 実装）

- **ファイル**: `src/server/repositories/wordRepository.ts`（新規）
- **やること**:
  ```typescript
  import type { DB } from '../db';
  import type { IWordRepository } from '../domain/word';
  import type { Word } from '@shared/types';

  export class WordRepository implements IWordRepository {
    constructor(private readonly db: DB) {}

    getSession(): readonly Word[] {
      // 優先枠 4件: weak / 未学習 / incorrect_count > 0
      const priority = this.db.query<Word, []>(`
        SELECT w.* FROM words w
        LEFT JOIN learning_progress p ON w.id = p.word_id
        WHERE p.word_id IS NULL OR p.status = 'weak' OR p.incorrect_count > 0
        ORDER BY COALESCE(p.incorrect_count, 999) DESC, RANDOM()
        LIMIT 4
      `).all();

      const priorityIds = priority.map(w => w.id);
      const placeholders = priorityIds.length > 0
        ? priorityIds.map(() => '?').join(',')
        : '0';

      // 通常枠 6件: 優先枠を除く
      const normal = this.db.query<Word, number[]>(`
        SELECT w.* FROM words w
        WHERE w.id NOT IN (${placeholders})
        ORDER BY RANDOM()
        LIMIT 6
      `).all(...priorityIds);

      return [...priority, ...normal];
    }
  }
  ```
- **検証**: `bun -e` でインスタンス化し `getSession()` が Word[] を返すことを確認。
- **注意**: architecture.md 準拠 — Infrastructure 層に HTTP 関連の import は絶対に持ち込まない。`any` は使用しない。

---

### T7: GetSessionUseCase（Application）

- **ファイル**: `src/server/usecases/getSession.ts`（新規）
- **やること**:
  ```typescript
  import type { IWordRepository } from '../domain/word';
  import type { Word } from '@shared/types';

  export class GetSessionUseCase {
    constructor(private readonly wordRepo: IWordRepository) {}

    execute(): readonly Word[] {
      return this.wordRepo.getSession();
    }
  }
  ```
- **検証**: `tsc --noEmit` でエラーなし。Application 層に `hono` や `bun:sqlite` の import がないことを確認。
- **注意**: architecture.md 準拠 — HTTP オブジェクト（`c: Context`、ステータスコード等）を一切 import しない。

---

### T8: GET /api/session ハンドラ

- **ファイル**: `src/server/routes/session.ts`（新規）
- **やること**:
  ```typescript
  import { Hono } from 'hono';
  import type { GetSessionUseCase } from '../usecases/getSession';

  type Env = {
    Variables: {
      getSessionUseCase: GetSessionUseCase;
    };
  };

  export const sessionRoutes = new Hono<Env>();

  sessionRoutes.get('/', (c) => {
    const useCase = c.get('getSessionUseCase');
    const words = useCase.execute();
    return c.json(words);
  });
  ```
- **検証**: `curl http://localhost:3000/api/session` で Word[] JSON が返ること（T9 起動後）。
- **注意**: hono.md 準拠 — `Env` 型を明示的に定義して Hono インスタンスに渡す。ビジネスロジック・DB クエリは書かない。

---

### T9: Hono アプリ本体・DI配線

- **ファイル**: `src/server/index.ts`（新規）
- **やること**:
  ```typescript
  import { Hono } from 'hono';
  import { serveStatic } from 'hono/bun';
  import { createDatabase } from './db';
  import { WordRepository } from './repositories/wordRepository';
  import { GetSessionUseCase } from './usecases/getSession';
  import { sessionRoutes } from './routes/session';

  const db = createDatabase();
  const wordRepo = new WordRepository(db);
  const getSessionUseCase = new GetSessionUseCase(wordRepo);

  const app = new Hono();

  // DI: UseCase を Context 変数に注入
  app.use('/api/*', async (c, next) => {
    c.set('getSessionUseCase', getSessionUseCase);
    await next();
  });

  app.route('/api/session', sessionRoutes);

  // React 静的ファイル配信（本番）
  app.use('/*', serveStatic({ root: './dist/client' }));
  app.get('/*', serveStatic({ path: './dist/client/index.html' }));

  export type AppType = typeof app;

  export default {
    port: 3000,
    fetch: app.fetch,
  };
  ```
- **検証**: `bun run server` でサーバーが起動し、`curl http://localhost:3000/api/session` が JSON を返すこと。
- **注意**: hono.md 準拠 — `AppType` を export。DI はエントリポイントで完結させる。本番では静的ファイル配信が有効になる。

---

### T10: useSpeech フック（iOS対応）

- **ファイル**: `src/client/hooks/useSpeech.ts`（新規）
- **やること**:
  ```typescript
  import { useCallback, useEffect, useRef, useState } from 'react';

  interface UseSpeechReturn {
    speak: (text: string, onend?: () => void) => void;
    isSpeaking: boolean;
    isSupported: boolean;
  }

  // Chrome/Safari は getVoices() が voiceschanged まで空配列。取得できた範囲でベストを返す。
  function pickEnglishVoice(): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return undefined;
    return (
      voices.find((v) => v.lang === 'en-US' && v.localService) ??
      voices.find((v) => v.lang === 'en-US') ??
      voices.find((v) => v.lang.startsWith('en')) ??
      undefined
    );
  }

  export function useSpeech(): UseSpeechReturn {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // R2-b 対策: voice リストを事前ウォームアップ（初回無音を防止）
    useEffect(() => {
      if (!isSupported) return;
      const warmUp = () => { window.speechSynthesis.getVoices(); };
      warmUp();
      window.speechSynthesis.addEventListener('voiceschanged', warmUp);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', warmUp);
    }, [isSupported]);

    useEffect(() => {
      return () => {
        if (isSupported) window.speechSynthesis.cancel();
      };
    }, [isSupported]);

    const speak = useCallback((text: string, onend?: () => void): void => {
      if (!isSupported) { if (onend) onend(); return; }

      const synth = window.speechSynthesis;

      // R2 対策: 再生中/保留中のときだけ cancel（無条件 cancel は Chrome/Safari で speak を握り潰す）
      if (synth.speaking || synth.pending) synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      const voice = pickEnglishVoice(); // R2-b: voice 明示選択
      if (voice) utterance.voice = voice;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => { setIsSpeaking(false); if (onend) onend(); };
      utterance.onerror = () => { setIsSpeaking(false); if (onend) onend(); };

      utteranceRef.current = utterance;
      synth.speak(utterance);   // R1: ユーザーアクション起点で同期的に実行
      synth.resume();           // Chrome の stuck 状態を解除（他ブラウザでは無害）
    }, [isSupported]);

    return { speak, isSpeaking, isSupported };
  }
  ```
- **検証**: **Chrome・Safari・Firefox の 3 ブラウザ**で 🔊 ボタンから英語音声が再生されること。**iOS Safari でもタップイベント内で音声再生されること（R1/R2 スパイク）**。ページ読み込み直後の初回タップでも鳴ること（voice ウォームアップ）。
- **注意**:
  - R1 対策 — `speak()` は必ずユーザーアクション（タップ）のイベントハンドラ内からのみ呼び出す設計。直接 useEffect から呼び出さないこと。
  - R2 対策 — `cancel()` は**条件付き**（`synth.speaking || synth.pending`）で呼ぶこと。無条件 cancel は Chrome/デスクトップ Safari で直後の speak を無音化するため禁止。

---

### T11: AudioButton コンポーネント

- **ファイル**: `src/client/components/AudioButton/AudioButton.tsx`（新規）, `AudioButton.module.css`（新規）
- **やること**:
  ```typescript
  import styles from './AudioButton.module.css';
  import { useSpeech } from '../../hooks/useSpeech';

  interface Props {
    word: string;
  }

  export function AudioButton({ word }: Props) {
    const { speak, isSpeaking, isSupported } = useSpeech();

    const handleClick = (): void => {
      // R1 対策: ユーザーアクション（click）起点を保証
      speak(word);
    };

    if (!isSupported) {
      return (
        <button className={styles.button} disabled title="このブラウザは音声非対応です">
          🔇
        </button>
      );
    }

    return (
      <button
        className={`${styles.button} ${isSpeaking ? styles.speaking : ''}`}
        onClick={handleClick}
        aria-label={`${word} を発音する`}
      >
        🔊
      </button>
    );
  }
  ```

  **AudioButton.module.css**: タップターゲット最小 44px・iOS セーフエリア考慮
  ```css
  .button {
    min-width: 44px;
    min-height: 44px;
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    border-radius: 8px;
    transition: opacity 0.2s;
  }
  .button:disabled { opacity: 0.4; cursor: not-allowed; }
  .speaking { opacity: 0.6; }
  ```

- **検証**: ブラウザでタップして音声が再生されること。`isSupported = false` 時に 🔇 が表示されること。
- **注意**: react.md 準拠 — `React.FC` は使わず関数コンポーネント + Props interface。タップターゲット 44px 以上（architecture.md の非機能要件）。

---

### T12: useSession フック

- **ファイル**: `src/client/hooks/useSession.ts`（新規）
- **やること**:
  ```typescript
  import { useQuery } from '@tanstack/react-query';
  import { hc } from 'hono/client';
  import type { AppType } from '../../server/index';
  import type { Word } from '@shared/types';

  // Hono RPC クライアント（一度だけ生成）
  const client = hc<AppType>('/');

  export interface SessionState {
    words: readonly Word[];
    isLoading: boolean;
    error: Error | null;
  }

  export function useSession(): SessionState {
    const { data, isLoading, error } = useQuery({
      queryKey: ['session'],
      queryFn: async () => {
        const res = await client.api.session.$get();
        if (!res.ok) throw new Error('セッションの取得に失敗しました');
        return res.json();
      },
    });

    return {
      words: data ?? [],
      isLoading,
      error: error instanceof Error ? error : null,
    };
  }
  ```
- **検証**: Network タブで `GET /api/session` が呼び出され、10件の Word[] が返ること。
- **注意**: hono.md 準拠 — `hc<AppType>()` で型安全な RPC クライアントを使用。react.md 準拠 — TanStack Query でキャッシュ・ローディング状態を管理。

---

### T13: FlashCard コンポーネント（表面のみ）

- **ファイル**: `src/client/components/FlashCard/FlashCard.tsx`（新規）, `FlashCard.module.css`（新規）
- **やること**:
  ```typescript
  import styles from './FlashCard.module.css';
  import { AudioButton } from '../AudioButton/AudioButton';
  import type { Word } from '@shared/types';

  interface Props {
    word: Word;
  }

  export function FlashCard({ word }: Props) {
    return (
      <div className={styles.card}>
        <div className={styles.front}>
          <p className={styles.english}>{word.english}</p>
          <AudioButton word={word.english} />
          {/* R3 対策: サイレントスイッチの説明 */}
          <p className={styles.hint}>音が出ない場合はサイレントモードをOFFに</p>
        </div>
      </div>
    );
  }
  ```

  **FlashCard.module.css**: R6 対策（100dvh + フォールバック）、セーフエリア対応
  ```css
  .card {
    min-height: 100dvh;
    min-height: -webkit-fill-available; /* iOS フォールバック */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: env(safe-area-inset-top) env(safe-area-inset-right)
             env(safe-area-inset-bottom) env(safe-area-inset-left);
  }
  .english {
    font-size: clamp(2rem, 8vw, 4rem);
    font-weight: bold;
    text-align: center;
  }
  .hint {
    font-size: 0.75rem;
    color: #999;
    margin-top: 1rem;
  }
  ```

- **検証**: ブラウザで英単語が大きく表示されること。🔊 ボタンが表示され音声再生できること。iPhone Safari でレイアウトが崩れないこと。
- **注意**: R6 対策 — `100dvh` を第一候補、`-webkit-fill-available` をフォールバックとして使用。`env(safe-area-inset-*)` でセーフエリアに対応。

---

### T14: StudyPage

- **ファイル**: `src/client/pages/StudyPage.tsx`（新規）
- **やること**:
  ```typescript
  import { useSession } from '../hooks/useSession';
  import { FlashCard } from '../components/FlashCard/FlashCard';

  export function StudyPage() {
    const { words, isLoading, error } = useSession();

    if (isLoading) {
      return <div style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</div>;
    }

    if (error) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'red' }}>
          単語の読み込みに失敗しました。再試行してください。
        </div>
      );
    }

    if (words.length === 0) {
      return (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          単語がありません。管理画面から追加してください。
        </div>
      );
    }

    return <FlashCard word={words[0]} />;
  }
  ```
- **検証**: ブラウザで StudyPage を開き、1枚目のカードが表示されること。ローディング中・エラー時のメッセージが表示されること。
- **注意**: Phase 1 はカード切り替えなし（1枚目固定）。カード遷移ロジックは Phase 2 で追加する。

---

### T15: App.tsx + main.tsx

- **ファイル**: `src/client/App.tsx`（新規）, `src/client/main.tsx`（新規）
- **やること**:

  **App.tsx**:
  ```typescript
  import { StudyPage } from './pages/StudyPage';

  export function App() {
    return <StudyPage />;
  }
  ```

  **main.tsx**:
  ```typescript
  import { StrictMode } from 'react';
  import { createRoot } from 'react-dom/client';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  import { App } from './App';

  const queryClient = new QueryClient();

  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>
  );
  ```

- **検証**: `bun run dev` で Vite と Hono が起動し、ブラウザで `http://localhost:5173` にアクセスして英単語カードが表示されること。🔊 をタップして音声再生されること。
- **注意**: react.md 準拠 — `React.FC` は使わない。`QueryClient` は一度だけ生成してアプリ全体で共有。

---

### T-ADD-1: iOSでの音声再生(TTS)非同期アンロック対応

- **ファイル**: `src/client/hooks/useSpeech.ts`, `src/client/pages/StudyPage.tsx`
- **やること**:
  1. `useSpeech.ts` の `Audio` インスタンス生成をモジュールスコープ（またはグローバルなシングルトン）での共有インスタンスに変更する。
  2. `useSpeech.ts` に `unlockSpeechAudio()` というアンロック用関数を定義し、ユーザーのジェスチャー（タップ等）の同期コールバック内で、無音のデータURIを設定した `play()` を実行してインスタンスをアンロックできるようにする。
  3. `StudyPage.tsx` などのユーザー操作インタラクションイベントリスナー (`pointerdown`, `touchend`, `keydown`) の中で、効果音のアンロック (`unlock()`) と同時に `unlockSpeechAudio()` も呼び出して、HTML5 Audio のアンロックを行う。
- **検証**: iOSのSafariにおいて、カードがめくられた際の `useEffect` による自動再生や、自動再生モード (`useAutoPlay`) による非同期再生時でも英語音声がブロックされずに正しく鳴ることを確認。

---

## 6. Done の定義（受け入れ基準チェックリスト）

### フェーズゴール
- [ ] `bun run dev` でフロントエンド + バックエンドが起動する
- [ ] ブラウザから `http://localhost:5173` にアクセスして FlashCard が表示される
- [ ] `curl http://localhost:3000/api/session` が JSON で Word[] 10件を返す
- [ ] FlashCard に英単語が大きく表示される（フォントサイズ 2rem 以上）
- [ ] 🔊 ボタンをタップすると英語音声が再生される

### iOS Safari 技術スパイク（R1/R2）
- [ ] iPhone Safari/Chrome のユーザー操作（同期イベント）内で、共有 `HTMLAudioElement` の `play()` が正常に呼び出され、アンロックされること。
- [ ] アンロック後、非同期処理（`/api/tts` の fetch / ロード等）や `useEffect` / `useAutoPlay` タイマーなどの非同期コンテキストから `speech.speak()` が正常に再生されること。
- [ ] 3回以上連続して音声再生が正常に動作すること。
- [ ] 条件付き `synth.cancel()` の代わりに、HTML5 Audio の `pause()` および `src` 切り替えが正しく制御され、多重再生が防止されていること。

### 設計 AC（flashcard.md）
- [ ] AC1: `GET /api/session` から Word[] 10件が取得され、1枚目のカード表面（英語）が表示される
- [ ] AC3: 🔊 ボタンをタップすると英単語が英語音声で再生される

### コード品質
- [ ] `bun run typecheck`（`tsc --noEmit`）がエラーなしで通る
- [ ] `any` 型を使用していない
- [ ] DB クエリをルートハンドラに直接書いていない（UseCase 経由）
- [ ] `src/server/usecases/` ファイルに `hono` や `bun:sqlite` の import がない
- [ ] SQLite に `data/learning.db` が作成され、words テーブルに 10件入っている
- [ ] WAL モードが有効になっている（`PRAGMA journal_mode` の確認）

### 非機能
- [ ] タップターゲットが 44px 以上（AudioButton）
- [ ] `env(safe-area-inset-*)` が FlashCard に適用されている
- [ ] `100dvh` + `-webkit-fill-available` フォールバックが適用されている
