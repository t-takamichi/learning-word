# Phase 2 実装計画書: 計画書（plan.md）の自動同期

## 1. 参照

- フェーズ定義: [phase-2.md](../../phase/phase-2.md)
- 設計（オーケストレーター）: [orchestrator.md](../../orchestrator.md)

---

## 2. このフェーズのゴール

- 設計書の変更差分を解析し、影響を受ける実装フェーズ定義および実装計画書 (`plan.md`) のファイルパスを自動特定できること。
- 特定された計画書 (`plan.md`) に対して、既存 of タスク構成を壊さずに、新規追加タスクを自動マージ・追記できること。
- 共通スクリプト `impact-analyzer.ts` がエラーなく動作し、ステップ定義 `step2-phase-sync.md` および `step3-plan-sync.md` を通じて計画の自動同期が完了すること。

---

## 3. 前提・依存

- Phase 1 が完了していること（`.agents/skills/flow/SKILL.md` や `scripts/utils.ts` が存在すること）。

---

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 |
|----|------------------|------|----|---------|
| **T1** | `.agents/skills/flow/scripts/impact-analyzer.ts` | 設計差分から影響フェーズ・計画書パスを特定するロジック | 共通スクリプト | `bun run` または tsx で実行し、ダミーの設計差分から正しく phase ファイルや plan.md のパスを抽出・出力できること。 |
| **T2** | `.agents/skills/flow/skills/step2-phase-sync.md` | 設計書の差分から影響フェーズを特定し、フェーズ定義を更新するプロンプトステップ | ステップ定義 | プロンプトに従って `spec/impl/phase/` が更新されること。 |
| **T3** | `.agents/skills/flow/skills/step3-plan-sync.md` | `plan.md` に新規タスクを自動マージするプロンプトステップ | ステップ定義 | `plan.md` にダミーのタスクが正しく追記・マージされること。 |

---

## 5. 各タスク詳細

### T1: `impact-analyzer.ts` の作成
- **ファイル**: `.agents/skills/flow/scripts/impact-analyzer.ts`（新規）
- **内容**:
  * 設計ファイル（`spec/design/`配下）の更新状況や git diff 情報をもとに、影響を受ける実装フェーズファイル（`spec/impl/phase/phase-N.md`）および実装計画書（`spec/impl/steps/N/plan.md`）を自動特定する。
  * 簡単なキーワードマッピングや、更新された設計ファイル名からマッピングするロジックを実装。
- **検証**:
  * スクリプトを実行し、例えば `flashcard.md` が変更された場合に `phase-2.md` および `steps/2/plan.md` が影響を受けると判定・出力すること。

### T2: `step2-phase-sync.md` の作成
- **ファイル**: `.agents/skills/flow/skills/step2-phase-sync.md`（新規）
- **内容**:
  * `impact-analyzer.ts` の解析結果をインプットとし、設計書の変更要件が既存のどのフェーズ定義（`phase-N.md`）に該当するか、あるいは新規フェーズを追加すべきかを自律判定・更新するステップ指示。
- **検証**:
  * エージェントがこのステップを実行し、フェーズ定義が適切に更新されること。

### T3: `step3-plan-sync.md` の作成
- **ファイル**: `.agents/skills/flow/skills/step3-plan-sync.md`（新規）
- **内容**:
  * 影響を受けるフェーズの実装計画書（`spec/impl/steps/N/plan.md`）に対し、既存 of タスク番号や並び順を破壊することなく、追加要件に基づく新規タスクを `T-ADD-1` などの形式で挿入・マージ・保存させるステップ指示。
- **検証**:
  * `plan.md` が破壊されずに有効な Markdown フォーマットのまま新規タスクがマージされること。
