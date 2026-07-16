# 実装計画書 - フェーズ UX-2: Atoms (原子部品)

本フェーズでは、Atomic Design の最小単位である純粋なUIパーツ（Atoms）の構築と移行を行います。

---

## 1. 成果物とタスク一覧

| タスクID | 対象ファイル | 成果物と実装内容 | 階層 | 検証方法 / 受け入れ基準 (AC) | 適用ルール |
|:---|:---|:---|:---|:---|:---|
| **UX-2-1** | `components/atoms/Button/` | 既存 `atoms/Button` の移行およびホバー時の拡大演出、生HEXのトークン置換。 | Atoms | `yarn typecheck` をパスすること。 | `R-ATOM-01`, `R-ATOM-02` |
| **UX-2-2** | `components/atoms/Text/` | 既存 `atoms/Text` の移行。丸ゴシックフォントファミリーへの対応。 | Atoms | 画面の全テキストが丸ゴシック体になり、本文の最小サイズが 16px を満たしていること。 | `R-ATOM-02` |
| **UX-2-3** | `components/atoms/Badge/` | 既存 `atoms/Badge` の移行と角丸トークン（`--radius-pill`）の適用。 | Atoms | 各レベルバッジが完全な角丸でレンダリングされること。 | `R-ATOM-02` |
| **UX-2-4** | `components/atoms/Mascot/` | **[新規]** マスコット「ベリーちゃん」コンポーネントの実装。Props `expression: 'standard' \| 'happy' \| 'sad'` により、いちご絵文字🍓と表情テキストをレンダリングする。 | Atoms | Props の変更で、表情や絵文字が適切に切り替わること。 | `R-ATOM-03` |
| **UX-2-5** | `components/atoms/Sparkle/` | **[新規]** キラキラのパーティクルエフェクト部品。CSSアニメーションで、`active` 時に飛び散りフェードアウトする。 | Atoms | `prefers-reduced-motion` が有効な場合は、単なる穏やかなフェードインに切り替わること。 | `R-UX-07` |
| **UX-2-6** | `components/atoms/SoundToggle/` | **[新規]** 音声ミュートオン/オフのトグルスイッチ。見た目の状態のみを制御する Pure Component。 | Atoms | タップターゲットが 44px 以上確保されていること。 | `R-UX-08` |

---

## 2. 動作検証手順
1.  各 Atoms コンポーネントを開発者向けコンポーネントショーケース（`AtomsShowcase.tsx`）に配線し、表示を確認します。
2.  `Mascot` の表示を各表情パターンで切り替え、エラーが発生しないことを確認します。
3.  OS の「視覚効果を減らす」設定を有効にして、`Sparkle` のアニメーションが抑制されることを確認します。
