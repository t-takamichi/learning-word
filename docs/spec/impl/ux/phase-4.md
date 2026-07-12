# UX-4 実装計画書: Molecules（分子）

親: [README.md](./README.md)

## 1. 参照
- UI/UX 仕様: [component-structure.md](../../design/ux/component-structure.md) §2 Molecules
- ビジュアル: [visual-design.md](../../design/ux/visual-design.md) §5.2〜5.4・§5.7
- モチベ: [motivation.md](../../design/ux/motivation.md) §2・§3・§4
- 受け入れ基準: [acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §2・§4

## 2. このフェーズのゴール
- `components/molecules/` を新設し、Atom を組み合わせた意味のあるまとまりを実装する
- 既存 Molecule（AudioButton / LanguageToggle / ReviewButtons / WordListItem）を**移行**する
- 新規 Molecule（ProgressIndicator / StreakBadge / SuccessToast / MuteButton / StatItem）を追加する
- **ドメインデータは props 受け取り**（R-ATOM-03）。ローカルな見た目状態（hover 等）は可

## 3. 前提・依存
- 依存フェーズ: UX-2（Atoms）、UX-3（`useSound`／MuteButton の音制御で使用）

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 分類 | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|------|----|---------|-----------|
| T1 | `molecules/AudioButton/*` | 移行 | 既存 `components/AudioButton` を移設。Icon(speaker)+Button 構成に整理。**発音機能は維持**（`useSpeech`） | Molecule | 目視＋発音再生 | react.md, R-ATOM-04 |
| T2 | `molecules/LanguageToggle/*` | 移行 | 既存を移設。Chip×2（🇻🇳/🇯🇵）。`language`,`onToggle` props | Molecule | 目視＋切替 | motivation §8 |
| T3 | `molecules/ReviewButtons/*` | 移行 | 既存を移設。もういちど＝Button(soft/danger 枠 coral)／できた！＝Button(primary=mint 塗り)。**❌ 記号を廃止**、文言を「もういちど」「できた！」に | Molecule | 目視（配色・文言） | motivation §2, F-6, visual-design §5.2 |
| T4 | `molecules/ProgressIndicator/*` | 新規 | ProgressBar+Badge+Text。`current`/`total` を受け、**完了数基準**で `4/10` 表示。残り2枚で「あと少し！」 | Molecule | 目視（進捗・励まし） | motivation §3, F-7 |
| T5 | `molecules/StreakBadge/*` | 新規 | Icon(flame)+Badge。`count`。2連続以上で `🔥N` 表示 | Molecule | 目視（count 別） | motivation §4 |
| T6 | `molecules/SuccessToast/*` | 新規 | Text+Sparkle。`message`/`visible`。下から出て自動で消える。`prefers-reduced-motion` で簡略化 | Molecule | 目視／reduced-motion | motivation §2 |
| T7 | `molecules/MuteButton/*` | 新規 | SoundToggle を包み `useSound` の `setMuted`/`isMuted` と結線。既定 ON、ワンタップ切替 | Molecule | 目視＋ミュート保持 | sound-haptics §3.3 |
| T8 | `molecules/WordListItem/*` | 移行 | 既存 `WordListItem` を移設。Text×2+AudioButton+**StatusDot 追加**（new/weak/mastered） | Molecule | 目視（1行表示） | visual-design §5.4, §5.7 |
| T9 | `molecules/StatItem/*` | 新規 | Text(label)+Text(value)。完了サマリーの1項目 | Molecule | 目視 | motivation §5 |

## 5. タスク詳細（要点）
- **移行タスク（T1〜T3, T8）**：ロジックはそのまま、見た目を Atom 合成に置換。**import パスの更新はまだ Page 側に反映しない**（UX-6 で切替）。移行先を作り、旧ファイルは UX-6 まで残置してもよい（typecheck を通す）。
- **T3 ReviewButtons**：`onGood`/`onAgain` を props で受けるのみ。**正解演出（音・Sparkle・Toast）の発火は Organism/Page 側で結線**（UX-6）。Molecule はドメインを持たない。
- **T4 ProgressIndicator**：現状 `currentIndex/total`（0始まり）を、**完了数基準**の値で受ける（変換ロジックは Page 側 UX-6）。Molecule は受けた `current`/`total` を表示するだけ。残り2枚（`total - current <= 2`）で励ましコピー。
- **T7 MuteButton**：`useSound` はフックのため、Molecule 内で直接呼ぶか、`muted`/`onToggle` を props で受ける薄い実装のどちらでもよい。ドメイン状態ではないので Molecule 内フック利用可。
- 色・角丸・影は全てトークン参照（生 HEX 禁止）。

## 6. 受け入れ基準（AC）
- [ ] 9つの Molecule が `components/molecules/` に分類配置されている
- [ ] 既存 4 Molecule（AudioButton/LanguageToggle/ReviewButtons/WordListItem）が機能維持で移設されている
- [ ] ReviewButtons から ❌ 記号が外れ、責めない配色・文言（F-6）
- [ ] ProgressIndicator が完了数基準で、残り2枚の励ましが出る（F-7）
- [ ] WordListItem に StatusDot が表示される
- [ ] Molecule が生 HEX を持たずトークン参照（R-ATOM-02）
- [ ] SuccessToast が `prefers-reduced-motion` で簡略化される

## 7. 検証手順
- 型: `bun run typecheck`
- 目視: 各 Molecule を仮配置し props を切替えて確認（AudioButton は発音再生も）
- アクセシビリティ: タップ 44px 以上、reduced-motion で Toast/Sparkle 簡略化
