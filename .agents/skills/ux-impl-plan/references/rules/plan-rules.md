# UX Impl Plan Rules

実装計画を作るときに必ず守るルール。

## R-PLAN-01: Atomic Design のボトムアップ順で積む
- Tokens → Atoms → Molecules → Organisms → Templates → Pages の依存順に並べる
- 下位が未完成のまま上位のタスクを先に置かない

## R-PLAN-02: タスクは検証可能な粒度にする
- 1タスク=1関心事。独立して型チェック or 目視確認できること
- 各タスクに「検証方法」を必ず書く

## R-PLAN-03: 受け入れ基準を必ず付ける
- 各フェーズの完了条件を、`docs/spec/design/ux/acceptance-criteria.md` と対応づける
- ACの無いフェーズは「計画未完了」とする

## R-PLAN-04: 既存を活かす（移行優先）
- 「全部作り直す」を避ける。現行 `components/*`・`*.module.css` の移行/置換を具体化する
- import 参照の更新箇所を洗い出す

## R-PLAN-05: リスクを早いフェーズに置く
- iOS Safariの音解錠・vibration・セーフエリアなど不確実性の高い箇所を前倒しする

## R-PLAN-06: スコープを守る
- Could（XP/レベル/カレンダー等）を計画に混ぜない
- 機能ロジック（API/DB/出題）を変更する計画を作らない（UI/UX層に限定）

## R-PLAN-07: 実装規約に従う
- `docs/rules/**`（React/TypeScript/アーキテクチャ）に反する計画を作らない
- 各タスクに「適用ルール」を明記する

## R-PLAN-08: 既存書式を踏襲する
- `docs/spec/impl/phase/` `docs/spec/impl/steps/*/plan.md` の様式に合わせ、`/impl` がそのまま読める形にする
