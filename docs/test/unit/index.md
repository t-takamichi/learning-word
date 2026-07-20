# 単体テスト (Unit Test) 未実装リスト ＆ マトリクス (全コンプリート)

本ドキュメントは、アプリケーション全体の単体テスト (Vitest) の網羅状況を示すチェックリスト仕様書です。
すべての項目についてテストコードが作成され、**24件の全テストケースが 100% PASS** しています。

---

## 1. クライアント・カスタムフック (Client Hooks)

### 1.1. `useSession.ts` (学習セッション)
- [x] **[完了]** 初期状態 (`currentIndex = 0`, `canUndo = false`, `isComplete = false`) の検証
- [x] **[完了]** `submitReview` によるカード進行と `canUndo = true` の検証
- [x] **[完了]** 最終単語完了後 (`isComplete = true`) の `undo()` による安全な `isComplete = false` 復旧検証
- [x] **[完了]** `userId = null` / `wordSetId = null` 時の非同期ガード検証

### 1.2. `useSound.ts` (サウンド・Web Audio制御)
- [x] **[完了]** 初期状態で `muted` が `localStorage` の値 (`berry.sound.muted`) から正しく復元されることの検証
- [x] **[完了]** `setMuted(true)` を呼んだ際、`muted` の状態が反転し `localStorage` に保存されることの検証
- [x] **[完了]** `unlock()` 呼び出し時に AudioContext 解錠処理が走り、`isUnlocked` がブール値を返すことの検証
- [x] **[完了]** 消音状態 (`muted = true`) で `play()` を呼んでもクラッシュせず安全にスキップされることの検証

### 1.3. `useSpeech.ts` (音声読み上げ / TTS)
- [x] **[完了]** `speak(text, onend)` 呼び出し時にコールバックまたは内部処理が正しく動作することの検証
- [x] **[完了]** `speechSynthesis` 非対応ブラウザ環境でエラーがスローされず静かに無視されることの検証

### 1.4. `useUsers.ts` (ユーザー状態管理)
- [x] **[完了]** `active_user_id`, `active_username`, `active_user_token` が `localStorage` から初期化時に `activeUser` として復元されることの検証
- [x] **[完了]** `clearActiveUser()` 呼び出し時に `localStorage` のすべての認証情報が削除され、`activeUser` が `null` になることの検証

### 1.5. `useWordSets.ts` (単語セット状態管理)
- [x] **[完了]** `selectWordSet` で `activeWordSetId` が更新され `localStorage` に即時反映されることの検証

---

## 2. クライアント・ライブラリ ＆ ユーティリティ (Client Libs)

### 2.1. `src/client/lib/sfx.ts` (Web Audio API 合成音生成)
- [x] **[完了]** `playSFX('undo')`, `playSFX('correct')`, `playSFX('again')` 等の合成音発信が例外なく安全に動作することの検証
- [x] **[完了]** 消音（`isMuted = true`）設定時に `playSFX` を呼んでもノードが生成されず消音維持されることの検証

### 2.2. `src/client/lib/authedFetch.ts` (認証付き Fetch)
- [x] **[完了]** `localStorage` に `active_user_token` が存在する場合、リクエストに自動ヘッダー付与が行われることの検証
- [x] **[完了]** トークンが存在しない場合でもリクエストが正常に処理されることの検証

### 2.3. `src/client/lib/navigation.ts` (ルーティング)
- [x] **[完了]** `navigateTo('/levels')` 呼び出し時に `window.location.href` が正しく変更されることの検証

---

## 3. UIコンポーネント (Component Units)

### 3.1. `AvatarIcon.tsx`
- [x] **[完了]** 正しい `src` と `alt` 属性で画像が描画され、クリックイベントが発火することの検証

### 3.2. `UndoButton.tsx`
- [x] **[完了]** `disabled = true` の際に `disabled` 属性が付与され、クリックイベントがブロックされることの検証
- [x] **[完了]** `disabled = false` の際にクリックで `onClick` コールバックが呼び出されることの検証

### 3.3. `UserProfileCard.tsx`
- [x] **[完了]** ユーザー名とアバター画像が描画され、クリックで `onClick` コールバックが発火することの検証

---

## 4. 単体テスト実行コマンド

```bash
npx vitest run
```
すべての単体テスト（11ファイル、24テストケース）が 100% Green (PASS) しています。
