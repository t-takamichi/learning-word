---
name: impl-phase
description: 設計書（docs/spec/design/README.md）を読み込み、実装計画を層（レイヤー）ごとに整理したうえで、要件ごとにフェーズを分割する。docs/spec/impl/phase/ 配下にフェーズ定義ドキュメントを生成する。設計完了後・実装計画作成前に使用する。
disable-model-invocation: false
---

# SKILL: Impl-Phase（フェーズ設計）

## 概要
設計書を読み込み、実装を層（レイヤー）ごとに整理したうえで、要件ごとにフェーズへ分割するスキル。
`docs/spec/impl/phase/` 配下にフェーズ定義ドキュメントを生成する。

「設計（design）」と「実装計画（impl-plan）」の橋渡しを担う。

## 起動方法
```
/impl-phase
/impl-phase [対象機能名]
```

---

## 前提条件

このスキルを実行する前に、以下が完了していること。

- `docs/spec/design/README.md` が存在する（`/design` の完了物）
- 各詳細設計ファイル（`architecture.md` / `[feature].md` / `risks.md`）が存在する

前提が満たされていない場合は「先に `/design` を実行してください」と案内して中断する。

---

## Agent

このスキルを起動したら、まず以下を読み込んでペルソナを確立する。

```
.claude/skills/impl-phase/agent/persona.md
```

あわせて、実装のレイヤー方針として以下を読み込む。

```
docs/rules/architecture.md
```

---

## Skills（実行ステップ）

以下を**この順番で**実行する。各STEPが完了してから次へ進む。

| STEP | ファイル | 内容 | 出力先 |
|------|---------|------|--------|
| 1 | `skills/step1-load-design.md` | 設計書の読み込み・要件抽出 | （内部整理） |
| 2 | `skills/step2-layer-plan.md` | 層（レイヤー）ごとの実装計画 | docs/spec/impl/phase/README.md（層マップ） |
| 3 | `skills/step3-phase-split.md` | 要件ごとのフェーズ分割 | docs/spec/impl/phase/phase-N.md |
| 4 | `skills/step4-output.md` | フェーズ一覧・依存関係の整備 | docs/spec/impl/phase/README.md（追記） |

---

## Rules

全STEPを通じて以下のルールを守ること。

```
.claude/skills/impl-phase/rules/phase-rules.md
```

---

## 完了条件

STEP 4 終了後、以下の品質ゲートを実行して全項目パスを確認する。

```
.claude/skills/impl-phase/rules/quality-gate.md
```

全項目チェック済みになったら「フェーズ設計完了」を宣言し、次のフェーズを案内する。

```
次のステップ: /impl-plan [フェーズ番号]（各フェーズの実装計画書を作成）
```

---

## 引数の扱い

- **引数なし**: `docs/spec/design/` 配下の全設計を読み込み、全体のフェーズ分割を実行
- **引数あり（機能名）**: 指定された機能に関連するフェーズのみを再設計（部分更新）
