# UX-3 実装計画書: サウンド基盤（useSound）

親: [README.md](./README.md)

> **リスク最前線フェーズ**。iOS Safari のオーディオ解錠・Vibration 非対応・遅延という不確実性を、ここで先に潰す。

## 1. 参照
- UI/UX 仕様: [sound-haptics.md](../../design/ux/sound-haptics.md)（全体）
- 受け入れ基準: [acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §3 サウンド&ハプティクス
- 規約: [react.md](../../../rules/react.md) / [TypeScript.md](../../../rules/TypeScript.md)

## 2. このフェーズのゴール
- `useSound` フックを新設し、**Web Audio API 合成**で `sfx.correct` 等を低遅延再生できる
- **AudioContext を初回ユーザー操作で `resume()` 解錠**（iOS 制約対応）
- ミュート状態を `localStorage("berry.sound.muted")` に保持
- `navigator.vibrate` は**存在チェック済み**で iOS Safari でもエラーにならない
- 既存フック（`useSpeech` 等）には手を加えない

## 3. 前提・依存
- 依存フェーズ: UX-1（トークンは不要だが同時進行の整合のため）
- 並行: UX-2（Atoms）と並行着手可
- **iOS Safari 実機 or シミュレータが必須**（音の解錠・vibrate 無害を実機検証）

## 4. 実装タスク一覧（実装順）

| ID | 成果物（ファイル） | 内容 | 層 | 検証方法 | 適用ルール |
|----|------------------|------|----|---------|-----------|
| T1 | `src/client/hooks/useSound.ts`（新規） | 単一 `AudioContext` 共有・`unlock()`（初回タップで `resume()`）・`play(id)`・`setMuted`/`isMuted`（localStorage）・`vibrate` 存在チェック | Hook | `bun run typecheck` / iOS Safari 実機 | react.md, TypeScript.md, sound-haptics §3.2 |
| T2 | `src/client/lib/sfx.ts`（新規） | SFX 定義（オシレータ合成関数）。`correct`/`combo`/`again`/`flip`/`complete`/`tap` を Web Audio ノードで生成（音源ファイル不要） | Lib | 各 SFX を単体再生して耳確認 | sound-haptics §1,§3.1 |
| T3 | `useSound` に vibrate パターン結線 | 正解 `15` / コンボ `[10,30,10]` / 完了 `[15,40,15,40,30]`。全て `if (navigator.vibrate)` ガード | Hook | iOS でエラーなし・Android で振動 | sound-haptics §4 |
| T4 | ミュート永続化の検証タスク | `setMuted(true)` → リロード → ミュート維持を確認。既定は ON（未設定時 unmuted=音あり） | Hook | 再訪でミュート保持 | sound-haptics §3.3, §6 |

## 5. タスク詳細

### T1: `useSound` フック
- **責務**（[sound-haptics.md](../../design/ux/sound-haptics.md) §3.2）:
  ```
  unlock():        初回タップで AudioContext を resume() 解錠
  play(id):        指定 SFX を低遅延再生（ミュート時は何もしない）
  setMuted(bool):  localStorage("berry.sound.muted") に保存
  isMuted():       現在の状態
  ```
- 単一の `AudioContext` をアプリで共有する。モジュールスコープで遅延生成し、`unlock()` 時に `resume()`。
- 戻り値の型・公開メソッドは**明示的な型注釈**（TypeScript.md）。`any` 禁止。存在しない API は `unknown` narrow / optional chaining で扱う。
- SSR 安全のため `typeof window !== 'undefined'` ガード（`useSpeech` と同様の作法）。

### T2: `sfx.ts`（Web Audio 合成）
- 音源ファイル不要のオシレータ合成（[sound-haptics.md](../../design/ux/sound-haptics.md) §3.1）：
  - `correct`: 三角波 2音 C6→E6 を 0.1s ずつ、エンベロープ付き（~0.4s）
  - `combo`: さらに高い上昇音（~0.6s）
  - `again`: やわらかい低め単音（~0.25s・責めない）
  - `complete`: 達成の和音アルペジオ（~1.2s 以内）
  - `flip`/`tap`: 任意・控えめ
- 既定音量は控えめ（0.3〜0.5）。わずかなピッチ揺らぎで連打時の不快を回避（§1・§5）。

### T3: ハプティクス
- **必ず `if (navigator.vibrate)` で存在チェック**してから呼ぶ。iOS では自然に無効化される想定。
- 触覚は「あれば嬉しい」レベル。無くても体験が成立する二重化（音・視覚が主）。

### T4: ミュート永続化
- 既定 ON（音あり）。`localStorage` 未設定時は音が鳴る。`setMuted` で保存、再訪時に読み出して初期化。

## 6. 受け入れ基準（AC）
[acceptance-criteria.md](../../design/ux/acceptance-criteria.md) §3 / [sound-haptics.md](../../design/ux/sound-haptics.md) §6 と対応：
- [ ] 最初のユーザー操作後、`sfx.correct`（Nice!）が体感即時で鳴る（遅延なし）
- [ ] Good で "Nice!" が鳴り、Again では責める音が鳴らない（低め・やわらか）
- [ ] ミュート状態が再訪時も保持される（localStorage）
- [ ] 音が鳴らない環境（サイレント/未対応）でも体験が成立する（音は加点）
- [ ] iOS Safari で `navigator.vibrate` 呼び出しがエラーを起こさない（存在チェック済み）
- [ ] `sfx.complete` が 1.2 秒以内で鳴り終わる

## 7. 検証手順（iOS 実機必須）
- 型: `bun run typecheck`
- 実機 iOS Safari:
  1. 初回タップ（例「れんしゅうする」相当のボタン）後に `play('correct')` が即時に鳴る
  2. 3回以上連続再生しても遅延・不発が起きない
  3. サイレントスイッチ ON でも視覚で成立（音は加点）
  4. `navigator.vibrate` 呼び出しでコンソールエラーが出ない
- リロード後にミュート設定が保持される
