# Phase 5 実装計画書: 単語自動入力（辞書引き）

## 1. 参照

- フェーズ定義: [phase-5.md](../../phase/phase-5.md)
- 設計（管理機能）: [admin.md](../../../design/admin.md)
- 設計（アーキテクチャ）: [architecture.md](../../../design/architecture.md)

---

## 2. このフェーズのゴール

- 管理者が単語を追加または編集する際、英単語入力フィールドに文字を入力すると、サーバーの辞書データ（`dictionary_words`）から前方一致でマッチする単語がサジェスト表示される。
- 候補を選択するか、英単語が辞書と完全一致した時、他の空のフィールド（ベトナム語訳、日本語訳、例文、例文訳など）に、辞書の対訳および例文データが自動でプレフィルされる。

---

## 3. 前提・依存

- Phase 4 が完了していること（すでに /admin の基本機能が動作していること）。

---

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 |
|----|------------------|------|----|---------|
| T1 | `scripts/generate-dictionary-seed.ts` | 辞書データ生成スクリプト。実行して `db/dictionary_seed.json` を吐き出す。 | 環境・シード | スクリプト実行後、`db/dictionary_seed.json` に約300語以上の対訳・例文データが含まれていることを確認する。 |
| T2 | `db/schema.sql` (**変更**) | `dictionary_words` テーブルとインデックス（`idx_dictionary_words_english`）の定義を追加。 | Infrastructure | `yarn db:reset` 実行後、テーブルとインデックスが追加されていることをSQLiteで確認する。 |
| T3 | `src/server/db.ts` (**変更**) | `seedDictionaryIfEmpty` 関数の実装。 `dictionary_words` が空の際、 `db/dictionary_seed.json` からバルクインサートする。 | Infrastructure | アプリ起動時（または `reset-db.ts` 実行時）に辞書データが正しくSQLiteにロードされることを確認する。 |
| T4 | `src/shared/types.ts` (**変更**) | `DictionaryWord` の型定義の追加。 | 共通 | `tsc --noEmit` 通過。 |
| T5 | `src/server/domain/dictionary.ts` (新規), `src/server/repositories/dictionaryRepository.ts` (新規), `src/server/usecases/dictionary.ts` (新規) | 辞書リポジトリおよびユースケースの実装。 | Domain / Infra / Application | `tsc --noEmit` 通過。 |
| T6 | `src/server/routes/admin.ts` (**変更**) | `/dictionary/search` (前方一致検索) と `/dictionary/lookup` (完全一致ルックアップ) APIを追加。 | Presentation | `curl` でのAPIリクエスト確認。 |
| T7 | `src/client/hooks/useDictionary.ts` (新規) | 辞書APIにアクセスするための React Hook (TanStack Query) の実装。 | Frontend | `tsc --noEmit` 通過。 |
| T8 | `src/client/pages/AdminPage.tsx` (**変更**) | 英単語入力フォームに `<datalist>` を追加してオートコンプリート。選択/完全一致時の自動プレフィル処理（既存の入力がある場合は上書きしないなど）を実装。 | Frontend | ブラウザ上で英単語を入力して、候補選択時に対訳が自動入力されることを確認。 |

---

## 5. 各タスク詳細

### T1: 辞書データ生成スクリプトとシードファイル作成
- **ファイル**: `scripts/generate-dictionary-seed.ts`（新規）, `db/dictionary_seed.json`（生成物）
- **やること**: 
  - 日常英単語（基本〜中級レベル、約300語以上）を網羅した JS/TS オブジェクトを作成し、それを JSON ファイル `db/dictionary_seed.json` として書き出す。
  - 各単語には `english`, `vietnamese`, `japanese`, `example_en`, `example_vi`, `example_ja` を含める。
  - スクリプトを `npx tsx scripts/generate-dictionary-seed.ts` で実行可能にする。

### T2: SQLiteスキーマの更新
- **ファイル**: `db/schema.sql`（変更）
- **やること**: 
  ```sql
  CREATE TABLE IF NOT EXISTS dictionary_words (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    english     TEXT NOT NULL UNIQUE,
    vietnamese  TEXT NOT NULL,
    japanese    TEXT NOT NULL,
    example_en  TEXT,
    example_vi  TEXT,
    example_ja  TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_dictionary_words_english ON dictionary_words(english);
  ```

