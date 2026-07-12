# Phase 5: 単語自動入力（辞書引き）

## ゴール（このフェーズ完了時に動くもの）

- 管理画面で単語を追加・編集する際、英単語フォームに入力し始めると、サーバー側の辞書から候補がオートコンプリート（サジェスト）される。
- 候補を選択するか、英単語フォームに辞書内の単語が入力された（完全一致した）時、ベトナム語訳、日本語訳、例文（英語・越・日）が自動的に入力フィールドに反映される。

---

## 対応する設計

- [管理機能](../../design/admin.md) (自動プレフィル部分)
- [アーキテクチャ設計](../../design/architecture.md) (辞書テーブル・API部分)

---

## スコープ（このフェーズでやること）

| 層 | 実装項目 |
|----|---------|
| **Domain** | `DictionaryWord` 型定義 (`src/shared/types.ts`) |
| **Infrastructure** | SQLiteスキーマ更新 (`db/schema.sql`) で `dictionary_words` テーブルとインデックスを追加。辞書データシードの実装 (`src/server/db.ts`) とシードデータ作成 (`db/dictionary_seed.json`)。`DictionaryRepository` の作成。 |
| **Application** | `src/server/usecases/dictionary.ts` — `SearchDictionaryUseCase`, `LookupDictionaryUseCase` |
| **Presentation** | `src/server/routes/admin.ts` に `GET /dictionary/search` と `GET /dictionary/lookup` エンドポイントを追加。 |
| **Frontend** | `src/client/pages/AdminPage.tsx` の追加/編集フォームを更新し、英単語入力にサジェスト用 `<datalist>` を追加。入力された値が候補と一致した際、または候補選択のタイミングで自動でAPIを呼び出し、他の空の入力項目（または全て）を自動プレフィルする。 |

---

## スコープ外（このフェーズでやらないこと）

- 管理画面以外での辞書検索UIの提供（Won't have）
- 管理者が辞書データ自体を編集・更新する機能（Won't have）
- 外部の翻訳API（Google Cloud Translation等）の直接呼び出し（オフライン/サーバー内保持要件のため）

---

## 依存フェーズ

- Phase 4（管理機能）— `/admin` ルートとBasic認証、単語CRUDがすでに実装されていること

---

## 完了条件（Doneの定義）

- [ ] SQLiteの `dictionary_words` テーブルが作成され、初期辞書データが正しくシードされていること
- [ ] `GET /api/admin/dictionary/search?q=...` APIで前方一致で最大10件の英単語候補が返ってくること
- [ ] `GET /api/admin/dictionary/lookup?english=...` APIで英単語の対訳と例文が正しく返ってくること
- [ ] 管理画面の単語追加/編集フォームの英単語入力で、文字を入力すると候補がサジェストされること
- [ ] 候補から選択、または辞書に存在する単語と完全一致したタイミングで、他のフィールド（ベトナム語、日本語、例文等）が自動プレフィルされること
- [ ] TypeScript コンパイルエラーがないこと

---

## 想定リスク

| リスク | 優先度 | 対策 |
|--------|--------|------|
| R9: 辞書データインポート時のサーバー起動遅延 | 低×低 | インデックス作成を徹底し、SQLiteへのデータロードをトランザクションで行うことでミリ秒単位で完了させる。 |
| R10: フロントエンドでのプレフィル時にユーザーの既存入力を誤って破壊する | 中×中 | フォームの英単語を変更した際、既存の他の入力値（訳や例文）が空の場合にのみプレフィルするか、あるいは自動入力時にユーザーに何らかのフィードバックを与える設計にする。 |
