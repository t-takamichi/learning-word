# Acceptance Criteria & Quality Gate — UI/UX

親: [README.md](./README.md)

UI/UX仕様が「完成した」と言える条件。実装完了時にこのゲートで検収する。

---

## 1. ビジュアル（[visual-design.md](./visual-design.md)）

- [ ] 背景・面・テキストが黒ベースから Berry（ピンク）トークンへ置換されている
- [ ] `:root` にデザイントークン（色・角丸・影）が定義され、`*.module.css` が生値でなくトークンを参照する
- [ ] 本文テキストが背景に対し WCAG AA（4.5:1）以上
- [ ] 真っ黒 `#000` を使っていない（テキストは `--ink-*`）
- [ ] 角丸・ソフト影・丸ゴシックで「やさしい」印象が成立している

## 2. モチベーション（[motivation.md](./motivation.md)）

- [ ] Good タップで 音・視覚・言葉の3チャンネルが 200ms 以内に発火
- [ ] Again が責めない演出（強い赤・エラー音なし）
- [ ] 進捗が「現在/全体」で常時見え、残り2枚で励ましが出る
- [ ] 進捗が0始まりでなく、1枚回答で「1/10」と感じられる（F-7）
- [ ] Again から ❌ 記号が外れ、責めない配色・文言になっている（F-6）
- [ ] UI文言に英語混在（Auto-Play/Front/Back等）が残っていない（F-5）
- [ ] Auto-Play設定が既定で折りたたまれ、主役がカードになっている（F-9）
- [ ] 完了画面にサマリー＋マスコットの祝福がある
- [ ] コンボ（Should）が実装される場合、3/5/10で強い祝福が出る

## 3. サウンド & ハプティクス（[sound-haptics.md](./sound-haptics.md)）

- [ ] 初回ユーザー操作後、`sfx.correct`（Nice!）が体感即時で鳴る
- [ ] ミュートがワンタップででき、状態が再訪時も保持される（localStorage）
- [ ] 音が鳴らない環境でも視覚だけで正解の実感が得られる
- [ ] `navigator.vibrate` は存在チェック済みで iOS Safari でエラーにならない

## 4. Atomic Design 構造（[component-structure.md](./component-structure.md)）

- [ ] コンポーネントが atoms/molecules/organisms/templates/pages に分類配置されている
- [ ] 依存が一方向（下位が上位を import しない）
- [ ] Atom/Molecule に生のHEXが無く、トークン参照になっている
- [ ] ドメイン状態・API は Organism/Page に閉じている
- [ ] 既存コンポーネント（FlashCard等）が移行対応表どおり再配置されている

## 5. 品質バー（[quality-bar.md](./quality-bar.md)）

- [ ] quality-bar.md の合否チェックリスト（Delight/Reward/Consistency/Craft/Respect）が全て✅
- [ ] 感情曲線に沿い、完了に"クライマックス"がある
- [ ] やりすぎ（常時アニメ・鳴りっぱなし・長い祝福）になっていない

## 6. 制約（iPhone / Safari）

- [ ] セーフエリア確保、タップ44px以上、本文16px以上
- [ ] `prefers-reduced-motion` で祝福・フリップが簡略化される

---

## 判定

- **全項目✅** → UI/UX完了。実装計画（`/ux-impl-plan`）へ。
- **未チェックあり** → 該当ドキュメントに戻って補完。
