# STEP 1: UI/UX計画書の読み込み・UXルール確認

**目的**: 実装を始める前に、対象UXフェーズの計画とルールを完全に把握する。

## 実施内容

### 対象計画書の特定
- 引数のUXフェーズ番号を確認する（`UX-N` / `N` のどちらも受け付ける）
- 番号の数値部 `N` を `docs/spec/impl/ux/phase-<N>.md` にマップして読み込む
  - 参照 / ゴール / 前提・依存 / タスク一覧 / 各タスク詳細 / 受け入れ基準(AC) / 検証手順
- 併せて [docs/spec/impl/ux/README.md](../../../../docs/spec/impl/ux/README.md) でフェーズ全体の位置づけ・依存を確認する
- [docs/spec/impl/ux/component-tasks.md](../../../../docs/spec/impl/ux/component-tasks.md) で新規/移行/置換・新パスを確認する

### 前提・依存の確認
- 計画書「前提・依存」に記載された前提フェーズが実装済みかを確認する
  - 例: UX-4 は UX-2（Atoms）・UX-3（サウンド基盤）に依存
- 未実装の前提があれば、先にそれを処理するよう案内する
- 依存パッケージ・環境（`node_modules` の有無、`typecheck` スクリプト）を確認する

### UXルールの読み込み（必須）
以下を実装前に必ず読み込み、違反しないことを確認する。

```
docs/rules/react.md                     ← React.FC禁止・props interface・フック規約
docs/rules/TypeScript.md                ← any禁止・readonly・明示的戻り値型
docs/spec/design/ux/component-structure.md   ← Atomic Design 依存方向（R-ATOM-01〜05）
docs/spec/design/ux/visual-design.md         ← デザイントークン（生HEXの置換元）
docs/spec/design/ux/acceptance-criteria.md   ← 受け入れ基準（検収の突き合わせ先）
```
- サウンド系フェーズ（UX-3 等）では `docs/spec/design/ux/sound-haptics.md` も読む
- 演出系フェーズ（UX-6/UX-7）では `docs/spec/design/ux/motivation.md` も読む

### タスク順序の確定
- 計画書のタスク一覧（T1, T2, ...）が実装順（依存順）に並んでいることを確認する

## 出力
このSTEPはファイル出力なし。
タスク一覧・適用ルール・対応ACを次STEPの実装へ引き継ぐ。
