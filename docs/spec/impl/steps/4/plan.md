# Phase 4 実装計画書: 管理機能

## 1. 参照

- フェーズ定義: [phase-4.md](../../phase/phase-4.md)
- 設計（管理機能）: [admin.md](../../../design/admin.md)
- 設計（単語リスト）: [word-list.md](../../../design/word-list.md)（ページネーション部分）
- 設計（アーキテクチャ）: [architecture.md](../../../design/architecture.md)
- 実装ルール（アーキテクチャ）: [rules/architecture.md](../../../../rules/architecture.md)
- 実装ルール（TypeScript）: [rules/TypeScript.md](../../../../rules/TypeScript.md)
- 実装ルール（Hono）: [rules/hono.md](../../../../rules/hono.md)
- 実装ルール（React）: [rules/react.md](../../../../rules/react.md)
- 前提計画書: [Phase 1 plan.md](../1/plan.md)

---

## 2. このフェーズのゴール

- `/admin` にアクセスすると認証フォームが表示され、Basic 認証でバックエンド API が保護される
- 管理者がスマホから単語の追加・編集・削除を操作できる
  - `POST /api/admin/words` — 単語追加（zValidator によるスキーマ検証）
  - `PUT /api/admin/words/:id` — 単語更新
  - `DELETE /api/admin/words/:id` — 単語削除（`learning_progress` CASCADE 削除）
- 単語リストのページネーション UI（「< 前へ」「次へ >」ボタン・ページ番号表示）が動作する

---

## 3. 前提・依存（Phase 2 完了が前提、Phase 3 の GET /api/words も必要）

| 依存フェーズ | 必要な成果物 |
|-------------|------------|
| Phase 2 | `src/server/db.ts`・`src/shared/types.ts`（`Word`・`WordInput`）・Hono アプリ構造 |
| Phase 3 | `GET /api/words`（ページネーション API）・`src/client/components/WordList/WordList.tsx`・`src/client/hooks/useWords.ts` |

### Phase 1/2/3 で作成済みの変更対象ファイル

| ファイル | 変更内容 |
|---------|---------|
| `src/server/index.ts` | adminRoutes マウント・DI 配線追加 |
| `src/client/App.tsx` | `/admin` パス分岐追加 |
| `src/client/components/WordList/WordList.tsx` | ページネーション UI（前へ/次へボタン・ページ番号）追加 |

---

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|----|---------|-----------|
| T1 | `src/server/schemas/wordInput.ts` | WordInputSchema・WordPartialInputSchema (Zod) | 共通 | `tsc --noEmit` 通過 | TypeScript.md |
| T2 | `src/server/domain/adminWord.ts` | IAdminWordRepository インターフェース | Domain | `tsc --noEmit` 通過 | architecture.md, TypeScript.md |
| T3 | `src/server/repositories/adminWordRepository.ts` | AdminWordRepository（findAll / create / update / delete） | Infrastructure | `bun -e` で CRUD 動作確認 | architecture.md, TypeScript.md |
| T4 | `src/server/usecases/adminWord.ts` | GetAdminWordsUseCase・CreateWordUseCase・UpdateWordUseCase・DeleteWordUseCase | Application | `tsc --noEmit`・hono/bun:sqlite import なし確認 | architecture.md, TypeScript.md |
| T5 | `src/server/routes/admin.ts` | Basic 認証ミドルウェア + CRUD エンドポイント（zValidator） | Presentation | `curl --user admin:changeme` で各エンドポイント動作確認 | hono.md, TypeScript.md |
| T6 | `src/server/index.ts` (**変更**) | adminRoutes マウント・DI 配線追加 | Presentation | `bun run server` 起動・AppType に admin ルート含有確認 | hono.md, architecture.md |
| T7 | `src/client/hooks/useAdminWords.ts` | 管理 API 用 TanStack Query hooks（CRUD + 認証） | Frontend | Network タブで各 API コール確認 | react.md, TypeScript.md |
| T8 | `src/client/pages/AdminPage.tsx`, `AdminPage.module.css` | 管理画面 UI（認証フォーム・単語追加・一覧・インライン編集・削除確認ダイアログ） | Frontend | ブラウザで CRUD 全操作・401 時フォームリセット確認 | react.md, TypeScript.md |
| T9 | `src/client/App.tsx` (**変更**) | `/admin` パス分岐で AdminPage をレンダリング | Frontend | `/admin` で AdminPage・`/` で StudyPage 確認 | react.md, TypeScript.md |
| T10 | `src/client/components/WordList/WordList.tsx` (**変更**) | ページネーション UI（前へ/次へボタン・ページ番号表示）追加 | Frontend | 「次へ >」「< 前へ」動作・ページ番号表示確認 | react.md, TypeScript.md |
| T11 | `.env.example` (新規) | ADMIN_USER・ADMIN_PASS・DB_PATH の設定例と警告コメント | 環境 | ファイル内容確認 | セキュリティ注意事項 |
| T12 | `src/shared/types.ts` 等 (**変更**) | `Word` 型および `WordInputSchema` 等に `word_set_id` を追加し、`AdminWordRepository` を修正して `word_set_id` の保存・更新に対応 | 共通/Infrastructure | `yarn typecheck` 通過 | architecture.md, TypeScript.md |
| T13 | `src/client/pages/AdminPage.tsx` 等 (**変更**) | 単語編集・追加時にレベル（単語セット）を選択可能にし、一覧でレベル毎にフィルタリングできる機能を追加。UIデザインをレスポンシブではみ出さない美しく洗練されたものに刷新 | Frontend | `yarn typecheck` 通過・UIが崩れないこと | react.md, TypeScript.md |


