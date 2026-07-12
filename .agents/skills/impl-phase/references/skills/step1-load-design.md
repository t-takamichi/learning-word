# STEP 1: 設計書の読み込みと要件抽出

**目的**: フェーズ分割の材料として、設計書の内容を漏れなく把握する。

## 実施内容

### 設計書の読み込み
以下を順に読み込む。

```
docs/spec/design/README.md        ← 全体像・機能一覧（MoSCoW）
docs/spec/design/architecture.md  ← 技術構成・APIエンドポイント・データモデル
docs/spec/design/[feature].md     ← 各機能の詳細・シーケンス図・AC
docs/spec/design/risks.md         ← 技術リスク
```

### 要件の抽出
- 機能一覧（MoSCoW）から **Must / Should / Could** を全て列挙する
- 各機能に紐づく API・データモデル・画面をメモする
- **Won't have** は除外対象として明示的に控えておく

### リスクの確認
- `risks.md` の「発生確率×影響度」が高い項目を抽出する
- 早いフェーズで検証すべきリスクを特定する

## 出力
このSTEPは内部整理のみ（ファイル出力なし）。
抽出した要件リストを次STEPのフェーズ分割に引き継ぐ。
