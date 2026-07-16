# 実装計画書 - フェーズ UX-3: サウンド・ハプティクス基盤

本フェーズでは、音声自動再生制限（iOS Safari）を解決するための AudioContext 解錠処理と、Web Audio API 合成音ライブラリ、およびミュート状態を永続化するフックの実装を行います。

---

## 1. 成果物とタスク一覧

| タスクID | 対象ファイル | 成果物と実装内容 | 階層 | 検証方法 / 受け入れ基準 (AC) | 適用ルール |
|:---|:---|:---|:---|:---|:---|
| **UX-3-1** | `client/lib/sfx.ts` | 既存 `lib/sfx.ts` をクリーンアップ。OscillatorNode 合成による効果音（correct, combo, again, flip, complete, tap）を定義。iOS Safari対応のサイレント・バッファ処理を調整する。 | Infrastructure | 音声ファイルの読み込みを行わず、Web Audio API の周波数合成のみで音が遅延なく生成・再生されること。 | `R-UX-08` |
| **UX-3-2** | `client/hooks/useSound.ts` | `useSound` フックをリファクタリング。`unlock()` でユーザーの物理タップを通じて `AudioContext.resume()` するロジック、および `navigator.vibrate` の有無（iOS）を安全に回避するフォールバック。ミュート状態を `localStorage` に保存・復元する。 | Hooks | ミュート状態がリロード後も永続化され、`navigator.vibrate` 非対応ブラウザでクラッシュしないこと。 | `R-UX-08` |

---

## 2. 動作検証手順
1.  iPhone（iOS Safari）にて検証用ページを開き、最初の「はじめる」ボタンタップ時に音声・効果音がブロックされず、正常に再生されることを確認します。
2.  コントロールセンター等でマナーモードに設定した場合でも、コンソールにエラー（AudioContext denied 等）が出力されず、無音状態でアプリが進行することを確認します。
3.  ミュートボタンを押した直後にブラウザをリロードし、ミュート状態が維持されていることを `localStorage` の値とともに確認します。
