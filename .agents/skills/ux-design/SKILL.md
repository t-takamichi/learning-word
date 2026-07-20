---
name: ux-design
description: UI/UXを設計する。分析結果をもとに、デザインコンセプト・カラー/タイポ等のデザイントークン・Atomic Designのコンポーネント構造・モチベーション機構・サウンド演出を設計し、docs/spec/design/ux/配下に仕様書として生成する。分析後・実装計画前に使用する。
disable-model-invocation: false
---

# SKILL: UX Design（UI/UX設計）

## 概要
UI/UXを **設計** するスキル。`/ux-analyze` の課題・改善仮説を入力に、
デザインコンセプト → デザイントークン → **Atomic Design** のコンポーネント構造 →
モチベーション機構 → サウンド演出 → 受け入れ基準 まで一貫設計し、
`docs/spec/design/ux/` 配下に仕様書として生成する。

## 起動方法
```
/ux-design               # UI/UX全体を設計
/ux-design [対象]         # 特定領域のみ設計（例: /ux-design sound）
```

---

## Agent
起動したら、まず以下を読み込んでペルソナを確立する。
```
.agents/skills/ux-design/agent/persona.md
```

## 入力
- 分析結果: `docs/spec/design/ux/analysis/**`（無ければ先に `/ux-analyze` を促す）
- 機能設計: `docs/spec/design/README.md`
- 要望・素材: ユーザーの追加要望（テキスト・参照画像等）
- 実装制約: `docs/rules/**`（React/TypeScript/アーキテクチャ）

---

## Skills（実行ステップ）
以下を**この順**で実行。各STEP完了後に次へ。

| STEP | ファイル | 担当 | 出力先 |
|------|---------|------|--------|
| 1 | `skills/step1-concept.md` | コンセプト・原則・ムード | ux/README.md |
| 2 | `skills/step2-design-tokens.md` | カラー/タイポ/余白/角丸/影トークン | ux/visual-design.md |
| 3 | `skills/step3-atomic.md` | **Atomic Design** コンポーネント構造 | ux/component-structure.md |
| 4 | `skills/step4-motivation.md` | モチベーション機構・演出・マイクロコピー | ux/motivation.md |
| 5 | `skills/step5-sound.md` | サウンド・ハプティクス（iOS制約込み） | ux/sound-haptics.md |
| 6 | `skills/step6-quality.md` | ディズニーPM品質バー・感情曲線 | ux/quality-bar.md |
| 7 | `skills/step7-ac.md` | 受け入れ基準・品質ゲート | ux/acceptance-criteria.md |

---

## Rules
全STEPで以下を守る。
```
.agents/skills/ux-design/rules/design-rules.md
.agents/skills/ux-design/rules/atomic-design.md
```

## 完了条件
STEP7後、品質ゲートで全項目パスを確認する。
```
.agents/skills/ux-design/rules/quality-gate.md
```
全項目パスで「UI/UX設計完了」を宣言し、次を案内する。
```
次のステップ: /ux-impl-plan（UI/UX実装計画の作成）
```

## 引数の扱い
- **引数なし**: 全STEP実行（全体設計）
- **引数あり**: 該当領域のSTEPのみ実行（部分設計）。既存ファイルは追記・更新する
