---
name: ux-impl
description: UXフェーズ番号（UX-1〜UX-7）を入力すると、対応するUI/UX実装計画書（docs/spec/impl/ux/phase-N.md）に沿って実装を開始する。デザイントークン・Atomic Designコンポーネント・サウンド・モチベーション演出をタスク順に実装し、各タスクの検証・受け入れ基準の確認まで行う。UI/UX実装計画（/ux-impl-plan）完了後に使用する。
disable-model-invocation: false
---

# SKILL: UX Impl（UI/UX実装の実行）

## 概要
指定されたUXフェーズ番号の**UI/UX実装計画書**に沿って、実際のコード実装を進めるスキル。
`docs/spec/impl/ux/phase-<N>.md` を読み込み、タスク（T1, T2, ...）を順に実装・検証する。
既存の `/impl`（`docs/spec/impl/steps/` を読む）とは別に、**UI/UX層（`docs/spec/impl/ux/`）専用**の実行スキル。

## 起動方法
```
/ux-impl [UXフェーズ番号]
```

- 例: `/ux-impl UX-1` → `docs/spec/impl/ux/phase-1.md` に沿って UX-1 を実装
- 例: `/ux-impl 3` → `docs/spec/impl/ux/phase-3.md` に沿って UX-3 を実装
- **番号の解釈**: `UX-N` / `N` のどちらも受け付け、`docs/spec/impl/ux/phase-<N>.md` にマップする（N は 1〜7）

**引数（UXフェーズ番号）は必須。** 未指定の場合は
`docs/spec/impl/ux/` 配下の計画書一覧（[README.md](../../../docs/spec/impl/ux/README.md) のフェーズ表）を提示して番号入力を促す。

---

## 前提条件

- `docs/spec/impl/ux/phase-<N>.md` が存在する（`/ux-impl-plan` の完了物）
- 前提が満たされていない場合は「先に `/ux-impl-plan` を実行してください」と案内して中断する
- 計画書の「前提・依存」に記載された前提フェーズが実装済みであること
  - 例: UX-4（Molecules）は UX-2（Atoms）・UX-3（サウンド基盤）に依存する

---

## Agent

このスキルを起動したら、まず以下を読み込んでペルソナを確立する。

```
.claude/skills/ux-impl/agent/persona.md
```

あわせて、実装ルールを**必ず**確認する（実装前チェック必須）。

```
docs/rules/react.md          ← フロントエンド規約
docs/rules/TypeScript.md     ← 型・コーディング規約
docs/spec/design/ux/component-structure.md   ← Atomic Design ルール（R-ATOM-*）
docs/spec/design/ux/visual-design.md         ← デザイントークン（生HEX禁止の参照元）
```

---

## Skills（実行ステップ）

以下を**この順番で**実行する。

| STEP | ファイル | 内容 |
|------|---------|------|
| 1 | `skills/step1-load-plan.md` | UI/UX計画書の読み込み・UXルール確認 |
| 2 | `skills/step2-implement.md` | タスク（T1→Tn）を順に実装（トークン参照・Atomic依存を守る） |
| 3 | `skills/step3-verify.md` | 検証（型/目視/iOS実機/reduced-motion）・受け入れ基準の確認・報告 |

---

## Rules

全STEPを通じて以下のルールを守ること。

```
.claude/skills/ux-impl/rules/impl-rules.md
```

## 完了条件

STEP 3 終了後、以下の品質ゲートを実行して全項目パスを確認する。

```
.claude/skills/ux-impl/rules/quality-gate.md
```

全項目チェック済みになったら「UX-<N> 実装完了」を宣言し、次のフェーズを案内する。

```
次のステップ: /ux-impl <次のUXフェーズ番号>
```
