# Phase 2 実装計画書: フラッシュカード完成

## 1. 参照

- フェーズ定義: [phase-2.md](../../phase/phase-2.md)
- 設計（フラッシュカード）: [flashcard.md](../../../design/flashcard.md)
- 設計（アーキテクチャ）: [architecture.md](../../../design/architecture.md)
- レイヤー依存ルール: [rules/architecture.md](../../../../rules/architecture.md)
- TypeScript ルール: [rules/TypeScript.md](../../../../rules/TypeScript.md)
- Hono ルール: [rules/hono.md](../../../../rules/hono.md)
- React ルール: [rules/react.md](../../../../rules/react.md)
- Phase 1 計画書: [steps/1/plan.md](../1/plan.md)

---

## 2. このフェーズのゴール

- FlashCard でカード領域をタップすると裏面（翻訳・例文）が表示される
- Good / Again ボタンをタップすると `POST /api/review` に記録が保存され、次のカードに進む
- 言語トグル（🇻🇳 / 🇯🇵）をタップすると翻訳・例文訳が即座に切り替わる（API再取得なし）
- セッション進捗「N / 10」形式がヘッダー下に表示される
- 10問すべて回答するとセッション完了画面が表示され、「もう一度」ボタンで再開できる
- 学習ステータス（new / weak / mastered）が SQLite に正しく記録される

---

## 3. 前提・依存（Phase 1 完了が前提）

Phase 1 で以下が実装済みであること:

| ファイル | 用途 |
|---------|------|
| `src/shared/types.ts` | `Word`, `LearningProgress`, `WordWithProgress`, `ReviewInput` 型 |
| `src/server/db.ts` | `createDatabase()` / `DB` 型 |
| `src/server/domain/word.ts` | `IWordRepository` インターフェース |
| `src/server/repositories/wordRepository.ts` | `WordRepository` 実装 |
| `src/server/usecases/getSession.ts` | `GetSessionUseCase` |
| `src/server/routes/session.ts` | `GET /api/session` ルート・`sessionRoutes` export |
| `src/server/index.ts` | Hono 本体・DI配線・`AppType` export |
| `src/client/hooks/useSession.ts` | `useSession()` フック（`words`, `isLoading`, `error` のみ） |
| `src/client/hooks/useSpeech.ts` | `useSpeech()` フック |
| `src/client/components/AudioButton/` | `AudioButton` コンポーネント |
| `src/client/components/FlashCard/FlashCard.tsx` | FlashCard 表面（英語表示のみ） |
| `src/client/pages/StudyPage.tsx` | `StudyPage`（1枚目固定表示） |
| `src/client/App.tsx` | React エントリポイント |

> Phase 1 ファイルを変更する場合は「**変更**」と明記する。後方互換性が崩れないよう注意する。

