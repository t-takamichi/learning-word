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
│   ├── db/                    # テーブル定義・シードデータ（git管理対象）
│   │   ├── schema.sql            # テーブル定義（起動時に自動実行）
│   │   ├── seed.json              # 単語セットの初期データ（初回起動時に自動投入）
│   │   └── dictionary_seed.json   # 辞書オートコンプリート用データ（初回起動時に自動投入）
│   ├── data/                  # 実行時生成物（.gitignore 対象）
│   │   ├── learning.db           # SQLiteファイル本体
│   │   └── voices/               # Piper音声モデル（setup:piper で取得）
│   └── bin/                   # Piperスタンドアロンバイナリ（setup:piper で取得、.gitignore 対象）
├── scripts/
│   ├── setup-piper.sh          # Piper TTSの実行環境をセットアップ
│   ├── reset-db.ts             # DBリセット
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

- 起動時に `storage/db/schema.sql` を自動実行（`CREATE TABLE IF NOT EXISTS` なのでべき等）
- `word_sets` テーブルが空の場合のみ `storage/db/seed.json` を自動投入
- `dictionary_words` テーブルが空の場合のみ `storage/db/dictionary_seed.json` を自動投入
- WALモード有効（`PRAGMA journal_mode = WAL`）、外部キー制約有効
- `storage/data/` ディレクトリは `.gitignore` 対象。本番環境では永続ボリュームにマウントするか、デプロイ先で書き込み可能なパスを `DB_PATH` で指定すること

## Piper TTS（音声合成）

`/api/tts?text=...` が Piper プロセスを都度起動して音声(WAV)をストリーミング返却する。

- macOS: `python3 -m piper` が使えればそれを優先使用。なければスタンドアロンバイナリにフォールバック
- Linux: スタンドアロンバイナリ必須
- 必要アセット（`storage/bin/piper/piper` 本体、`storage/data/voices/en_US-ljspeech-medium.onnx` 及び `.onnx.json`、合計 約61MB）はすべて `.gitignore` 対象のため、**デプロイ環境ごとに `yarn setup:piper` の実行が必要**
- 同時実行数は最大2プロセス、起動間隔は最低333ms（`ttsService.ts` 内でキュー制御）

## 管理画面

`/api/admin/*` は Basic認証必須（`ADMIN_USER` / `ADMIN_PASS`）。Basic認証は平文送信のため、**本番環境ではHTTPS必須**（TLS終端はnginx等のリバースプロキシを前提、`docs/spec/design/risks.md` R8参照）。

---

## リリース前の最小設定チェックリスト

現状の実装を確認した結果、最低限そろえる必要がある設定項目は以下の通り。

### 必須（未設定だとセキュリティ上/機能上の問題がある）

- [ ] **`ADMIN_PASS` / `ADMIN_USER` をデフォルト値（`admin` / `changeme`）から変更**し、本番サーバーの環境変数として設定する（`.env` はコミットしない）
- [ ] **HTTPS化**: Basic認証を平文送信しないよう、リバースプロキシ（nginx等）でTLS終端するか、PaaSのHTTPS機能を利用する
- [ ] **`storage/data/` ディレクトリの永続化**: SQLiteファイルとPiper音声モデルを保持する永続ボリューム（またはそれに準ずる書き込み可能な永続パス）を用意する。コンテナ環境で永続化を忘れると再起動のたびにDBが初期化される
- [ ] **`yarn setup:piper` をデプロイ手順に組み込む**: `storage/bin/` と `storage/data/voices/` はgit管理外のため、デプロイ先で明示的に実行するかビルド時に含める必要がある
- [ ] **Node.js バージョン固定**: `node:sqlite` は実験的機能。本番の実行環境（Docker/PaaS）で Node.js 22.5以上を明示指定する（`package.json` に `engines` フィールドがまだ無い）

### 推奨（今は動くが、リリース前に決めておくべき）

- [ ] **リッスンポートの環境変数化**: 現在 `3001` 固定（`src/server/index.ts:105`）。Render/Railway等のPaaSは `PORT` を動的に割り当てるため、そのままでは動かない可能性がある
- [ ] **ドメイン/ホスティング先の決定**: 単一プロセスでAPI+静的配信するため、VPS・PaaS（Node対応）いずれでも動くが、Piperのネイティブバイナリ実行が可能な環境（サーバーレスは不可）である必要がある
- [ ] **DBバックアップ方針**: `storage/data/learning.db` はファイル1本なので、定期的なファイルバックアップ（cron + rsync/S3等）を検討する
- [ ] **ログ収集**: 現状 `console.log` / `console.error` のみ。本番運用するなら永続化されたログ出力先（PaaSのログ機能 or ファイル）を確認する

### 任意（将来的に）

- [ ] 複数ユーザー運用時の認証方式（現在はBasic認証1組のみ。`users` テーブルはあるがログイン機構は未実装 — `docs/spec/design/README.md` の設計対象）
- [ ] マイグレーション管理（現状 `schema.sql` 再実行方式。`docs/spec/design/architecture.md` ではV2でdrizzle等の導入を検討と記載）

---

## スクリプト一覧

| コマンド | 説明 |
|---------|------|
| `yarn dev` | 開発サーバー起動（API + Vite HMR） |
| `yarn server` | APIサーバーのみ起動（`tsx watch`） |
| `yarn build` | フロントエンドを `dist/client` にビルド |
| `yarn start` | 本番起動（ビルド済み前提） |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn setup:piper` | Piper TTSバイナリ・音声モデルを取得 |
| `yarn db:reset` | DBリセット（`scripts/reset-db.ts`） |
