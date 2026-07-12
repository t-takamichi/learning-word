# STEP 7: 受け入れ基準・品質ゲート

**目的**: UI/UX仕様が「完成」と言える条件を、検収可能なチェックリストにする。

## 実施内容
以下の領域ごとにACをチェックリスト化する。
- **ビジュアル**: トークン化・AAコントラスト・真っ黒不使用・やさしい印象
- **モチベーション**: 3チャンネル200ms・Again非難しない・進捗可視・完了祝福
- **サウンド**: Nice!が即時・ミュート保持・音無しでも成立・vibrate存在チェック
- **Atomic Design**: 層分類・一方向依存・生HEX不使用・状態はOrganism/Pageに閉じる・既存移行
- **品質バー**: quality-bar のチェックが全✅・クライマックスあり・やりすぎ無し
- **制約**: セーフエリア・44px・16px・reduced-motion

## 出力先
`docs/spec/design/ux/acceptance-criteria.md`

## 完了後
- README のドキュメントリンクが全て揃っているか確認
- 品質ゲート（`rules/quality-gate.md`）を実行
- `/ux-impl-plan` を案内する