---

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|----|---------|-----------|
| T1 | `src/server/domain/review.ts`（**新規**） | `ReviewResult` 型・`LearningStatus` 型・`IReviewRepository` インターフェース・`calculateNextProgress()` ドメイン関数 | Domain | `tsc --noEmit` 通過 | architecture.md, TypeScript.md |
| T2 | `src/server/repositories/reviewRepository.ts`（**新規**） | `IReviewRepository` 実装・`learning_progress` UPSERT（INSERT OR REPLACE）・`getProgress()` | Infrastructure | `bun -e` でUPSERT動作確認 | architecture.md, TypeScript.md |
| T3 | `src/server/usecases/submitReview.ts`（**新規**） | `SubmitReviewUseCase`（getProgress → calculateNextProgress → upsertProgress） | Application | `tsc --noEmit` ／ hono・bun:sqlite import がないこと | architecture.md, TypeScript.md |
| T4 | `src/server/routes/review.ts`（**新規**） | `POST /api/review` ハンドラ・`zValidator` スキーマ検証 | Presentation | `curl -X POST` で `{ ok: true }` 確認 | hono.md, TypeScript.md |
| T5 | `src/server/index.ts`（**変更**） | `ReviewRepository`・`SubmitReviewUseCase` DI配線・`/api/review` ルート追加 | Presentation | `bun run server` 起動確認 + curl POST | hono.md, architecture.md |
| T6 | `src/client/hooks/useSession.ts`（**変更**） | `SessionState` 拡張（`currentIndex`, `isAnswerVisible`, `isComplete`）・`useMutation`（POST /api/review）追加・`showAnswer()`, `submitReview()`, `restart()` 関数追加 | Frontend | Network タブで POST 送信・状態遷移確認 | react.md, hono.md, TypeScript.md |
| T7 | `src/client/components/LanguageToggle/LanguageToggle.tsx`（**新規**） | 言語トグル UI・`props` で `language` / `onToggle` 受け取り。グローバル CSS（`vi-content` / `ja-content`）を `src/client/index.css` に追加 | Frontend | トグルで翻訳即時切り替え確認（API呼び出しなし） | react.md, TypeScript.md |
| T8 | `src/client/components/ReviewButtons/ReviewButtons.tsx`（**新規**） | Good / Again ボタン・`isSubmitting` 時 disabled・タップターゲット 44px 以上 | Frontend | タップで POST 送信確認・二重送信防止確認 | react.md, TypeScript.md |
| T9 | `src/client/components/FlashCard/FlashCard.tsx`（**変更**） + `FlashCard.module.css`（**変更**） | 裏面表示ロジック追加（翻訳・例文・`vi-content` / `ja-content` CSS クラス）・`ReviewButtons` 統合 | Frontend | 答えを表示タップ→翻訳表示・言語トグル切り替え確認 | react.md, TypeScript.md |
| T10 | `src/client/components/CompleteScreen/CompleteScreen.tsx`（**新規**） | セッション完了画面・「もう一度」ボタン | Frontend | 10問回答後の完了画面表示確認 | react.md, TypeScript.md |
| T11 | `src/client/pages/StudyPage.tsx`（**変更**） | `language` 状態管理・`body[data-lang]` useEffect・進捗「N / 10」表示・`LanguageToggle` 統合・`CompleteScreen` 条件表示 | Frontend | 進捗カウンター表示・完了後の再開動作確認 | react.md, TypeScript.md |
| T12 | `src/server/domain/review.ts`（**変更**） | ⭕ Good 押下時に即座に `mastered` に、❌ Again 押下時に即座に `weak` に遷移するようにステータス遷移ロジックを是正 | Domain | `yarn tsc` 通過・単体テスト通過 | architecture.md, TypeScript.md |


---

## 5. 各タスク詳細

---

### T1: domain/review.ts — Domain（新規）

- **ファイル**: `src/server/domain/review.ts`
- **役割**: ステータス遷移の純粋なビジネスロジック。DB・HTTP に依存しない。

**主要型・関数シグネチャ**:
```typescript
export type ReviewResult = 'good' | 'again';
export type LearningStatus = 'new' | 'weak' | 'mastered';

export interface CurrentProgress {
  readonly status: LearningStatus;
  readonly reviewCount: number;
  readonly incorrectCount: number;
}

export interface NextProgress {
  readonly status: LearningStatus;
  readonly reviewCount: number;
  readonly incorrectCount: number;
}

export interface IReviewRepository {
  getProgress(wordId: number): CurrentProgress | null;
  upsertProgress(wordId: number, progress: NextProgress): void;
}

export function calculateNextProgress(
  current: CurrentProgress | null,
  result: ReviewResult,
): NextProgress;
```

**ステータス遷移ロジック** (`calculateNextProgress` 実装詳細):

| 操作 | 条件 | 新 status | reviewCount | incorrectCount |
|------|------|-----------|-------------|----------------|
| `again` | 任意 | `'weak'` | そのまま | +1 |
| `good` | `incorrectCount === 0` かつ `nextReviewCount >= 3` | `'mastered'` | +1 | そのまま |
| `good` | `incorrectCount === 0` かつ `nextReviewCount < 3` | そのまま（または `'new'`） | +1 | そのまま |
| `good` | `incorrectCount > 0` | `'weak'`（変化なし） | +1 | そのまま |

