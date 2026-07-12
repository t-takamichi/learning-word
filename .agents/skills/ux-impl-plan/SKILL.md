---
name: ux-impl-plan
description: UI/UX設計を実装計画に落とし込む。docs/spec/design/ux/配下のUI/UX仕様（デザイントークン・Atomic Designのコンポーネント構造・モチベーション機構・サウンド）をもとに、フェーズ分割・タスク分解・実装順序・受け入れ基準を含む実装計画を docs/spec/impl/ux/ に生成する。UI/UX設計完了後・実装前に使用する。
disable-model-invocation: false
---

# SKILL: UX Impl Plan（UI/UX実装計画）

## 概要
`/ux-design` が作ったUI/UX仕様を **実装計画** に落とし込むスキル。
Atomic Design の階層（Tokens→Atoms→…→Pages）を実装順序に、
モチベーション機構・サウンドをタスクに分解し、
`docs/spec/impl/ux/` 配下に実装計画書を生成する。既存の `/impl` で実装できる粒度に整える。

## 起動方法
```
/ux-impl-plan            # UI/UX全体の実装計画を作成
/ux-impl-plan [対象]      # 特定領域のみ（例: /ux-impl-plan sound）
```

---

## Agent
起動したら、まず以下を読み込んでペルソナを確立する。
```
.agents/skills/ux-impl-plan/references/agent/persona.md
```

## 入力
- UI/UX仕様: `docs/spec/design/ux/**`（無ければ先に `/ux-design` を促す）
- 既存実装: `src/client/**`（移行元コンポーネント・CSS）
- 実装規約: `docs/rules/**`（React / TypeScript / アーキテクチャ）
- 既存フェーズ様式: `docs/spec/impl/phase/**`, `docs/spec/impl/steps/**`（書式を踏襲）

---

## Skills（実行ステップ）
以下を**この順**で実行。各STEP完了後に次へ。

| STEP | ファイル | 内容 | 出力先 |
|------|---------|------|--------|
| 1 | `skills/step1-load-ux.md` | UX仕様の読み込み・実装インパクト把握 | （分析メモ） |
| 2 | `skills/step2-phase-split.md` | Atomic Designに沿ったフェーズ分割 | docs/spec/impl/ux/README.md |
| 3 | `skills/step3-component-map.md` | コンポーネント別 実装/移行タスクマップ | docs/spec/impl/ux/component-tasks.md |
| 4 | `skills/step4-task-breakdown.md` | フェーズ毎のタスク分解・順序・依存・見積り | docs/spec/impl/ux/phase-N.md |
| 5 | `skills/step5-plan-output.md` | 受け入れ基準・検証手順・全体整合 | 各計画書へ追記 |

---

## Rules
全STEPで以下を守る。
```
.agents/skills/ux-impl-plan/references/rules/plan-rules.md
```

## 完了条件
STEP5後、品質ゲートで全項目パスを確認する。
```
.agents/skills/ux-impl-plan/references/rules/quality-gate.md
```
全項目パスで「UI/UX実装計画完了」を宣言し、次を案内する。
```
次のステップ: /impl <フェーズ番号>（実装の実行）
```
