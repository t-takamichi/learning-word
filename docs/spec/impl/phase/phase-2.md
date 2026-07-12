# Phase 2: フラッシュカード完成

## ゴール（このフェーズ完了時に動くもの）

- Good / Again ボタンをタップすると学習記録が保存され、次のカードに進む
- 言語トグルで翻訳表示を 🇻🇳 / 🇯🇵 に切り替えられる
- セッション進捗（例: 「3 / 10」）が表示される
- 10問すべて回答するとセッション完了画面が表示され、「もう一度」で再開できる
- 学習ステータス（new/weak/mastered）がDBに正しく記録される

---

## 対応する設計

- [フラッシュカード機能](../../design/flashcard.md)

---

## スコープ（このフェーズでやること）

| 層 | 実装項目 |
|----|---------|
| **Domain** | `ReviewResult` Value Object（good/again）, ステータス遷移ロジック（`new→weak→mastered` ルール） |
| **Infrastructure** | `src/server/repositories/reviewRepository.ts` — `learning_progress` UPSERT（status・review_count・incorrect_count 更新） |
| **Application** | `src/server/usecases/submitReview.ts` — `SubmitReviewUseCase`（ステータス遷移 + learning_progress 更新） |
| **Presentation** | `src/server/routes/review.ts` — `POST /api/review` ハンドラ（zValidator でスキーマ検証） |
| **Frontend** | `FlashCard.tsx` 更新 — 裏面（翻訳・例文）表示ロジック追加, Good/Again ボタンコンポーネント, `LanguageToggle/LanguageToggle.tsx` — 🇻🇳 / 🇯🇵 トグル + `body[data-lang]` CSS制御, `useSession.ts` 更新 — `currentIndex`, `isAnswerVisible`, `isComplete` 状態管理, セッション進捗表示（StudyPage に「N / 10」表示）, セッション完了画面（「セッション完了！」＋「もう一度」ボタン） |

---

## スコープ外（このフェーズでやらないこと）

- 単語リスト表示（Phase 3）
- 自動再生モード（Phase 3）
- 管理画面（Phase 4）
- ページネーション（Phase 4）

---

## 依存フェーズ

- Phase 1（Walking Skeleton）— `shared/types.ts`, `db.ts`, `GET /api/session`, FlashCard 表面が必須

---

## 完了条件（Doneの定義）

- [ ] FlashCard 表面で「答えを表示」をタップすると裏面（翻訳・例文）が表示される
- [ ] 🇻🇳 / 🇯🇵 トグルを切り替えると翻訳・例文訳が即座に切り替わる（APIコールなし）
- [ ] `POST /api/review { wordId, result: 'good' }` が `{ ok: true }` を返す
- [ ] `POST /api/review { wordId, result: 'again' }` が `{ ok: true }` を返す
- [ ] Good を累計3回以上（incorrect=0）記録した単語の status が `mastered` になる
- [ ] Again を記録した単語の status が `weak` になる
- [ ] セッション進捗「3 / 10」形式が表示される
- [ ] 10問回答後にセッション完了画面が表示される
- [ ] 「もう一度」ボタンで新しいセッションが開始される
- [ ] フラッシュカード設計書の AC1〜AC7 を全て満たす
- [ ] TypeScript コンパイルエラーがない

---

## 想定リスク

| リスク | 優先度 | 対策 |
|--------|--------|------|
| R3: iPhone サイレントスイッチで音無し | 中×高 | 「音が出ない場合はサイレントモードをOFFに」のUI説明をカード画面に常時表示 |
| R9: Bun SQLite API の変更 | 低×低 | `db.ts` の抽象レイヤーで変更影響を1ファイルに閉じ込める（Phase 1 で実施済み） |
