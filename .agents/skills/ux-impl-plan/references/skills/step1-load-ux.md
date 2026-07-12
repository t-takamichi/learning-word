# STEP 1: UX仕様の読み込み・実装インパクト把握

**目的**: 何を作り、何を移行し、何を置換するかを、実装コストで把握する。

## 実施内容
- `docs/spec/design/ux/**` を全て読む（README/visual-design/component-structure/motivation/sound-haptics/quality-bar/acceptance-criteria）
  - 無ければ「先に `/ux-design` を実行してください」と促して中断
- `docs/rules/**`（React/TypeScript/アーキテクチャ規約）を読む
- 既存実装を確認し、**差分の大きい箇所** を特定
  - トークン化（`index.css` に `:root` 追加、各 `*.module.css` の生値置換）
  - コンポーネントのAtomic階層への再配置
  - 新規要素（useSound / CelebrationOverlay / Mascot / StreakBadge / SuccessToast）
- 各仕様AC（`acceptance-criteria.md`）を控えておく（後で計画のACに写す）

## 出力
- 内部メモ（次STEPの入力）。「新規/移行/置換」の3分類でインパクト表を作る
  ```
  | 対象 | 分類 | 影響ファイル | インパクト | リスク |
  ```
