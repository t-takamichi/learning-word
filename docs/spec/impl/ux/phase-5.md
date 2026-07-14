# UX-5 実装計画書: Organisms（有機体）

親: [README.md](./README.md)

## 1. 参照
- UI/UX 仕様: [component-structure.md](../../design/ux/component-structure.md) §3 Organisms・§6 移行対応表
- ビジュアル: [visual-design.md](../../design/ux/visual-design.md) §5.1・§5.6
- モチベ: [motivation.md](../../design/ux/motivation.md) §5 完了祝福
- 受け入れ基準: [acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §2・§4

## 2. このフェーズのゴール
- `components/organisms/` を新設し、Molecule とドメイン状態を束ねる主要ブロックを実装する
- `FlashCard` を移行＋刷新（色・フリップ演出）、`WordList` を移設、`CompleteScreen` を分解
- 新規 Organism（SessionHeader / CelebrationOverlay / CompleteSummary）を実装する
- Organism はフック（`useSound` 等）と接続してよい（R-ATOM-03）
- FlashCard のカード表示枠を広げ、スクロール不要で翻訳および例文を一目で確認できるようにする（デザインの美しさを維持しつつ、高さを380px〜400px、例文のmax-heightを140px以上に拡張する）
- カード裏面が表示された際、自動的に単語と例文（`${word.english}. ${word.example_en}`）をゆっくりめの速度（0.8倍速）で発音（再生）する。再レンダリングによる重複再生（複数回再生）を防ぐための refs 制御を導入し、1回のみ再生されるようにする。自動再生モード時も裏面表示でゆっくり重複なく発音し、発音完了後に待機時間のカウントを開始する。

## 3. 前提・依存
- 依存フェーズ: UX-4（Molecules）
- 演出の**結線（Good ハンドラ・完了トリガー）は UX-6** で行う。本フェーズは部品として動く状態まで

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 分類 | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|------|----|---------|-----------|
| T1 | `organisms/FlashCard/*` | 移行(刷新) | 既存を移設。面 `--surface`/角丸 `--radius-card`/影 `--shadow-soft`。英単語 `--ink-900`＋任意で `--berry-200` 下線。裏返し Y 軸フリップ(180ms)・`prefers-reduced-motion` でクロスフェード。「こたえを見る」ボタン。カード高さを380px〜400px、例文のmax-heightを140pxに拡張し、裏面表示時に単語と例文をゆっくり（0.8倍速）かつ重複（複数回再生）なしで自動発音する。 | Organism | 目視＋フリップ／reduced-motion | visual-design §5.1, react.md |
| T2 | `organisms/WordList/*` | 移行 | 既存 `WordList` を移設。WordListItem×N の 10 件リスト | Organism | 目視（リスト） | R-ATOM-04 |
| T3 | `organisms/SessionHeader/*` | 新規 | Mascot+ProgressIndicator+StreakBadge+MuteButton。学習画面ヘッダー | Organism | 目視（ヘッダー要素） | motivation §3,§4 |
| T4 | `organisms/CelebrationOverlay/*` | 新規 | Confetti(ピンク/ミント/サニー)+Mascot(cheer)+Sparkle。`active`/`variant`(combo/complete)。2.5秒で収束。`prefers-reduced-motion` で静的イラスト置換。`useSound('complete')` と連動可 | Organism | 目視／reduced-motion | motivation §5, 制約 §6 |
| T5 | `organisms/CompleteSummary/*` | 置換 | 既存 `CompleteScreen` を分解。StatItem×3（枚数/正解/最高コンボ）+Mascot(cheer)「ぜんぶできたね！」+Button×2（もういちど/単語リスト） | Organism | 目視（サマリー） | motivation §5 |
| T6 | `organisms/AutoPlayControls/*` | 移行 | StudyPage 内の Auto-Play UI を抽出。**既定折りたたみ**：ヘッダーは「じどうめくり」ピルトグルのみ、秒数設定は展開時に表示（`--berry-100` 面） | Organism | 目視（折りたたみ/展開） | visual-design §5.6, F-9 |

## 5. タスク詳細（要点）

### T1: FlashCard 刷新
- 既存の反転ロジック（`isAnswerVisible`/`onShowAnswer` 等）は維持。**見た目とフリップ演出のみ刷新**。
- 表面の英単語 `--ink-900`、裏面翻訳は `--mint-500`（[visual-design.md](../../design/ux/visual-design.md) §2）。
- Y 軸フリップ 180ms ease-out。`@media (prefers-reduced-motion: reduce)` はクロスフェードに簡略化。
- カードの縦幅を `320px` から `380px`（または `400px`）に広げ、例文エリア（`.examples`）の `max-height` を `140px` に広げることで、スクロールなしで翻訳と例文（英文と訳）を表示できるようにする。
- 裏面表示時、自動的に単語と例文（`${word.english}. ${word.example_en}`）をゆっくり（0.8倍速）で自動発音する。再レンダリングやキャッシュ更新などによる重複トリガー（複数回発音されるバグ）を防ぐために refs による制御を施し、1回のめくりにつき1回のみ発音されるように配線する。

### T4: CelebrationOverlay
- Confetti は軽量実装（CSS/canvas いずれか。過剰実装しない）。2.5 秒で自然収束。
- `prefers-reduced-motion` 時は**静的イラスト**に置換（アニメを止める）。
- `variant='combo'`（3/5/10 到達）と `variant='complete'`（完了）で見せ方を切替。**発火タイミングの結線は UX-6/UX-7**。

### T5: CompleteSummary（置換の分解）
- 既存 `CompleteScreen` は `CompleteTemplate`（UX-6）+ `CompleteSummary` + `CelebrationOverlay` に分解する（component-structure §6）。
- 本タスクは**サマリー表示部**を担う。`total`/`correct`/`bestCombo` は props で受け（集計は Page 側）。
- ボタン文言はやさしい応援形（「もういちど」「単語リストを見る」）。

### T6: AutoPlayControls（F-9 是正）
- 現状は秒数入力を含む設定がヘッダー上部に常時露出し主役（カード）を食っている。
- **既定は折りたたみ**、展開時のみ秒数（「おもて／うら（秒）」）を表示。視覚重みを脇役に落とす。
- `useAutoPlay` フックのロジックは変更しない（UI 再配置のみ）。

## 6. 受け入れ基準（AC）
- [ ] 6つの Organism が `components/organisms/` に分類配置されている
- [ ] FlashCard が移行対応表どおり移設され、Berry スタイル・フリップ演出になっている
- [ ] FlashCard の表示領域（高さ380px〜400px）および例文表示枠（最大高さ140px以上）が確保され、スクロールなしで翻訳と言語別の例文が一目で確認できること
- [ ] FlashCard が裏面表示された際、自動的に単語と例文（英文）がゆっくり（0.8倍速）重複なく1回のみ発音されること。また、自動再生モード時は発音完了後に待機時間のカウントダウンが開始されること
- [ ] FlashCard フリップが `prefers-reduced-motion` でクロスフェードに簡略化
- [ ] CompleteScreen が CompleteSummary/CelebrationOverlay に分解されている
- [ ] CelebrationOverlay が `prefers-reduced-motion` で静的化する
- [ ] AutoPlayControls が既定で折りたたまれている（F-9）
- [ ] ドメイン状態・API は Organism/Page に閉じている（R-ATOM-03）

## 7. 検証手順
- 型: `bun run typecheck`
- 目視: 各 Organism を仮配置し、FlashCard 反転・Overlay 発火（手動 active）・折りたたみ展開を確認
- アクセシビリティ: reduced-motion でフリップ/Confetti が簡略化、タップ 44px 以上
