# Phase 6: DB基盤（role/created_by追加）＋ 可視性フィルタ

## ゴール（このフェーズ完了時に動くもの）
- サーバー起動時、`users.role` / `word_sets.created_by` / `words.created_by` が **追記のみ**（`ALTER TABLE ADD COLUMN`）でマイグレーションされ、既存の `users` / `words` / `word_sets` の行数・内容（`pin_hash` / `token` を含む）が一切変化しないこと。
- `GET /api/words`・`GET /api/word-sets`・`GET /api/session` が、共有データ（`created_by IS NULL`）と自分が作成したデータ（`created_by = 自分のuserId`）のみを返し、他ユーザーの専用データが混入しないこと。
- 作成・編集・削除APIはまだ存在しない（読み取り専用の土台のみ）。

## 対応する設計
- [一般ユーザーによる単語・単語セット登録](../../design/user-word-management.md)
- [アーキテクチャ](../../design/architecture.md)

## スコープ（このフェーズでやること）

| 層 | 実装項目 |
|----|---------|
| Domain | `Word` / `WordWithProgress` / `WordSet` 型に `created_by: number \| null` を追加（`shared/types.ts`、`repositories/wordSetRepository.ts`のWordSet型） |
| Infrastructure | `storage/db/schema.sql` に `role` / `created_by` 列を追記。`src/server/db.ts` の `migrateColumns()` に `users.role`・`word_sets.created_by`・`words.created_by` の存在チェック→追記ロジックを追加（**`DELETE FROM` は一切呼ばない**）。`WordRepository.getWords()` / `getSession()`、`WordSetRepository.getWordSetsForUser()` のSQLに `WHERE (created_by IS NULL OR created_by = ?)` を追加 |
| Application | `GetWordsUseCase` / `GetSessionUseCase` のシグネチャ変更なし（内部SQLの可視性フィルタのみ変更） |
| Presentation | 既存の `GET /api/words` / `GET /api/word-sets` / `GET /api/session` ハンドラは変更なし（返却内容が変わるのみ） |
| Frontend | `Word` / `WordSet` 型に `created_by` を追加（編集・削除ボタンの表示判定はPhase 7/8で使用するため型だけ先に用意） |

## スコープ外（このフェーズでやらないこと）
- 一般ユーザーによる単語・単語セットの作成・編集・削除API（Phase 7・Phase 8）
- 辞書オートコンプリートの一般ユーザー開放（Phase 9）
- フロントエンドの編集・削除ボタンUI表示（Phase 7・Phase 8）

## 依存フェーズ
- Phase 3（単語リスト表示）・Phase 4（管理機能CRUD）— 対象テーブル・リポジトリが実装済みであること

## 完了条件（Doneの定義）
- [ ] マイグレーション適用前後で `users` テーブルの行数・`pin_hash`・`token` が完全一致すること（回帰テストで確認）
- [ ] マイグレーション適用前後で `words` / `word_sets` テーブルの行数・内容が完全一致すること
- [ ] テストデータとして他ユーザー作成の単語・単語セットを投入し、`GET /api/words` / `GET /api/word-sets` / `GET /api/session` のいずれにも混入しないこと
- [ ] `GetSessionUseCase` の優先枠・通常枠の両方のSQLに可視性フィルタが入っていること
- [ ] [user-word-management.md](../../design/user-word-management.md) の AC7・AC11 を満たす

## 想定リスク
- R11: `migrateColumns()` 実装時に過去の `DELETE FROM` パターンを再発させ、既存ユーザー・既存データが消失するリスク（`docs/spec/design/risks.md`）
- R12: `created_by` の参照アクションを `ON DELETE SET NULL` にすると、アカウント削除時に非公開データが全ユーザーに公開されてしまうリスク → `ON DELETE CASCADE` を採用
- R13: `GET /api/session` のSQLに可視性フィルタを入れ忘れ、他ユーザーの自分専用単語が出題されてしまうリスク