> `current` が `null`（初回）の場合は `{ status: 'new', reviewCount: 0, incorrectCount: 0 }` とみなして計算する。

```typescript
// 内部実装イメージ（シグネチャのみ記載）
export function calculateNextProgress(
  current: CurrentProgress | null,
  result: ReviewResult,
): NextProgress {
  const base: CurrentProgress = current ?? { status: 'new', reviewCount: 0, incorrectCount: 0 };

  if (result === 'again') {
    return { status: 'weak', reviewCount: base.reviewCount, incorrectCount: base.incorrectCount + 1 };
  }

  const nextReviewCount = base.reviewCount + 1;

  if (base.incorrectCount === 0 && nextReviewCount >= 3) {
    return { status: 'mastered', reviewCount: nextReviewCount, incorrectCount: base.incorrectCount };
  }

  const nextStatus: LearningStatus = base.incorrectCount > 0 ? 'weak' : base.status;
  return { status: nextStatus, reviewCount: nextReviewCount, incorrectCount: base.incorrectCount };
}
```

- **検証**: `tsc --noEmit` 通過。DB・HTTPの import が0件であること。
- **注意**: architecture.md Domain 層ルール — `bun:sqlite`, `hono` の import 禁止。`any` 型禁止。

---

### T2: reviewRepository.ts — Infrastructure（新規）

- **ファイル**: `src/server/repositories/reviewRepository.ts`
- **役割**: `IReviewRepository` を SQLite で実装。`learning_progress` の読み書きのみ担当。

**主要型・関数シグネチャ**:
```typescript
import type { DB } from '../db';
import type { IReviewRepository, CurrentProgress, NextProgress } from '../domain/review';

export class ReviewRepository implements IReviewRepository {
  constructor(private readonly db: DB) {}

  getProgress(wordId: number): CurrentProgress | null;
  upsertProgress(wordId: number, progress: NextProgress): void;
}
```

**`getProgress` 実装詳細**:
```typescript
// SQLクエリ例（型シグネチャのみ示す）
// SELECT status, review_count, incorrect_count FROM learning_progress WHERE word_id = ?
```

**`upsertProgress` 実装詳細**:
```sql
-- INSERT OR REPLACE で UPSERT（Bun SQLite の推奨パターン）
INSERT OR REPLACE INTO learning_progress
  (word_id, status, review_count, incorrect_count, last_reviewed_at)
VALUES
  (?, ?, ?, ?, CURRENT_TIMESTAMP);
```

> `INSERT OR REPLACE` は `word_id` に UNIQUE 制約があるため、既存行を置き換える（Phase 1 schema.sql に `UNIQUE` 定義済み）。

- **検証**:
  ```bash
  bun -e "
    import { createDatabase } from './src/server/db.ts';
    import { ReviewRepository } from './src/server/repositories/reviewRepository.ts';
    const db = createDatabase();
    const repo = new ReviewRepository(db);
    repo.upsertProgress(1, { status: 'weak', reviewCount: 0, incorrectCount: 1 });
    console.log(repo.getProgress(1)); // { status: 'weak', reviewCount: 0, incorrectCount: 1 }
  "
  ```
- **注意**: HTTP 関連の import を持ち込まない。ビジネスロジック（ステータス遷移）を書かない。

---

### T3: submitReview.ts — Application（新規）

- **ファイル**: `src/server/usecases/submitReview.ts`
- **役割**: Domain 関数と Repository を組み合わせてユースケースを完結させる。

**主要型・関数シグネチャ**:
```typescript
import type { IReviewRepository, ReviewResult } from '../domain/review';
import { calculateNextProgress } from '../domain/review';

export interface SubmitReviewInput {
  readonly wordId: number;
  readonly result: ReviewResult;
}

export class SubmitReviewUseCase {
  constructor(private readonly reviewRepo: IReviewRepository) {}

  execute(input: SubmitReviewInput): void;
}
```

**`execute` 実装フロー**:
1. `this.reviewRepo.getProgress(input.wordId)` で現在の進捗を取得（null = 初回）
2. `calculateNextProgress(current, input.result)` で次状態を計算
3. `this.reviewRepo.upsertProgress(input.wordId, next)` で保存

