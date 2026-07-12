# プラン: bin/・data/・db/ を storage/ 配下へ統合

## 背景・目的

現状、ルート直下に `bin/`（Piperバイナリ、gitignore対象）・`data/`（DBファイル・音声モデル、gitignore対象）・`db/`（スキーマ・シードデータ、git管理対象）の3つが並列に存在しており、ルートが散らかる。実行時生成物とソース管理データが同列にあると見分けにくいため、`storage/` という1つの親ディレクトリの下にまとめる。

**方針**: サブディレクトリ名（`bin` / `data` / `db`）はそのまま維持し、`storage/` の下に移すだけ。git管理の有無（`storage/db/` は追跡、`storage/bin/` `storage/data/` は非追跡）はディレクトリ単位で変わらない。

## Before / After

```
# Before                          # After
learning-word/                    learning-word/
├── bin/            (ignored)     ├── storage/
├── data/           (ignored)     │   ├── bin/            (ignored)
│   ├── learning.db               │   │   └── piper/
│   └── voices/                   │   ├── data/           (ignored)
├── db/             (tracked)     │   │   ├── learning.db
│   ├── schema.sql                │   │   └── voices/
│   ├── seed.json                 │   └── db/             (tracked)
│   └── dictionary_seed.json      │       ├── schema.sql
├── src/                          │       ├── seed.json
├── scripts/                      │       └── dictionary_seed.json
└── ...                           ├── src/
                                   ├── scripts/
                                   └── ...
```

## 変更対象ファイル一覧

### 1. コード（パス文字列の変更）

| ファイル | 現在 | 変更後 |
|---|---|---|
| `src/server/db.ts:8` | `process.env['DB_PATH'] ?? 'data/learning.db'` | `?? 'storage/data/learning.db'` |
| `src/server/db.ts:29` | `readFileSync('db/schema.sql', 'utf-8')` | `readFileSync('storage/db/schema.sql', 'utf-8')` |
| `src/server/db.ts:40` | `readFileSync('db/seed.json', 'utf-8')` | `readFileSync('storage/db/seed.json', 'utf-8')` |
| `src/server/db.ts:71` | `readFileSync('db/dictionary_seed.json', 'utf-8')` | `readFileSync('storage/db/dictionary_seed.json', 'utf-8')` |
| `src/server/services/ttsService.ts:8` | `path.resolve(process.cwd(), 'bin')` | `path.resolve(process.cwd(), 'storage', 'bin')` |
| `src/server/services/ttsService.ts:9` | `path.resolve(process.cwd(), 'data')` | `path.resolve(process.cwd(), 'storage', 'data')` |
| `scripts/reset-db.ts:5` | `process.env['DB_PATH'] ?? 'data/learning.db'` | `?? 'storage/data/learning.db'` |
| `scripts/reset-db.ts:59` | `path.resolve(process.cwd(), 'db', 'schema.sql')` | `path.resolve(process.cwd(), 'storage', 'db', 'schema.sql')` |
| `scripts/reset-db.ts:65` | `path.resolve(process.cwd(), 'db', 'seed.json')` | `path.resolve(process.cwd(), 'storage', 'db', 'seed.json')` |
| `scripts/generate-dictionary-seed.ts:910` | `const targetPath = 'db/dictionary_seed.json'` | `const targetPath = 'storage/db/dictionary_seed.json'` |

`VOICES_DIR` (`ttsService.ts:10`) と `PIPER_BIN_PATH` / `PIPER_MODEL_PATH` (`ttsService.ts:14,19`) は `BIN_DIR` / `DATA_DIR` からの相対解決なので、上記2箇所を直せば自動的に追従する。`PIPER_BIN_PATH` / `PIPER_MODEL_PATH` を環境変数で上書きしている場合は、その値も `storage/` 配下に更新が必要（後述）。

### 2. `scripts/setup-piper.sh`

スクリプト内の `bin/` への参照（`mkdir -p bin`、`bin/piper/piper` の存在チェック・`chmod`・ログ出力、`bin/piper.tar.gz` の展開先）と `data/voices/` への参照（`mkdir -p data/voices`、モデル・configのダウンロード先）を、それぞれ `storage/bin/`・`storage/data/voices/` に置き換える。全箇所が対象（十数行）。

### 3. `.env.example`

```diff
- DB_PATH=data/learning.db
+ DB_PATH=storage/data/learning.db
```

### 4. `.gitignore`

現状:
```
node_modules/
dist/
data/
*.db
.env
```

変更後:
```
node_modules/
dist/
storage/bin/
storage/data/
*.db
.env
```

`data/` の無指定パターンは `storage/db/` 配下に偶然 `data` という名前のサブディレクトリができた場合も拾ってしまう非アンカー型なので、`storage/bin/`・`storage/data/` に明示的に変更する。

> 補足: 現状の `.gitignore` には `bin/` の指定が無く、Piperバイナリがgit管理対象から漏れていなかった（=誤ってコミットされうる状態だった）。今回の変更で `storage/bin/` を明示的に無視することで、この漏れも合わせて解消する。

### 5. `README.md`（今回新規作成した分）

ディレクトリ構成図・環境変数テーブルのデフォルト値・Piper TTSセットアップの説明・チェックリスト内の `data/` 永続化の記述を、すべて `storage/data/` `storage/bin/` `storage/db/` に更新する。

### 6. 影響なし（変更不要）

- `src/client/**`：クライアント側からこれらのパスへの参照なし
- `dist/`：ビルド成果物のみで、サーバー側パス文字列を含まない
- `spec/design/architecture.md` / `spec/impl/steps/1/plan.md`：過去の設計・実装記録。すでにBunランタイム前提など実態と乖離した記述がある「当時のスナップショット」なので、今回のパス変更に合わせて書き換える必要はない（必要なら別タスクで設計ドキュメントの全体更新を検討）

## 実施手順

1. サーバー・devプロセスを停止する（SQLiteファイルロック中の移動を避ける）
2. `mkdir -p storage` の上で、既存の `bin/` `data/` `db/` を丸ごと `storage/` 配下へ移動
   - 現時点でこのリポジトリは未初期化（`.git` なし）のため単純に `mv bin data db storage/` でよい。将来git初期化後に同じ移動を行う場合は `git mv` を使うこと
   - `data/learning.db`（学習済みDBがある場合）と `data/voices/*.onnx`（61MBの音声モデル、ダウンロード済みの場合）はそのまま移動し、再取得・再生成はしない
3. 上記「変更対象ファイル一覧」に沿ってコード・スクリプト・`.env.example`・`.gitignore`・`README.md` を更新
4. 自分のローカル `.env`（gitignore対象で今回のコード変更に含まれない）に `DB_PATH` や `PIPER_BIN_PATH` / `PIPER_MODEL_PATH` を明示指定している場合は、`storage/` 配下のパスに手動で書き換える
5. 動作確認
   - `yarn typecheck`
   - `yarn db:reset` → `storage/data/learning.db` が再生成されることを確認
   - `yarn dev` → `/api/session` が単語を返すこと、`/api/tts?text=hello` が音声を返すこと（= `storage/bin/piper` と `storage/data/voices/` を正しく参照できていること）を確認
   - 音声モデル未取得の環境では `yarn setup:piper` を実行し、`storage/bin/piper/piper` と `storage/data/voices/*.onnx*` が生成されることを確認

## ロールバック

git初期化前の作業なので、移動前にディレクトリを丸ごとバックアップ（`cp -r bin data db /tmp/backup-xxx` 等）しておけば、問題があった場合はそのまま戻すだけで良い。