---

## 5. 各タスク詳細

### T1: WordInputSchema（Zod）

- **ファイル**: `src/server/schemas/wordInput.ts`（新規）
- **やること**:
  ```typescript
  import { z } from 'zod';

  export const WordInputSchema = z.object({
    english:    z.string().min(1, '英単語は必須です').max(100),
    vietnamese: z.string().min(1, 'ベトナム語訳は必須です').max(200),
    japanese:   z.string().min(1, '日本語訳は必須です').max(200),
    example_en: z.string().max(500).optional().nullable(),
    example_vi: z.string().max(500).optional().nullable(),
    example_ja: z.string().max(500).optional().nullable(),
  });

  export const WordPartialInputSchema = WordInputSchema.partial();

  export type WordInputDto     = z.infer<typeof WordInputSchema>;
  export type WordPartialInputDto = z.infer<typeof WordPartialInputSchema>;
  ```
- **検証**: `tsc --noEmit` でエラーなし。`WordInputSchema.safeParse({})` が `success: false` を返すことを `bun -e` で確認。
- **注意**: このスキーマは Presentation 層（admin.ts）の `zValidator` でのみ使用する。Application 層・Domain 層は `src/shared/types.ts` の `WordInput` 型に依存し、このファイルを import しない。

---

### T2: IAdminWordRepository インターフェース（Domain）

- **ファイル**: `src/server/domain/adminWord.ts`（新規）
- **やること**:
  ```typescript
  import type { Word, WordInput } from '@shared/types';

  export interface IAdminWordRepository {
    findAll(): readonly Word[];
    findById(id: number): Word | null;
    create(input: WordInput): Word;
    update(id: number, input: Partial<WordInput>): Word | null;
    delete(id: number): boolean;
  }
  ```
- **検証**: `tsc --noEmit` でエラーなし。
- **注意**: Domain 層は zero third-party framework dependencies。`hono`・`bun:sqlite`・Infrastructure 層を一切 import しない。`WordInput` は `src/shared/types.ts` の既存型（`Omit<Word, 'id' | 'created_at'>`）をそのまま使用する。

---

### T3: AdminWordRepository（Infrastructure）

- **ファイル**: `src/server/repositories/adminWordRepository.ts`（新規）
- **やること**:
  ```typescript
  import type { DB } from '../db';
  import type { IAdminWordRepository } from '../domain/adminWord';
  import type { Word, WordInput } from '@shared/types';

  export class AdminWordRepository implements IAdminWordRepository {
    constructor(private readonly db: DB) {}

    findAll(): readonly Word[] {
      return this.db.query<Word, []>(
        'SELECT * FROM words ORDER BY id DESC',
      ).all();
    }

    findById(id: number): Word | null {
      return this.db.query<Word, [number]>(
        'SELECT * FROM words WHERE id = ?',
      ).get(id) ?? null;
    }

    create(input: WordInput): Word {
      const stmt = this.db.prepare<
        Word,
        [string, string, string, string | null, string | null, string | null]
      >(
        `INSERT INTO words (english, vietnamese, japanese, example_en, example_vi, example_ja)
         VALUES (?, ?, ?, ?, ?, ?)
         RETURNING *`,
      );
      const row = stmt.get(
        input.english,
        input.vietnamese,
        input.japanese,
        input.example_en ?? null,
        input.example_vi ?? null,
        input.example_ja ?? null,
      );
      if (!row) throw new Error('単語の作成に失敗しました');
      return row;
    }

    update(id: number, input: Partial<WordInput>): Word | null {
      const existing = this.findById(id);
      if (!existing) return null;

      // 既存値にマージ（undefined は既存値を維持、null は明示的にクリア）
      const merged: WordInput = {
        english:    input.english    ?? existing.english,
        vietnamese: input.vietnamese ?? existing.vietnamese,
        japanese:   input.japanese   ?? existing.japanese,
        example_en: 'example_en' in input ? (input.example_en ?? null) : existing.example_en,
        example_vi: 'example_vi' in input ? (input.example_vi ?? null) : existing.example_vi,
        example_ja: 'example_ja' in input ? (input.example_ja ?? null) : existing.example_ja,
      };

      const stmt = this.db.prepare<
        Word,
        [string, string, string, string | null, string | null, string | null, number]
      >(
        `UPDATE words
         SET english = ?, vietnamese = ?, japanese = ?,
             example_en = ?, example_vi = ?, example_ja = ?
         WHERE id = ?
         RETURNING *`,
      );
      return stmt.get(
        merged.english, merged.vietnamese, merged.japanese,
        merged.example_en, merged.example_vi, merged.example_ja,
        id,
      ) ?? null;
    }

    delete(id: number): boolean {
      const result = this.db.run(
        'DELETE FROM words WHERE id = ?',
        [id],
      );
      return result.changes > 0;
    }
  }
  ```
