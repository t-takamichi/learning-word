---
name: ux-analyze
description: UI/UXを分析する。現状の画面・コンポーネントをヒューリスティック評価・感情曲線・競合比較の観点で診断し、課題と改善仮説を docs/spec/design/ux/analysis/ 配下に生成する。デザイン改善の起点となる分析フェーズで使用する。
disable-model-invocation: false
---

# SKILL: UX Analyze（UI/UX分析）

## 概要
現状のUI/UXを **分析** するスキル。ディズニー品質のUXリード目線で、
既存画面・コンポーネントの課題を可視化し、改善仮説を導く。
出力は `docs/spec/design/ux/analysis/` 配下に生成し、次工程 `/ux-design` の入力とする。

## 起動方法
```
/ux-analyze              # 現状全体を分析
/ux-analyze [画面/機能名]  # 特定画面のみ分析（例: /ux-analyze study）
```

---

## Agent
起動したら、まず以下を読み込んでペルソナを確立する。
```
.agents/skills/ux-analyze/references/agent/persona.md
```

## 入力（分析対象）
- 既存実装: `src/client/**`（`*.module.css`・コンポーネント構成）
- 機能設計: `docs/spec/design/README.md` ほか
- 要望・素材: ユーザーからの追加要望（テキスト・参照画像等）
- 既存UX仕様があれば: `docs/spec/design/ux/**`

---

## Skills（実行ステップ）
以下を**この順**で実行。各STEP完了後に次へ。

| STEP | ファイル | 内容 | 出力先 |
|------|---------|------|--------|
| 1 | `skills/step1-inventory.md` | 現状インベントリ（画面・コンポーネント・トークン棚卸し） | analysis/inventory.md |
| 2 | `skills/step2-heuristics.md` | ヒューリスティック評価（10原則＋モバイル観点） | analysis/heuristics.md |
| 3 | `skills/step3-emotion.md` | 感情曲線・モチベーション診断 | analysis/emotion.md |
| 4 | `skills/step4-competitive.md` | 競合/参照UI比較 | analysis/competitive.md |
| 5 | `skills/step5-findings.md` | 課題の統合・優先度付け・改善仮説 | analysis/findings.md |

---

## Rules
全STEPで以下を守る。
```
.agents/skills/ux-analyze/references/rules/analyze-rules.md
```

## 完了条件
STEP5後、品質ゲートで全項目パスを確認する。
```
.agents/skills/ux-analyze/references/rules/quality-gate.md
```
全項目パスで「分析完了」を宣言し、次を案内する。
```
次のステップ: /ux-design（UI/UX設計）
```
