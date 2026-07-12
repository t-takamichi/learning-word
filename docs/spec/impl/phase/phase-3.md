# Phase 3: 単語リスト + 自動再生

## ゴール（このフェーズ完了時に動くもの）

- StudyPage に単語リスト（10件、縦スクロール）が表示される
- 各カードに英単語（漢字）・読み仮名（ひらがな）・漢越音・学習ステータスバッジ・翻訳・例文・音声ボタン・メモ欄・登録日が表示される
- 単語リストの表示/非表示を切り替える `Danh sách từ` トグルスイッチが動作する
- 最下部に「Luyện tập (練習する)」ボタンが配置され、タップするとフラッシュカード学習が起動する
- Auto-Play トグルをONにすると、カードが自動めくりで音声付きで流れる
- Auto-Play 中にOFFにすると即座に停止し手動操作に戻る

---

## 対応する設計

- [単語リスト機能](../../design/word-list.md)
- [フラッシュカード機能](../../design/flashcard.md)（自動再生モード部分）

---

## スコープ（このフェーズでやること）

| 層 | 実装項目 |
|---|---|
| **Domain** | `WordWithProgress` 型（`shared/types.ts` に定義済み。必要に応じて漢越音やメモ、登録日付フィールドなどを追加） |
| **Infrastructure** | `src/server/repositories/wordRepository.ts` 更新 — `getWords(page, limit)` (words LEFT JOIN learning_progress + LIMIT/OFFSET + total件数カウント)。メモの保存処理（UPSERT）の追加。 |
| **Application** | `src/server/usecases/getWords.ts` — `GetWordsUseCase`（ページ/リミット引数を受け取り WordsResponse を返す）、およびメモ更新UseCase。 |
| **Presentation** | `src/server/routes/words.ts` — `GET /api/words?page&limit` ハンドラ、およびメモ保存 API。 |
| **Frontend** | `src/client/components/WordList/WordList.tsx` — `Danh sách từ` トグルスイッチ、および「Luyện tập (練習する)」ボタンの実装。`src/client/components/WordList/WordListItem.tsx` — 漢字・ひらがな・漢越音・ベトナム語訳・例文（日ベトナム両対応）・メモ入力欄・保存ボタン・日付の表示。`StudyPage.tsx` 更新 — リストトグル状態および学習ランチャー動作。 |

---

## スコープ外（このフェーズでやらないこと）

- ページネーションUI（Phase 4）— API 側は `page/limit` 対応済みだが UI の「次へ/前へ」は Phase 4
- 管理画面（Phase 4）

---

## 依存フェーズ

- Phase 2（フラッシュカード完成）— `useSession`, FlashCard 裏面、AudioButton、useSpeech が必須

---

## 完了条件（Doneの定義）

- [ ] `GET /api/words?page=1&limit=10` が `{ words: WordWithProgress[], total, page, limit, totalPages }` を返す
- [ ] StudyPage に単語リストが縦スクロールで表示される（最大10件）
- [ ] 各カードに英単語・ステータスバッジ（new黄/weak赤/mastered緑）・翻訳・例文が表示される
- [ ] 言語トグルで単語リスト内の翻訳も即座に切り替わる（APIコールなし）
- [ ] 単語リスト内の 🔊 ボタンで音声再生できる
- [ ] Auto-Play トグルをONにすると自動進行が始まる（音声→3s→裏面→4s→次カード）
- [ ] Auto-Play 中にOFFにすると即座に停止する
- [ ] 単語リスト設計書の AC1〜AC7 を全て満たす
- [ ] フラッシュカード設計書の AC8〜AC10 を全て満たす
- [ ] TypeScript コンパイルエラーがない

---

## 想定リスク

| リスク | 優先度 | 対策 |
|--------|--------|------|
| R1/R2: Auto-Play での iOS 連鎖 speak() 停止 | 高×高 | Phase 1 の技術スパイクで対策済み（`onend` コールバックチェーン + 条件付き `synth.cancel()`。無条件 cancel は Chrome/Safari で無音になるため禁止） |
| R7: Web Speech API でベトナム語音声不可 | 低×中 | 今フェーズでは英語音声のみ実装。ベトナム語音声はスコープ外 |
