# Unit Test Rules

1. `docs/test/test-plan.md` に定義されたテストケースに沿ってテストコードを書くこと。
2. Vitest の標準構文 (`describe`, `it`, `expect`, `vi`) を使用すること。
3. `sfx.ts` や `useSession` などの関心の分離、境界値テスト、Undo動作のローカル状態減算を検証すること。
4. テストは独立して並列実行できる状態を保つこと。
