---
name: ux-analyze
description: UI/UXを多角的に分析する。ユーザー（オーナー）へのペルソナヒアリングから開始し、PM・デザイナー・CEOのサブエージェントを召喚して、コード特定・加点（Plussing）・感情曲線の観点から分析・統合し、docs/spec/design/ux/analysis/ 配下に成果物を生成する。
disable-model-invocation: false
---

# SKILL: UX Analyze（マルチエージェントUI/UX分析）

## 概要
現状のUI/UXを、**ユーザー（プロダクトオーナー）へのインタビュー** を起点として、**PM・デザイナー・CEO・UXリードからなる「マルチエージェントUX会議チーム」** が多角的に分析するスキル。

単一エージェントによる一方的な評価ではなく、多角的な議論を通じて「ビジネス戦略」「ビジュアル世界観」「実装現実性」のバランスが取れた高品質な課題と改善仮説を導き出します。
出力は `docs/spec/design/ux/analysis/` 配下に生成し、次工程 `/ux-design` の入力とします。

## 起動方法
```
/ux-analyze              # 現状全体を分析（対話ヒアリングからスタート）
/ux-analyze [画面/機能名]  # 特定画面のみ分析
```

---

## チーム編成（召喚エージェント）
起動後、UX Lead（メイン）は以下のサブエージェントを `define_subagent` および `invoke_subagent` を使って召喚し、それぞれのロールに特化した分析を依頼します。

*   **UX Lead (ファシリテーター & 統合担当)**
    *   ペルソナ: `.agents/skills/ux-analyze/agent/persona.md`
    *   役割: ユーザー（オーナー）へのインタビュー、進行管理、および最終統合。
*   **PM (プロダクトマネジメント & 実装整合性担当)**
    *   ペルソナ: `.agents/skills/ux-analyze/agent/persona-pm.md`
    *   役割: ヒューリスティクス評価（Nielsen）、論理的一貫性の検証、課題に対応するソースコード（ファイルパス・行数・CSS）の特定。
*   **UI/UX Designer (ビジュアル・演出・加点担当)**
    *   ペルソナ: `.agents/skills/ux-analyze/agent/persona-designer.md`
    *   役割: 世界観の調和評価、トランジションの質感、アクセシビリティ、ディズニー流「加点（Plussing）」提案。
*   **CEO (ビジネス戦略・顧客体験価値担当)**
    *   ペルソナ: `.agents/skills/ux-analyze/agent/persona-ceo.md`
    *   役割: 感情ジャーニー（Mermaid感情曲線）、モチベーション設計（Octalysis）、KPIやユーザー継続率へのインパクト評価。

---

## 実行ステップ

以下を **この順** で実行します。必ず前ステップの完了を確認してから進めてください。

### STEP 0: ユーザーヒアリングと前提合意 【最重要】
*   **内容**: UX Leadは、勝手に分析を始めるのを禁止します。まず、設計書（`docs/spec/design/README.md` 等）に書かれているペルソナ案を叩き台として提示し、ユーザーにターゲット属性や特に改善したい体験（ペインポイント）についてインタビューを行います。
*   **ゴール**: ユーザーと「今回の分析前提となるペルソナ」について合意が取れたら、STEP 1 へ進行します。

### STEP 1: 現状インベントリ（棚卸し）
*   **内容**: UX Leadは、実装コードとCSSを静的解析し、画面・コンポーネント・トークンの現状を洗い出し、`analysis/inventory.md` を作成します。
*   **サブエージェント召喚**: インベントリ作成後、UX Leadは `ux-pm`, `ux-designer`, `ux-ceo` にそれぞれの担当観点からレビューを依頼します。

### STEP 2: ヒューリスティック評価（PM担当）
*   **内容**: PMは、Nielsenの10原則やモバイル観点を元に、論理的使いやすさを評価。課題の再現となる **具体的なソースコードのファイルパスと行数** を特定し、`analysis/heuristics.md` を作成。

### STEP 3: 感情曲線・モチベーション診断（CEO担当）
*   **内容**: CEOは、体験ジャーニーを分析し、**Mermaid グラフを用いた感情曲線** と、Octalysis（ゲーミフィケーション）による診断を行い、`analysis/emotion.md` を作成。

### STEP 4: 競合比較 ＆ デザイン加点（デザイナー担当）
*   **内容**: デザイナーは、世界観の調和とアクセシビリティを評価。一般的な良作パターンとの比較を行い、ディズニー品質の「加点（Plussing）」提案を含めて `analysis/competitive.md` を作成。

### STEP 5: 課題統合と優先度決定（Lead担当・会議）
*   **内容**: UX Leadは、各エージェントのレビューを回収・ファシリテートし、PMの「コスト」とデザイナー/CEOの「体験価値」を戦わせ、優先度（Quick Wins）を整理した最終レポート `analysis/findings.md` を統合作成します。

---

## ルールと品質基準
全ステップにおいて、以下を守る必要があります。
*   ルール: `.agents/skills/ux-analyze/rules/analyze-rules.md`
*   完了条件: `.agents/skills/ux-analyze/rules/quality-gate.md`

すべての品質ゲートがチェックされたら「分析完了」を宣言し、次を案内します。
```
次のステップ: /ux-design（UI/UX設計）
```
