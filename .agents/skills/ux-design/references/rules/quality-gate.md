# Quality Gate — UI/UX設計 完了チェックリスト

全項目を満たしたら「UI/UX設計完了」とし、`/ux-impl-plan` へ進む。

## 成果物
- [ ] `ux/README.md`（コンセプト・原則・スコープ・リンク）
- [ ] `ux/visual-design.md`（トークン＋黒→新の置換表＋:root実装）
- [ ] `ux/component-structure.md`（Atomic Design 全層＋移行対応表）
- [ ] `ux/motivation.md`（正解演出・ストリーク・完了祝福・マイクロコピー）
- [ ] `ux/sound-haptics.md`（Nice!音・iOS制約対応・useSound責務）
- [ ] `ux/quality-bar.md`（感情曲線・PM判定・やりすぎ防止）
- [ ] `ux/acceptance-criteria.md`（領域別AC）

## ビジュアル
- [ ] 色がトークン化され、生HEXが仕様に散らばっていない
- [ ] 真っ黒不使用・本文AAコントラスト確保
- [ ] 黒→新テーマの置換対応表がある

## Atomic Design
- [ ] Atoms〜Pages 全層が定義されている
- [ ] 依存が一方向で説明されている
- [ ] 既存コンポーネントの移行対応表がある

## 感情・音
- [ ] 正解に音×視覚×言葉のフィードバックが設計されている
- [ ] Againが罰にならない設計
- [ ] iOS Safariの音・vibration制約への対応が明記されている
- [ ] reduced-motion・ミュートの配慮がある

## 品質
- [ ] 感情曲線に完了のクライマックスがある
- [ ] やりすぎ防止（Anti-goal）が定義されている
- [ ] 各領域にACがある

## 判定
- 全✅ → 設計完了。`/ux-impl-plan` へ
- 未✅ → 該当STEPへ戻る
