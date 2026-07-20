# STEP 3: Atomic Design コンポーネント構造

**目的**: UIを Atomic Design で構造化し、実装（コンポーネント）と1対1で対応する設計にする。

## 前提ルール
```
.claude/skills/ux-design/rules/atomic-design.md
```
を必ず適用する。

## 実施内容
1. **全体マップ**: Tokens → Atoms → Molecules → Organisms → Templates → Pages を図で示す
2. **各層の定義表**（役割・構成・props・Berryスタイル）
   - Atoms: Button / Icon / Text / Chip / Badge / StatusDot / Mascot / SoundToggle / Sparkle …
   - Molecules: AudioButton / ReviewButtons / ProgressIndicator / StreakBadge / SuccessToast / WordListItem …
   - Organisms: FlashCard / WordList / SessionHeader / CelebrationOverlay / CompleteSummary …
   - Templates: StudyTemplate / WordListTemplate / CompleteTemplate / AdminTemplate
   - Pages: StudyPage / WordListPage / AdminPage（接続フックを明記）
3. **ディレクトリ構成**: `src/client/components/{atoms,molecules,organisms,templates}` の指針
4. **既存→Atomic 移行対応表**: 現行コンポーネントをどの層に再配置するか
5. **依存方向の明示**: 下位は上位を import しない（一方向）

## 出力先
`docs/spec/design/ux/component-structure.md`

## 注意
- 粒度の判断基準を明確に（状態/APIを持つのはOrganism/Page、Atom/Moleculeは純粋部品）
- 既存資産（FlashCard/WordList/ReviewButtons/AudioButton/LanguageToggle）の移設コストを見積もる
