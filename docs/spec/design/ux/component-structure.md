# Component Structure — Atomic Design

親: [README.md](./README.md)

UI/UXを **Atomic Design**（Brad Frost）で構造化する。
デザイントークン → Atoms → Molecules → Organisms → Templates → Pages の粒度で
再利用可能なコンポーネント階層を定義し、実装（[../../impl/ux/](../../impl/) 予定）と1対1で対応させる。

---

## 0. 全体マップ

```
Design Tokens (visual-design.md の CSS変数)   ← 原子より小さい「素粒子」
        │
        ▼
Atoms      Button / Icon / Text / Chip / Badge / StatusDot / Mascot / SoundToggle / Sparkle / UserAvatar
        │
        ▼
Molecules  AudioButton / LanguageToggle / ReviewButtons / ProgressIndicator /
           StreakBadge / SuccessToast / WordListItem / StatItem / MuteButton / UserCard / WordSetCard
        │
        ▼
Organisms  FlashCard / WordList / SessionHeader / CelebrationOverlay /
           CompleteSummary / AutoPlayControls / AdminWordForm / UserSelector / WordSetSelector / UserNav
        │
        ▼
Templates  StudyTemplate / WordListTemplate / CompleteTemplate / AdminTemplate / UserSelectTemplate / WordSetSelectTemplate
        │
        ▼
Pages      StudyPage / WordListPage / AdminPage / UserSelectPage / WordSetSelectPage
```

### ディレクトリ構成（実装ガイド）
```
src/client/components/
  atoms/       Button/ Icon/ Text/ Chip/ Badge/ StatusDot/ Mascot/ SoundToggle/ Sparkle/ UserAvatar/
  molecules/   AudioButton/ LanguageToggle/ ReviewButtons/ ProgressIndicator/
               StreakBadge/ SuccessToast/ WordListItem/ StatItem/ MuteButton/ UserCard/ WordSetCard/
  organisms/   FlashCard/ WordList/ SessionHeader/ CelebrationOverlay/
               CompleteSummary/ AutoPlayControls/ AdminWordForm/ UserSelector/ WordSetSelector/ UserNav/
  templates/   StudyTemplate/ WordListTemplate/ CompleteTemplate/ AdminTemplate/ UserSelectTemplate/ WordSetSelectTemplate/
```
> 既存 `components/FlashCard`・`WordList`・`ReviewButtons` 等は、この階層へ再配置していく（[../../impl](../../impl) で移行計画）。

---

## 1. Atoms（原子）

最小単位。状態を持たず、propsで見た目が決まる。トークンのみを参照する。

| Atom | 役割 | 主なprops | Berryスタイル |
|------|------|----------|--------------|
| `Button` | 全ボタンの土台 | `variant`(primary/ghost/soft/danger), `size`, `fullWidth` | ぷっくり／`--berry-500` 塗り／押下で沈む |
| `Icon` | SVGアイコン | `name`(speaker/heart/flame/check/star/sound-on/off), `size` | `--berry-500` 既定 |
| `Text` | タイポ統一 | `as`, `variant`(word/translation/heading/body/hint) | visual-design のタイポ表に準拠 |
| `Chip` | ピル型ラベル | `tone`(berry/mint/lavender) | `--radius-pill` |
| `Badge` | 数値/カウント | `value`, `tone` | 進捗カウント・XP |
| `StatusDot` | new/weak/mastered | `status` | ピンク/ミント/ラベンダーのドット |
| `Mascot` | 相棒Berry | `mood`(idle/happy/cheer) | 🍓 SVG。表情差分 |
| `SoundToggle` | 🔊/🔈 アイコン | `muted` | ピル |
| `Sparkle` | 正解時の粒 | `count`, `color` | `--sunny-400`/`--mint-500` |
| `UserAvatar` | ユーザーのアバター表示 | `username`, `size` | 丸型、名前の頭文字または🍓マスコット、やさしいパステル背景 |

**原則**: Atomはビジネスロジック・API・状態管理を持たない。純粋な表示部品。

---

## 2. Molecules（分子）

Atomを2〜数個組み合わせた、意味のある小さなまとまり。

| Molecule | 構成Atom | 役割 |
|----------|---------|------|
| `AudioButton` | Icon(speaker) + Button | 発音再生ボタン（既存を移設） |
| `LanguageToggle` | Chip×2 | 🇻🇳/🇯🇵 切替（既存を移設） |
| `ReviewButtons` | Button(danger-soft)＝もういちど + Button(primary/mint)＝できた！ | 自己評価。Goodで正解演出をトリガー |
| `ProgressIndicator` | ProgressBar + Badge + Text | `4/10`＋残り2枚で励まし |
| `StreakBadge` | Icon(flame) + Badge | 🔥連続正解数 |
| `SuccessToast` | Text + Sparkle | 「Nice!／いいね！」の応援トースト |
| `MuteButton` | SoundToggle | 音ON/OFF＋localStorage保持 |
| `WordListItem` | Text×2 + AudioButton + StatusDot | 単語リストの1行（希望.JPG準拠） |
| `StatItem` | Text(label) + Text(value) | 完了サマリーの1項目 |
| `UserCard` | UserAvatar + Text(username) + Button(delete) | ユーザー選択用カード。選択状態でピンクの光彩（`--shadow-berry`） |
| `WordSetCard` | Text(name) + StatItem(progress) + ProgressBar | レベル別単語セットの選択カード。進捗率のプログレスバー表示 |

