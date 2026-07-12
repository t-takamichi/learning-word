# Component Tasks — 新規 / 移行 / 置換マップ

親: [README.md](./README.md)

[../../design/ux/component-structure.md](../../design/ux/component-structure.md) の全コンポーネントを「新規 / 移行 / 置換」で棚卸しし、
Atomic の層・元ファイル・新パス・下位依存・主要 props・対応 AC を1行ずつ定義する。
依存は下位（Atoms）から積む順に並べる。

---

## 0. ディレクトリ移行方針

```
src/client/components/
  atoms/       Button/ Icon/ Text/ Chip/ Badge/ StatusDot/ Mascot/ Sparkle/ SoundToggle/
  molecules/   AudioButton/ LanguageToggle/ ReviewButtons/ ProgressIndicator/
               StreakBadge/ SuccessToast/ MuteButton/ WordListItem/ StatItem/
  organisms/   FlashCard/ WordList/ SessionHeader/ CelebrationOverlay/
               CompleteSummary/ AutoPlayControls/
  templates/   StudyTemplate/ WordListTemplate/ CompleteTemplate/ AdminTemplate/
```

- 既存 `components/FlashCard`・`WordList`・`ReviewButtons`・`AudioButton`・`LanguageToggle`・`CompleteScreen` は上記へ再配置する。
- **import 参照の更新箇所**（移行時に必ず追随）:
  - `src/client/pages/StudyPage.tsx` … `FlashCard` / `LanguageToggle` / `CompleteScreen` / `WordList` の import パス
  - `src/client/pages/AdminPage.tsx` … （管理フォーム移設時）
  - 各 Molecule/Organism 間の相互 import（例: `WordListItem` → `AudioButton`）
- 各コンポーネントは `Component.tsx` + `Component.module.css`（＋必要なら `index.ts`）で1ディレクトリにまとめる（R-ATOM-04）。

---

## 1. Atoms（UX-2）

| コンポーネント | 層 | 分類 | 元ファイル | 新パス | 依存(下位) | 主要 props | 対応 AC |
|--------------|----|------|-----------|--------|-----------|-----------|---------|
| `Button` | Atom | 新規 | —（各所の生 `<button>` を集約） | `atoms/Button/` | Tokens | `variant`(primary/ghost/soft/danger), `size`, `fullWidth`, `onClick` | ビジュアル §5.5, AC4 |
| `Icon` | Atom | 新規 | —（絵文字直書きを置換） | `atoms/Icon/` | Tokens | `name`(speaker/heart/flame/check/star/sound-on/off), `size` | ビジュアル §1 |
| `Text` | Atom | 新規 | —（タイポ直書きを集約） | `atoms/Text/` | Tokens | `as`, `variant`(word/translation/heading/body/hint) | ビジュアル §2 |
| `Chip` | Atom | 新規 | — | `atoms/Chip/` | Tokens | `tone`(berry/mint/lavender), `children` | ビジュアル §1 |
| `Badge` | Atom | 新規 | — | `atoms/Badge/` | Tokens | `value`, `tone` | モチベ §3 |
| `StatusDot` | Atom | 新規 | —（WordListItem のバッジを置換） | `atoms/StatusDot/` | Tokens | `status`(new/weak/mastered) | ビジュアル §5.7 |
| `Mascot` | Atom | 新規 | — | `atoms/Mascot/` | Tokens | `mood`(idle/happy/cheer) | ビジュアル §4 |
| `Sparkle` | Atom | 新規 | — | `atoms/Sparkle/` | Tokens | `count`, `color` | モチベ §2 |
| `SoundToggle` | Atom | 新規 | — | `atoms/SoundToggle/` | Tokens, Icon | `muted` | サウンド §3.3 |
| `UserAvatar` | Atom | 新規 | — | `atoms/UserAvatar/` | Tokens | `username`, `size` | ユーザーのアバター表示 |

---

## 2. Molecules（UX-4）

