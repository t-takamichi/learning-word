# Phase UX-8: 複数ユーザー対応 & レベル別単語セット選択

親: [README.md](./README.md)
設計: [../../design/ux/README.md](../../design/ux/README.md)

---

## 1. ゴール

「誰がまなぶか」「どのレベルをまなぶか」を直感的かつやさしく選択できるようにし、ユーザーごとのパーソナライズ学習履歴と、レベル選択画面の実装を完了する。

---

## 2. タスク分解

### 📦 T-8.1: Atoms の実装 (Atoms)
* [ ] **`atoms/UserAvatar` の作成**:
  * ユーザーの頭文字、または軽量な🍓アバターを丸型背景（`--plum-100` 等のパステルカラー）の中に配置する。
  * props: `username: string`, `size?: 'sm' | 'md' | 'lg'`

### 📦 T-8.2: Molecules の実装 (Molecules)
* [ ] **`molecules/UserCard` の作成**:
  * `UserAvatar` + `Text(username)` + `Button(delete)`
  * 選択中状態（現在のアカウント）は、外枠を `--berry-500` の太枠＋ピンクの光彩（`--shadow-berry`）で強調し、カード全体が少し沈み込む（スケール変化）インタラクションを付与する。
  * 削除ボタンはホバー/タップ時のみ表示され、テキストは「おわかれする」。
* [ ] **`molecules/WordSetCard` の作成**:
  * `Text(name)` + `StatItem(progress)` + `ProgressBar`
  * レベル名（はじめて/なれてきた/ばっちり）と進捗率をゲージで表現。
  * 100%完了時は、金色の星（`Icon(star)`）と特別な王冠マークを表示。

### 📦 T-8.3: Organisms の実装 (Organisms)
* [ ] **`organisms/UserSelector` の作成**:
  * 登録済み `UserCard` をやさしいグリッドで配置（レスポンシブ対応）。
  * ユーザー新規登録フォーム：入力欄のプレースホルダーは「おなまえを教えてね🍓」。
* [ ] **`organisms/WordSetSelector` の作成**:
  * `Tab` (レベルタグによるカテゴリ分け切り替え) + `WordSetCard` のリスト。
  * リストは片手スクロールしやすいように間隔をしっかりあける。
* [ ] **`organisms/UserNav` の作成**:
  * ヘッダーの右上に `UserAvatar` + `Text(username)` を組み合わせたドロップダウンを配置。タップすると「別のレベルにする」「ちがう人でまなぶ」のメニューが表示される。

### 📦 T-8.4: Templates & Pages の実装 (Templates & Pages)
* [ ] **`templates/UserSelectTemplate` & `pages/UserSelectPage` の作成**:
  * ユーザー登録・選択画面の実装。
  * 新規フック `useUsers` を作成し、DBの `/api/users` からデータを取得・追加・削除。
  * **ディズニーPM Plussing**: ユーザー選択時に Berry が happy 表情になり、`useSound('welcome')` が鳴る演出を組み込む。
* [ ] **`templates/WordSetSelectTemplate` & `pages/WordSetSelectPage` の作成**:
  * レベル/単語セット選択画面の実装。
  * 新規フック `useWordSets` を作成し、DBの `/api/word-sets` からデータ（レベル、セット名、進捗率）を取得。
  * レベルを選択したら `StudyPage` へ遷移。
* [ ] **ヘッダーへの `UserNav` 組み込み**:
  * `StudyPage` や `WordListPage` の `SessionHeader` 内に `UserNav` を組み込み、現在誰が学習中かを明示。

### 📦 T-8.5: テスト用データ初期化・再シードスクリプトの整備
* [ ] **`scripts/reset-db.ts` の整備と package.json 連携**:
  * 既存 DB（`learning.db`）ファイルを物理削除し、新規テーブルスキーマ適用および新しい `db/seed.json`（レベル別構造）からテストデータを再投入するスクリプトを構築する。
  * `yarn db:reset` コマンドでいつでも綺麗にデータベースをクリーン＆シードできる環境を整備する。

---

## 3. 受け入れ基準 (Acceptance Criteria)

* **複数ユーザー機能**:
  * [ ] ユーザー選択後、ヘッダーに選択したユーザー名とアバターが表示されること。
  * [ ] ユーザーを切り替えた際、学習進捗（weakやstreak等）がそのユーザー固有のものに切り替わり、他のユーザーに干渉しないこと。
  * [ ] 新規登録時、名前が空または重複している場合に、やさしい応援形のコピーでエラーが返されること。
* **レベル選択機能**:
  * [ ] 学習開始前にレベル（初級/中級/上級）が選択でき、選択したレベル内の単語のみが出題されること。
  * [ ] 各レベルカードに進捗率（〇〇/〇〇語）とプログレスバーが正確に表示されること。
  * [ ] 100%完了時に、制覇マーク（星/王冠）が表示されること。
* **データ管理 & テスト容易性 (Attention to Detail)**:
  * [ ] `yarn db:reset` を実行した際、データベース（learning.db）が初期化され、`db/seed.json` に定義された 3 つのレベル（Basic, Intermediate, Advanced）の単語セットが正しく投入されること。
* **ディズニー品質**:
  * [ ] ユーザー選択成功時、マスコットが喜ぶアニメーションとウェルカム音が遅延なく（200ms以内）再生されること。
  * [ ] 画面レイアウト（特にカードやボタン）のタップターゲットがすべて 44px 以上確保されていること。