- **検証**: `tsc --noEmit` 通過。`hono`, `bun:sqlite` の import が0件であること。
- **注意**: architecture.md Application 層ルール — `c: Context`・HTTP ステータスコードを一切 import しない。DI は Presentation 層（index.ts）で行う。

---

### T4: routes/review.ts — Presentation（新規）

- **ファイル**: `src/server/routes/review.ts`
- **役割**: HTTP リクエストの受付・バリデーション・UseCase への委譲・レスポンス返却。

**主要型・関数シグネチャ**:
```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import type { SubmitReviewUseCase } from '../usecases/submitReview';

type Env = {
  Variables: {
    submitReviewUseCase: SubmitReviewUseCase;
  };
};

export const reviewRoutes = new Hono<Env>();

// POST /api/review
// zValidator でリクエストボディを検証
const reviewSchema = z.object({
  wordId: z.number().int().positive(),
  result: z.enum(['good', 'again']),
});

reviewRoutes.post('/', zValidator('json', reviewSchema), (c) => {
  const { wordId, result } = c.req.valid('json');
  const useCase = c.get('submitReviewUseCase');
  useCase.execute({ wordId, result });
  return c.json({ ok: true } as const);
});
```

- **検証**（T5 の `bun run server` 起動後）:
  ```bash
  # Good 記録
  curl -X POST http://localhost:3000/api/review \
    -H "Content-Type: application/json" \
    -d '{"wordId":1,"result":"good"}' 
  # => { "ok": true }

  # Again 記録
  curl -X POST http://localhost:3000/api/review \
    -H "Content-Type: application/json" \
    -d '{"wordId":1,"result":"again"}'
  # => { "ok": true }

  # バリデーションエラー（resultが不正）
  curl -X POST http://localhost:3000/api/review \
    -H "Content-Type: application/json" \
    -d '{"wordId":1,"result":"invalid"}'
  # => 400 Bad Request
  ```
- **注意**: hono.md 準拠 — `c.req.valid('json')` で検証済みデータのみ使用。ビジネスロジック・DBクエリを直接書かない。エラーは `app.onError` で集約（T5 で設定）。

---

### T5: server/index.ts — Presentation（変更）

- **ファイル**: `src/server/index.ts`
- **変更内容**: `ReviewRepository`・`SubmitReviewUseCase` の DI配線と `/api/review` ルートの追加。`app.onError` の集約エラーハンドラ追加。

**追加するコード（差分イメージ）**:
```typescript
// 追加 import
import { ReviewRepository } from './repositories/reviewRepository';
import { SubmitReviewUseCase } from './usecases/submitReview';
import { reviewRoutes } from './routes/review';

// DI: 追加インスタンス
const reviewRepo = new ReviewRepository(db);
const submitReviewUseCase = new SubmitReviewUseCase(reviewRepo);

// app.use ミドルウェアに submitReviewUseCase を追加
app.use('/api/*', async (c, next) => {
  c.set('getSessionUseCase', getSessionUseCase);
  c.set('submitReviewUseCase', submitReviewUseCase);  // 追加
  await next();
});

// ルート追加
app.route('/api/review', reviewRoutes);

// エラーハンドラ追加
app.onError((err, c) => {
  console.error(err);
  return c.json({ success: false, message: 'Internal Server Error' }, 500);
});
```

- **検証**: `bun run server` でサーバーが起動し、`curl` で `GET /api/session` と `POST /api/review` の両方が正常動作すること。
- **注意**: `AppType` の export は変更不要（`typeof app` で自動反映）。既存の GET /api/session は動作を変えない。

---

### T6: hooks/useSession.ts — Frontend（変更）

- **ファイル**: `src/client/hooks/useSession.ts`
- **変更内容**: `SessionState` を大幅拡張。`useMutation` で `POST /api/review` を送信。セッション制御関数（`showAnswer`, `submitReview`, `restart`）を追加。

