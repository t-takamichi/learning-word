# STEP 2: 実装タスクへの分解・順序付け

**目的**: フェーズのスコープを、実装者がそのまま着手できるタスク列に分解する。

## 実施内容

### タスクへの分解
フェーズのスコープを「1タスク=1成果物」に分解する。各タスクに以下を定める。

- **タスクID**: T1, T2, ... （連番）
- **成果物**: 作成/変更するファイルパス
- **内容**: 何を実装するか（主要な型・関数シグネチャ・コンポーネント）
- **レイヤー**: Domain / Infrastructure / Application / Presentation / Frontend / 共通
- **検証方法**: 動作確認コマンド・手動確認・テスト観点
- **適用ルール**: `docs/rules/` の該当ルール

### 依存順に並べる
レイヤー依存方向に沿って T番号 の順序を確定する。

```
共有型(shared/) → Domain(Entity/Interface) → Infrastructure(Repo実装/DB)
  → Application(UseCase) → Presentation(Hono Handler) → Frontend(React)
```

### タスク分解の例

| ID | 成果物 | 内容 | 層 | 検証 |
|----|--------|------|----|------|
| T1 | `src/shared/types/word.ts` | Word型定義 | 共通 | `tsc --noEmit` |
| T2 | `src/server/domain/word.ts` | Word Entity + Repository IF | Domain | 単体テスト |
| T3 | `src/server/infra/wordRepository.ts` | SQLite実装 | Infra | クエリ動作確認 |
| T4 | `src/server/app/getSessionUseCase.ts` | セッション取得 UseCase | App | 単体テスト |
| T5 | `src/server/routes/session.ts` | GET /api/session | Presentation | curl動作確認 |
| T6 | `src/client/components/Card.tsx` | カード表示 | Frontend | 画面表示確認 |

## 出力
このSTEPは内部整理のみ（ファイル出力なし）。
確定したタスク列を次STEPの計画書生成へ引き継ぐ。