| コンポーネント | 層 | 分類 | 元ファイル | 新パス | 依存(下位) | 主要 props | 対応 AC |
|--------------|----|------|-----------|--------|-----------|-----------|---------|
| `AudioButton` | Molecule | 移行 | `components/AudioButton/*` | `molecules/AudioButton/` | Icon, Button | `word` | AC3（既存機能維持） |
| `LanguageToggle` | Molecule | 移行 | `components/LanguageToggle/*` | `molecules/LanguageToggle/` | Chip | `language`, `onToggle` | モチベ §8 |
| `ReviewButtons` | Molecule | 移行 | `components/ReviewButtons/*` | `molecules/ReviewButtons/` | Button | `onGood`, `onAgain`, `disabled` | モチベ §2, F-6 |
| `ProgressIndicator` | Molecule | 新規 | —（StudyPage 内の進捗を抽出） | `molecules/ProgressIndicator/` | Badge, Text | `current`, `total` | モチベ §3, F-7 |
| `StreakBadge` | Molecule | 新規 | — | `molecules/StreakBadge/` | Icon, Badge | `count` | モチベ §4 |
| `SuccessToast` | Molecule | 新規 | — | `molecules/SuccessToast/` | Text, Sparkle | `message`, `visible` | モチベ §2 |
| `MuteButton` | Molecule | 新規 | — | `molecules/MuteButton/` | SoundToggle | `muted`, `onToggle` | サウンド §3.3, AC3 |
| `WordListItem` | Molecule | 移行 | `components/WordList/WordListItem.tsx` | `molecules/WordListItem/` | Text, AudioButton, StatusDot | `word` | ビジュアル §5.4 |
| `StatItem` | Molecule | 新規 | — | `molecules/StatItem/` | Text | `label`, `value` | モチベ §5 |
| `UserCard` | Molecule | 新規 | — | `molecules/UserCard/` | UserAvatar, Button | `user`, `isActive`, `onSelect`, `onDelete` | ユーザー選択用カード |
| `WordSetCard` | Molecule | 新規 | — | `molecules/WordSetCard/` | Text, ProgressBar | `set`, `onSelect` | レベル別単語セットカード |

---

## 3. Organisms（UX-5）

| コンポーネント | 層 | 分類 | 元ファイル | 新パス | 依存(下位) | 主要 props | 対応 AC |
|--------------|----|------|-----------|--------|-----------|-----------|---------|
| `FlashCard` | Organism | 移行(刷新) | `components/FlashCard/*` | `organisms/FlashCard/` | Text, AudioButton, Button | `word`, `isAnswerVisible`, `onShowAnswer` | ビジュアル §5.1, AC |
| `WordList` | Organism | 移行 | `components/WordList/WordList.tsx` | `organisms/WordList/` | WordListItem | `page` | ビジュアル §5.4 |
| `SessionHeader` | Organism | 新規 | —（StudyPage header を抽出） | `organisms/SessionHeader/` | Mascot, ProgressIndicator, StreakBadge, MuteButton | `current`, `total`, `streak`, `muted`, `onToggleMute` | モチベ §3,4 |
| `CelebrationOverlay` | Organism | 新規 | — | `organisms/CelebrationOverlay/` | Mascot, Sparkle | `active`, `variant`(combo/complete) | モチベ §5 |
| `CompleteSummary` | Organism | 置換 | `components/CompleteScreen/*` を分解 | `organisms/CompleteSummary/` | StatItem, Mascot, Button | `total`, `correct`, `bestCombo`, `onRestart`, `onWordList` | モチベ §5 |
| `AutoPlayControls` | Organism | 移行 | StudyPage 内の Auto-Play UI を抽出 | `organisms/AutoPlayControls/` | Button, Chip | `isAutoPlay`, `onToggle`, `frontDelay`, `backDelay`, `onChangeDelay` | ビジュアル §5.6, F-9 |
| `UserSelector` | Organism | 新規 | — | `organisms/UserSelector/` | UserCard, Input, Button | `users`, `onCreate`, `onSelect`, `onDelete` | ユーザー選択と追加フォーム |
| `WordSetSelector` | Organism | 新規 | — | `organisms/WordSetSelector/` | Tab, WordSetCard | `sets`, `activeTab`, `onSelect` | レベル別単語セット選択 |
| `UserNav` | Organism | 新規 | — | `organisms/UserNav/` | UserAvatar, Dropdown | `user`, `onSelectMenu` | ユーザーナビメニュー |

