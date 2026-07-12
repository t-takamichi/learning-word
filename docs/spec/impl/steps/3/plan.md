# Phase 3 実装計画書: 単語リスト + 自動再生

## 1. 参照

- フェーズ定義: [phase-3.md](../../phase/phase-3.md)
- 設計（単語リスト）: [word-list.md](../../../design/word-list.md)
- 設計（フラッシュカード / 自動再生）: [flashcard.md](../../../design/flashcard.md)
- 設計（アーキテクチャ）: [architecture.md](../../../design/architecture.md)
- レイヤールール: [rules/architecture.md](../../../../rules/architecture.md)
- TypeScript ルール: [rules/TypeScript.md](../../../../rules/TypeScript.md)
- Hono ルール: [rules/hono.md](../../../../rules/hono.md)
- React ルール: [rules/react.md](../../../../rules/react.md)
- Phase 1 計画書（前提）: [steps/1/plan.md](../1/plan.md)

---

## 2. このフェーズのゴール

- `GET /api/words?page=1&limit=10` が `WordsResponse` 型の JSON を返す
- StudyPage に単語リスト（最大10件、縦スクロール）が表示される
- 各カードに英単語・学習ステータスバッジ（new=黄/weak=赤/mastered=緑）・翻訳・例文・🔊 ボタンが表示される
- 言語トグルで翻訳・例文訳が即座に切り替わる（APIコールなし）
- Auto-Play トグルをONにすると、音声再生 → 3秒待機 → 裏面表示 → 4秒待機 → 次カードへ、が自動で繰り返される
- Auto-Play 中にOFFにすると即座に停止し手動操作に戻る

---

## 3. 前提・依存（Phase 2 完了が前提）

Phase 3 は以下が Phase 2 で実装済みであることを前提とする。

| 成果物 | Phase での役割 |
|--------|--------------|
| `src/client/hooks/useSpeech.ts` | iOS 対応 Web Speech API ラッパー（`speak(text, onend?)` コールバックチェーン） |
| `src/client/hooks/useSession.ts` | セッション管理（`words`, `currentIndex`, `goNext`, `isAnswerVisible`, `showAnswer`, `isComplete`） |
| `src/client/components/AudioButton/AudioButton.tsx` | 音声ボタン（タップイベント起点） |
| `src/client/components/FlashCard/FlashCard.tsx` | フラッシュカード（表面+裏面、Good/Again） |
| `src/server/domain/word.ts` | `IWordRepository` インターフェース（`getSession` 定義済み） |
| `src/server/repositories/wordRepository.ts` | `WordRepository`（`getSession` 実装済み） |
| `src/server/index.ts` | DI 配線・AppType export 済み |
| `src/shared/types.ts` | `Word`, `WordWithProgress`, `LearningProgress`, `WordsResponse` 型定義済み |

> **重要**: `useSpeech` の `speak()` は Phase 3 の `useAutoPlay` から `onend` コールバックを受け取れるよう、シグネチャが `speak(text: string, onend?: () => void): void` に拡張されていること。Phase 2 で対応済みでなければ T1 の前に修正する。

