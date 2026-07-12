# STEP 4: 詳細設計 + シーケンス図（エンジニア）

**目的**: 各機能の動作を図で明確化し、実装前の認識合わせを行う。

## 実施内容

### シーケンス図（Mermaid）— 必須
```mermaid
sequenceDiagram
  participant User
  participant Frontend
  participant API as Hono API
  participant DB as SQLite

  User->>Frontend: アクション
  Frontend->>API: リクエスト
  API->>DB: クエリ
  DB-->>API: レスポンス
  API-->>Frontend: JSONレスポンス
  Frontend-->>User: UI更新
```

### データモデル（ERD）
```mermaid
erDiagram
  words {
    int id PK
    string english
    string vietnamese
    string japanese
    string example
  }
  learning_progress {
    int id PK
    int word_id FK
    string status
    int review_count
    int incorrect_count
  }
  words ||--o{ learning_progress : has
```

### 画面遷移図
- ワイヤーフレームが存在する場合は参照する
- 主要な遷移パターンを図示する

### エラーハンドリング設計
- 各APIエンドポイントのエラーケースを列挙する
- フロントエンドでのフォールバック動作を定義する

## 出力先
機能ごとに `docs/spec/design/[feature-name].md`
- 例: `docs/spec/design/flashcard.md`
- 例: `docs/spec/design/word-list.md`
- 例: `docs/spec/design/admin.md`
