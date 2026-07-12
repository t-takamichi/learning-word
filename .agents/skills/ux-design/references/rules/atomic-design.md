# Atomic Design Rules

コンポーネント設計は Atomic Design（Brad Frost）に従う。

## 階層定義
```
Design Tokens（素粒子: 色/余白/角丸/影のCSS変数）
  └ Atoms       最小の純粋部品（Button, Icon, Text, Chip, Badge, StatusDot, Mascot, Sparkle …）
    └ Molecules  Atomの意味ある小さな集合（AudioButton, ReviewButtons, ProgressIndicator …）
      └ Organisms 画面の主要ブロック（FlashCard, WordList, SessionHeader, CelebrationOverlay …）
        └ Templates レイアウトの骨組み（StudyTemplate, CompleteTemplate …）
          └ Pages    実データ・フック結線の最終形（StudyPage, WordListPage, AdminPage）
```

## ルール
### R-ATOM-01: 依存は一方向
- 下位は上位を import しない（Atomは Moleculeを知らない）。依存方向は Pages→…→Atoms→Tokens の一方向のみ

### R-ATOM-02: トークン参照を徹底
- Atom/Molecule に生のHEX・マジックナンバーを書かない。必ずデザイントークンを参照する

### R-ATOM-03: 状態とロジックの置き場所
- ドメインデータ・API・グローバル状態は **Organism/Page** のみで扱う
- Atom/Molecule は props で受け取る純粋部品（ローカルな見た目状態hover等はOK）

### R-ATOM-04: 1コンポーネント=1ディレクトリ
- `Component.tsx` + `Component.module.css`（＋必要なら `index.ts`）をまとめる
- ディレクトリ＝分類（`atoms/Button` のように層が分かる配置）

### R-ATOM-05: 既存資産は移行対応表で扱う
- 現行 `components/*` を新階層へ再配置する対応表を必ず作り、破壊的変更を避ける

### R-ATOM-06: 粒度は再利用性で判断
- 「複数箇所で使う純粋な見た目」＝ Atom/Molecule
- 「その画面固有・状態を束ねる」＝ Organism
- 迷ったら小さく作り、上位で組み合わせる