---

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|----|---------|-----------|
| T1 | `src/server/domain/word.ts`（**変更**） | `IWordRepository` に `getWords(page, limit)` メソッドを追加 | Domain | `tsc --noEmit` | architecture.md, TypeScript.md |
| T2 | `src/server/repositories/wordRepository.ts`（**変更**） | `getWords(page, limit)` 実装（words LEFT JOIN learning_progress + LIMIT/OFFSET + total件数カウント） | Infrastructure | `bun -e` でクエリ結果確認 | architecture.md, TypeScript.md |
| T3 | `src/server/usecases/getWords.ts`（**新規**） | `GetWordsUseCase`（page/limit 引数 → WordsResponse 返却） | Application | `tsc --noEmit` + 単体動作確認 | architecture.md, TypeScript.md |
| T4 | `src/server/routes/words.ts`（**新規**） | `GET /api/words?page&limit` Hono ハンドラ（zValidator でクエリ検証） | Presentation | `curl` で JSON 確認 | hono.md, TypeScript.md |
| T5 | `src/server/index.ts`（**変更**） | `GetWordsUseCase` の DI 追加・`wordsRoutes` の mount | Presentation | `bun run server` 再起動確認 | hono.md, architecture.md |
| T6 | `src/client/components/WordList/WordListItem.tsx`（**新規**） | 単語カード1件（英単語・ステータスバッジ・翻訳・例文・AudioButton） | Frontend | Storybook 相当のブラウザ確認 | react.md, TypeScript.md |
| T7 | `src/client/components/WordList/WordList.module.css`（**新規**） | WordList / WordListItem のスタイル（縦スクロール・バッジ色・言語切り替え CSS） | Frontend | ブラウザで表示確認 | architecture.md |
| T8 | `src/client/hooks/useWords.ts`（**新規**） | TanStack Query で `GET /api/words` を取得するフック | Frontend | Network タブで確認 | react.md, hono.md |
| T9 | `src/client/components/WordList/WordList.tsx`（**新規**） | 単語リスト親コンポーネント（useWords + WordListItem × 10件 + エラー/空状態） | Frontend | ブラウザで10件表示確認 | react.md, TypeScript.md |
| T10 | `src/client/hooks/useAutoPlay.ts`（**新規**） | Auto-Play ロジック（useSpeech の onend チェーン + setInterval タイマー + iOS R1/R2 対策） | Frontend | ブラウザで自動進行確認 | react.md, TypeScript.md |
| T11 | `src/client/pages/StudyPage.tsx`（**変更**） | FlashCard + WordList の配置 + Auto-Play トグル UI 追加 | Frontend | ブラウザで統合確認 | react.md, TypeScript.md |

---

## 5. 各タスク詳細

---

### T1: IWordRepository に `getWords` を追加（Domain）

- **ファイル**: `src/server/domain/word.ts`（変更）
- **変更内容**: `getWords` メソッドを `IWordRepository` インターフェースに追加する。

```typescript
import type { Word, WordWithProgress } from '@shared/types';

export interface GetWordsResult {
  readonly words: readonly WordWithProgress[];
  readonly total: number;
}

export interface IWordRepository {
  getSession(): readonly Word[];
  getWords(page: number, limit: number): GetWordsResult;
}
```

- **検証**: `bun run typecheck` でエラーなし。Domain 層に `hono` / `bun:sqlite` の import がないこと。
- **注意**: `GetWordsResult` を同ファイルに定義し、Application 層が直接 `WordsResponse` に変換する。Domain 層に HTTP 概念（page/totalPages 計算ロジック）は持ち込まない。

---

### T2: WordRepository に `getWords` を実装（Infrastructure）

- **ファイル**: `src/server/repositories/wordRepository.ts`（変更）
- **変更内容**: `getWords(page, limit)` メソッドを追加する。

```typescript
import type { DB } from '../db';
import type { IWordRepository, GetWordsResult } from '../domain/word';
import type { Word, WordWithProgress } from '@shared/types';

type WordRow = Word & {
  status: 'new' | 'weak' | 'mastered' | null;
  review_count: number | null;
  incorrect_count: number | null;
  last_reviewed_at: string | null;
};

type CountRow = { total: number };

export class WordRepository implements IWordRepository {
  constructor(private readonly db: DB) {}

  getSession(): readonly Word[] { /* Phase 1 実装済み */ }

  getWords(page: number, limit: number): GetWordsResult {
    const offset = (page - 1) * limit;

    const rows = this.db.query<WordRow, [number, number]>(`
      SELECT
        w.*,
        COALESCE(p.status, 'new')            AS status,
        COALESCE(p.review_count, 0)          AS review_count,
        COALESCE(p.incorrect_count, 0)       AS incorrect_count,
        p.last_reviewed_at
      FROM words w
      LEFT JOIN learning_progress p ON w.id = p.word_id
      ORDER BY w.id ASC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const countRow = this.db.query<CountRow, []>(
      'SELECT COUNT(*) AS total FROM words'
    ).get();

    const total = countRow?.total ?? 0;

    const words: WordWithProgress[] = rows.map((row) => ({
      id: row.id,
      english: row.english,
      vietnamese: row.vietnamese,
      japanese: row.japanese,
      example_en: row.example_en,
      example_vi: row.example_vi,
      example_ja: row.example_ja,
      created_at: row.created_at,
      progress: row.status !== null
        ? {
            word_id: row.id,
            status: row.status,
            review_count: row.review_count ?? 0,
            incorrect_count: row.incorrect_count ?? 0,
            last_reviewed_at: row.last_reviewed_at,
          }
        : null,
    }));

    return { words, total };
  }
}
```

- **検証**: `bun -e "import { createDatabase } from './src/server/db'; import { WordRepository } from './src/server/repositories/wordRepository'; const repo = new WordRepository(createDatabase()); console.log(JSON.stringify(repo.getWords(1, 10), null, 2))"` で `words` 配列と `total` が返ること。
- **注意**: `COALESCE` で未学習単語（`learning_progress` レコードなし）の `status` を `'new'` にデフォルト。`progress` フィールドは `status` が `null`（LEFT JOIN ミス）の場合のみ `null` を返す。`any` は絶対に使わない。

---

### T3: GetWordsUseCase（Application）

- **ファイル**: `src/server/usecases/getWords.ts`（新規）

```typescript
import type { IWordRepository } from '../domain/word';
import type { WordsResponse } from '@shared/types';

