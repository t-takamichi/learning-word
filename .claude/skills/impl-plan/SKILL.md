---
name: impl-plan
description: フェーズ番号を入力すると、対応するフェーズ定義（docs/spec/impl/phase/phase-N.md）をもとに実装計画（実装計画書）を作成する。docs/spec/impl/steps/<フェーズ番号>/ 配下に、タスク分解・実装順序・受け入れ基準を含む計画書を生成する。フェーズ設計完了後・実装開始前に使用する。
disable-model-invocation: false
---

# SKILL: Impl-Plan（実装計画書の作成）

## 概要
指定されたフェーズ番号の実装計画書を作成するスキル。
`docs/spec/impl/phase/phase-N.md` を読み込み、実装可能なタスクへ分解して
`docs/spec/impl/steps/<フェーズ番号>/` 配下に実装計画書を生成する。

## 起動方法
```
/impl-plan [フェーズ番号]
```

- 例: `/impl-plan 1` → Phase 1 の実装計画書を `docs/spec/impl/steps/1/` に作成

**引数（フェーズ番号）は必須。** 未指定の場合は
`docs/spec/impl/phase/README.md` のフェーズ一覧を提示して番号入力を促す。

---

## 前提条件

- `docs/spec/impl/phase/phase-<番号>.md` が存在する（`/impl-phase` の完了物）
- 前提が満たされていない場合は「先に `/impl-phase` を実行してください」と案内して中断する

---

## Agent

このスキルを起動したら、まず以下を読み込んでペルソナを確立する。

```
.claude/skills/impl-plan/agent/persona.md
```

あわせて、実装ルールを確認する。

```
docs/rules/architecture.md
docs/rules/TypeScript.md
docs/rules/hono.md
docs/rules/react.md
```

---

## Skills（実行ステップ）

以下を**この順番で**実行する。各STEPが完了してから次へ進む。

| STEP | ファイル | 内容 | 出力先 |
|------|---------|------|--------|
| 1 | `skills/step1-load-phase.md` | フェーズ定義・設計の読み込み | （内部整理） |
| 2 | `skills/step2-task-breakdown.md` | 実装タスクへの分解・順序付け | （内部整理） |
| 3 | `skills/step3-plan-output.md` | 実装計画書の生成 | docs/spec/impl/steps/<番号>/plan.md |

---

## Rules

全STEPを通じて以下のルールを守ること。

```
.claude/skills/impl-plan/rules/plan-rules.md
```

---

## 完了条件

STEP 3 終了後、以下の品質ゲートを実行して全項目パスを確認する。

```
.claude/skills/impl-plan/rules/quality-gate.md
```

全項目チェック済みになったら「実装計画完了」を宣言し、次のフェーズを案内する。

```
次のステップ: /impl <フェーズ番号>（実装計画書に沿って実装を開始）
```
