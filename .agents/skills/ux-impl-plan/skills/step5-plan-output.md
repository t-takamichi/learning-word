# STEP 5: 受け入れ基準・検証手順・全体整合

**目的**: 計画を検収可能にし、`/impl` に安全に渡せる状態へ仕上げる。

## 実施内容
1. **各フェーズにACを付与**: `docs/spec/design/ux/acceptance-criteria.md` の項目を、該当フェーズの完了条件に写す
2. **検証手順**: フェーズ末に「何をどう確認したら完了か」を書く
   - 型: `bun run typecheck`
   - 目視: ブラウザで対象画面
   - 実機: iOS Safari（音の解錠・セーフエリア・vibrate無害）
   - アクセシビリティ: reduced-motion / コントラスト / ミュート保持
3. **全体整合チェック**:
   - フェーズ依存が矛盾していないか（下位→上位の順か）
   - Could（XP等スコープ外）が紛れ込んでいないか
   - 既存機能（出題ロジック・API）を壊す計画になっていないか
4. **リンク整備**: `docs/spec/impl/ux/README.md` から各 phase-N.md / component-tasks.md へリンク

## 出力先
- 各計画書へ追記、`docs/spec/impl/ux/README.md` を最終化

## 完了後
- 品質ゲート（`rules/quality-gate.md`）を実行
- `/impl <フェーズ番号>` を案内する
