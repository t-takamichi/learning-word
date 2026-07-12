# 分析 STEP1 — 現状インベントリ（棚卸し）

対象: `src/client/**`（実装実データより）／親: [../README.md](../README.md)

---

## 1. 画面一覧

| 画面 | ファイル | 役割 |
|------|---------|------|
| 学習ページ | `pages/StudyPage.tsx` | フラッシュカード＋自動再生＋進捗＋単語リストを1画面に集約 |
| 管理ページ | `pages/AdminPage.tsx` | 単語CRUD（Basic認証） |

> 単語リスト（`WordList`）は独立画面ではなく **StudyPage の下部に同居**している（`StudyPage.tsx:162`）。

## 2. コンポーネント一覧（現状の粒度）

| コンポーネント | ファイル | 見立て（Atomic） | 備考 |
|--------------|---------|----------------|------|
| FlashCard | `components/FlashCard/` | Organism | 表/裏・こたえを見る |
| ReviewButtons | `components/ReviewButtons/` | Molecule | Again(❌)/Good(⭕) |
| AudioButton | `components/AudioButton/` | Molecule | 🔊 発音（TTS） |
| LanguageToggle | `components/LanguageToggle/` | Molecule | 🇻🇳/🇯🇵 |
| WordList / WordListItem | `components/WordList/` | Organism / Molecule | 一覧＋ステータスバッジ＋ページャ |
| CompleteScreen | `components/CompleteScreen/` | Organism（要分解） | 完了画面 |
| Auto-Play制御 | StudyPage内にインライン | 未分離 | Front/Back秒数の数値入力 |

## 3. 現状デザイントークン（実値抽出）

**トークンは未定義**（CSS変数なし）。各 `*.module.css` に生値がハードコードされている。

| 役割 | 現状の実値 | 使用箇所 |
|------|-----------|---------|
| 背景 | `radial-gradient(#1c1d24 → #0c0d12)` / `#0c0d12` | StudyPage |
| テキスト（主） | `#ffffff` | 全体 |
| テキスト（副） | `rgba(255,255,255,0.4〜0.6)` | ヒント・補助 |
| 面（カード） | `rgba(255,255,255,0.03〜0.08)` | Card全般 |
| ボーダー | `rgba(255,255,255,0.08〜0.15)` | 全体 |
| アクセント（正解/翻訳） | `#81c784`（緑） | FlashCard翻訳 |
| Good ボタン | `#ffffff` 背景 / `#1e1e24` 文字 | ReviewButtons |
| Again ボタン | `#ef5350`（赤） | ReviewButtons |
| ステータス badge | `#fbbf24`(new) / `#f87171`(weak) / `#34d399`(mastered) | WordList |
| 影 | `rgba(0,0,0,0.15〜0.3)` | 全体（黒い影） |
| 角丸 | 8 / 12 / 14 / 16 / 24 / 28px（バラバラ） | 各所 |
| フォント | 指定なし（system既定・サンセリフ） | 全体 |

→ **色・角丸・影に一貫したトークンがなく、値が散在**。ピンク化＝全ファイルの生値置換が必要。

## 4. フィードバック機構の現状

| 機構 | 現状 | 根拠 |
|------|------|------|
| 正解音（Nice!等） | **無** | サウンド再生は `useSpeech`（発音TTS）のみ。効果音の仕組み・音源・`useSound`は存在しない |
| 正解アニメ | **無** | Goodタップ時、`submitReview('good')` を呼ぶだけ（`ReviewButtons.tsx:23-29`）。視覚演出なし |
| 褒め言葉 | **無** | トースト・メッセージなし |
| ストリーク/コンボ | **無** | 状態・UIともに無し |
| 完了の祝福 | **静的な🎉絵文字のみ** | `CompleteScreen.tsx`。コンフェッティ・音・サマリー無し |
| 進捗表示 | **有** | `currentIndex / words.length`（`StudyPage.tsx:140`）。ただし0始まりで開始時「0 / 10」 |
| ハプティクス | **無** | `navigator.vibrate` 呼び出しなし |
| マスコット/世界観 | **無** | キャラクター・物語要素なし |

## 5. その他の観察

- **文言が英語混在**: 「Auto-Play: ON」「Front / Back」「Good / Again」など英語UIと VI/JA が混在。対象ユーザーにとって不統一
- **Auto-Play制御が技術的**: 秒数の数値入力(`type="number"`)がヘッダー上部に常時露出。学習の主役より目立ち、"エンジニアのツール"感が強い
- **完了画面のコピー**: 実際はベトナム語＋日本語併記（設計の「VIのみ」方針と実装が乖離）
- セーフエリア(`env(safe-area-inset-*)`)は一部で考慮済み（ReviewButtons下部）