### T3: データベース初期化処理の変更
- **ファイル**: `src/server/db.ts`（変更）
- **やること**:
  - `createDatabase` メソッドで `seedDictionaryIfEmpty(db)` を呼び出すように変更。
  - `seedDictionaryIfEmpty` で `db/dictionary_seed.json` が存在するか確認し、存在する場合は `dictionary_words` テーブルにトランザクションを用いてバルクインサートする。

### T4: 共有型の更新
- **ファイル**: `src/shared/types.ts`（変更）
- **やること**: 
  `DictionaryWord` を定義して export する。
  ```typescript
  export type DictionaryWord = {
    id: number;
    english: string;
    vietnamese: string;
    japanese: string;
    example_en: string | null;
    example_vi: string | null;
    example_ja: string | null;
  };
  ```

### T5: Domain/Repository/Usecase 層の実商
- **ファイル**:
  - `src/server/domain/dictionary.ts` (新規) - `IDictionaryRepository` インターフェース定義。
  - `src/server/repositories/dictionaryRepository.ts` (新規) - SQLite を利用した `DictionaryRepository` の実装。前方一致検索 `search(q: string, limit?: number)` と完全一致取得 `findByEnglish(english: string)` を提供。
  - `src/server/usecases/dictionary.ts` (新規) - `SearchDictionaryUseCase`, `LookupDictionaryUseCase` を実装。

### T6: Hono API への組み込み
- **ファイル**: `src/server/routes/admin.ts`（変更）および `src/server/index.ts`（変更）
- **やること**:
  - `adminRoutes` に以下のエンドポイントを定義：
    - `GET /dictionary/search` (クエリ `q` から前方一致検索。最大10件)
    - `GET /dictionary/lookup` (クエリ `english` から完全一致取得)
  - `src/server/index.ts` にて、UseCase の DI 配線を追加。

### T7: フロントエンド用 API Hook の実装
- **ファイル**: `src/client/hooks/useDictionary.ts`（新規）
- **やること**:
  - `useDictionarySearch` (TanStack Query の `useQuery` を利用し、入力値 `q` が 1文字以上の場合に API を呼び出す)
  - `useDictionaryLookup` (特定の英単語の対訳情報を取得するための関数、または Query)

### T8: AdminPage UI のアップデート
- **ファイル**: `src/client/pages/AdminPage.tsx`（変更）
- **やること**:
  - 英単語入力フォーム `<input>` に `list="dictionary-suggestions"` を指定。
  - 入力値に基づいて `useDictionarySearch` を呼び出し、結果を `<datalist id="dictionary-suggestions">` の `<option>` として出力。
  - 英単語入力値が変更された際（`onChange`）、取得したサジェストリストと比較して完全一致するものがあるか、あるいは `datalist` から選択されたタイミングで `useDictionaryLookup` を経由して（あるいはすでに取得済みのサジェスト情報に含まれる場合はそれを利用して）対訳データを取得。
  - 取得した対訳データ（ベトナム語、日本語、例文等）をフォームの各 state にプレフィル。
  - プレフィルを行う際は、**ユーザーがすでに手動で入力している項目を上書きしない**ように空文字列（`""`）の場合のみプレフィルするか、あるいは「辞書から自動入力されました」というヒント/リセットUIを提供する。

---

## 6. 受け入れテストシナリオ

1. **初期データ構築確認**:
   - `yarn db:reset` を実行し、コンソールエラーがないこと。
   - `sqlite3 data/learning.db "SELECT COUNT(*) FROM dictionary_words"` でデータが正しく300件以上投入されていること。
2. **API確認**:
   - `/api/admin/dictionary/search?q=a` にアクセス（Basic認証情報付与）すると、`a` から始まる英単語リストが返ってくること。
   - `/api/admin/dictionary/lookup?english=apple` にアクセスすると、りんご（quả táo）の情報が取得できること。
3. **UI動作確認**:
   - 管理画面の「英単語」に `b` と入力した際、`banana` などの候補がブラウザのサジェストに表示されること。
   - サジェストから `banana` を選ぶ、もしくは `banana` と入力が完了した際、「ベトナム語訳」に `quả chuối`、「日本語訳」に `バナナ`、例文に `He peeled a banana.` などが自動的に入力されること。
   - 「日本語訳」にあらかじめ `ばなな` と自分で入力してから「英単語」を `banana` にした際、手動入力された `ばなな` は上書きされずに残ること（プレフィルの保護機能）。