export class GetWordsUseCase {
  constructor(private readonly wordRepo: IWordRepository) {}

  execute(page: number, limit: number): WordsResponse {
    const { words, total } = this.wordRepo.getWords(page, limit);
    return {
      words,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

- **検証**: `tsc --noEmit` でエラーなし。ファイル内に `hono` / `bun:sqlite` の import が存在しないこと。
- **注意**: Application 層は HTTP フレームワークに依存しない。`totalPages` の計算はここで行う（Domain 層には持ち込まない）。`WordsResponse` の `words` フィールドが `readonly WordWithProgress[]` であることを確認する。

---

### T4: GET /api/words ハンドラ（Presentation）

- **ファイル**: `src/server/routes/words.ts`（新規）

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { GetWordsUseCase } from '../usecases/getWords';

type Env = {
  Variables: {
    getWordsUseCase: GetWordsUseCase;
  };
};

const querySchema = z.object({
  page:  z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const wordsRoutes = new Hono<Env>();

wordsRoutes.get(
  '/',
  zValidator('query', querySchema),
  (c) => {
    const { page, limit } = c.req.valid('query');
    const useCase = c.get('getWordsUseCase');
    const result = useCase.execute(page, limit);
    return c.json(result);
  }
);
```

- **検証**: `curl 'http://localhost:3000/api/words?page=1&limit=10'` で `{ words, total, page, limit, totalPages }` が返ること。`curl 'http://localhost:3000/api/words?page=0'` で 400 バリデーションエラーが返ること。
- **注意**: hono.md 準拠 — `zValidator` で必ずクエリパラメータを検証する。ビジネスロジック・DB クエリはハンドラに書かない（UseCase 経由のみ）。`c.req.valid('query')` で検証済みデータを使う。

---

### T5: index.ts に GetWordsUseCase の DI を追加（Presentation）

- **ファイル**: `src/server/index.ts`（変更）
- **変更内容**: `GetWordsUseCase` のインスタンス生成・DI ミドルウェア追加・`wordsRoutes` の mount。

```typescript
// 追加 import（既存 import の後に追加）
import { GetWordsUseCase } from './usecases/getWords';
import { wordsRoutes } from './routes/words';

// 既存の UseCase 生成の後に追加
const getWordsUseCase = new GetWordsUseCase(wordRepo);

// 既存の DI ミドルウェア内に追加
app.use('/api/*', async (c, next) => {
  c.set('getSessionUseCase', getSessionUseCase);
  c.set('getWordsUseCase', getWordsUseCase);   // ← 追加
  await next();
});

// 既存 route の後に追加
app.route('/api/words', wordsRoutes);
```

- **検証**: `bun run server` を再起動後、`curl 'http://localhost:3000/api/words'` が JSON を返すこと。
- **注意**: DI の配線は必ずエントリポイント（`index.ts`）で完結させる。`WordRepository` インスタンスは既存の `wordRepo` を再利用する（新規生成しない）。

---

### T6: WordListItem コンポーネント（Frontend）

- **ファイル**: `src/client/components/WordList/WordListItem.tsx`（新規）

```typescript
import { AudioButton } from '../AudioButton/AudioButton';
import type { WordWithProgress } from '@shared/types';
import styles from './WordList.module.css';

const STATUS_LABEL: Record<'new' | 'weak' | 'mastered', string> = {
  new:      '🟡 new',
  weak:     '🔴 weak',
  mastered: '🟢 mastered',
};

const STATUS_CLASS: Record<'new' | 'weak' | 'mastered', string> = {
  new:      styles.badgeNew,
  weak:     styles.badgeWeak,
  mastered: styles.badgeMastered,
};

interface Props {
  word: WordWithProgress;
}

export function WordListItem({ word }: Props) {
  const status = word.progress?.status ?? 'new';

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.english}>{word.english}</span>
        <AudioButton word={word.english} />
      </div>
      <span className={`${styles.badge} ${STATUS_CLASS[status]}`}>
        {STATUS_LABEL[status]}
      </span>
      <div className={styles.translations}>
        <p className={`${styles.translation} vi-content`}>{word.vietnamese}</p>
        <p className={`${styles.translation} ja-content`}>{word.japanese}</p>
      </div>
      {word.example_en && (
        <div className={styles.examples}>
          <p className={styles.exampleEn}>{word.example_en}</p>
          {word.example_vi && (
            <p className={`${styles.exampleTrans} vi-content`}>{word.example_vi}</p>
          )}
          {word.example_ja && (
            <p className={`${styles.exampleTrans} ja-content`}>{word.example_ja}</p>
          )}
        </div>
      )}
    </article>
  );
}
```

- **検証**: ブラウザで `<WordListItem word={mockWord} />` を StudyPage に仮置きして、英単語・バッジ・翻訳・🔊 ボタンが表示されること。言語トグルで翻訳が切り替わること。
- **注意**: `React.FC` は使わない（react.md 準拠）。`status` の型は `'new' | 'weak' | 'mastered'` に固定し `any` を使わない。`vi-content` / `ja-content` クラス名は CSS の言語切り替えと連動するグローバルクラス（CSS Modules の外）なので注意。

---

### T7: WordList.module.css（Frontend）

- **ファイル**: `src/client/components/WordList/WordList.module.css`（新規）

```css
/* ---- リストコンテナ ---- */
.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  overflow-y: auto;
}

/* ---- 単語カード ---- */
.card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}

.cardHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.english {
  font-size: 1.4rem;
  font-weight: bold;
}

/* ---- ステータスバッジ ---- */
.badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 9999px;
  width: fit-content;
}

