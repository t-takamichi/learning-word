# UI/UX 実装計画書 (UX Implementation Plan)

本ドキュメントは、定義された UI/UX 設計仕様に基づき、体験価値（Delight）を高め、拡張性と保守性に優れたシステムへと移行するための実装手順とフェーズ分割を定義するロードマップです。

---

## 1. 実装方針と原則

*   **ボトムアップ順の実装 (Tokens → Atoms → Molecules → Organisms → Pages)**:
    依存性の低い基礎パーツから順に構築・検証し、上位コンポーネントが下位に依存する Atomic Design の構成を安全に組み上げます。
*   **リスク（不確実性）の前倒し**:
    iOS Safari における音声自動再生ブロックやバイブレーションのフォールバックなど、ブラウザ制約が絡む「サウンド・ハプティクス基盤」を早期（UX-3）に実装・解消します。
*   **検証可能性の担保**:
    各フェーズおよびタスクごとに動作検証手順を明記し、手戻りのない段階的な移行を実現します。

---

## 2. フェーズ分割 (Phase Roadmap)

体験設計の移行は、以下の 7 つのフェーズに分けて段階的に実行します。

| フェーズ | フェーズ名 | 主な実装内容 | 依存関係 |
|:---|:---|:---|:---|
| **UX-1** | [デザイントークン基盤](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-1.md) | `:root` のCSS変数定義、背景・テキストのカラー置換（真っ黒排除）。 | なし |
| **UX-2** | [Atoms (原子部品)](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-2.md) | `Button`, `Text`, `Badge`, `Mascot`, `Sparkle` などの最小単位のPureコンポーネント構築。 | UX-1 |
| **UX-3** | [サウンド・ハプティクス基盤](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-3.md) | Web Audio 合成音ライブラリ `sfx.ts` と `useSound` フック、iOS解錠、ミュート永続化の実装。 | UX-1 |
| **UX-4** | [Molecules (分子部品)](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-4.md) | `AudioButton`, `ReviewButtons`, `WordListItem`, `WordSetCard` 等の複合Pureコンポーネント構築・移設。 | UX-2, UX-3 |
| **UX-5** | [Organisms (主要ブロック)](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-5.md) | `FlashCard`, `WordList`, `SessionHeader`, `CelebrationOverlay` 等の機能ブロック構築・移設。 | UX-4 |
| **UX-6** | [Templates & Pages 結線](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-6.md) | レイアウトへの配置、学習回答ハンドラへの正解演出（音＋振動＋スパークル）の結線。 | UX-5 |
| **UX-7** | [モチベーション仕上げ](file:///Users/tanakakoushin/Documents/workspace/projects/2026/projects/learning-word/docs/spec/impl/ux/phase-7.md) | コンボ演出の洗練、完了祝福画面、ストリーク継続の寄り添い、`prefers-reduced-motion` 対応の最終調整。 | UX-6 |

---

## 3. 実装の実行方法

各フェーズの実装を開始する際は、実装支援サブエージェント（または `/impl` コマンド）を使用し、対応する計画書（例: `/ux-impl docs/spec/impl/ux/phase-1.md`）を読み込ませて開始してください。
各タスクが完了するごとに型チェック (`yarn typecheck`) および動作確認を行い、品質ゲートを通過しながら進めます。
