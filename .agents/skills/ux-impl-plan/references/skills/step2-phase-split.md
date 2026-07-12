# STEP 2: Atomic Design に沿ったフェーズ分割

**目的**: Atomic階層のボトムアップで、安全に積めるフェーズへ分割する。

## 推奨フェーズ（ボトムアップ）
下位が揃うほど上位が速く安全に組める。

| フェーズ | 名前 | 内容 |
|---------|------|------|
| UX-1 | デザイントークン基盤 | `:root` にトークン定義、背景/テキストのピンク化（黒→新の置換表を適用）。最小の見た目移行 |
| UX-2 | Atoms | Button / Icon / Text / Chip / Badge / StatusDot / Mascot / Sparkle / SoundToggle |
| UX-3 | サウンド基盤 | `useSound` フック（AudioContext解錠・play・ミュート保持）。iOS制約対応をここで潰す |
| UX-4 | Molecules | AudioButton / LanguageToggle / ReviewButtons / ProgressIndicator / StreakBadge / SuccessToast / WordListItem（既存移設含む） |
| UX-5 | Organisms | FlashCard刷新 / WordList / SessionHeader / CelebrationOverlay / CompleteSummary |
| UX-6 | Templates & Pages 結線 | StudyTemplate等へ組み上げ、Goodハンドラに正解演出＋音を結線 |
| UX-7 | モチベーション仕上げ | コンボ・完了祝福・デイリー/継続（Should）、reduced-motion/ミュート最終調整 |

- リスクの高い **サウンド（iOS解錠）** を早め（UX-3）に置く
- Could（XP/レベル/カレンダー）は計画に含めない（スコープ厳守）

## 出力先
`docs/spec/impl/ux/README.md`（フェーズ一覧・依存関係・全体ゴール）
- 既存 `docs/spec/impl/phase/` の書式に倣う
