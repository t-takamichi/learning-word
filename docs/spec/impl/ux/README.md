# UI/UX 実装計画書 (UX Implementation Plan)

本ドキュメントは、定義された UI/UX 設計仕様に基づき、体験価値（Delight）を高め、共有デバイスでの利便性（キーボード手入力排除）とモバイル片手操作性（Undo・スワイプ）を考慮したシステムへ移行するための実装手順とフェーズ分割を定義するロードマップです。

---

## 1. 実装方針と原則

*   **ボトムアップ順の実装 (Tokens → Atoms → Molecules → Organisms → Pages)**:
    依存性の低い基礎パーツから順に構築・検証し、上位コンポーネントが下位に依存する Atomic Design の構成を安全に組み上げます。
*   **アセットの内製化と前倒し**:
    アバター選択ログインに不可欠な「アバター画像アセット」の生成（AI画像生成）を最初のフェーズ（UX-1）で前倒しし、動作確認ができる状態を早期に整えます。
*   **リスク（不確実性）の早期解消**:
    iOS Safari における音声自動再生制限を突破するための「スタートボタンによる解錠フロー」と「サウンド・ハプティクス基盤」を UX-3 で実装します。
*   **検証可能性の担保**:
    各フェーズおよびタスクごとに動作検証手順を明記し、手戻りのない段階的な移行を実現します。

---

## 2. フェーズ分割 (Phase Roadmap)

体験設計の移行は、以下の 7 つのフェーズに分けて段階的に実行します。

| フェーズ | フェーズ名 | 主な実装内容 | 依存関係 |
|:---|:---|:---|:---|
| **UX-1** | [デザイントークン基盤 ＆ アバター画像生成](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-1.md) | `:root` のCSS変数定義（`--focus-ring` 等）、背景・カラー置換（真っ黒排除）。<br>**AI画像生成（generate_image）による5つのアカウントアバターアセットの生成・配置**。 | なし |
| **UX-2** | [Atoms (原子部品)](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-2.md) | `Button`, `Text`, `Badge`, `Mascot`, `Sparkle` の構築・移設。<br>新規: `AvatarIcon` (ホバースケール付き), `UndoButton` (小さな矢印型)。 | UX-1 |
| **UX-3** | [サウンド・ハプティクス基盤](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-3.md) | Web Audio 合成音ライブラリ `sfx.ts` と `useSound` フック（`undo`音・音声解錠 `unlockAudio` 処理を含む）、ミュート永続化の実装。 | UX-1 |
| **UX-4** | [Molecules (分子部品)](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-4.md) | `AudioButton`, `ReviewButtons`, `WordListItem`, `WordSetCard` の構築・移設。<br>新規: `UserProfileCard` (アバター画像 ＋ おなまえカード)。 | UX-2, UX-3 |
| **UX-5** | [Organisms (主要ブロック) ＆ 操作性](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-5.md) | `FlashCard` (Undoボタンの組み込みと状態巻き戻し・スワイプジェスチャー判定の実装)。<br>`CelebrationOverlay` の非ブロッキング化。<br>`UserSelector` のアバタータイル簡単ログイン化リファクタリング。 | UX-4 |
| **UX-6** | [Templates & Pages 結線 ＆ 音声解錠](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-6.md) | `StudyPage` での音声解錠「スタート！」ボタンの実装・アンロック接続。<br>`UserSelectPage` でのアバターログイン接続。 | UX-5 |
| **UX-7** | [モチベーション仕上げ ＆ 継続ループ](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-7.md) | `CompleteSummary` での「本日の目標ゲージ」「次のオススメボタン」「交代ショートカット」の実装。<br>`prefers-reduced-motion` の最終確認。 | UX-6 |

---

## 3. 実装の実行方法

各フェーズの実装を開始する際は、実装支援サブエージェント（または `/impl` コマニー）を使用し、対応する計画書（例: `/ux-impl docs/spec/impl/ux/phase-N.md`）を読み込ませて開始してください。
各タスクが完了するごとに型チェック (`yarn typecheck` / `npm run build` 等) および動作確認を行い、品質ゲートを通過しながら進めます。
