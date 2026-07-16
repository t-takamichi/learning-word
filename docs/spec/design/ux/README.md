# UI/UX基本設計書 (UX Design Specification)

本ドキュメントは、英語・ベトナム語の学習者向けアプリ `learning-word` における、UI/UXデザインコンセプト、デザイン原則、および体験設計の全体像を定義する入口（README）です。

---

## 1. デザインコンセプトとブランドムード

### コンセプトワード
> **「やさしい応援と指先のごほうびで、もっと学びたくなるBerry単語帳」**

学習の単調さを排除し、隙間時間に片手で触るだけで心が弾むような、極上の「Delight（よろこび）」をもたらす学習体験を提供します。

### ブランドムード（3つのキーワード）
1.  **やさしい (Gentle)**: 厳しさやプレッシャーを感じさせない、包み込むようなやさしさ。失敗（間違い）さえも寄り添う。
2.  **あまい (Sweet)**: いちご（Berry）を想起させる、大人すぎず子供すぎない、あまく愛着のわく世界観。
3.  **前向き (Positive)**: 少しの進捗でもベリーちゃんが一緒になって喜び、次の一歩を踏み出したくなる応援感。

---

## 2. デザイン原則 (Design Principles)

UI/UX設計における判断基準となる5つの原則です。デザインに迷った際は、この優先順位（P1〜P5）に従います。

*   **P1: Delight (よろこび) を最優先する** (Delight First)
    *   正解時、完了時の「音・振動・光」のフィードバックを通じて、脳に心地よい報酬を与え、ゲームのように遊べる感覚を作ります。
*   **P2: ユーザーのがんばりを見逃さない** (Acknowledge effort)
    *   連続正解（コンボ）や毎日の継続（ストリーク）など、ユーザーの少しずつの努力にマスコット「ベリーちゃん」が敏感に反応し、しっかりと褒め称えます。
*   **P3: 片手・隙間時間の使いやすさを守る** (Mobile First & Safari Ready)
    *   20代ユーザーの主なデバイスである「片手持ちのiPhone」で、親指が届き誤操作のないタップ領域を確保し、iOS Safariの音声自動再生ブロックなどの制約を完全に解決した設計を行います。
*   **P4: うるさくしない（やりすぎ防止）** (Plussing but Minimal)
    *   演出は「気持ちいい一手間」に留め、常時ループアニメーションや音の鳴りっぱなしなど、学習の認知負荷を高める「やりすぎ」を徹底して避けます。`prefers-reduced-motion` も尊重します。
*   **P5: 細部にやさしさを込める** (Micro-kindness)
    *   エラーの発生やデータの削除など、負の体験になる瞬間こそ、機械的な冷たいテキストを排除し、やさしいマイクロコピーで寄り添います。

---

## 3. スコープ (Scope In / Out)

*   **Scope In（設計範囲）**:
    *   デザインコンセプトおよび世界観の定義
    *   CSS変数（カラー、角丸、影、余白、タイポグラフィ）の定義
    *   **Atomic Design** に従ったUIコンポーネントの構造化および依存設計
    *   モチベーション機構（コンボ、ストリーク、お祝い演出）およびマイクロコピーの定義
    *   サウンド（Web Audio 合成音）・ハプティクス（振動）の演出設計
*   **Scope Out（設計範囲外）**:
    *   データベース（SQLite）のスキーマ再設計
    *   APIエンドポイントのロジック・認証ロジックの変更
    *   英単語の出題・判定アルゴリズムの変更

---

## 4. 仕様書リンク一覧

UI/UX設計の各詳細仕様は以下のドキュメントに分割して記述されています。

1.  **[ビジュアルデザイン・デザイントークン仕様](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/design/ux/visual-design.md)**
    *   色調・カラーマッピング・タイポグラフィ・余白・角丸の厳密な定義。
2.  **[コンポーネント構造仕様 (Atomic Design)](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/design/ux/component-structure.md)**
    *   Atoms / Molecules / Organisms / Templates / Pages の依存関係と再利用部品の定義。
3.  **[モチベーション・演出仕様](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/design/ux/motivation.md)**
    *   コンボ演出、セッション完了の祝福、ストリーク継続の仕掛け、および温かいマイクロコピー。
4.  **[サウンド・ハプティクス仕様](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/design/ux/sound-haptics.md)**
    *   シンセサイズ効果音の定義とiOS Safari制限対応（AudioContext解錠）。
5.  **[品質バー・感情曲線仕様](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/design/ux/quality-bar.md)**
    *   UX品質基準と、改善後の理想感情曲線。
6.  **[受け入れ基準・品質ゲート](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/design/ux/acceptance-criteria.md)**
    *   実装前にクリアすべき詳細な合格判定条件。