**主要型・関数シグネチャ**:
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hc } from 'hono/client';
import { useState, useCallback } from 'react';
import type { AppType } from '../../server/index';
import type { Word, ReviewInput } from '@shared/types';

const client = hc<AppType>('/');

// GET /api/session が Word[] を返すため、WordWithProgress に正規化する
// progress は Phase 2 では使用しないため null を設定
type WordWithNullProgress = Word & { readonly progress: null };

interface SessionState {
  readonly words: readonly WordWithNullProgress[];
  readonly currentIndex: number;
  readonly isAnswerVisible: boolean;
  readonly isComplete: boolean;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly isSubmitting: boolean;
}

interface SessionActions {
  showAnswer(): void;
  submitReview(result: ReviewInput['result']): void;
  restart(): void;
}

export function useSession(): SessionState & SessionActions;
```

**内部実装のポイント**:
```typescript
// useQuery: GET /api/session
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['session'],
  queryFn: async () => {
    const res = await client.api.session.$get();
    if (!res.ok) throw new Error('セッションの取得に失敗しました');
    const words = await res.json();
    // Word[] → WordWithNullProgress[]
    return words.map((w) => ({ ...w, progress: null as null }));
  },
});

// useMutation: POST /api/review
const mutation = useMutation({
  mutationFn: async (input: ReviewInput) => {
    const res = await client.api.review.$post({ json: input });
    if (!res.ok) throw new Error('記録できませんでした');
    return res.json();
  },
  onSuccess: () => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= (data?.length ?? 0)) {
        setIsComplete(true);
      }
      return next;
    });
    setIsAnswerVisible(false);
  },
  onError: (err) => {
    // トーストを表示する（詳細はT9/T11で実装）
    // エラーでも次のカードには進む（flashcard.md エラーハンドリング仕様）
    console.error(err);
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (next >= (data?.length ?? 0)) {
        setIsComplete(true);
      }
      return next;
    });
    setIsAnswerVisible(false);
  },
});

// restart: セッション再開
const restart = useCallback((): void => {
  setCurrentIndex(0);
  setIsAnswerVisible(false);
  setIsComplete(false);
  void refetch();
}, [refetch]);

// submitReview: Good/Again 送信
const submitReview = useCallback((result: ReviewInput['result']): void => {
  const word = data?.[currentIndex];
  if (!word) return;
  mutation.mutate({ wordId: word.id, result });
}, [data, currentIndex, mutation]);
```

- **検証**: ブラウザの Network タブで `POST /api/review` が送信されること。Good 3回後に SQLite の status が `mastered` になること（`bun -e` で確認）。
- **注意**: react.md 準拠 — TanStack Query で非同期処理を管理。`useMutation` の `onError` でもユーザーを次のカードに進める（flashcard.md エラーハンドリング仕様に準拠）。`any` 禁止。

---

### T7: LanguageToggle.tsx — Frontend（新規）

- **ファイル**: `src/client/components/LanguageToggle/LanguageToggle.tsx`
- **グローバル CSS**: `src/client/index.css`（または `src/client/global.css`）に以下を追加:

**グローバル CSS（vi-content / ja-content 制御）**:
```css
/* src/client/index.css に追記 */
body[data-lang="vi"] .ja-content {
  display: none;
}
body[data-lang="ja"] .vi-content {
  display: none;
}
```

**コンポーネントシグネチャ**:
```typescript
type Language = 'vi' | 'ja';

interface Props {
  language: Language;
  onToggle: () => void;
}

export function LanguageToggle({ language, onToggle }: Props) {
  // UI: 🇻🇳 / 🇯🇵 ボタン。現在の言語をアクティブ表示
}
```

- **検証**: トグルをタップして `document.body.dataset.lang` が切り替わること。`.vi-content` と `.ja-content` が CSS により表示/非表示されること（DevTools Elements タブで確認）。
- **注意**: body への副作用（`document.body.dataset.lang` の設定）は StudyPage.tsx の `useEffect` で管理する（T11）。このコンポーネントはUIのみ担当。`React.FC` は使わない。

---

### T8: ReviewButtons.tsx — Frontend（新規）

- **ファイル**: `src/client/components/ReviewButtons/ReviewButtons.tsx`
- **役割**: Good / Again ボタンの UI を担当。送信中は disabled にして二重送信を防ぐ。

**コンポーネントシグネチャ**:
```typescript
interface Props {
  onGood: () => void;
  onAgain: () => void;
  isSubmitting: boolean;
}