**原則**: Moleculeはローカルな見た目状態（hover等）はOK。ドメインデータは props で受け取る。

---

## 3. Organisms（有機体）

Moleculeやドメイン状態を束ねた、画面の主要ブロック。フック（`useSound` 等）と接続してよい。

| Organism | 構成 | 役割 |
|----------|------|------|
| `FlashCard` | Text(word) + 裏面(翻訳/例文) + AudioButton + Button(こたえを見る) | カード反転（既存を刷新：色・フリップ演出） |
| `WordList` | WordListItem × N | 10件リスト（既存を移設） |
| `SessionHeader` | Mascot + ProgressIndicator + StreakBadge + MuteButton | 学習画面ヘッダー |
| `CelebrationOverlay` | Confetti + Mascot(cheer) + Sparkle | 完了/コンボの祝福演出。`useSound(complete)` と連動 |
| `CompleteSummary` | StatItem × 3 + Mascot + Button×2 | 完了サマリー（[motivation.md](./motivation.md) §5） |
| `AutoPlayControls` | Button + Input | 自動再生（既存を移設） |
| `AdminWordForm` | Text/Input/Button群 | 管理画面のCRUDフォーム |
| `UserSelector` | UserCard × N + Input(username) + Button | 登録済みユーザーの一覧選択と新規追加フォーム |
| `WordSetSelector` | Tab(level) + WordSetCard × N | レベル別の単語セットの選択リストとタブ切替 |
| `UserNav` | UserAvatar + Text(username) + DropdownMenu | ヘッダーに常駐するユーザー切り替え/レベル変更ナビゲーション |

---

## 4. Templates（テンプレート）

配置とレスポンシブのみを定義。**ダミー/実データを問わずレイアウトが成立**する骨組み。
セーフエリア・8ptグリッド・最大幅（448–480px中央寄せ）をここで担保する。

| Template | 含むOrganism | 備考 |
|----------|-------------|------|
| `StudyTemplate` | SessionHeader + FlashCard + ReviewButtons + (CelebrationOverlay) | 学習の骨組み |
| `WordListTemplate` | SessionHeader(簡易) + WordList | 一覧の骨組み |
| `CompleteTemplate` | CelebrationOverlay + CompleteSummary | 完了の骨組み |
| `AdminTemplate` | ヘッダー + AdminWordForm + 一覧 | 管理の骨組み |
| `UserSelectTemplate` | Mascot(cheer) + UserSelector | ユーザー登録・選択画面のレイアウト |
| `WordSetSelectTemplate` | SessionHeader(簡易) + WordSetSelector | レベル別単語セット選択画面のレイアウト |

---

## 5. Pages（ページ）

Templateに実データ・ルーティング・API/フックを結線した最終形。

| Page | Template | 接続フック（既存） |
|------|----------|-------------------|
| `StudyPage` | StudyTemplate | `useWords` `useSession` `useSpeech` `useAutoPlay` ＋新規`useSound` |
| `WordListPage` | WordListTemplate | `useWords` |
| `AdminPage` | AdminTemplate | `useAdminWords` |
| `UserSelectPage` | UserSelectTemplate | 新規: `useUsers` (ユーザー一覧・登録管理) |
| `WordSetSelectPage` | WordSetSelectTemplate | 新規: `useWordSets` (レベル別進捗と単語セット取得) |

> `StudyPage` は既存を維持しつつ、Goodハンドラで `useSound('correct')` とコンボ状態を発火するよう結線する。

---

## 6. 既存コンポーネント → Atomic 移行対応表

| 現行 | 新しい分類 | 対応 |
|------|-----------|------|
| `components/FlashCard` | Organism | 移設＋Berryスタイル・フリップ演出 |
| `components/WordList` + `WordListItem` | Organism + Molecule | 移設＋StatusDot追加 |
| `components/ReviewButtons` | Molecule | 移設＋正解演出トリガー結線 |
| `components/AudioButton` | Molecule | 移設 |
| `components/LanguageToggle` | Molecule | 移設 |
| `components/CompleteScreen` | Template + Organism へ分解 | CompleteTemplate / CompleteSummary / CelebrationOverlay に再構成 |
| （新規） | Atoms 各種・Mascot・Sparkle・StreakBadge・SuccessToast・CelebrationOverlay | 追加 |

---

## 7. コンポーネント設計ルール（Atomic）

- **R-ATOM-01**: 下位の粒度は上位を import しない（Atom は Molecule を知らない）。依存は常に一方向（Pages→Templates→Organisms→Molecules→Atoms→Tokens）。
- **R-ATOM-02**: 色・余白・角丸・影は **必ずトークン参照**。Atom/Molecule に生のHEXを書かない。
- **R-ATOM-03**: ドメインデータ・API・グローバル状態は **Organism/Page** でのみ扱う。Atom/Moleculeは props 経由の純粋部品。
- **R-ATOM-04**: 各コンポーネントは `Component.tsx` + `Component.module.css`（＋必要なら `index.ts`）で1ディレクトリにまとめる。
- **R-ATOM-05**: 命名は分類が分かる形（例：`atoms/Button`）。ディレクトリ＝分類。
