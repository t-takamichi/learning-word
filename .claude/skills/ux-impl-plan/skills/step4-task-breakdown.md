# STEP 4: フェーズ毎タスク分解・順序・依存・見積り

**目的**: 各フェーズを `/impl` で実行できる粒度のタスク列にする。

## タスク表フォーマット（既存 docs/spec/impl/steps/*/plan.md に倣う）
```
| ID | 成果物（ファイル） | 内容 | 層(Atomic) | 検証方法 | 適用ルール |
```

## 各タスクの粒度基準
- 1タスク=1関心事（1コンポーネント or 1フック or 1トークン群）
- 独立して型チェック・目視確認できること
- 依存順に並べる（Tokens→Atoms→…）

## 各タスク詳細に必ず含める
- **ファイル**: 新規/移行/編集の別
- **やること**: 具体的な実装内容
- **トークン参照**: どのデザイントークンを使うか（生HEX禁止）
- **検証方法**: `bun run typecheck` / ブラウザ目視 / iOS Safari実機（音・セーフエリア）
- **適用ルール**: `docs/rules/*` の該当

## 特に注意するタスク
- **useSound（UX-3）**: 初回タップでの `AudioContext.resume()`、`navigator.vibrate` 存在チェック、ミュートのlocalStorage保持 → iOS Safari実機で検証必須
- **正解演出の結線（UX-6）**: Good ハンドラで `play('correct')` ＋ Sparkle ＋ SuccessToast を200ms以内に発火
- **reduced-motion**: 各アニメに `@media (prefers-reduced-motion: reduce)` の簡略版を用意

## 出力先
`docs/spec/impl/ux/phase-N.md`（フェーズごと）
