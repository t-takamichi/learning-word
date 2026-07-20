# Learning Word

英単語（英語 → ベトナム語 / 日本語）のフラッシュカード学習アプリ。iPhone Safari を主対象に、Chrome / Firefox でも動作する。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Frontend | React + TypeScript + Vite（`dist/client` に静的ビルド） |
| Backend | Hono + `@hono/node-server`（**Node.js** ランタイム、`tsx` で実行） |
| DB | SQLite（Node.js 標準の `node:sqlite`、ファイルは `storage/data/learning.db`） |
| 音声合成 | Piper TTS（ローカルプロセス起動、`/api/tts` でストリーミング配信） |
| 管理画面認証 | Basic認証（`hono/basic-auth`） |

> **注記**: `docs/spec/design/architecture.md` には Bun ランタイム前提の記載があるが、実装は Node.js（`@hono/node-server` + `tsx` + `node:sqlite`）で行われている。本READMEは実装の実態に合わせている。
>
> `node:sqlite` は Node.js の実験的機能（`ExperimentalWarning` が出力される）。動作確認済みバージョン: Node.js v25。**Node.js 22.5 以上が必須**（`node:sqlite` が導入されたバージョン）。

## ディレクトリ構成（抜粋）

```
learning-word/
├── src/
│   ├── client/       # React フロントエンド
│   ├── server/        # Hono バックエンド（routes/usecases/repositories/services）
│   └── shared/         # フロント・バック共有の型定義
├── storage/              # 実行時データ・DBソースをまとめた親ディレクトリ
│   ├── db/                    # マイグレーション・シードデータ（git管理対象）
│   │   ├── migrations/           # 番号付きマイグレーションSQL（未適用分を起動時に順次適用）
│   │   │   └── 0001_baseline.sql   # ベースラインスキーマ
│   │   ├── seed.json              # 単語セットの初期データ（初回起動時に自動投入）
│   │   └── dictionary_seed.json   # 辞書オートコンプリート用データ（初回起動時に自動投入）
│   ├── data/                  # 実行時生成物（.gitignore 対象）
│   │   ├── learning.db           # SQLiteファイル本体
│   │   └── voices/               # Piper音声モデル（setup:piper で取得）
│   └── bin/                   # Piperスタンドアロンバイナリ（setup:piper で取得、.gitignore 対象）
├── scripts/
│   ├── setup-piper.sh          # Piper TTSの実行環境をセットアップ
│   ├── migrate.ts              # 未適用マイグレーションの適用（データ保持）
│   ├── reset-db.ts             # DBリセット（全消し→再構築）
│   └── generate-dictionary-seed.ts
└── docs/spec/                # 設計・実装計画ドキュメント
```

## セットアップ（開発環境）

```bash
yarn install
cp .env.example .env      # 値は必要に応じて編集
yarn setup:piper          # 初回のみ: Piper TTSバイナリ・音声モデルをダウンロード
yarn dev                  # サーバー(3001) + Vite(5173, /api は3001へproxy) を同時起動
```

## ビルド・本番起動

```bash
yarn build   # vite build → dist/client に静的ファイル出力
yarn start   # tsx src/server/index.ts（3001番ポートでAPI+静的ファイルを配信）
```

Hono サーバーが `dist/client` を静的配信し、API (`/api/*`) も同一プロセス・同一オリジンで提供する（フロント/バック間のCORS設定は不要）。

## 環境変数

`.env.example` を参照。

| 変数 | 必須 | デフォルト | 説明 |
|------|:---:|-----------|------|
| `ADMIN_USER` | 本番は必須 | `admin` | 管理画面（`/api/admin/*`）のBasic認証ユーザー名 |
| `ADMIN_PASS` | 本番は必須 | `changeme` | 管理画面のBasic認証パスワード。**デフォルト値のまま本番公開しないこと** |
| `DB_PATH` | 任意 | `storage/data/learning.db` | SQLiteファイルパス |
| `PIPER_BIN_PATH` | 任意 | `storage/bin/piper/piper` | Piper実行バイナリのパス（未設定時は自動検出パスを使用） |
| `PIPER_MODEL_PATH` | 任意 | `storage/data/voices/en_US-ljspeech-medium.onnx` | Piper音声モデルのパス |

