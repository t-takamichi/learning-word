# STEP 4: フェーズ一覧・依存関係の整備

**目的**: フェーズ設計物を整理し、実装計画フェーズ（impl-plan）へ引き渡す。

## 保存先ディレクトリ構成

```
docs/spec/
└── impl/
    └── phase/
        ├── README.md      ← フェーズ全体トップ（層マップ＋一覧＋依存図）
        ├── phase-1.md     ← 各フェーズ詳細
        ├── phase-2.md
        └── ...
```

## README.md の必須構成

```markdown
# 実装フェーズ計画

## 1. 概要
- 設計書（docs/spec/design/README.md）に基づくフェーズ分割方針

## 2. 層マップ（STEP 2 の成果物）
- 機能 × レイヤー の実装項目表

## 3. フェーズ一覧
| Phase | 名称 | ゴール | 優先度 | 依存 | 設計リンク |
|-------|------|--------|--------|------|-----------|
| 1 | Walking Skeleton | ... | Must | なし | ... |
| 2 | ... | ... | Must | 1 | ... |

## 4. フェーズ依存関係図
​```mermaid
graph LR
  P1[Phase 1: Skeleton] --> P2[Phase 2: ...]
  P2 --> P3[Phase 3: ...]
​```

## 5. 各フェーズ詳細リンク
- [Phase 1](./phase-1.md)
- [Phase 2](./phase-2.md)
- ...
```

## 完了条件
- 全ての `phase-N.md` が `docs/spec/impl/phase/` に存在すること
- `rules/quality-gate.md` の全チェック項目がパスすること

## 完了後の案内
```
フェーズ設計完了。次は各フェーズの実装計画書を作成します:
/impl-plan 1
```
