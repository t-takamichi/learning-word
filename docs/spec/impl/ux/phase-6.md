# 実装計画書 - フェーズ UX-6: Templates & Pages 結線

本フェーズでは、構築した Organisms を Templates レイアウトに配置し、Page 最終エントリーポイント（StudyPage, WordSetSelectPage）へ状態およびイベントハンドラを結線します。特に、回答時の「ごほうび（Delight）」演出の同期制御を組み込みます。

---

## 1. 成果物とタスク一覧

| タスクID | 対象ファイル | 成果物と実装内容 | 階層 | 検証方法 / 受け入れ基準 (AC) | 適用ルール |
|:---|:---|:---|:---|:---|:---|
| **UX-6-1** | `components/templates/` | `StudyTemplate`, `WordSetSelectTemplate`, `CompleteTemplate` などの骨組みレイアウトを Atomic 階層へ移設・調整。 | Templates | `children` を受け取って正しく中央配置・レスポンシブ幅で表示できること。 | `R-ATOM-01` |
| **UX-6-2** | `pages/WordSetSelectPage.tsx` | レベル選択ページと `WordSetSelector` の最終結線。ユーザー作成・編集・削除 Mutation（`useWordSets`）の結線。 | Pages | 単語セットの作成、編集、削除（子単語連動）が画面操作から正常に動作すること。 | `R-ATOM-03` |
| **UX-6-3** | `pages/StudyPage.tsx` | 学習ページと `FlashCard`, `WordList`, `SessionHeader`, `CompleteSummary` の最終結線。 | Pages | モード切り替え（リストとクイズ）が正常に行われ、クイズの進捗がヘッダーと同期すること。 | `R-ATOM-03` |
| **UX-6-4** | `pages/StudyPage.tsx` | **[最優先結線]** クイズ回答時の `submitReview` ハンドラに、`play('correct' / 'again')` と `Sparkle` パーティクル表示、および `SuccessToast` の表示を 200ms 以内で同時発火する Delight 演出処理を配線する。 | Pages | 「Good」を選択した際、効果音とスパークルが瞬時に同期して発動すること。 | `R-UX-05` |

---

## 2. 動作検証手順
1.  ビルド (`yarn build`) が成功することを確認します。
2.  クイズ回答時の「Good」タップ時に、Correct音が遅延なく再生され、カード周囲に星型のスパークルエフェクトが表示されることを目視確認します。
3.  テスト単語を作成し、完了トースト「あたらしい単語を覚えたよ！いっしょにがんばろう🍓」が画面下部に表示されることを確認します。
