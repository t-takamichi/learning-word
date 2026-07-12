# Phase 1: Walking Skeleton

## ゴール（このフェーズ完了時に動くもの）

- Bun + Hono + React + Vite が起動し、ブラウザからアクセスできる
- `GET /api/session` が SQLite から単語10件を返す
- React で FlashCard の表面（英語のみ）が表示される
- 🔊 ボタンをタップすると英語音声が再生される（iOS Safari で動作確認済み）
- 高×高リスク（R1/R2: iOS Web Speech API）の技術スパイクが完了する

---

## 対応する設計

- [アーキテクチャ](../../design/architecture.md)
- [フラッシュカード機能](../../design/flashcard.md)（表面・音声再生部分）

---

## スコープ（このフェーズでやること）

| 層 | 実装項目 |
|----|---------|
| **共通基盤** | `package.json` (Bun + Hono + React + Vite + TypeScript), `vite.config.ts`, `tsconfig.json`, `index.html` |
| **Domain** | `src/shared/types.ts` — `Word`, `LearningProgress`, `WordWithProgress`, `ReviewInput`, `WordInput` |
| **Infrastructure** | `db/schema.sql` — words / learning_progress テーブル定義（WALモード設定含む）, `db/seed.json` — 初期単語データ（10件）, `src/server/db.ts` — Bun SQLite 接続・初期化・WAL設定 |
| **Application** | `src/server/usecases/getSession.ts` — `GetSessionUseCase`（優先4問+通常6問クエリ） |
| **Presentation** | `src/server/routes/session.ts` — `GET /api/session` ハンドラ, `src/server/index.ts` — Hono アプリ本体・静的ファイル配信 |
| **Frontend** | `src/client/main.tsx` — React エントリポイント, `src/client/App.tsx` — アプリルート, `src/client/pages/StudyPage.tsx` — 学習ページ（FlashCard 埋め込み）, `src/client/components/FlashCard/FlashCard.tsx` + `FlashCard.module.css` — 英語表面のみ表示, `src/client/components/AudioButton/AudioButton.tsx` — 音声再生ボタン, `src/client/hooks/useSpeech.ts` — Web Speech API ラッパー, `src/client/hooks/useSession.ts` — セッションデータ取得 (GET /api/session) |

---

## スコープ外（このフェーズでやらないこと）

- Good / Again ボタン（Phase 2）
- カード裏面（翻訳・例文）表示（Phase 2）
- 言語トグル（Phase 2）
- セッション進捗表示（Phase 2）
- 単語リスト（Phase 3）
- 管理画面（Phase 4）

---

## 依存フェーズ

なし（最初のフェーズ）

---

## 完了条件（Doneの定義）

- [ ] `bun run dev` でフロントエンド + バックエンドが起動する
- [ ] ブラウザから `http://localhost:3000` にアクセスして FlashCard が表示される
- [ ] `GET /api/session` が JSON で Word[] 10件を返す（curlで確認可能）
- [ ] SQLite に `words` テーブルと `learning_progress` テーブルが作成される
- [ ] シードデータ（seed.json）から単語が投入される
- [ ] FlashCard に英単語が表示される
- [ ] 🔊 ボタンをタップすると英語音声が再生される
- [ ] **iOS Safari で音声再生が動作する**（技術スパイク合格基準: 3回以上連続正常動作）
- [ ] TypeScript コンパイルエラーがない（`bun run typecheck`）
- [ ] `shared/types.ts` の型が server / client 両方で import できる

---

## 想定リスク

| リスク | 優先度 | 対策 |
|--------|--------|------|
| **R1: iOS Web Speech API 自動再生不可** | 高×高 | AudioButton のタップイベント内で `speechSynthesis.speak()` を実行（ユーザーアクション起点を保証） |
| **R2: Safari で speak() が途中停止 / 多重再生** | 高×高 | `speak()` 前の `cancel()` は**再生中・保留中のときだけ**実行する（`synth.speaking \|\| synth.pending` を条件に）。無条件 `cancel()` は Chrome/デスクトップ Safari で直後の `speak()` を握り潰すため禁止。`useSpeech` フックに組み込む |
| **R2-b: Chrome/Safari で英語音声が無音** | 高×高 | `voiceschanged` を購読して voice リストを事前ウォームアップし、`en-US` の voice を明示選択する。`speak()` 直後に `synth.resume()` を呼び Chrome の stuck 状態を解除する |
| R6: `100vh` がiOSで意図どおりにならない | 中×高 | FlashCard の高さには `100dvh` + フォールバック `-webkit-fill-available` を使用 |
