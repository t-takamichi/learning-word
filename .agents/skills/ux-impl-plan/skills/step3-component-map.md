# STEP 3: コンポーネント別 実装/移行タスクマップ

**目的**: Atomic Designの各コンポーネントを「新規/移行/置換」で棚卸しし、実装の地図を作る。

## 実施内容
`component-structure.md` の全コンポーネントについて、次を1行ずつ定義する。

```
| コンポーネント | 層 | 分類(新規/移行/置換) | 元ファイル | 新パス | 依存(下位) | 主要props | 対応AC |
```

- **移行**: 既存 `components/FlashCard` → `organisms/FlashCard` へ再配置＋トークン適用
- **置換**: `CompleteScreen` → `templates/CompleteTemplate` + `organisms/CompleteSummary` + `CelebrationOverlay` に分解
- **新規**: Mascot / Sparkle / StreakBadge / SuccessToast / CelebrationOverlay / useSound

## ディレクトリ移行方針
- `src/client/components/{atoms,molecules,organisms,templates}/` を新設
- import 参照の更新箇所を洗い出す（既存 Page からの参照）

## 出力先
`docs/spec/impl/ux/component-tasks.md`

## 注意
- 依存は下位から積む（Atomが無いとMoleculeが作れない）順序で並べる
- 「作り直し」でなく「移行」を優先し、破壊範囲を最小化する