export function ReviewButtons({ onGood, onAgain, isSubmitting }: Props) {
  // ⭕ Good, ❌ Again の2ボタン
  // isSubmitting 時: disabled + opacity 変更
  // タップターゲット: min-height 44px（iOS HIG 準拠）
}
```

- **検証**: 各ボタンをタップして `onGood` / `onAgain` が呼ばれること。`isSubmitting = true` 時にボタンが disabled になること。
- **注意**: `env(safe-area-inset-bottom)` を CSS に適用（フッター固定ボタンのため）。タップターゲット 44px 以上を確保。

---

### T9: FlashCard.tsx / FlashCard.module.css — Frontend（変更）

- **ファイル**: `src/client/components/FlashCard/FlashCard.tsx`, `FlashCard.module.css`
- **変更内容**: 裏面（翻訳・例文）の表示ロジック追加。`isAnswerVisible` / `onShowAnswer` props 追加。`ReviewButtons` の統合。

**更新後の Props インターフェース**:
```typescript
import type { Word } from '@shared/types';

interface Props {
  word: Word;
  isAnswerVisible: boolean;
  onShowAnswer: () => void;
  onGood: () => void;
  onAgain: () => void;
  isSubmitting: boolean;
}

export function FlashCard({ word, isAnswerVisible, onShowAnswer, onGood, onAgain, isSubmitting }: Props) {
  // 表面: 常時表示（英単語・AudioButton・ヒント）
  // 裏面: isAnswerVisible === true のとき表示
  //   - <span className="vi-content">{word.vietnamese}</span>
  //   - <span className="ja-content">{word.japanese}</span>
  //   - 例文: word.example_en（英語）
  //   - <span className="vi-content">{word.example_vi}</span>
  //   - <span className="ja-content">{word.example_ja}</span>
  // フッター:
  //   - isAnswerVisible === false: 「答えを表示」ボタン（onShowAnswer を呼ぶ）
  //   - isAnswerVisible === true: <ReviewButtons ... />
}
```

**vi-content / ja-content の使い方**:
```tsx
{/* 翻訳エリア（両方 DOM に存在させる — AC2 準拠） */}
<p className={`${styles.translation} vi-content`}>{word.vietnamese}</p>
<p className={`${styles.translation} ja-content`}>{word.japanese}</p>
```

> グローバル CSS（T7 で追加）の `body[data-lang="vi"] .ja-content { display: none }` により、APIを呼ばず即座に切り替わる（flashcard.md AC2）。

- **検証**:
  - 「答えを表示」タップで裏面が表示されること（AC2）
  - 言語トグルで翻訳が即座に切り替わること（DOM上は両方存在・CSS切り替えのみ）
  - 裏面表示後に Good / Again ボタンが表示されること
- **注意**: Phase 1 で FlashCard が `word: Word` を受け取っていた。props 拡張後も後方互換性が崩れないよう、新 props（`isAnswerVisible` 等）に適切なデフォルト値を設定しないこと（StudyPage が全 props を渡す設計で対応）。

---

### T10: CompleteScreen.tsx — Frontend（新規）

- **ファイル**: `src/client/components/CompleteScreen/CompleteScreen.tsx`
- **役割**: 10問回答後のセッション完了画面。「もう一度」ボタンでセッション再開。

**コンポーネントシグネチャ**:
```typescript
interface Props {
  onRestart: () => void;
}

