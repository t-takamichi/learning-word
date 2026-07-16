# Phase 6 実装計画書: DB基盤（role/created_by追加）＋ 可視性フィルタ

## 1. 参照

- フェーズ定義: [phase-6.md](../../phase/phase-6.md)
- 設計（一般ユーザー単語管理）: [user-word-management.md](../../design/user-word-management.md)
- 設計（アーキテクチャ）: [architecture.md](../../../design/architecture.md)

---

## 2. このフェーズのゴール

- サーバー起動時に、自前のマイグレーション関数 `migrateColumns()` により、既存データを一切破壊せずに `users.role` / `word_sets.created_by` / `words.created_by` カラムが追記（`ALTER TABLE`）されること。
- 各種読み取りAPI（`GET /api/words`, `GET /api/word-sets`, `GET /api/session`）が、全ユーザー共有データ（`created_by IS NULL`）と自分専用データ（`created_by = 自分のuserId`）のみを返すように可視性フィルタが機能すること。
- 他ユーザーのプライベートな単語・単語セットが混入しないセキュリティ境界線が引かれていること。

---

## 3. 前提・依存

- **依存フェーズ**: Phase 3（単語リスト表示）および Phase 4（管理機能）が実装完了していること。
- **安全ガードレール**: 既存の `users` / `words` / `word_sets` のデータを誤って物理削除（`DELETE FROM`）しないよう、マイグレーションコードを厳密に実装・検証する。

---

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 |
|----|------------------|------|----|---------|
| **T6.1** | `src/shared/types.ts` | 共有型定義に `created_by` プロパティを追加 | 共通 | `bun run typecheck` でコンパイルが通ること |
| **T6.2** | `src/server/db.ts` | `migrateColumns()` で `users.role`、`word_sets.created_by`、`words.created_by` の追記マイグレーションを実行 | Infrastructure | サーバー起動後、SQLiteのスキーマを確認しカラムが追加されていること。既存データ（行・PIN）が破損していないこと |
| **T6.3** | `src/server/repositories/wordRepository.ts` | `getWords()`, `getSession()` クエリに `(created_by IS NULL OR created_by = ?)` 可視性フィルタを追加 | Infrastructure | テストデータ投入による他ユーザーデータの除外確認 |
| **T6.4** | `src/server/repositories/wordSetRepository.ts` | `getWordSetsForUser()` クエリに `(created_by IS NULL OR created_by = ?)` 可視性フィルタを追加 | Infrastructure | テストデータ投入による他ユーザーデータの除外確認 |
| **T6.5** | `src/server/usecases/` | `GetWordsUseCase` / `GetSessionUseCase` からリポジトリへ `userId` を伝搬させるよう調整 | Application | `bun run typecheck` 合格 |
| **T6.6** | `src/server/routes/` | APIエンドポイントから認証済み `userId` をユースケースに正しく渡すよう配線 | Presentation | `GET` エンドポイントが200を返し、フィルタされたデータが返却されること |

---

## 5. 各タスク詳細

### T6.1: 共有型の更新
- **ファイル**: `src/shared/types.ts`
- **内容**:
  `Word`, `WordWithProgress`, `WordSet` の型定義に `created_by?: number | null` を追加する。

### T6.2: `db.ts` マイグレーションスクリプトの更新
- **ファイル**: `src/server/db.ts`
- **内容**:
  `migrateColumns()` 内で、既存 of `users.role`、`word_sets.created_by`、`words.created_by` のカラム存在チェックを行う。
  カラムが存在しない場合は、それぞれ以下の SQL を実行する。
  - `ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`
  - `ALTER TABLE word_sets ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE CASCADE`
  - `ALTER TABLE words ADD COLUMN created_by INTEGER REFERENCES users(id) ON DELETE CASCADE`
  ※ `migrateColumns()` 内で **`DELETE FROM` を絶対に呼び出さない**。

### T6.3: `WordRepository` 可視性フィルタの実装
- **ファイル**: `src/server/repositories/wordRepository.ts`
- **内容**:
  `getWords(wordSetId, userId)` / `getSession(userId)` などのクエリを修正。
  `WHERE` 句に `AND (created_by IS NULL OR created_by = ?)` を追加し、管理者データ（NULL）と自ユーザーデータのみを返す。

### T6.4: `WordSetRepository` 可視性フィルタの実装
- **ファイル**: `src/server/repositories/wordSetRepository.ts`
- **内容**:
  `getWordSetsForUser(userId)` (またはそれに類するメソッド) のクエリを修正。
  `WHERE` 句に `(created_by IS NULL OR created_by = ?)` を追加する。

### T6.5 & T6.6: UseCase と Route の調整
- **ファイル**: `src/server/usecases/*`, `src/server/routes/*`
- **内容**:
  認証ミドルウェアから取得した `userId` を各UseCase、Repositoryへと正しくリレーする。

---

## 6. 受け入れ基準（Doneの定義）

*   **AC1 (データ非破壊)**: マイグレーション実行後、既存のユーザー（ID、名前、PIN）や管理者登録単語が一切消失・破損しないこと。
*   **AC2 (単語可視性)**: `activeUserId` を指定して `GET /api/words` を呼び出した際、`created_by` が NULL または `activeUserId` に一致する単語のみが取得され、他人の単語は1件も含まれないこと。
*   **AC3 (セット可視性)**: `GET /api/word-sets` 呼び出し時、`created_by` が NULL または `activeUserId` に一致するセットのみが取得されること。
*   **AC4 (セッション可視性)**: フラッシュカード用セッション (`GET /api/session`) においても、他ユーザーの自分専用単語が出題されないこと（優先枠・通常枠の両方のSQLにフィルタが入っていること）。
