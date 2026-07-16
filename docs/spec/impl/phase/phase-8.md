# Phase 8: 一般ユーザーによる単語セットCRUD

## ゴール（このフェーズ完了時に動くもの）
- ログイン済みの一般ユーザーが、自分専用の単語セット（名前・レベルタグ〔basic/intermediate/advancedから必須選択〕・説明）を作成できる。
- 自分が作成したセットのみ、セット一覧に「自分専用」バッジと編集・削除ボタンが表示される。
- 自分のセットを削除すると、そのセットに属する自分の単語もCASCADEで削除される。

## 対応する設計
- [一般ユーザーによる単語・単語セット登録](../../design/user-word-management.md)

## スコープ（このフェーズでやること）

| 層 | 実装項目 |
|----|---------|
| Domain | `domain/userWordSet.ts`（`IUserWordSetRepository`: `create` / `update` / `delete`）新設 |
| Infrastructure | `repositories/userWordSetRepository.ts` 新設（所有権チェックをSQLの`WHERE`句に含める）。`schemas/wordSetInput.ts`（`WordSetInputSchema` / `WordSetPartialInputSchema`）新設 |
| Application | `usecases/userWordSet.ts`（`CreateUserWordSetUseCase` / `UpdateUserWordSetUseCase` / `DeleteUserWordSetUseCase`）新設 |
| Presentation | `routes/wordSets.ts` に `POST /` / `PUT /:id` / `DELETE /:id` ハンドラを追加 |
| Frontend | セット作成フォーム（名前・レベルタグ選択・説明）。単語セット一覧に「自分専用」バッジ・編集/削除ボタンを `created_by === activeUserId` の場合のみ表示 |

## スコープ外（このフェーズでやらないこと）
- セット一覧への登録済み単語数表示（Phase 10、Could have）
- 単語セットあたりの登録件数上限（Phase 10、Could have）

## 依存フェーズ
- Phase 6（`word_sets.created_by` カラムと可視性フィルタが前提）
- Phase 7 とは独立に並行実施可能（対象テーブルが異なるため）

## 完了条件（Doneの定義）
- [ ] `POST /api/word-sets` でセットを作成すると `created_by` が自分の `userId` になること
- [ ] `level_tag` が `basic`/`intermediate`/`advanced` 以外の値だとバリデーションエラーになること
- [ ] 自分が作成したセットのみ「自分専用」バッジと編集・削除ボタンが表示されること
- [ ] 自分のセットを削除すると、配下の自分の単語も削除されること（CASCADE、DBのFK制約で自動的に達成される）
- [ ] 他ユーザーが作成したセットのIDを直接指定して `PUT`/`DELETE` を実行すると404が返ること
- [ ] 既存の共有3セット（`created_by IS NULL`）がマイグレーション後も変化しないこと
- [ ] [user-word-management.md](../../design/user-word-management.md) の AC8〜AC11 を満たす

## 想定リスク
- R12: `created_by` の参照アクションを `ON DELETE CASCADE` にした設計判断が正しく実装されていること（`SET NULL`にすると情報漏洩になる）
- R15: 所有者不一致は404で統一する