.badgeNew      { background: #fef9c3; color: #854d0e; }
.badgeWeak     { background: #fee2e2; color: #991b1b; }
.badgeMastered { background: #dcfce7; color: #166534; }

/* ---- 翻訳・例文 ---- */
.translations {
  font-size: 1rem;
  color: #374151;
}

.translation {
  margin: 0;
}

.examples {
  font-size: 0.875rem;
  color: #6b7280;
  border-top: 1px solid #f3f4f6;
  padding-top: 0.5rem;
  margin-top: 0.25rem;
}

.exampleEn    { margin: 0; font-style: italic; }
.exampleTrans { margin: 0; color: #9ca3af; }

/* ---- 言語トグル（グローバルセレクタで制御） ---- */
:global(body[data-lang="vi"]) .ja-content { display: none; }
:global(body[data-lang="ja"]) .vi-content { display: none; }
```

- **検証**: ブラウザで各バッジ色（黄・赤・緑）が正しく表示されること。`body[data-lang="ja"]` 時にベトナム語訳が非表示になること。
- **注意**: CSS Modules の `:global()` を使い、`body[data-lang]` による言語切り替えを有効にする。`vi-content` / `ja-content` の制御は CSS のみで行い、JavaScript での display 切り替えは行わない（設計書準拠）。

---

### T8: useWords フック（Frontend）

- **ファイル**: `src/client/hooks/useWords.ts`（新規）

```typescript
import { useQuery } from '@tanstack/react-query';
import { hc } from 'hono/client';
import type { AppType } from '../../server/index';
import type { WordsResponse } from '@shared/types';

const client = hc<AppType>('/');

interface UseWordsOptions {
  page?: number;
  limit?: number;
}

interface UseWordsReturn {
  data: WordsResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useWords({ page = 1, limit = 10 }: UseWordsOptions = {}): UseWordsReturn {
  const { data, isLoading, error, refetch } = useQuery<WordsResponse>({
    queryKey: ['words', page, limit],
    queryFn: async () => {
      const res = await client.api.words.$get({ query: { page: String(page), limit: String(limit) } });
      if (!res.ok) throw new Error('単語リストの取得に失敗しました');
      return res.json() as Promise<WordsResponse>;
    },
  });

  return {
    data,
    isLoading,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
```

- **検証**: Network タブで `GET /api/words?page=1&limit=10` が呼び出され、`{ words, total, page, limit, totalPages }` が返ること。
- **注意**: hono.md 準拠 — `hc<AppType>` で型安全な RPC クライアントを使う。react.md 準拠 — TanStack Query でキャッシュ・ローディング管理。クライアントインスタンスはモジュールスコープで一度だけ生成する。

---

### T9: WordList コンポーネント（Frontend）

- **ファイル**: `src/client/components/WordList/WordList.tsx`（新規）

```typescript
import { WordListItem } from './WordListItem';
import { useWords } from '../../hooks/useWords';
import styles from './WordList.module.css';

interface Props {
  page?: number;
}

export function WordList({ page = 1 }: Props) {
  const { data, isLoading, error, refetch } = useWords({ page, limit: 10 });

  if (isLoading) {
    return <p style={{ textAlign: 'center', padding: '1rem' }}>読み込み中...</p>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem', color: '#dc2626' }}>
        <p>読み込みに失敗しました。再試行してください。</p>
        <button onClick={() => refetch()}>再試行</button>
      </div>
    );
  }

  if (!data || data.words.length === 0) {
    return <p style={{ textAlign: 'center', padding: '1rem' }}>まだ単語が登録されていません</p>;
  }

  return (
    <section>
      <ol className={styles.list}>
        {data.words.map((word) => (
          <WordListItem key={word.id} word={word} />
        ))}
      </ol>
    </section>
  );
}
```

- **検証**: ブラウザで単語カード10件が縦スクロールで表示されること。空状態・エラー状態のメッセージが正しく表示されること。
- **注意**: react.md 準拠 — `React.FC` を使わない。150行超の場合はサブコンポーネントに分割する。エラー時は再試行ボタンを提供する（word-list.md のエラーハンドリング準拠）。

---

### T10: useAutoPlay フック（Frontend）

- **ファイル**: `src/client/hooks/useAutoPlay.ts`（新規）

```typescript
import { useCallback, useEffect, useRef, useState } from 'react';
import type { UseSpeechReturn } from './useSpeech';

interface UseAutoPlayOptions {
  words: readonly { english: string }[];
  currentIndex: number;
  isAnswerVisible: boolean;
  showAnswer: () => void;
  goNext: () => void;
  speech: UseSpeechReturn;
  frontDelay?: number;  // 音声終了後→裏面表示までの秒数（デフォルト 3）
  backDelay?: number;   // 裏面表示後→次カードへの秒数（デフォルト 4）
}

interface UseAutoPlayReturn {
  isAutoPlay: boolean;
  toggleAutoPlay: () => void;
}

export function useAutoPlay({
  words,
  currentIndex,
  isAnswerVisible,
  showAnswer,
  goNext,
  speech,
  frontDelay = 3,
  backDelay = 4,
}: UseAutoPlayOptions): UseAutoPlayReturn {
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isAutoPlayRef = useRef(false);

  const clearTimer = useCallback((): void => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback((): void => {
    isAutoPlayRef.current = false;
    setIsAutoPlay(false);
    clearTimer();
    window.speechSynthesis.cancel();
  }, [clearTimer]);

  // Auto-Play ON: 最初の speak() はユーザーアクション（toggleAutoPlay）起点（R1 対策）
  const toggleAutoPlay = useCallback((): void => {
    if (isAutoPlay) {
      stop();
      return;
    }

    const word = words[currentIndex];
    if (!word) return;

    isAutoPlayRef.current = true;
    setIsAutoPlay(true);

    // R1 対策: toggleAutoPlay はボタン click ハンドラから呼ばれるため、
    // ここでの speak() はユーザーアクション起点が保証される
    speech.speak(word.english, () => {
      if (!isAutoPlayRef.current) return;
      timerRef.current = setTimeout(() => {
        if (!isAutoPlayRef.current) return;
        showAnswer();
      }, frontDelay * 1000);
    });
  }, [isAutoPlay, words, currentIndex, speech, frontDelay, showAnswer, stop]);

  // 裏面表示後に backDelay 秒待機 → 次カードへ
  useEffect(() => {
    if (!isAutoPlay || !isAnswerVisible) return;

    timerRef.current = setTimeout(() => {
      if (!isAutoPlayRef.current) return;
      goNext();
    }, backDelay * 1000);

    return () => clearTimer();
  }, [isAutoPlay, isAnswerVisible, backDelay, goNext, clearTimer]);

  // 次カード（currentIndex 更新）後に次の単語を読み上げ
  useEffect(() => {
    if (!isAutoPlay || isAnswerVisible) return;

    const word = words[currentIndex];
    if (!word) {
      stop();
      return;
    }

    speech.speak(word.english, () => {
      if (!isAutoPlayRef.current) return;
      timerRef.current = setTimeout(() => {
        if (!isAutoPlayRef.current) return;
        showAnswer();
      }, frontDelay * 1000);
    });
  }, [isAutoPlay, currentIndex, isAnswerVisible, words, speech, frontDelay, showAnswer, stop]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      isAutoPlayRef.current = false;
      clearTimer();
    };
  }, [clearTimer]);

  return { isAutoPlay, toggleAutoPlay };
}
```

- **検証**:
  1. Auto-Play トグルをONにすると `currentIndex` が 0 → 1 → 2 ... と自動で進むこと
  2. 音声 → 3秒 → 裏面表示 → 4秒 → 次カードのシーケンスが動作すること
  3. Auto-Play ON 中にトグルをOFFにすると即座に停止すること
  4. iOS Safari でAuto-Play ON 直後の speak() がユーザーアクション起点で動作すること（R1/R2 対策）
- **注意**:
  - `isAutoPlayRef` は `setIsAutoPlay` による非同期状態更新のクロージャ問題を回避するための ref
  - `useSpeech` の `speak()` シグネチャが `speak(text: string, onend?: () => void): void` であることを前提とする
  - `useEffect` の依存配列は正確に列挙する（react.md 準拠）
  - `any` 型は使用しない

---

### T11: StudyPage を更新（Frontend）

- **ファイル**: `src/client/pages/StudyPage.tsx`（変更）
- **変更内容**: WordList と Auto-Play トグルを追加する。`useSession` の `currentIndex`, `isAnswerVisible`, `showAnswer`, `goNext` を `useAutoPlay` に渡す。

```typescript
import { useState } from 'react';
import { useSession } from '../hooks/useSession';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { useSpeech } from '../hooks/useSpeech';
import { FlashCard } from '../components/FlashCard/FlashCard';
import { WordList } from '../components/WordList/WordList';

export function StudyPage() {
  const {
    words,
    currentIndex,
    isAnswerVisible,
    isComplete,
    isLoading,
    error,
    showAnswer,
    goNext,
    restart,
  } = useSession();

  const speech = useSpeech();

  const [autoPlayFrontDelay, setAutoPlayFrontDelay] = useState(3);
  const [autoPlayBackDelay, setAutoPlayBackDelay]   = useState(4);

  const { isAutoPlay, toggleAutoPlay } = useAutoPlay({
    words,
    currentIndex,
    isAnswerVisible,
    showAnswer,
    goNext,
    speech,
    frontDelay: autoPlayFrontDelay,
    backDelay:  autoPlayBackDelay,
  });

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '2rem' }}>読み込み中...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
        単語の読み込みに失敗しました。再試行してください。
      </div>
    );
  }

  if (isComplete) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>セッション完了！</p>
        <button onClick={restart}>もう一度</button>
      </div>
    );
  }

  const currentWord = words[currentIndex];
  if (!currentWord) return null;

  return (
    <main>
      {/* Auto-Play トグル */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
        <button
          onClick={toggleAutoPlay}
          aria-pressed={isAutoPlay}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            background: isAutoPlay ? '#3b82f6' : '#e5e7eb',
            color: isAutoPlay ? '#fff' : '#374151',
            border: 'none',
            cursor: 'pointer',
            minWidth: '44px',
            minHeight: '44px',
          }}
        >
          {isAutoPlay ? '⏸ Auto-Play: ON' : '▶ Auto-Play: OFF'}
        </button>
        {/* ⚙ 秒数設定（AC10 対応） */}
        <label style={{ fontSize: '0.8rem' }}>
          表面
          <input
            type="number"
            min={1}
            max={10}
            value={autoPlayFrontDelay}
            onChange={(e) => setAutoPlayFrontDelay(Number(e.target.value))}
            style={{ width: '3rem', marginLeft: '0.25rem' }}
          />
          s
        </label>
        <label style={{ fontSize: '0.8rem' }}>
          裏面
          <input
            type="number"
            min={1}
            max={10}
            value={autoPlayBackDelay}
            onChange={(e) => setAutoPlayBackDelay(Number(e.target.value))}
            style={{ width: '3rem', marginLeft: '0.25rem' }}
          />
          s
        </label>
      </div>

      {/* フラッシュカード */}
      <FlashCard
        word={currentWord}
        isAnswerVisible={isAnswerVisible}
        onShowAnswer={showAnswer}
        onGood={() => goNext()}
        onAgain={() => goNext()}
      />

      {/* 単語リスト */}
      <WordList page={1} />
    </main>
  );
}
```

- **検証**:
  1. フラッシュカードと単語リストが同一ページに表示されること
  2. Auto-Play トグルをONにすると `▶ Auto-Play: OFF` → `⏸ Auto-Play: ON` に切り替わること
  3. 秒数入力を変更すると次カードから新しい秒数が反映されること（AC10）
  4. `bun run typecheck` でエラーなし
- **注意**:
  - `useSpeech` を StudyPage で呼び出して `useAutoPlay` に渡す（フックの引き回しによる iOS R1 対策の責任分離）
  - `useSession` の返り値に `restart` が Phase 2 で実装済みであることを前提とする
  - FlashCard の Props は Phase 2 の実装に合わせること（`onGood` / `onAgain` / `onShowAnswer` の有無を確認して調整）

---

## 6. Done の定義（受け入れ基準チェックリスト）

### word-list.md の受け入れ基準

- [ ] **AC1**: StudyPage を開いたとき `GET /api/words?page=1&limit=10` が実行され、最大10件の単語カードが縦スクロールで表示される
- [ ] **AC2**: 各単語カードに英単語・ステータスバッジ（new=黄/weak=赤/mastered=緑）・選択言語の翻訳・英語例文・例文訳・🔊 ボタンが表示される
- [ ] **AC3**: 単語リスト内の 🔊 ボタンをタップすると、その単語の英語音声が再生される
- [ ] **AC4**: 言語トグル（🇻🇳/🇯🇵）を切り替えると、全カードの翻訳・例文訳が即座に切り替わり、APIの再取得は発生しない
- [ ] **AC5**: ページネーション UI は Phase 4 スコープ（今フェーズではスキップ可）
- [ ] **AC6**: 単語が0件のとき「まだ単語が登録されていません」が表示される
- [ ] **AC7**: Good/Again 記録後に単語リストを `refetch()` すると、ステータスバッジが最新の状態に更新される

### flashcard.md（自動再生モード）の受け入れ基準

- [ ] **AC8**: Auto-Play トグルをONにすると「音声再生 → 3秒待機 → 裏面表示 → 4秒待機 → 次カード」が自動で繰り返される
- [ ] **AC9**: Auto-Play 中にトグルをOFFにすると即座に自動進行が停止し、現在のカードで手動操作に戻る
- [ ] **AC10**: Auto-Play の待機秒数（表面: 3s / 裏面: 4s）を ⚙ 入力欄から変更でき、変更は次カードから即座に反映される

### API 検証

- [ ] `GET /api/words?page=1&limit=10` が `{ words: WordWithProgress[], total, page, limit, totalPages }` を返す
- [ ] `page=0` や `limit=100`（上限 50 超）でバリデーションエラー（400）が返る
- [ ] `words LEFT JOIN learning_progress` により未学習単語の `status` が `'new'` で返る

### コード品質

- [ ] `bun run typecheck`（`tsc --noEmit`）がエラーなしで通る
- [ ] `any` 型を一切使用していない
- [ ] `src/server/usecases/getWords.ts` に `hono` / `bun:sqlite` の import がない
- [ ] `src/server/domain/word.ts` にフレームワーク依存の import がない
- [ ] `useAutoPlay` の `useEffect` 依存配列が正確に列挙されている
- [ ] 全コンポーネントで `React.FC` を使用していない
- [ ] `readonly` を適切に使い immutability を保証している

### iOS / 非機能

- [ ] iOS Safari で Auto-Play の最初の `speak()` がユーザーアクション（トグルタップ）起点で呼ばれており、音声が再生される（R1/R2 対策）
- [ ] Auto-Play 停止時に `speechSynthesis.cancel()` が呼ばれ、音声が即座に停止する
- [ ] 単語リストのタップターゲット（🔊 ボタン）が 44px 以上
- [ ] 言語切り替えが CSS `body[data-lang]` のみで制御され、JS での `display` 操作がない