- **検証**:
  ```bash
  bun -e "
    import { createDatabase } from './src/server/db.ts';
    import { AdminWordRepository } from './src/server/repositories/adminWordRepository.ts';
    const db = createDatabase();
    const repo = new AdminWordRepository(db);
    const w = repo.create({ english: 'test', vietnamese: 'thử', japanese: 'テスト', example_en: null, example_vi: null, example_ja: null });
    console.log('created id:', w.id);
    const u = repo.update(w.id, { english: 'test-updated' });
    console.log('updated english:', u?.english);
    const d = repo.delete(w.id);
    console.log('deleted:', d);
    // learning_progress CASCADE 確認
    const lp = db.query('SELECT * FROM learning_progress WHERE word_id = ?').get(w.id);
    console.log('cascade deleted lp:', lp);
  "
  ```
- **注意**: `ON DELETE CASCADE` は Phase 1 の `schema.sql` で定義済み（`FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE`）。HTTP 関連 import 禁止。`any` 型不使用。

---

### T4: AdminWord UseCases（Application）

- **ファイル**: `src/server/usecases/adminWord.ts`（新規）
- **やること**:
  ```typescript
  import type { IAdminWordRepository } from '../domain/adminWord';
  import type { Word, WordInput } from '@shared/types';

  export class GetAdminWordsUseCase {
    constructor(private readonly repo: IAdminWordRepository) {}

    execute(): readonly Word[] {
      return this.repo.findAll();
    }
  }

  export class CreateWordUseCase {
    constructor(private readonly repo: IAdminWordRepository) {}

    execute(input: WordInput): Word {
      return this.repo.create(input);
    }
  }

  export class UpdateWordUseCase {
    constructor(private readonly repo: IAdminWordRepository) {}

    execute(id: number, input: Partial<WordInput>): Word {
      const updated = this.repo.update(id, input);
      if (!updated) throw new Error('Word not found');
      return updated;
    }
  }

  export class DeleteWordUseCase {
    constructor(private readonly repo: IAdminWordRepository) {}

    execute(id: number): void {
      const deleted = this.repo.delete(id);
      if (!deleted) throw new Error('Word not found');
    }
  }
  ```
- **検証**: `tsc --noEmit` でエラーなし。以下のコマンドで `hono`・`bun:sqlite` の import がないことを確認する（出力ゼロが合格）:
  ```bash
  grep -n "hono\|bun:sqlite" src/server/usecases/adminWord.ts
  ```
- **注意**: Application 層は `hono`・`bun:sqlite` を一切 import しない（architecture.md）。UseCase は `IAdminWordRepository` インターフェースにのみ依存し、Infrastructure の具象クラスへの参照を持たない。

---

### T5: admin.ts ルート（Presentation）

