# UX-1 実装計画書: デザイントークン基盤

親: [README.md](./README.md)

## 1. 参照
- UI/UX 仕様: [visual-design.md](../../design/ux/visual-design.md) §1・§3・§6
- 受け入れ基準: [acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §1 ビジュアル
- 規約: [react.md](../../../rules/react.md) / [TypeScript.md](../../../rules/TypeScript.md)

## 2. このフェーズのゴール
- `src/client/index.css` の `:root` に Berry デザイントークン（色・角丸・影）が定義される
- 背景を `#0c0d12`（黒）→ `--bg-gradient`（ピンク）へ、本文を白 → `--ink-*` へ置換する
- 既存の各 `*.module.css` の**生 HEX を全てトークン参照に置換**する（[visual-design.md](../../design/ux/visual-design.md) §1.5 黒→ピンク置換表）
- **最小の見た目移行**：構造は変えず色・影・角丸・フォントだけを Berry 化する

## 3. 前提・依存
- 依存フェーズ: なし（UX の最初のフェーズ）
- 既存の全 `*.module.css`（StudyPage / FlashCard / AudioButton / ReviewButtons / CompleteScreen / WordList / LanguageToggle / AdminPage）が対象

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|----|---------|-----------|
| T1 | `src/client/index.css`（編集） | `:root` に Berry トークン定義（色・角丸・影）＋ `body` 背景グラデ・フォントファミリー・既定テキスト色 | Tokens | `bun run typecheck` / ブラウザで背景ピンク化確認 | visual-design §6 |
| T2 | `src/client/pages/StudyPage.module.css`（編集） | 背景・本文・ボーダー・影の生値をトークンへ置換 | Tokens | ブラウザ目視（学習画面） | R-ATOM-02 |
| T3 | `src/client/components/FlashCard/FlashCard.module.css`（編集） | 面 `--surface`・角丸 `--radius-card`・影 `--shadow-soft`・英単語 `--ink-900` | Tokens | ブラウザ目視（カード） | visual-design §5.1 |
| T4 | `src/client/components/ReviewButtons/ReviewButtons.module.css`（編集） | もういちど＝枠 `--coral-500`／できた！＝`--mint-500` 塗り＋白文字 | Tokens | ブラウザ目視（評価ボタン） | visual-design §5.2 |
| T5 | `src/client/components/AudioButton/AudioButton.module.css`（編集） | アイコン色 `--berry-500`・角丸 `--radius-btn` | Tokens | ブラウザ目視 | visual-design §5.4 |
| T6 | `src/client/components/CompleteScreen/CompleteScreen.module.css`（編集） | 面・テキスト・ボタンをトークン化 | Tokens | ブラウザ目視（完了画面） | visual-design §1.5 |
| T7 | `src/client/components/WordList/WordList.module.css`（編集） | 各行を白カード（`--radius-btn`・`--shadow-soft`）、見出し `--ink-900`／翻訳 `--ink-700` | Tokens | ブラウザ目視（リスト） | visual-design §5.4 |
| T8 | `src/client/components/LanguageToggle/LanguageToggle.module.css`（編集） | チップを `--berry-100` 面＋`--ink-900`／アクティブ `--berry-500` | Tokens | ブラウザ目視 | visual-design §1.5 |
| T9 | `src/client/pages/AdminPage.module.css`（編集） | 管理画面の黒基調をトークン化（エラー色のみ `#E5484D` 許容） | Tokens | ブラウザ目視（管理） | visual-design §1.4 |

## 5. タスク詳細（要点）

### T1: トークン定義（`index.css`）
- [visual-design.md](../../design/ux/visual-design.md) §6 の `:root` ブロックをそのまま定義する（`--berry-*` / `--mint-*` / `--lavender-500` / `--sunny-400` / `--coral-500` / `--ink-*` / `--surface*` / `--bg-gradient` / `--radius-*` / `--shadow-*`）。
- `body` に `background: var(--bg-gradient)`、`color: var(--ink-700)`、`font-family: "Hiragino Maru Gothic ProN", "Quicksand", "Nunito", system-ui, -apple-system, sans-serif;` を設定。
- `--berry-200`（下線装飾用）が仕様で参照されるため、`#FFC1D6` 相当を追加定義してよい（生 HEX はここ `:root` に集約）。
- 既存の `body[data-lang]` ルールは維持（言語トグル機能を壊さない）。

### T2〜T9: 生値→トークン置換
- [visual-design.md](../../design/ux/visual-design.md) §1.5 の対応表に従う：
  - `#0c0d12` / `radial-gradient(...)` → `var(--bg-gradient)`
  - 本文 `#ffffff` → `var(--ink-700)`、見出し → `var(--ink-900)`
  - カード面 `rgba(255,255,255,0.04)` → `var(--surface)` ＋ ピンク影
  - ボーダー `rgba(255,255,255,0.1)` → `rgba(255,111,165,0.18)`
  - 正解の緑 `#81c784` → `var(--mint-500)`
  - `box-shadow rgba(0,0,0,0.2)` → `var(--shadow-soft)`
- **生 HEX を残さない**（`:root` 以外にハードコード色を書かない）。管理画面のエラー色 `#E5484D` のみ例外として許容。

## 6. 受け入れ基準（AC）
[acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §1 と対応：
- [ ] 背景・面・テキストが黒ベースから Berry トークンへ置換されている
- [ ] `:root` にトークン（色・角丸・影）が定義され、`*.module.css` が生値でなくトークンを参照する
- [ ] 本文テキストが背景に対し WCAG AA（4.5:1）以上（`--ink-700` on `--bg-gradient` を検証）
- [ ] 真っ黒 `#000` を使っていない（テキストは `--ink-*`）
- [ ] 角丸・ソフト影・丸ゴシックで「やさしい」印象が成立

## 7. 検証手順
- 型: `bun run typecheck`
- 目視: `bun run dev` → 学習/リスト/完了/管理の4画面が全てピンク基調で崩れない
- アクセシビリティ: コントラストチェッカで本文 AA を確認、`#000` 直値の grep がゼロ（`:root` と `#E5484D` を除く）
