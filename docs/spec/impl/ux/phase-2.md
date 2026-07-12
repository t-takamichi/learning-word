# UX-2 実装計画書: Atoms（原子）

親: [README.md](./README.md)

## 1. 参照
- UI/UX 仕様: [component-structure.md](../../design/ux/component-structure.md) §1 Atoms・§7 設計ルール
- ビジュアル: [visual-design.md](../../design/ux/visual-design.md) §2 タイポ・§4 マスコット・§5 コンポーネント
- 受け入れ基準: [acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §4 Atomic 構造

## 2. このフェーズのゴール
- `src/client/components/atoms/` を新設し、状態を持たない純粋表示部品を実装する
- 各 Atom は **トークンのみ参照**（生 HEX 禁止・R-ATOM-02）、Molecule 以上を import しない（R-ATOM-01）
- 上位（Molecules/Organisms）が組み立てられる土台を揃える

## 3. 前提・依存
- 依存フェーズ: UX-1（トークン定義済み）
- 並行: UX-3（サウンド基盤）と並行着手可

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|----|---------|-----------|
| T1 | `atoms/Text/Text.tsx` + `.module.css` | タイポ統一。`variant`(word/translation/heading/body/hint) を [visual-design.md](../../design/ux/visual-design.md) §2 のサイズ/ウェイト/色に対応 | Atom | `bun run typecheck` / Storybook 代替として一時ページで目視 | react.md, R-ATOM-02 |
| T2 | `atoms/Icon/Icon.tsx` + `.module.css` | SVG アイコン。`name`(speaker/heart/flame/check/star/sound-on/sound-off), `size`。既定色 `--berry-500` | Atom | 目視（各 name 表示） | R-ATOM-02 |
| T3 | `atoms/Button/Button.tsx` + `.module.css` | 全ボタンの土台。`variant`(primary/ghost/soft/danger), `size`, `fullWidth`。ぷっくり影・押下で沈む（`translateY(1px)`+`--shadow-press`）・min-height 44px | Atom | 目視（variant 別） | react.md, visual-design §3,§5.5 |
| T4 | `atoms/Chip/Chip.tsx` + `.module.css` | ピル型ラベル。`tone`(berry/mint/lavender)・`--radius-pill` | Atom | 目視 | R-ATOM-02 |
| T5 | `atoms/Badge/Badge.tsx` + `.module.css` | 数値/カウント。`value`, `tone` | Atom | 目視 | R-ATOM-02 |
| T6 | `atoms/StatusDot/StatusDot.tsx` + `.module.css` | new=`--lavender-500` / weak=`--coral-500` / mastered=`--mint-500` の小ドット | Atom | 目視（3状態） | visual-design §5.7 |
| T7 | `atoms/Mascot/Mascot.tsx` + `.module.css` | 相棒 Berry。`mood`(idle/happy/cheer)。まず 🍓 絵文字 or 簡易 SVG 1点で最小コスト | Atom | 目視（3 mood） | visual-design §4 |
| T8 | `atoms/Sparkle/Sparkle.tsx` + `.module.css` | 正解の粒。`count`, `color`(`--sunny-400`/`--mint-500`)。`@media (prefers-reduced-motion: reduce)` で静的表示 | Atom | 目視 / reduced-motion 確認 | motivation §2, 制約 §6 |
| T9 | `atoms/SoundToggle/SoundToggle.tsx` + `.module.css` | 🔊/🔈 アイコン（Icon 利用）。`muted`・`--radius-pill` | Atom | 目視（muted 切替） | sound-haptics §3.3 |

## 5. タスク詳細（要点・共通）
- **props interface を明示**（`interface Props { ... }`、`React.FC` 禁止 — react.md）。
- 各 Atom は `Component.tsx` + `Component.module.css`（＋必要なら `index.ts`）で1ディレクトリ（R-ATOM-04）。
- **ビジネスロジック・API・状態管理を持たない**（R-ATOM-03）。見た目は props で決まる純粋部品。
- 色・余白・角丸・影は必ずトークン参照（R-ATOM-02）。生 HEX を書かない。
- `Sparkle` / `Mascot` のアニメは軽量に。`prefers-reduced-motion` 簡略版を CSS で用意（P4）。
- **目視検証**：Storybook が無いため、`src/client/pages/` に一時的な確認用ページ、または既存画面に仮配置して確認 → 完了後に撤去してよい（一時確認手段はコミットに残さない）。

## 6. 受け入れ基準（AC）
[acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §4 と対応：
- [ ] 9つの Atom が `components/atoms/` 配下に分類配置されている
- [ ] Atom が Molecule 以上を import していない（依存一方向・R-ATOM-01）
- [ ] Atom に生の HEX が無く、トークン参照になっている（R-ATOM-02）
- [ ] Atom がドメイン状態・API を持たない純粋部品（R-ATOM-03）
- [ ] `Sparkle` が `prefers-reduced-motion` で静的化する

## 7. 検証手順
- 型: `bun run typecheck`
- 目視: 各 Atom を仮配置し variant/mood/status を切替えて確認
- アクセシビリティ: `Button` のタップ範囲 44px 以上、`Sparkle`/`Mascot` の reduced-motion 簡略化
