# STEP 2: 層（レイヤー）ごとの実装計画

**目的**: 抽出した要件を、レイヤードアーキテクチャの各層に振り分けて整理する。

## 前提
`docs/rules/architecture.md` のレイヤー定義・依存方向に従う。

```
Presentation (Hono Handler)
        ↓
Application (Use Case)
        ↓
Domain (Entity / Repository Interface)   ← ここに依存が集まる
        ↑
Infrastructure (Repository 実装 / DB)
```

## 実施内容

### 層マップの作成
各機能について、どの層に何を実装するかを表にまとめる。

| 機能 | Domain | Infrastructure | Application | Presentation | Frontend(React) |
|------|--------|----------------|-------------|--------------|-----------------|
| フラッシュカード | Word/Review Entity | WordRepository実装 | GetSessionUseCase | GET /api/session | Card画面 |
| 自己評価 | ReviewResult VO | ReviewRepository実装 | SubmitReviewUseCase | POST /api/review | 評価ボタン |
| ... | ... | ... | ... | ... | ... |

### 共通基盤の洗い出し
- 全フェーズで必要な横断項目を先に特定する
  - プロジェクト初期化（Vite / Hono / TypeScript 設定）
  - DBスキーマ・マイグレーション基盤
  - 共有型（`shared/`）
  - DIの配線（エントリポイント）

### 依存方向の確認
- Domain 型がないと Infrastructure/Application が作れない、という前後関係を明示する
- この依存関係が STEP 3 のフェーズ順序の根拠になる

## 出力先
`docs/spec/impl/phase/README.md` の「層マップ」セクション（初回作成）
