# Phase 4: 管理機能

## ゴール（このフェーズ完了時に動くもの）

- `/admin` にアクセスすると Basic 認証ダイアログが表示される
- 管理者が単語の追加・編集・削除をスマホから操作できる
- 単語リストのページネーション（「次へ / 前へ」）が動作する

---

## 対応する設計

- [管理機能](../../design/admin.md)
- [単語リスト機能](../../design/word-list.md)（ページネーション部分）

---

## スコープ（このフェーズでやること）

| 層 | 実装項目 |
|----|---------|
| **Domain** | `WordInput` 型（`shared/types.ts` に Phase 1 で定義済み）, `WordInputSchema` (Zod バリデーション) |
| **Infrastructure** | `src/server/repositories/adminWordRepository.ts` — `insert()`, `update()`, `delete()` (SQLite INSERT/UPDATE/DELETE + learning_progress CASCADE 削除) |
| **Application** | `src/server/usecases/adminWord.ts` — `CreateWordUseCase`, `UpdateWordUseCase`, `DeleteWordUseCase` |
| **Presentation** | `src/server/routes/admin.ts` — Basic認証ミドルウェア (`hono/basic-auth`), `GET /api/admin/words`, `POST /api/admin/words`, `PUT /api/admin/words/:id`, `DELETE /api/admin/words/:id`, zValidator によるスキーマ検証 |
| **Frontend** | `src/client/pages/AdminPage.tsx` — 管理画面ページ（単語追加フォーム + 一覧 + 編集/削除ボタン）, `App.tsx` 更新 — `/admin` ルート追加（React Router または条件分岐）, 単語リストのページネーション UI（`WordList.tsx` に「< 前へ」「次へ >」ボタン追加）|
| **環境** | `.env.example` — `ADMIN_USER`, `ADMIN_PASS` の設定例を記載 |

---

## スコープ外（このフェーズでやらないこと）

- ダークモード（Won't have）
- ユーザーアカウント・ログイン（Won't have）
- クラウド同期（Won't have）
- 完全 Anki SRS（Won't have）

---

## 依存フェーズ

- Phase 2（フラッシュカード完成）— `db.ts`, `shared/types.ts`, Hono アプリ構造が必須
- Phase 3（単語リスト + 自動再生）— `GET /api/words` (pagination API) が必須

---

## 完了条件（Doneの定義）

- [ ] `/admin` にアクセスすると Basic 認証ダイアログが表示される
- [ ] 正しい認証情報で管理画面が表示される
- [ ] 誤った認証情報で 401 が返り、再ダイアログが表示される
- [ ] 管理画面に全単語の一覧（英単語・ステータス・編集/削除ボタン）が表示される
- [ ] 単語追加フォームに必須項目（english/vietnamese/japanese）が未入力で保存するとエラー表示される
- [ ] 単語追加が成功し一覧の先頭に表示される（`POST /api/admin/words`）
- [ ] 編集ボタンでインライン編集フォームが表示され更新できる（`PUT /api/admin/words/:id`）
- [ ] 削除ボタンで確認ダイアログが表示され削除できる（`DELETE /api/admin/words/:id`）
- [ ] 削除後に `learning_progress` も CASCADE 削除されている
- [ ] 単語リストの「次へ / 前へ」ボタンでページネーションが動作する
- [ ] 管理機能設計書の AC1〜AC6 を全て満たす
- [ ] 単語リスト設計書の AC5 を満たす
- [ ] 環境変数 `ADMIN_USER` / `ADMIN_PASS` が設定されていない場合のデフォルト動作が確認できる
- [ ] TypeScript コンパイルエラーがない

---

## 想定リスク

| リスク | 優先度 | 対策 |
|--------|--------|------|
| R8: Basic 認証の資格情報が平文送信 | 中×低 | HTTPS前提（本番はリバースプロキシでTLS終端）。`.env.example` に注意書きを記載 |
| R5: スコープクリープ（追加要求） | 中×高 | Won't have を設計書で明示。追加要求は次バージョンへ積む |