サーバーのリッスンポートは `src/server/index.ts` に `3001` でハードコードされており、環境変数化されていない（下記「リリース前の最小設定チェックリスト」参照）。

## データベース

- 起動時に `storage/db/migrations/` 配下の**未適用マイグレーションだけ**を番号順に適用する（適用済みバージョンは `schema_migrations` テーブルで管理）。既存データを消さずにスキーマを更新できる
- `word_sets` テーブルが空の場合のみ `storage/db/seed.json` を自動投入
- `dictionary_words` テーブルが空の場合のみ `storage/db/dictionary_seed.json` を自動投入
- WALモード有効（`PRAGMA journal_mode = WAL`）、外部キー制約有効（接続確立時に設定）
- `storage/data/` ディレクトリは `.gitignore` 対象。本番環境では永続ボリュームにマウントするか、デプロイ先で書き込み可能なパスを `DB_PATH` で指定すること

### マイグレーションの追加手順

1. `storage/db/migrations/` に `0002_<説明>.sql` のように**連番プレフィックス付き**のSQLファイルを作成する（既存ファイルは編集しない。追記のみ・べき等を推奨）
2. 各ファイルは1つのトランザクションで実行され、成功時に `schema_migrations` へ記録される。以降の起動・`yarn db:migrate` では未適用分だけが適用される
3. 本番デプロイ時は `yarn db:migrate`（データ保持したままスキーマ更新）を実行する。`yarn db:reset` は**全データを削除**して作り直すため、開発時のみ使用する
4. PRAGMA（`journal_mode` 等）はマイグレーションSQLに書かない（接続時に適用済み。`journal_mode` はトランザクション内で変更できない）

> マイグレーション導入前に作られた既存DB（`schema_migrations` を持たない）は、初回適用時に不足カラム（`role` / `created_by` 等）を自動追記してからベースラインを記録する後方互換処理が入る。

## Piper TTS（音声合成）

`/api/tts?text=...` が Piper プロセスを都度起動して音声(WAV)をストリーミング返却する。

- macOS: `python3 -m piper` が使えればそれを優先使用。なければスタンドアロンバイナリにフォールバック
- Linux: スタンドアロンバイナリ必須
- 必要アセット（`storage/bin/piper/piper` 本体、`storage/data/voices/en_US-ljspeech-medium.onnx` 及び `.onnx.json`、合計 約61MB）はすべて `.gitignore` 対象のため、**デプロイ環境ごとに `yarn setup:piper` の実行が必要**
- 同時実行数は最大2プロセス、起動間隔は最低333ms（`ttsService.ts` 内でキュー制御）

## 管理画面

`/api/admin/*` は Basic認証必須（`ADMIN_USER` / `ADMIN_PASS`）。Basic認証は平文送信のため、**本番環境ではHTTPS必須**（TLS終端はnginx等のリバースプロキシを前提、`docs/spec/design/risks.md` R8参照）。

## テスト実行

本プロジェクトは Vitest による単体テストおよび Playwright による実機 E2E テスト環境を整備しています。

### 単体テスト (Vitest)
クライアント・フック・ライブラリ・コンポーネントの単体テスト（異常系・通信障害・片方訳語のみ描画テスト含む 29ケース）を実行します。

```bash
yarn test          # または npx vitest run
```

### E2E テスト (Playwright)
Chromium および Mobile Safari (iPhone 13 実機解像度) 上で、新規登録・音声解錠・スワイプ・Undo・交代ログインなどのユーザーシナリオテストを実行します。

```bash
yarn test:e2e      # または npx playwright test
```

---

## スクリプト一覧

| コマンド | 説明 |
|---------|------|
| `yarn dev` | 開発サーバー起動（API + Vite HMR） |
| `yarn server` | APIサーバーのみ起動（`tsx watch`） |
| `yarn build` | フロントエンドを `dist/client` にビルド |
| `yarn start` | 本番起動（ビルド済み前提） |
| `yarn test` | 単体テスト実行（Vitest 全29ケース） |
| `yarn test:e2e` | E2E シミュレーションテスト実行（Playwright） |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn setup:piper` | Piper TTSバイナリ・音声モデルを取得 |
| `yarn db:migrate` | 未適用マイグレーションを適用（データ保持、`scripts/migrate.ts`） |
| `yarn db:reset` | DBを全消し→再構築（`scripts/reset-db.ts`、開発用） |
