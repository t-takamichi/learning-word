# UX-6 実装計画書: Templates & Pages 結線

親: [README.md](./README.md)

> **体験の核心フェーズ**。Good ハンドラに「音×視覚×言葉」を 200ms 以内で結線し、"正解が報われる"を実現する。

## 1. 参照
- UI/UX 仕様: [component-structure.md](../../design/ux/component-structure.md) §4 Templates・§5 Pages
- モチベ: [motivation.md](../../design/ux/motivation.md) §2 正解フィードバック・§3 進捗・§8 マイクロコピー
- サウンド: [sound-haptics.md](../../design/ux/sound-haptics.md) §2 iOS 解錠
- 受け入れ基準: [acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §2・§3・§6

## 2. このフェーズのゴール
- `components/templates/` を新設し、配置・レスポンシブ・セーフエリア・最大幅を担う骨組みを作る
- 既存 `StudyPage` を Template 結線へ更新し、**旧 import を新 Atomic パスへ切替**
- **Good タップで音・視覚・言葉の3チャンネルを 200ms 以内に発火**（最優先 F-1）
- 進捗を**完了数基準**に是正（F-7）、初回操作で `useSound.unlock()`（iOS 解錠）
- UI 文言の**英語混在を解消**（F-5）、Auto-Play の折りたたみ結線（F-9）

## 3. 前提・依存
- 依存フェーズ: UX-5（Organisms）
- **機能ロジック（`useSession`/`useSpeech`/`useAutoPlay`/API）は変更しない**。結線とレイアウトのみ

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|----|---------|-----------|
| T1 | `templates/StudyTemplate/*` | SessionHeader+FlashCard+ReviewButtons+CelebrationOverlay の配置。セーフエリア `env(safe-area-inset-*)`・8pt グリッド・最大幅 448–480px 中央寄せ | Template | 目視（レイアウト骨組み） | 制約 §6, R-ATOM-01 |
| T2 | `templates/CompleteTemplate/*` | CelebrationOverlay+CompleteSummary の配置 | Template | 目視 | motivation §5 |
| T3 | `templates/WordListTemplate/*` | SessionHeader(簡易)+WordList の配置 | Template | 目視 | 制約 §6 |
| T4 | `pages/StudyPage.tsx`（編集） | 新 Atomic import へ切替。StudyTemplate 結線。初回操作で `useSound.unlock()`。進捗を完了数基準に変換。Auto-Play を AutoPlayControls（折りたたみ）に置換 | Page | 目視＋iOS 実機 | react.md, F-5/F-7/F-9 |
| T5 | **正解演出の結線**（StudyPage Good ハンドラ） | `onGood` で `useSound.play('correct')` ＋ FlashCard バウンス ＋ Sparkle ＋ SuccessToast を**同一ハンドラで即時発火**（200ms 以内）。vibrate(15) | Page | iOS 実機で同時発火計測 | motivation §2 |
| T6 | **Again 結線**（StudyPage Again ハンドラ） | `play('again')`（やわらか低音）＋「だいじょうぶ、もういちど♪」。**強い赤・エラー音・❌ を出さない** | Page | 目視＋耳確認 | motivation §2, F-6 |
| T7 | マイクロコピー統一（StudyPage 他） | 英語 UI（Auto-Play/Front/Back/Tiến độ/Loading 等）を [motivation.md](../../design/ux/motivation.md) §8 のやさしい日本語へ全面置換 | Page | 目視（全文言） | motivation §8, F-5 |
| T8 | 旧コンポーネント撤去 | 移行済みの `components/{FlashCard,WordList,ReviewButtons,AudioButton,LanguageToggle,CompleteScreen}` 旧ファイルを削除、参照が新パスのみになったことを確認 | 共通 | `bun run typecheck` / grep で旧 import ゼロ | R-ATOM-04 |

## 5. タスク詳細

### T4: StudyPage 結線・進捗是正（F-7）
- 現状 `currentIndex / words.length`（0始まり）を、**完了数基準**へ是正：回答済み枚数（例 `completedCount`）を `current` として ProgressIndicator に渡し、1枚回答＝「1/10」と感じられるようにする。
- 初回のユーザー操作（最初のタップ）で `useSound.unlock()` を呼び、以降のプログラム再生を解錠（[sound-haptics.md](../../design/ux/sound-haptics.md) §2）。
- `useSession`/`useAutoPlay` の呼び出しシグネチャは維持（機能を壊さない）。

### T5: 正解演出の結線（最優先・F-1）
- **1つの `onGood` ハンドラ内で3チャンネルを即時発火**（[motivation.md](../../design/ux/motivation.md) §2）：
  ```
  🔊 useSound.play('correct')     // Nice! 上昇音
  ✨ FlashCard バウンス + Sparkle  // scale 1.0→1.04→1.0 (220ms) + ミントのチェック+粒
  💬 SuccessToast 表示            // "Nice! / いいね！ / その調子！ / さすが！" ランダム
  📳 navigator.vibrate?.(15)      // 対応端末のみ
  ```
- **200ms 以内**に全チャンネルが立ち上がること。既存の `submitReview('good')`（API）はそのまま呼ぶ（演出は非同期の完了を待たない）。

### T6: Again 結線（F-6）
- `play('again')` はやわらかい低音、文言「だいじょうぶ、もういちど♪」。**責める演出をしない**（強い赤・エラー音・❌ 廃止）。

### T7: マイクロコピー（F-5）
- [motivation.md](../../design/ux/motivation.md) §8 対応表に沿って全 UI 文言を置換：
  「こたえを見る／できた！／もういちど／じどうめくり ON/OFF／おもて・うら（秒）／じゅんびちゅう…／いまここ」等。
- 学習対象の英単語と UI の英語が混同されないよう、UI はやさしい日本語ベースに統一。

### T8: 旧コンポーネント撤去
- 全 Page が新 Atomic パスを参照した後、旧 `components/*` を削除。`bun run typecheck` と grep（旧パス import ゼロ）で担保。

## 6. 受け入れ基準（AC）
[acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §2・§3 と対応：
- [ ] Good タップで 音・視覚・言葉の3チャンネルが 200ms 以内に発火
- [ ] Again が責めない演出（強い赤・エラー音・❌ なし）
- [ ] 進捗が「現在/全体」で常時見え、0始まりでなく1枚回答で「1/10」（F-7）
- [ ] 残り2枚で励ましが出る
- [ ] UI 文言に英語混在（Auto-Play/Front/Back 等）が残っていない（F-5）
- [ ] Auto-Play 設定が既定で折りたたまれ、主役がカードになっている（F-9）
- [ ] 初回操作後 `sfx.correct` が体感即時で鳴る（iOS 解錠済み）
- [ ] セーフエリア確保・タップ 44px・本文 16px 以上（制約 §6）
- [ ] 旧 `components/*` への import が残っていない

## 7. 検証手順
- 型: `bun run typecheck`
- 目視: 学習画面で Good/Again の演出、進捗表示、Auto-Play 折りたたみ、全文言
- iOS 実機: 初回タップ後の Good で "Nice!" が即時に鳴り、3チャンネルが同時に立つ／セーフエリア崩れなし
- アクセシビリティ: reduced-motion で演出簡略化、コントラスト AA
