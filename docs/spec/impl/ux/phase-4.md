# 実装計画書 - フェーズ UX-4: Molecules (分子部品)

本フェーズでは、複数の Atoms を組み合わせたドメイン非依存な「純粋な複合部品（Molecules）」の実装および移行を行います。

---

## 1. 成果物とタスク一覧

| タスクID | 対象ファイル | 成果物と実装内容 | 階層 | 検証方法 / 受け入れ基準 (AC) | 適用ルール |
|:---|:---|:---|:---|:---|:---|
| **UX-4-1** | `components/molecules/AudioButton/` | 既存 `AudioButton` の移設。内部から発音（TTS API）を直接呼び出すロジックを排除し、`onPlay` コールバックを外部から受け取る形式（Pure）に変更。 | Molecules | 別の親コンポーネントからトリガーされた時にのみ再生イベントが走り、型エラーがないこと。 | `R-ATOM-03` |
| **UX-4-2** | `components/molecules/ReviewButtons/` | 既存 `ReviewButtons` の移設。Good/Again のタップハンドラバインド。 | Molecules | 単体テストまたはショーケース画面でタップ時に正しいコールバックが発火すること。 | `R-ATOM-03` |
| **UX-4-3** | `components/molecules/ProgressIndicator/` | 既存の進捗パーセント表示バーの移設。角丸トークンの適用。 | Molecules | パーセント値に基づき、進行ゲージが滑らかにアニメーション伸縮すること。 | `R-ATOM-02` |
| **UX-4-4** | `components/molecules/SuccessToast/` | **[新規]** 成功トースト。角丸 `--radius-btn` と `--shadow-soft` を適用。マイクロコピー定義に基づく励ましのテキストを表示可能にする。 | Molecules | `visible` Props を切り替えることで、下部からふわっと浮き出て3秒後に消えるアニメーションが動作すること。 | `R-UX-07` |
| **UX-4-5** | `components/molecules/WordListItem/` | 既存 `WordListItem` の移設と置換。自分が作成した単語にのみ ✏️/🗑 を表示する Props 配線、およびおわかれ確認モーダル表示用のクリックコールバック。 | Molecules | 他人が作成した単語アイテムに編集・削除ボタンが表示されないこと。 | `R-ATOM-03` |
| **UX-4-6** | `components/molecules/WordSetCard/` | 既存 `WordSetCard` の移設と置換。自分が作成したセットに「自分専用」バッジを表示。編集・削除ボタンのタップイベントバブル（`stopPropagation`）の確認。 | Molecules | 「自分専用」バッジのスタイルが崩れず、✏️/🗑 のクリックでセット詳細画面へ遷移しないこと。 | `R-ATOM-03` |

---

## 2. 動作検証手順
1.  各 Molecules の Props 定義に、余分な API 通信フック（例: `useMutation` 等）が混入していないことを静的解析およびコードレビューで確認します。
2.  `AtomsShowcase.tsx` で各部品が正しくデザイントークンを継承してスタイリングされていることを確認します。
3.  削除ボタン等の配置余白が十分（44px以上のターゲット面積）にあり、隣接要素と誤タップしにくい距離にあるかを確認します。