- **ファイル**: `src/server/routes/admin.ts`（新規）
- **やること**:
  ```typescript
  import { Hono } from 'hono';
  import { basicAuth } from 'hono/basic-auth';
  import { zValidator } from '@hono/zod-validator';
  import { z } from 'zod';
  import { WordInputSchema, WordPartialInputSchema } from '../schemas/wordInput';
  import type {
    GetAdminWordsUseCase,
    CreateWordUseCase,
    UpdateWordUseCase,
    DeleteWordUseCase,
  } from '../usecases/adminWord';

  const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

  type Env = {
    Variables: {
      getAdminWordsUseCase: GetAdminWordsUseCase;
      createWordUseCase: CreateWordUseCase;
      updateWordUseCase: UpdateWordUseCase;
      deleteWordUseCase: DeleteWordUseCase;
    };
  };

  export const adminRoutes = new Hono<Env>();

  adminRoutes.use(
    '*',
    basicAuth({
      username: Bun.env['ADMIN_USER'] ?? 'admin',
      password: Bun.env['ADMIN_PASS'] ?? 'changeme',
    }),
  );

  adminRoutes.get('/words', (c) => {
    const words = c.get('getAdminWordsUseCase').execute();
    return c.json(words);
  });

  adminRoutes.post('/words', zValidator('json', WordInputSchema), (c) => {
    const input = c.req.valid('json');
    const word = c.get('createWordUseCase').execute(input);
    return c.json(word, 201);
  });

  adminRoutes.put(
    '/words/:id',
    zValidator('param', idParamSchema),
    zValidator('json', WordPartialInputSchema),
    (c) => {
      const { id } = c.req.valid('param');
      const input = c.req.valid('json');
      try {
        const word = c.get('updateWordUseCase').execute(id, input);
        return c.json(word);
      } catch {
        return c.json({ success: false, message: '単語が見つかりません' }, 404);
      }
    },
  );

  adminRoutes.delete('/words/:id', zValidator('param', idParamSchema), (c) => {
    const { id } = c.req.valid('param');
    try {
      c.get('deleteWordUseCase').execute(id);
      return c.json({ ok: true });
    } catch {
      return c.json({ success: false, message: '単語が見つかりません' }, 404);
    }
  });
  ```
- **検証** (`bun run server` 起動後):
  ```bash
  # 認証なし → 401
  curl -i http://localhost:3000/api/admin/words

  # 認証成功 → Word[]
  curl -u admin:changeme http://localhost:3000/api/admin/words

  # 単語追加
  curl -u admin:changeme -X POST http://localhost:3000/api/admin/words \
    -H "Content-Type: application/json" \
    -d '{"english":"cat","vietnamese":"con mèo","japanese":"猫"}'

  # バリデーションエラー（english 未入力 → 400）
  curl -u admin:changeme -X POST http://localhost:3000/api/admin/words \
    -H "Content-Type: application/json" \
    -d '{"vietnamese":"con mèo","japanese":"猫"}'

  # 単語更新
  curl -u admin:changeme -X PUT http://localhost:3000/api/admin/words/1 \
    -H "Content-Type: application/json" \
    -d '{"english":"apple-updated"}'

  # 単語削除
  curl -u admin:changeme -X DELETE http://localhost:3000/api/admin/words/1
  ```
- **注意**: `c.req.valid('json')` と `c.req.valid('param')` を必ず使用する（hono.md）。エラーは `{ success: false, message: string }` 形式で返す（hono.md）。ビジネスロジックは UseCase に委譲し、ルートハンドラには書かない。

---

### T6: src/server/index.ts（変更）

- **ファイル**: `src/server/index.ts`（**変更**）
- **やること**: 以下を既存コードに追加する。

  **追加 import**:
  ```typescript
  import { AdminWordRepository } from './repositories/adminWordRepository';
  import {
    GetAdminWordsUseCase,
    CreateWordUseCase,
    UpdateWordUseCase,
    DeleteWordUseCase,
  } from './usecases/adminWord';
  import { adminRoutes } from './routes/admin';
  ```

  **DI 配線（既存の `wordRepo` 宣言の直後に追加）**:
  ```typescript
  const adminWordRepo       = new AdminWordRepository(db);
  const getAdminWordsUseCase = new GetAdminWordsUseCase(adminWordRepo);
  const createWordUseCase    = new CreateWordUseCase(adminWordRepo);
  const updateWordUseCase    = new UpdateWordUseCase(adminWordRepo);
  const deleteWordUseCase    = new DeleteWordUseCase(adminWordRepo);
  ```

  **ミドルウェア（既存の `/api/*` ミドルウェアの近くに追加）**:
  ```typescript
  app.use('/api/admin/*', async (c, next) => {
    c.set('getAdminWordsUseCase', getAdminWordsUseCase);
    c.set('createWordUseCase', createWordUseCase);
    c.set('updateWordUseCase', updateWordUseCase);
    c.set('deleteWordUseCase', deleteWordUseCase);
    await next();
  });
  ```

  **ルート登録（既存の `app.route()` の近くに追加）**:
  ```typescript
  app.route('/api/admin', adminRoutes);
  ```

  **AppType** — ルートチェーン方式にしている場合は `typeof app` が自動的に admin ルートを含む。メソッドチェーン方式でない場合は `export type AppType = typeof app;` を維持しつつ、admin ルートが含まれるよう確認する。

- **検証**: `bun run server` でエラーなく起動。`curl -u admin:changeme http://localhost:3000/api/admin/words` が Word[] JSON を返すこと。
- **注意**: DI 配線は index.ts のみで完結させる（architecture.md）。`Variables` 型に admin UseCase が不足する場合は Hono の型定義を更新する。

