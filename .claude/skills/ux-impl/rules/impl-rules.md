# UX Impl Rules

UI/UX実装時に必ず守るルール。違反する実装は受け付けない。

---

## 前提ルール

### R-UXIM-PRE-01: 実装前に UXルールを必ず読む
- `docs/rules/react.md` `docs/rules/TypeScript.md` を実装前に確認する
- `docs/spec/design/ux/component-structure.md`（R-ATOM-*）と `visual-design.md`（トークン）を確認する
- これらに反する実装をしない

### R-UXIM-PRE-02: 計画書に沿って実装する
- `docs/spec/impl/ux/phase-<N>.md` のタスク（T1→Tn）を順序どおりに実装する
- 計画に存在しない作業を勝手に追加しない（必要ならユーザーへ確認）

---

## 実装ルール

### R-UXIM-01: Atomic Design の依存方向を守る
- 依存は常に一方向：`Pages → Templates → Organisms → Molecules → Atoms → Tokens`
- 下位（Atom）は上位（Molecule 以上）を import しない（R-ATOM-01）
- ドメインデータ・API・グローバル状態は Organism/Page でのみ扱う（R-ATOM-03）

### R-UXIM-02: デザイントークンを必ず参照する（生HEX禁止）
- 色・余白・角丸・影は `:root` のトークン（`--berry-*` 等）を参照する（R-ATOM-02）
- コンポーネントの `*.module.css` に生の HEX を書かない
- 例外は `index.css` の `:root` 定義と、管理画面のエラー色 `#E5484D` のみ

### R-UXIM-03: 機能ロジックを壊さない
- 出題アルゴリズム・API・DBスキーマ・既存フック（`useSession`/`useSpeech`/`useAutoPlay` 等）のシグネチャを変更しない
- UI/UX層（見た目・演出・結線・文言）に変更を限定する

### R-UXIM-04: iOS Safari / アクセシビリティ制約を織り込む
- サウンドは初回ユーザー操作で `AudioContext.resume()` 解錠、`navigator.vibrate` は存在チェック必須
- 各アニメに `@media (prefers-reduced-motion: reduce)` の簡略版を用意する
- セーフエリア `env(safe-area-inset-*)`・タップ44px・本文16px を守る

### R-UXIM-05: 型安全を徹底する
- `any` を安易に使わない。動的な型は `unknown` + 型ガード
- 関数コンポーネントは `interface Props` を明示（`React.FC` 禁止）
- 公開関数・フックの戻り値に明示的な型注釈

### R-UXIM-06: 既存を活かす（移行優先）／スタイルを合わせる
- 「全部作り直す」を避け、既存コンポーネントの移行/置換を優先する
- 移行時は import 参照の更新箇所を洗い出す
- 周囲の命名・フォーマット・コメント密度に合わせ、無関係なリファクタリングを混ぜない

### R-UXIM-07: スコープを守る
- Could（XP/レベル/週間カレンダー）を勝手に実装しない
- 1タスク=1関心事。独立して検証できる粒度を保つ

### R-UXIM-08: 破壊的操作は確認してから行う
- 既存ファイルの大幅な上書き・旧コンポーネントの削除は、参照が新パスに切替わったことを確認してから行う

---

## 報告ルール

### R-UXIM-REP-01: 結果を正直に報告する
- 型チェック・目視・iOS実機の各検証結果を明示する
- iOS実機で未検証の項目は「未検証」と明示する（勝手に「動作確認済み」と書かない）
- 「完了」と言えるのは検証が通ったときだけ
