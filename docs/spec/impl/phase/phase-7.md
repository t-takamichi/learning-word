# Phase 7: 一般ユーザーによる単語CRUD

## ゴール（このフェーズ完了時に動くもの）
- ログイン済みの一般ユーザーが、既存の共有単語セット（basic/intermediate/advanced）に対して自分専用の単語を作成できる。
- 自分が作成した単語のみ、単語一覧に編集・削除ボタンが表示され、実際に編集・削除できる。
- 他ユーザーが作成した単語や管理者登録の単語（`created_by IS NULL`）に対する編集・削除操作は404で拒否される。

## 対応する設計
- [一般ユーザーによる単語・単語セット登録](../../design/user-word-management.md)

## スコープ（このフェーズでやること）

| 層 | 実装項目 |
|----|---------|
| Domain | `domain/userWord.ts`（`IUserWordRepository`: `create(userId, input)` / `update(userId, id, input)` / `delete(userId, id)`）新設 |
| Infrastructure | `repositories/userWordRepository.ts` 新設。`UPDATE`/`DELETE`のSQLに `WHERE id = ? AND created_by = ?` を含め、所有権チェックと更新/削除をアトミックに行う |
| Application | `usecases/userWord.ts`（`CreateUserWordUseCase` / `UpdateUserWordUseCase` / `DeleteUserWordUseCase`）新設。既存 `usecases/adminWord.ts` と対になる構成 |
| Presentation | `routes/words.ts` に `POST /` / `PUT /:id` / `DELETE /:id` ハンドラを追加。既存の `schemas/wordInput.ts`（`WordInputSchema` / `WordPartialInputSchema`）を再利用。`word_set_id` が自分から見えるセット（共有 or 自分専用）かを事前検証し、見えなければ400 |
| Frontend | ・**単語追加/編集フォーム**: Berryテーマ（角丸`--radius-btn`、フォーカス枠線、iOSズーム防止のフォントサイズ16px、ぷっくりした`--berry-500`背景の送信ボタン）に完全準拠した入力フォームの実装<br>・**編集・削除ボタン**: 単語リストの各項目に `created_by === activeUserId` の場合のみ、丸みのある控えめなアイコンボタンを表示<br>・**やさしい削除確認モーダル (`ConfirmModal`)**: マスコットからの「この単語と、おわかれする？」という問いかけと、「やっぱりいっしょにいる！」「バイバイする」の感情配慮ボタン<br>・**成功時のやさしいトースト**: 登録・編集成功時にマスコット🍓付きのやさしい応援トーストを表示 |

## スコープ外（このフェーズでやらないこと）
- 自分専用の単語セットの作成・編集・削除（Phase 8）
- 辞書オートコンプリートの一般ユーザー開放（Phase 9）
- 登録件数の上限チェック（Phase 10、Could have）

## 依存フェーズ
- Phase 6（`words.created_by` カラムと可視性フィルタが前提）

## 完了条件（Doneの定義）
- [ ] 自分が作成した単語のみ編集・削除ボタンが表示されること（管理者登録・他ユーザー作成の単語には表示されない）
- [ ] `POST /api/words` で単語を作成すると `created_by` が自分の `userId` になること
- [ ] 自分の単語に対する `PUT` / `DELETE` が成功すること
- [ ] 他ユーザーが作成した単語のIDを直接指定して `PUT`/`DELETE` を実行すると404が返り、対象データが変化しないこと
- [ ] 存在しない/見えない `word_set_id` を指定した場合に400が返ること
- [ ] [user-word-management.md](../../design/user-word-management.md) の AC1〜AC6 を満たす

## 想定リスク
- R14: 一般ユーザーが単語を無制限に登録し、DBサイズ・一覧表示パフォーマンスが悪化するリスク（本フェーズでは許容、Phase 10で上限導入を検討）
- R15: 所有者不一致を403で返すと他人のデータの存在を推測されうるため、404で統一する
