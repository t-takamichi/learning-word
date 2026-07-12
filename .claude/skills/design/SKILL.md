---
name: design
description: プロダクト設計を実行する。PM目線とエンジニア目線を統合し、docs/spec/design/配下に設計ドキュメント（README・アーキテクチャ・シーケンス図・リスク評価）を生成する。
disable-model-invocation: false
---

# SKILL: Design

## 概要
プロダクト設計を実行するスキル。PM目線とエンジニア目線を統合し、
`docs/spec/design/` 配下に設計ドキュメントを生成する。

## 起動方法
```
/design
/design [対象機能名]
```

---

## Agent

このスキルを起動したら、まず以下を読み込んでペルソナを確立する。

```
.claude/skills/design/agent/persona.md
```

---

## Skills（実行ステップ）

以下を**この順番で**実行する。各STEPが完了してから次へ進む。

| STEP | ファイル | 担当目線 | 出力先 |
|------|---------|---------|--------|
| 1 | `skills/step1-product.md` | PM | docs/spec/design/README.md（冒頭） |
| 2 | `skills/step2-requirements.md` | PM × ENG | docs/spec/design/README.md（要件） |
| 3 | `skills/step3-architecture.md` | ENG | docs/spec/design/architecture.md |
| 4 | `skills/step4-detail.md` | ENG | docs/spec/design/[feature].md |
| 5 | `skills/step5-risk.md` | PM | docs/spec/design/risks.md |
| 6 | `skills/step6-ac.md` | PM | docs/spec/design/[feature].md（追記） |
| 7 | `skills/step7-output.md` | ENG | 全体確認・リンク整備 |

---

## Rules

全STEPを通じて以下のルールを守ること。

```
.claude/skills/design/rules/design-rules.md
```

---

## 完了条件

STEP 7 終了後、以下の品質ゲートを実行して全項目パスを確認する。

```
.claude/skills/design/rules/quality-gate.md
```

全項目チェック済みになったら「設計完了」を宣言し、次のフェーズを案内する。

```
次のステップ: /impl-plan（実装計画の作成）
```

---

## 引数の扱い

- **引数なし**: ユーザーとの対話・既存の `docs/spec/design/**` を踏まえて全体設計を実行
- **引数あり（機能名）**: 指定された機能のみ STEP 3〜6 を実行（部分設計）
