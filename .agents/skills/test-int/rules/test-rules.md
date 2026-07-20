# Integration Test Rules

1. `docs/test/test-plan.md` (TC-01 認証、TC-05 管理) に定義された統合シナリオをテストすること。
2. APIエンドポイント（`/api/users/login`, `/api/review` 等）のリクエスト/レスポンスおよび DB の最終状態をアサートすること。
3. 未認証状態で `GET /api/users` などの列挙ルートが存在せず 404/401 となるセキュリティ検証を含めること。
4. テストDBの分離および各テスト前後のクリーンアップを徹底すること。
