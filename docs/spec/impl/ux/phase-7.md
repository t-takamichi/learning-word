# UX-7 実装計画書: モチベーション仕上げ（Should）

親: [README.md](./README.md)

## 1. 参照
- モチベ: [motivation.md](../../design/ux/motivation.md) §4 コンボ・§5 完了祝福・§6 デイリー/継続
- サウンド: [sound-haptics.md](../../design/ux/sound-haptics.md) §1 combo/complete・§4 ハプティクス
- 受け入れ基準: [acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §2・§5・§6

## 2. このフェーズのゴール
- 連続正解コンボ（🔥）、完了時の祝福（コンフェッティ＋マスコット＋ファンファーレ）を結線する
- デイリーゴール・継続日数を `localStorage` で軽量導入する
- reduced-motion・ミュート・マイクロコピーの**最終調整**で品質バーを満たす
- **Could（XP/レベル/カレンダー）は実装しない**（過剰実装防止）

## 3. 前提・依存
- 依存フェーズ: UX-6（正解演出の結線が完了していること）
- 本フェーズは Should。V1 の締めとして体験のクライマックスを作る

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|----|---------|-----------|
| T1 | `src/client/hooks/useCombo.ts`（新規） | 連続正解カウント。Good で +1、Again で 0 リセット。3/5/10 到達を通知 | Hook | `bun run typecheck` / 連続正解で確認 | react.md, motivation §4 |
| T2 | StudyPage コンボ結線 | StreakBadge に `count` を反映。3/5/10 で `play('combo')`＋CelebrationOverlay(`variant='combo'`)＋`--sunny-400` バースト＋vibrate([10,30,10])。**リセットは静かに**（大げさに描かない） | Page | 目視＋耳確認 | motivation §4 |
| T3 | CompleteTemplate 完了祝福結線 | 最終カード回答で CelebrationOverlay(`variant='complete'`) 発火：コンフェッティ(2.5s 収束)＋Mascot(cheer)「ぜんぶできたね！」＋`play('complete')`(1.2s 以内)＋CompleteSummary（枚数/正解/最高コンボ）＋vibrate([15,40,15,40,30]) | Page/Template | 目視＋iOS 実機 | motivation §5 |
| T4 | `src/client/hooks/useDailyStreak.ts`（新規） | `localStorage` で継続日数・デイリー達成（1セッション=10枚）を管理。達成でヘッダー ✅、継続日数 `🔥N日` | Hook | リロード跨ぎで保持確認 | motivation §6 |
| T5 | 継続 UI 結線（SessionHeader/CompleteSummary） | デイリー達成・継続日数を表示。**途切れても責めるコピーを出さない** | Page | 目視 | motivation §6 |
| T6 | reduced-motion 最終調整 | 全演出（フリップ/バウンス/Sparkle/Confetti/コンボバースト）が `prefers-reduced-motion` で簡略化されることを総点検 | 共通 | reduced-motion で全画面確認 | 制約 §6 |
| T7 | ミュート・音量最終調整 | 既定音量 0.3〜0.5、ミュート保持、音なしでも視覚で成立を総点検 | 共通 | iOS 実機／ミュート再訪 | sound-haptics §5 |
| T8 | 品質バー総点検 | [quality-bar.md](../../design/ux/quality-bar.md) の合否チェックリスト（Delight/Reward/Consistency/Craft/Respect）を通す。**やりすぎ**（常時アニメ・鳴りっぱなし・長い祝福）になっていないか確認 | 共通 | 感情曲線レビュー | quality-bar.md |

## 5. タスク詳細（要点）

### T2: コンボ（F-8 系・Should）
- 2連続から `🔥N` バッジ。しきい値 3/5/10 で強めの祝福（`--sunny-400` バースト＋上昇音）。
- Again でリセットは**静かに 0 へ**。落胆させる演出をしない（[motivation.md](../../design/ux/motivation.md) §4）。

### T3: 完了祝福（F-4）
- セッション最後のカード回答（`isComplete`）で CompleteTemplate に遷移し、CelebrationOverlay を発火。
- コンフェッティはピンク/ミント/サニー、2.5 秒で自然収束。`prefers-reduced-motion` 時は静的イラスト。
- ファンファーレ `sfx.complete` は 1.2 秒以内で鳴り終わる。

### T4/T5: デイリー・継続日数（Should）
- `localStorage` で軽量に保持（サーバー拡張はスコープ外）。
- 「途切れ回避」より「戻ってこられる優しさ」。途切れても責めない（[motivation.md](../../design/ux/motivation.md) §6）。

### スコープ厳守
- **Could（XP/レベル/スタンプ/週間カレンダー）は実装しない**（[motivation.md](../../design/ux/motivation.md) §7・quality-bar P4）。

## 6. 受け入れ基準（AC）
[acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §2・§5・§6 と対応：
- [ ] コンボが 3/5/10 で強い祝福を出し、Again のリセットが静か
- [ ] 完了画面にサマリー＋マスコットの祝福があり、`sfx.complete` が 1.2 秒以内
- [ ] 継続日数・デイリー達成が localStorage で保持され、途切れを責めない
- [ ] すべての演出が `prefers-reduced-motion` で簡略化される
- [ ] 音は既定 ON、ワンタップでミュートでき設定が保持される
- [ ] やりすぎ（常時アニメ・鳴りっぱなし・長い祝福）になっていない（quality-bar）
- [ ] 感情曲線に沿い、完了に"クライマックス"がある
- [ ] Could（XP 等スコープ外）が混入していない

## 7. 検証手順
- 型: `bun run typecheck`
- 目視: 連続正解でコンボ祝福、セッション完了で祝福＋サマリー、継続日数表示
- iOS 実機: コンボ音/完了ファンファーレ/vibrate（存在チェック）
- アクセシビリティ: reduced-motion 全画面、ミュート再訪保持、コントラスト AA
- 品質: [quality-bar.md](../../design/ux/quality-bar.md) 合否チェックリスト全 ✅