export function CompleteScreen({ onRestart }: Props) {
  // 「セッション完了！」テキスト
  // 「もう一度」ボタン（onRestart を呼ぶ）
}
```

- **検証**: 10問回答後に `CompleteScreen` が表示されること（AC7）。「もう一度」タップで新しいセッションが開始され、1枚目のカードが表示されること。
- **注意**: `React.FC` は使わない。シンプルな UI のみ。ロジックは `useSession` の `restart()` に集約済み。

---

### T11: StudyPage.tsx — Frontend（変更）

- **ファイル**: `src/client/pages/StudyPage.tsx`
- **変更内容**: `language` 状態管理・`body[data-lang]` の `useEffect`・進捗「N / 10」表示・`LanguageToggle` 統合・`CompleteScreen` 条件表示。`useSession` の新インターフェースに対応。

**更新後のシグネチャ**:
```typescript
import { useState, useEffect } from 'react';
import { useSession } from '../hooks/useSession';
import { FlashCard } from '../components/FlashCard/FlashCard';
import { LanguageToggle } from '../components/LanguageToggle/LanguageToggle';
import { CompleteScreen } from '../components/CompleteScreen/CompleteScreen';

type Language = 'vi' | 'ja';

export function StudyPage() {
  const [language, setLanguage] = useState<Language>('vi');
  const {
    words, currentIndex, isAnswerVisible, isComplete,
    isLoading, error, isSubmitting,
    showAnswer, submitReview, restart,
  } = useSession();

  // body[data-lang] CSS 制御（APIコールなし）
  useEffect(() => {
    document.body.dataset['lang'] = language;
  }, [language]);

  const handleToggle = (): void => {
    setLanguage((prev) => (prev === 'vi' ? 'ja' : 'vi'));
  };

  // ローディング / エラー / 空 / 完了 / 通常表示の分岐
  if (isComplete) {
    return <CompleteScreen onRestart={restart} />;
  }

  const currentWord = words[currentIndex];
  if (!currentWord) return null;

  return (
    <div>
      {/* ヘッダー: LanguageToggle */}
      <LanguageToggle language={language} onToggle={handleToggle} />
      {/* 進捗: N / 10 */}
      <p>{currentIndex} / {words.length}</p>
      {/* フラッシュカード */}
      <FlashCard
        word={currentWord}
        isAnswerVisible={isAnswerVisible}
        onShowAnswer={showAnswer}
        onGood={() => submitReview('good')}
        onAgain={() => submitReview('again')}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
```

> 進捗は `currentIndex / words.length` で表示。`currentIndex` は 0-indexed だが、表示は `currentIndex + 1` ではなく「回答済み枚数 / 全体数」として扱う（0問回答時は `0 / 10`、1問回答後は `1 / 10`）。

- **検証**:
  - 「N / 10」形式でセッション進捗が表示されること（AC / Done 定義）
  - `bun run dev` で全体が動作し、10問回答後に完了画面が出ること
  - 「もう一度」で新セッションが始まること
- **注意**: react.md 準拠 — `language` 状態は現時点で StudyPage にローカルに置く（Phase 3 以降に必要な場合 App.tsx に lift up）。`useEffect` の依存配列に `language` を正確に記載。

---

### T12: domain/review.ts — Domain（変更）

- **ファイル**: `src/server/domain/review.ts`
- **役割**: ステータス遷移ロジックの是正。10問全問正解などの学習時の進捗率向上を促すため、Good 押下時に即座に `mastered` に遷移させ、Again 押下時は即座に `weak` に遷移させる。
- **実装詳細**:
  - `calculateNextProgress` を変更。
  - `result === 'good'` の場合、`status: 'mastered'` を返す。
  - `result === 'again'` の場合、`status: 'weak'` を返す。
- **検証**: `yarn tsc` が通過し、単体テストがすべてパスすること。

---

## 6. Done の定義（受け入れ基準チェックリスト）

### フェーズゴール（phase-2.md より）

- [ ] FlashCard 表面で「答えを表示」をタップすると裏面（翻訳・例文）が表示される
- [ ] 🇻🇳 / 🇯🇵 トグルを切り替えると翻訳・例文訳が即座に切り替わる（APIコールなし）
- [ ] `POST /api/review { wordId, result: 'good' }` が `{ ok: true }` を返す
- [ ] `POST /api/review { wordId, result: 'again' }` が `{ ok: true }` を返す
- [ ] Good を記録した単語の status が `mastered` になる
- [ ] Again を記録した単語の status が `weak` になる
- [ ] セッション進捗「N / 10」形式が表示される
- [ ] 10問回答後にセッション完了画面が表示される
- [ ] 「もう一度」ボタンで新しいセッションが開始される


### 設計 AC（flashcard.md）

- [ ] **AC1**: `GET /api/session` から Word[]（最大10件）が取得され、1枚目のカード表面（英語）が表示される
- [ ] **AC2**: カード領域をタップすると、選択中の言語（🇻🇳 or 🇯🇵）の翻訳・例文が表示される。非選択の言語は DOM 上に存在するが `display:none` で不可視である
- [ ] **AC3**: 🔊 ボタンをタップすると英単語が英語音声で再生される（Phase 1 から引き継ぎ）
- [ ] **AC4**: 「⭕ Good」ボタンをタップすると `POST /api/review` に `{ wordId, result:'good' }` が送信され、次のカード（index+1）の表面が表示される
- [ ] **AC5**: 「❌ Again」ボタンをタップすると `POST /api/review` に `{ wordId, result:'again' }` が送信され、次のカードが表示される
- [ ] **AC6**: Good が積み重なり status が mastered になった単語は、次セッションで優先枠（4問）に入らない（Session API の WHERE 句が `p.status != 'mastered'` を暗黙的に満たす — weak / 未学習のみ優先枠対象）
- [ ] **AC7**: 10問すべて回答すると「セッション完了！」画面が表示され、「もう一度」ボタンで新しいセッションが開始される。「レベル選択へもどる」ボタンでレベル選択画面（/levels）へ遷移できる
- [ ] **AC11**: 「こたえを見る」ボタンがカードの下部で大きすぎずコンパクトな幅とパディングであること
- [ ] **AC11**: 学習画面上部のヘッダー領域（マスコット、コンボ数、ミュートボタン、ユーザーNavアバター）がコンパクトに縮小・整理されていること


### コード品質

- [ ] `bun run typecheck`（`tsc --noEmit`）がエラーなしで通る
- [ ] `any` 型を使用していない
- [ ] `src/server/usecases/submitReview.ts` に `hono`, `bun:sqlite` の import がない
- [ ] `src/server/domain/review.ts` にフレームワーク依存の import がない
- [ ] DB クエリをルートハンドラに直接書いていない（UseCase 経由）
- [ ] `zValidator` による `POST /api/review` のスキーマ検証が通っている
- [ ] `body[data-lang]` の CSS 制御で API 再取得が発生していないこと（Network タブで確認）

### 非機能

- [ ] Good / Again ボタンのタップターゲットが 44px 以上
- [ ] `env(safe-area-inset-bottom)` が ReviewButtons に適用されている
- [ ] `POST /api/review` が失敗してもユーザーは次のカードに進める（flashcard.md エラーハンドリング仕様）

---

## 付録: ファイル変更サマリー

| ファイル | 種別 |
|---------|------|
| `src/server/domain/review.ts` | 新規 |
| `src/server/repositories/reviewRepository.ts` | 新規 |
| `src/server/usecases/submitReview.ts` | 新規 |
| `src/server/routes/review.ts` | 新規 |
| `src/server/index.ts` | 変更（DI追加・onError追加） |
| `src/client/hooks/useSession.ts` | 変更（大幅拡張） |
| `src/client/components/LanguageToggle/LanguageToggle.tsx` | 新規 |
| `src/client/components/ReviewButtons/ReviewButtons.tsx` | 新規 |
| `src/client/components/CompleteScreen/CompleteScreen.tsx` | 新規 |
| `src/client/components/FlashCard/FlashCard.tsx` | 変更（裏面追加） |
| `src/client/components/FlashCard/FlashCard.module.css` | 変更 |
| `src/client/pages/StudyPage.tsx` | 変更（大幅拡張） |
| `src/client/index.css`（または `global.css`） | 変更（vi-content/ja-content CSS 追加） |