---

### T7: useAdminWords フック（Frontend）

- **ファイル**: `src/client/hooks/useAdminWords.ts`（新規）
- **背景**: `hono/basic-auth` は `WWW-Authenticate` ヘッダーを返すが、モダンブラウザは `fetch` API での 401 に対してネイティブ Basic 認証ダイアログを表示しない。そのため、AdminPage に軽量な認証フォームを設け、取得した credentials を Authorization ヘッダーに付与する方式を採用する。
- **やること**:
  ```typescript
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import type { Word, WordInput } from '@shared/types';

  export interface AdminCredentials {
    readonly username: string;
    readonly password: string;
  }

  function makeAuthHeader(creds: AdminCredentials): string {
    return `Basic ${btoa(`${creds.username}:${creds.password}`)}`;
  }

  async function adminFetch<T>(
    path: string,
    init: RequestInit,
    creds: AdminCredentials,
  ): Promise<T> {
    const res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
        Authorization: makeAuthHeader(creds),
      },
    });
    if (res.status === 401) throw new Error('UNAUTHORIZED');
    if (!res.ok) {
      const body = await res.json().catch(() => ({})) as { message?: string };
      throw new Error(body.message ?? `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  export function useAdminWords(creds: AdminCredentials | null) {
    return useQuery<readonly Word[], Error>({
      queryKey: ['admin', 'words', creds?.username],
      queryFn: () => {
        if (!creds) throw new Error('UNAUTHORIZED');
        return adminFetch<readonly Word[]>('/api/admin/words', {}, creds);
      },
      enabled: creds !== null,
      retry: false,
    });
  }

  export function useCreateWord(creds: AdminCredentials) {
    const qc = useQueryClient();
    return useMutation<Word, Error, WordInput>({
      mutationFn: (input) =>
        adminFetch<Word>(
          '/api/admin/words',
          { method: 'POST', body: JSON.stringify(input) },
          creds,
        ),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'words'] }),
    });
  }

  export function useUpdateWord(creds: AdminCredentials) {
    const qc = useQueryClient();
    return useMutation<Word, Error, { id: number; input: Partial<WordInput> }>({
      mutationFn: ({ id, input }) =>
        adminFetch<Word>(
          `/api/admin/words/${id}`,
          { method: 'PUT', body: JSON.stringify(input) },
          creds,
        ),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'words'] }),
    });
  }

  export function useDeleteWord(creds: AdminCredentials) {
    const qc = useQueryClient();
    return useMutation<{ ok: true }, Error, number>({
      mutationFn: (id) =>
        adminFetch<{ ok: true }>(
          `/api/admin/words/${id}`,
          { method: 'DELETE' },
          creds,
        ),
      onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'words'] }),
    });
  }
  ```
- **検証**: AdminPage から呼び出し、Network タブで:
  - GET `/api/admin/words` に `Authorization: Basic ...` ヘッダーが付くこと
  - POST/PUT/DELETE が正しいパスとメソッドで実行されること
  - credentials が誤っている場合に error.message が `'UNAUTHORIZED'` になること
- **注意**: `any` 型不使用。`enabled: creds !== null` により未認証状態ではクエリを実行しない。`makeAuthHeader` は `btoa` を使用するためブラウザ環境専用（SSR なし前提）。

---

### T8: AdminPage（Frontend）

- **ファイル**: `src/client/pages/AdminPage.tsx`（新規）, `src/client/pages/AdminPage.module.css`（新規）
- **やること**:

  **AdminPage.tsx 主要シグネチャ**:
  ```typescript
  import { useState, useEffect } from 'react';
  import {
    useAdminWords, useCreateWord, useUpdateWord, useDeleteWord,
  } from '../hooks/useAdminWords';
  import type { AdminCredentials } from '../hooks/useAdminWords';
  import type { Word, WordInput } from '@shared/types';
  import styles from './AdminPage.module.css';

  // 認証フォーム（creds === null のときに表示）
  function CredentialsForm({
    onSubmit,
    errorMessage,
  }: {
    onSubmit: (creds: AdminCredentials) => void;
    errorMessage: string | null;
  }) { /* username / password フォーム */ }

  // 単語追加フォーム（展開/折り畳みトグル付き）
  function AddWordForm({ creds }: { creds: AdminCredentials }) {
    const createWord = useCreateWord(creds);
    // WordInput の各フィールドを useState で管理
    // english/vietnamese/japanese が空のとき保存ボタンを押すとエラー表示
  }

  // 単語行（インライン編集 + 削除確認ダイアログ）
  function WordRow({
    word,
    creds,
  }: {
    word: Word;
    creds: AdminCredentials;
  }) {
    const updateWord = useUpdateWord(creds);
    const deleteWord = useDeleteWord(creds);
    const [isEditing, setIsEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    // isEditing: インライン編集フォーム表示
    // confirmDelete: 削除確認ダイアログ表示
  }

  export function AdminPage() {
    const [creds, setCreds] = useState<AdminCredentials | null>(null);
    const { data: words, error, isLoading } = useAdminWords(creds);

    useEffect(() => {
      if (error?.message === 'UNAUTHORIZED') setCreds(null);
    }, [error]);

    if (!creds) {
      return (
        <CredentialsForm
          onSubmit={setCreds}
          errorMessage={error?.message === 'UNAUTHORIZED' ? '認証に失敗しました' : null}
        />
      );
    }
    if (isLoading) return <div className={styles.status}>読み込み中...</div>;
    if (error) return <div className={styles.status}>エラーが発生しました。再試行してください。</div>;

    return (
      <main className={styles.container}>
        <header className={styles.header}>
          <h1>管理画面</h1>
          <a href="/">← 学習へ</a>
        </header>
        <AddWordForm creds={creds} />
        <section>
          <h2>単語一覧（管理用）</h2>
          <ul className={styles.wordList}>
            {words?.map((w) => <WordRow key={w.id} word={w} creds={creds} />)}
          </ul>
        </section>
      </main>
    );
  }
  ```

  **AdminPage.module.css（スマホ最適化）**:
  ```css
  .container {
    padding: env(safe-area-inset-top, 1rem) 1rem env(safe-area-inset-bottom, 1rem);
    max-width: 600px;
    margin: 0 auto;
  }
  .header { display: flex; justify-content: space-between; align-items: center; }
  .form { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
  .input {
    font-size: 1rem; padding: 0.5rem;
    border: 1px solid #ccc; border-radius: 6px;
    width: 100%; box-sizing: border-box;
  }
  .button { min-height: 44px; font-size: 1rem; border-radius: 6px; cursor: pointer; padding: 0 1rem; }
  .buttonDanger { background: #e00; color: #fff; border: none; }
  .error { color: #e00; font-size: 0.875rem; margin-top: 0.25rem; }
  .wordList { list-style: none; padding: 0; margin: 0; }
  .wordRow {
    display: flex; align-items: center; gap: 0.5rem;
    padding: 0.75rem 0; border-bottom: 1px solid #eee;
  }
  .wordName { flex: 1; font-weight: bold; }
  .status { text-align: center; padding: 2rem; }
  .dialog {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4);
    display: flex; align-items: center; justify-content: center;
    z-index: 100;
  }
  .dialogBox { background: #fff; padding: 1.5rem; border-radius: 12px; max-width: 320px; width: 90%; }
  ```

- **検証**:
  1. ブラウザで `/admin` を開き認証フォームが表示されること（AC1）
  2. 誤った credentials → 一覧取得失敗 → `setCreds(null)` でフォームに戻ること（AC1）
  3. 正しい credentials → 全単語一覧表示（AC2）
  4. [+ 新しい単語を追加] タップ → フォーム展開（AC3）
  5. 必須未入力で保存 → エラーメッセージ（AC3）
  6. 全必須項目入力 → 追加 → 一覧先頭に表示（AC4）
  7. [✏️] → インライン編集フォーム → [更新する] → 即時反映（AC5）
  8. [🗑] → 確認ダイアログ → [削除する] → 一覧から消える（AC6）
  9. ダイアログで [キャンセル] → 削除されないこと（AC6）
- **注意**: react.md 準拠 — `React.FC` 不使用。各サブコンポーネントが 150 行を超える場合はファイル分割する（`src/client/components/Admin/` 配下）。削除確認ダイアログは `window.confirm` 不使用（モバイルでの挙動が不安定なため、インライン state で制御する）。

---

### T9: App.tsx（変更）

- **ファイル**: `src/client/App.tsx`（**変更**）
- **やること**: 既存の `StudyPage` レンダリングに `/admin` パス分岐を追加する。
  ```typescript
  import { StudyPage } from './pages/StudyPage';
  import { AdminPage } from './pages/AdminPage';

  export function App() {
    const isAdmin = window.location.pathname.startsWith('/admin');
    return isAdmin ? <AdminPage /> : <StudyPage />;
  }
  ```
- **検証**:
  - `http://localhost:5173/admin` で AdminPage が表示される
  - `http://localhost:5173/` で StudyPage が表示される
- **注意**: React Router を導入しない（追加依存を避ける）。SPA 内で画面を切り替える場合は `window.location.href = '/admin'` または `window.location.href = '/'` を使用する（ハードナビゲーション）。`window.location.pathname` は初期描画時のみ評価される点を把握しておく。

---

### T10: WordList.tsx — ページネーション UI 追加（変更）

- **ファイル**: `src/client/components/WordList/WordList.tsx`（**変更**）
- **前提**: Phase 3 で `useWords` フックと `WordList.tsx` が作成済みであること。`useWords` が `page`・`totalPages` を返す場合はそのまま使用する。返さない場合は以下のように `WordList.tsx` 内に `page` state を追加する。
- **やること**:

  **ページネーション用サブコンポーネント（WordList.tsx 内）**:
  ```typescript
  interface PaginationProps {
    readonly page: number;
    readonly totalPages: number;
    readonly onPrev: () => void;
    readonly onNext: () => void;
  }

  function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
    return (
      <nav aria-label="ページネーション" className={styles.pagination}>
        <button
          onClick={onPrev}
          disabled={page <= 1}
          aria-label="前のページ"
          className={styles.pageButton}
        >
          {'< 前へ'}
        </button>
        <span className={styles.pageInfo}>{page} / {totalPages} ページ</span>
        <button
          onClick={onNext}
          disabled={page >= totalPages}
          aria-label="次のページ"
          className={styles.pageButton}
        >
          {'次へ >'}
        </button>
      </nav>
    );
  }
  ```

  **WordList コンポーネントへの追加箇所**（`page` を `useWords` が管理していない場合）:
  ```typescript
  const [page, setPage] = useState<number>(1);
  const { words, totalPages, isLoading, error } = useWords({ page, limit: 10 });

  const handleNext = (): void => {
    setPage((p) => p + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handlePrev = (): void => {
    setPage((p) => Math.max(1, p - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  ```

  **返却 JSX に Pagination を追加**:
  ```typescript
  return (
    <section>
      {/* 既存の単語カード一覧 */}
      <Pagination
        page={page}
        totalPages={totalPages ?? 1}
        onPrev={handlePrev}
        onNext={handleNext}
      />
    </section>
  );
  ```

  **WordList.module.css に追加**:
  ```css
  .pagination {
    display: flex; align-items: center; justify-content: space-between;
    padding: 1rem 0 env(safe-area-inset-bottom, 1rem);
    gap: 0.5rem;
  }
  .pageButton {
    min-height: 44px; min-width: 80px; font-size: 1rem;
    border: 1px solid #ccc; border-radius: 6px;
    background: #fff; cursor: pointer;
  }
  .pageButton:disabled { opacity: 0.4; cursor: not-allowed; }
  .pageInfo { font-size: 0.9rem; color: #555; }
  ```

- **検証**:
  1. 単語リストページで「次へ >」をタップして次の10件が表示されること（AC5）
  2. 「< 前へ」で前の10件に戻れること（AC5）
  3. 「X / Y ページ」形式でページ番号が表示されること（AC5）
  4. 1ページ目で「< 前へ」が非活性になること
  5. 最終ページで「次へ >」が非活性になること
  6. ページ変更後にスクロール位置が先頭に戻ること
- **注意**: タップターゲット 44px 以上を維持する（`min-height: 44px`）。`useWords` フックの Phase 3 実装内容によって `page`・`totalPages` の取得方法が異なるため、既存実装を確認してから変更する。

---

### T11: .env.example（新規）

- **ファイル**: `.env.example`（新規）
- **やること**:
  ```dotenv
  # WARNING: Do not commit actual credentials to source control.
  # These are LOCAL DEVELOPMENT DEFAULTS ONLY.
  # In production, set strong and unique values for ADMIN_USER and ADMIN_PASS.
  # Basic auth credentials are transmitted in plaintext — always use HTTPS in production.
  ADMIN_USER=admin
  ADMIN_PASS=changeme
  DB_PATH=data/learning.db
  ```
- **検証**:
  - ファイルが存在し、3 つの変数と警告コメントが記載されていること
  - `.gitignore` に `.env` が含まれ、`.env.example` は除外されていないことを確認
- **注意**: `.env.example` はリポジトリに含める（開発者向けドキュメントとして機能）。`ADMIN_PASS` の実際の値は絶対にソースコードにハードコードしない。

---

---

### T12: word_set_id 連携仕様変更 (変更)

- **ファイル**: `src/shared/types.ts`（変更）, `src/server/schemas/wordInput.ts`（変更）, `src/server/repositories/adminWordRepository.ts`（変更）, `src/server/routes/admin.ts`（変更）
- **やること**:
  - `Word` 型に `word_set_id` を追加。
  - `WordInputSchema` に `word_set_id: z.number().int().positive()` を追加。
  - `AdminWordRepository` の `create` および `update` で `word_set_id` を SQL クエリに含める。
  - `admin.ts` のポストおよびプットルートで `word_set_id` を正しく引き渡す。
- **検証**: `yarn typecheck` でエラーがないこと。

---

### T13: AdminPage UI刷新・フィルタ追加 (変更)

- **ファイル**: `src/client/pages/AdminPage.tsx`（変更）, `src/client/pages/AdminPage.module.css`（変更）
- **やること**:
  - 新規作成、インライン編集の各フォームに「単語セット」を選択するセレクトボックス（1: Basic, 2: Intermediate, 3: Advanced）を追加。
  - 単語一覧の上に、単語セットによるフィルタリングができるようにする選択コントロール（タブまたはセレクトボックス）を追加。
  - UIデザインがダサいのを改善し、レスポンシブではみ出さないプレミアムデザイン（適切なパディング、モダンな影、ピンクアクセント、伸縮可能な入力フィールド）に改修する。
- **検証**: 画面幅320pxの極小デバイスからデスクトップまでレイアウトが崩れず、はみ出しがないこと。

---

## 6. Done の定義（受け入れ基準チェックリスト）

### admin.md — AC1〜AC7（管理機能）

- [ ] **AC1**: ユーザー選択画面（/users）のフッター領域に、管理画面（/admin）へのリンクが配置されていること
- [ ] **AC1**: 動線リンクが言語トグル（vi/ja）の選択に追従して切り替わること
- [ ] **AC1**: `/admin` にアクセスすると認証フォームが表示される
- [ ] **AC1**: 正しい credentials を入力すると管理画面（単語一覧）が表示される
- [ ] **AC1**: 誤った credentials では 401 が返り、認証フォームが再表示される

- [ ] **AC2**: 管理画面に現在登録されている全単語の一覧が表示される
- [ ] **AC2**: 各行に英単語・学習ステータス・編集ボタン・削除ボタンが表示される
- [ ] **AC3**: [+ 新しい単語を追加] をタップするとフォームが展開される
- [ ] **AC3**: english / vietnamese / japanese が未入力のまま保存するとエラーメッセージが表示される
- [ ] **AC3**: 新しい単語を追加する際に「単語セット (ランク)」を選択できること
- [ ] **AC4**: 全必須項目入力 → [保存する] で `POST /api/admin/words` が実行され、単語一覧の先頭に追加される
- [ ] **AC5**: [✏️] でインライン編集フォームが表示され、[更新する] で `PUT /api/admin/words/:id` が実行され一覧が即時更新される
- [ ] **AC5**: 編集時に単語セット（ランク）を変更可能で、保存後に反映されること
- [ ] **AC6**: [🗑] で確認ダイアログが表示され、[削除する] で `DELETE /api/admin/words/:id` が実行され一覧から消える
- [ ] **AC6**: [キャンセル] で削除されないこと
- [ ] **AC6**: 削除後に `learning_progress` レコードが CASCADE 削除されていること
- [ ] **AC7**: 一覧画面で「Basic」「Intermediate」「Advanced」「すべて」のフィルタ絞り込みが正常に動作すること
- [ ] **AC7**: 各種フォームやダイアログがスマホの画面幅からはみ出さず、レスポンシブ対応された美しく洗練されたデザイン（プレミアムデザイン）であること
- [ ] **AC8**: 管理画面上部に LanguageToggle が追加され、ベトナム語/日本語の表示切り替えが正しく機能すること
- [ ] **AC8**: 編集フォーム内の「更新」ボタンと「キャンセル」ボタンが 1:1 の同一比率（等幅）で左右対称に表示されること


### word-list.md — AC5（ページネーション）

- [ ] **AC5**: [次へ>] で次の10件が表示される
- [ ] **AC5**: [< 前へ] で前の10件に戻れる
- [ ] **AC5**: 「X / Y ページ」形式でページ番号が表示される

### phase-4.md の完了条件（固有）

- [ ] 環境変数 `ADMIN_USER` / `ADMIN_PASS` が設定されていない場合はデフォルト値（admin / changeme）で動作する
- [ ] `.env.example` に本番環境での変更を促す警告コメントが記載されている

### コード品質

- [ ] `bun run typecheck`（`tsc --noEmit`）がエラーなしで通る
- [ ] `any` 型を使用していない（全 `src/server/` および `src/client/` ファイル）
- [ ] `src/server/usecases/adminWord.ts` に `hono` / `bun:sqlite` の import がない
- [ ] `src/server/domain/adminWord.ts` にサードパーティフレームワーク of import がない
- [ ] `src/server/repositories/adminWordRepository.ts` に HTTP 関連の import がない
- [ ] Presentation 層（admin.ts）にビジネスロジックを直接記述していない（UseCase 経由のみ）
- [ ] AdminPage のボタン類のタップターゲットが 44px 以上
- [ ] ページネーションボタンのタップターゲットが 44px 以上