> `CompleteScreen`（既存）は **置換**：`CompleteTemplate` + `CompleteSummary` + `CelebrationOverlay` に分解する（component-structure §6）。
> `AdminWordForm` は管理画面の CRUD フォームだが、本 UI/UX スコープでは**トークン適用のみ**に留め、Organism 化は任意（UX-5 で低優先タスクとして扱う）。

---

## 4. Templates & Pages（UX-6）

| コンポーネント | 層 | 分類 | 元ファイル | 新パス | 含む Organism | 対応 AC |
|--------------|----|------|-----------|--------|--------------|---------|
| `StudyTemplate` | Template | 新規 | —（StudyPage レイアウトを抽出） | `templates/StudyTemplate/` | SessionHeader + FlashCard + ReviewButtons + CelebrationOverlay | 制約 §6 |
| `WordListTemplate` | Template | 新規 | — | `templates/WordListTemplate/` | SessionHeader(簡易) + WordList | 制約 §6 |
| `CompleteTemplate` | Template | 新規 | — | `templates/CompleteTemplate/` | CelebrationOverlay + CompleteSummary | モチベ §5 |
| `AdminTemplate` | Template | 新規(任意) | `pages/AdminPage.module.css` | `templates/AdminTemplate/` | ヘッダー + AdminWordForm + 一覧 | ビジュアル §1 |
| `StudyPage` | Page | 移行(結線) | `pages/StudyPage.tsx` | 同左（結線更新） | StudyTemplate | モチベ §2 全体 |
| `WordListPage` | Page | 新規(任意) | — | `pages/WordListPage.tsx` | WordListTemplate | — |
| `AdminPage` | Page | 移行 | `pages/AdminPage.tsx` | 同左（トークン適用） | AdminTemplate | ビジュアル §1 |
| `UserSelectTemplate` | Template | 新規 | — | `templates/UserSelectTemplate/` | UserSelector | ユーザー選択画面の枠組み |
| `WordSetSelectTemplate` | Template | 新規 | — | `templates/WordSetSelectTemplate/` | SessionHeader(簡易) + WordSetSelector | レベル選択画面の枠組み |
| `UserSelectPage` | Page | 新規 | — | `pages/UserSelectPage.tsx` | UserSelectTemplate | ユーザー登録・選択画面の実体 |
| `WordSetSelectPage` | Page | 新規 | — | `pages/WordSetSelectPage.tsx` | WordSetSelectTemplate | レベル別単語セット選択画面の実体 |

---

## 5. フック（UX-3）

| フック | 分類 | 新パス | 責務 | 対応 AC |
|--------|------|--------|------|---------|
| `useSound` | 新規 | `src/client/hooks/useSound.ts` | AudioContext 解錠 / Web Audio 合成再生 / `setMuted`(localStorage) / vibrate 存在チェック | サウンド §6 全 AC |
| `useUsers` | 新規 | `src/client/hooks/useUsers.ts` | ユーザーのロード、新規追加、お別れ（削除）処理、および現在選択されているユーザー状態の管理 | 複数ユーザーAC |
| `useWordSets` | 新規 | `src/client/hooks/useWordSets.ts` | 利用可能なレベル（単語セット）の一覧、およびユーザー個別のレベル別進捗率（％）の取得 | レベル選択AC |

> 既存フック（`useSession` / `useSpeech` / `useAutoPlay` / `useWords` / `useAdminWords`）は**変更しない**（機能ロジック維持）。
> `useSound` のみ新設し、UX-6 で StudyPage の Good ハンドラに結線する。

---

## 6. 既存 → Atomic 移行対応表（要約）

| 現行 | 新分類 | 対応 |
|------|--------|------|
| `components/FlashCard` | Organism | 移設＋Berry スタイル・フリップ演出刷新 |
| `components/WordList` + `WordListItem` | Organism + Molecule | 移設＋StatusDot 追加 |
| `components/ReviewButtons` | Molecule | 移設＋正解演出トリガー結線（UX-6） |
| `components/AudioButton` | Molecule | 移設（機能維持） |
| `components/LanguageToggle` | Molecule | 移設 |
| `components/CompleteScreen` | Template + Organism | `CompleteTemplate` / `CompleteSummary` / `CelebrationOverlay` へ分解 |
| （新規） | Atoms 各種・Mascot・Sparkle・StreakBadge・SuccessToast・CelebrationOverlay・useSound | 追加 |
