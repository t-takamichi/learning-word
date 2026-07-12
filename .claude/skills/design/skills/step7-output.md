# STEP 7: ドキュメント生成と保存

**目的**: 設計物をdocs/specディレクトリに整理し、実装フェーズへ引き渡す。

## 保存先ディレクトリ構成

```
docs/spec/
└── design/
    ├── README.md             ← 全体設計トップ（最初に作成・必須）
    ├── architecture.md       ← アーキテクチャ・技術選定・ディレクトリ構成
    ├── [feature-name].md     ← 機能別詳細設計・シーケンス図・AC
    └── risks.md              ← リスク評価表
```

## README.md の必須構成

```markdown
# [プロジェクト名] 設計書

## 1. プロジェクト概要・目的
## 2. ユーザーストーリー
## 3. システム構成図
## 4. 機能一覧（MoSCoW優先度付き）
## 5. 成功指標（KPI）
## 6. 詳細設計リンク
  - [アーキテクチャ](./architecture.md)
  - [機能名](./feature-name.md)
  - ...
## 7. リスク一覧
  - [リスク評価](./risks.md)
```

## 完了条件
- 全ての必須ファイルが `docs/spec/design/` に存在すること
- `rules/quality-gate.md` の全チェック項目がパスすること
