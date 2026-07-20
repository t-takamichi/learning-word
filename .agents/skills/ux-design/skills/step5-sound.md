# STEP 5: サウンド・ハプティクス設計

**目的**: 「正解時にNice!の音」を、iPhone Safariで確実に鳴る形で設計する。

## 実施内容
- **サウンド一覧**: correct(Nice!) / combo / again / flip / complete / tap
  - 各: トリガー・長さ・キャラクター（明るく短くうるさくない）
- **iOS Safari 制約と対応**（必須）
  - オーディオ解錠: 初回ユーザー操作で `AudioContext.resume()`
  - サイレントスイッチ: 音無しでも体験が成立するよう視覚と二重化
  - `navigator.vibrate` 非対応: 存在チェックしてから呼ぶ。iOSは視覚/音で代替
  - 遅延: `<audio>`ではなく **Web Audio API**（合成 or 事前デコード）を推奨
- **実装方針**: `useSound` フックの責務（unlock/play/setMuted/isMuted）
- **ミュートUI**: 既定ON、ワンタップ切替、localStorage保持
- **ハプティクスのパターン**（対応端末のみ、存在チェック必須）
- **アクセシビリティ**: 音量控えめ、reduced-motionと独立、即ミュート可
- **AC**

## 出力先
`docs/spec/design/ux/sound-haptics.md`

## 注意
- 「音が鳴らなくても成立する」を最優先（音は加点）
- 効果音は合成でファイル不要にできる旨を実装ヒントとして残す
