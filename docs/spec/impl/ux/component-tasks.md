# コンポーネント別 実装・移行タスクマップ

本ドキュメントは、既存コンポーネントの構造化、および新規演出パーツの実装に際し、各コンポーネントを「新規 / 移行 / 置換」の3分類に整理し、実装の順序と依存関係を定義したマップです。

---

## 1. コンポーネント移行・実装マトリクス

依存関係を解決するため、Atoms（原子） ➡️ Molecules（分子） ➡️ Organisms（生体） ➡️ Templates/Pages（画面）のボトムアップ順で実装・移行を行います。

| コンポーネント名 | レイヤー | 分類 | 既存元ファイル / パス | 新設配置パス | 依存コンポーネント | 主要Props / インタフェース |
|:---|:---|:---|:---|:---|:---|:---|
| **Button** | Atoms | 移行 | `components/atoms/Button` | `components/atoms/Button` | なし | `variant`, `size`, `onClick`, `disabled` |
| **Text** | Atoms | 移行 | `components/atoms/Text` | `components/atoms/Text` | なし | `variant`, `as` |
| **Badge** | Atoms | 移行 | `components/atoms/Badge` | `components/atoms/Badge` | なし | `children`, `variant` |
| **Mascot** | Atoms | 新規 | なし | `components/atoms/Mascot` | なし | `expression: 'standard' \| 'happy' \| 'sad'` |
| **Sparkle** | Atoms | 新規 | なし | `components/atoms/Sparkle` | なし | `active: boolean` |
| **SoundToggle** | Atoms | 新規 | なし | `components/atoms/SoundToggle` | なし | `muted: boolean`, `onToggle: () => void` |
| **AudioButton** | Molecules | 移行 | `components/molecules/AudioButton` | `components/molecules/AudioButton` | `Button` | `word: string`, `onPlay?: () => void` |
| **LanguageToggle** | Molecules | 移行 | `components/molecules/LanguageToggle` | `components/molecules/LanguageToggle` | `Button` | `value: 'vi' \| 'ja'`, `onChange: (val: 'vi' \| 'ja') => void` |
| **ReviewButtons** | Molecules | 移行 | `components/molecules/ReviewButtons` | `components/molecules/ReviewButtons` | `Button` | `onGood: () => void`, `onAgain: () => void`, `disabled?: boolean` |
| **ProgressIndicator** | Molecules | 移行 | `components/molecules/ProgressIndicator` | `components/molecules/ProgressIndicator` | `Text` | `current: number`, `total: number` |
| **SuccessToast** | Molecules | 新規 | なし | `components/molecules/SuccessToast` | `Text` | `message: string`, `visible: boolean` |
| **WordListItem** | Molecules | 置換 | `components/molecules/WordListItem` | `components/molecules/WordListItem` | `AudioButton` | `word`, `userId`, `onEdit`, `onDelete` |
| **WordSetCard** | Molecules | 置換 | `components/molecules/WordSetCard` | `components/molecules/WordSetCard` | `Text` | `wordSet`, `onSelect`, `activeUserId`, `onEdit`, `onDelete` |
| **FlashCard** | Organisms | 置換 | `components/organisms/FlashCard` | `components/organisms/FlashCard` | `Text`, `AudioButton` | `word`, `isAnswerVisible`, `onFlip`, `onSpeak` |
| **WordList** | Organisms | 置換 | `components/organisms/WordList` | `components/organisms/WordList` | `WordListItem`, `SuccessToast` | `userId`, `wordSetId`, `onRefetchTrigger` |
| **SessionHeader** | Organisms | 置換 | `components/organisms/SessionHeader` | `components/organisms/SessionHeader` | `ProgressIndicator`, `SoundToggle` | `current`, `total`, `muted`, `onMuteToggle` |
| **CelebrationOverlay** | Organisms | 新規 | なし | `components/organisms/CelebrationOverlay` | `Mascot`, `Sparkle` | `active: boolean`, `comboCount: number` |
| **WordSetSelector** | Organisms | 置換 | `components/organisms/WordSetSelector` | `components/organisms/WordSetSelector` | `WordSetCard` | `wordSets`, `onSelect`, `activeUserId`, `onCreate`, `onEdit`, `onDelete` |
| **CompleteSummary** | Organisms | 置換 | `components/organisms/CompleteSummary` | `components/organisms/CompleteSummary` | `Mascot`, `Button` | `streak`, `correctCount`, `onRestart`, `onBackToHome` |

---

## 2. ディレクトリ移行手順

既存の `src/client/components/` フォルダを、Atoms/Molecules/Organisms/Templates に整理統合するために、以下の手順でディレクトリの再編成を行います。

1.  **新規ディレクトリの生成**:
    `src/client/components/atoms`, `molecules`, `organisms`, `templates` フォルダを作成します。
2.  **純粋コンポーネント（Atoms / Molecules）の移動**:
    依存のない `Button.tsx` や `Text.tsx` などを移動し、CSS モジュール名や相対インポートパスを修正します。
3.  **Page エントリーポイントの import パス一括置換**:
    `src/client/pages/StudyPage.tsx` や `WordSetSelectPage.tsx` で import しているパスを一括して新しい Atomic Design 階層（例: `../../components/organisms/FlashCard`）に書き換えます。
4.  **移行の検証**:
    移動するたびに `yarn typecheck` を走らせ、TypeScript のインポートエラーが 0 件であることを確認します。
