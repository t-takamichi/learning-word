---
name: impl
description: フェーズ番号を入力すると、対応する実装計画書（docs/spec/impl/steps/<番号>/plan.md）に沿って実装を開始する。タスクを順に実装し、各タスクの検証・受け入れ基準の確認まで行う。実装計画完了後に使用する。
disable-model-invocation: false
---

# SKILL: Impl（実装の実行）

## 概要
指定されたフェーズ番号の実装計画書に沿って、実際のコード実装を進めるスキル。
`docs/spec/impl/steps/<番号>/plan.md` を読み込み、タスク（T1, T2, ...）を順に実装・検証する。

## 起動方法
```
/impl [フェーズ番号]
```

- 例: `/impl 1` → `docs/spec/impl/steps/1/plan.md` に沿って Phase 1 を実装

**引数（フェーズ番号）は必須。** 未指定の場合は
`docs/spec/impl/steps/` 配下の計画書一覧を提示して番号入力を促す。

---

## 前提条件

- `docs/spec/impl/steps/<番号>/plan.md` が存在する（`/impl-plan` の完了物）
- 前提が満たされていない場合は「先に `/impl-plan <番号>` を実行してください」と案内して中断する
- 計画書の「前提・依存」に記載された前提フェーズが実装済みであること

---

## Agent

このスキルを起動したら、まず以下を読み込んでペルソナを確立する。

```
.claude/skills/impl/agent/persona.md
```

あわせて、実装ルールを**必ず**確認する（`docs/rules` は実装前チェック必須）。

```
docs/rules/architecture.md
docs/rules/TypeScript.md
docs/rules/hono.md
docs/rules/react.md
```

---

## Skills（実行ステップ）

以下を**この順番で**実行する。

| STEP | ファイル | 内容 |
|------|---------|------|
| 1 | `skills/step1-load-plan.md` | 計画書の読み込み・実装ルール確認 |
| 2 | `skills/step2-implement.md` | タスク（T1→Tn）を順に実装 |
| 3 | `skills/step3-verify.md` | 検証・受け入れ基準の確認・報告 |

---

## Rules

全STEPを通じて以下のルールを守ること。

```
.claude/skills/impl/rules/impl-rules.md
```

---

## 完了条件

STEP 3 終了後、以下の品質ゲートを実行して全項目パスを確認する。

```
.claude/skills/impl/rules/quality-gate.md
```

全項目チェック済みになったら「Phase <N> 実装完了」を宣言し、次のフェーズを案内する。

```
次のステップ: /impl-plan <次のフェーズ番号> → /impl <次のフェーズ番号>
```
