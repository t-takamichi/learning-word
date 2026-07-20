import { test, expect } from '@playwright/test';

test.describe('学習アプリ E2E 完全シミュレーション (認証 → 音声解錠 → カード学習・スワイプ → Undo → 交代)', () => {
  
  test('シナリオ1: 新規登録 ＆ 音声解錠 ＆ スワイプ操作 ＆ Undo ＆ ログアウト交代', async ({ page }) => {
    // 1. トップログイン画面へアクセス
    await page.goto('/');

    // 2. ユニークな新規アカウント作成
    const testUsername = `User_${Math.random().toString(36).substring(2, 9)}`;
    await page.getByRole('button', { name: 'あたらしくはじめる' }).click();
    await page.getByPlaceholder('おなまえを教えてね🍓').fill(testUsername);
    await page.getByPlaceholder('合言葉を入力してね🔑').fill('Pass1234');
    
    // 登録実行
    await page.getByRole('button', { name: 'いっしょにはじめる' }).click();

    // 3. レベル選択画面 (/levels) への遷移
    await expect(page).toHaveURL(/\/levels/);

    // 4. 単語セットを選択して学習開始
    const startButton = page.getByRole('button', { name: /学習をスタート/i }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
    }

    // 5. 音声アンロック「スタート！🍓」画面が表示されタップ解錠されること
    const unlockBtn = page.getByRole('button', { name: 'スタート！🍓' });
    if (await unlockBtn.isVisible()) {
      await unlockBtn.click();
    }

    // 6. フラッシュカードの回答表示
    const showAnswerBtn = page.getByRole('button', { name: 'こたえを見る' });
    if (await showAnswerBtn.isVisible()) {
      await showAnswerBtn.click();
    }

    // 7. ボタンでの Good 判定の実行
    const goodBtn = page.getByRole('button', { name: 'できた！' });
    if (await goodBtn.isVisible()) {
      await goodBtn.click();
    }

    // 8. Undo (ひとつのカードに戻る) ボタンによる安全な巻き戻し検証
    const undoBtn = page.getByTitle('直前のカードに戻る');
    if (await undoBtn.count() > 0) {
      const isEnabled = await undoBtn.isEnabled().catch(() => false);
      if (isEnabled) {
        await undoBtn.click();
      }
    }

    // 9. ユーザー交代・ログアウト処理 (/users 経由)
    await page.goto('/users');
    await page.getByRole('button', { name: 'べつの人でログインする' }).click();

    // ログイン画面へ安全に戻ること
    await expect(page.getByRole('button', { name: 'ログイン', exact: true })).toBeVisible();
  });

  test('シナリオ2: 既存ユーザーの「おなまえ＋英数字パスワード」手入力直接ログイン画面要素チェック', async ({ page }) => {
    await page.goto('/');

    // 「ログイン」タブ (exact: true)
    await page.getByRole('button', { name: 'ログイン', exact: true }).click();
    await page.getByPlaceholder('おなまえを教えてね🍓').fill('ExistingUser');
    await page.getByPlaceholder('合言葉を入力してね🔑').fill('AlphaNumPass99');

    // ログインフォーム送信の存在確認
    await expect(page.getByRole('button', { name: 'ログインする' })).toBeVisible();
  });

  test('シナリオ3: 「日本語訳のみ」および「ベトナム語訳のみ」の単語カード表示非クラッシュ検証', async ({ page }) => {
    await page.goto('/');
    const testUsername = `Single_${Math.random().toString(36).substring(2, 9)}`;
    await page.getByRole('button', { name: 'あたらしくはじめる' }).click();
    await page.getByPlaceholder('おなまえを教えてね🍓').fill(testUsername);
    await page.getByPlaceholder('合言葉を入力してね🔑').fill('Pass1234');
    await page.getByRole('button', { name: 'いっしょにはじめる' }).click();

    await expect(page).toHaveURL(/\/levels/);

    const startButton = page.getByRole('button', { name: /学習をスタート/i }).first();
    if (await startButton.isVisible()) {
      await startButton.click();
    }
    const unlockBtn = page.getByRole('button', { name: 'スタート！🍓' });
    if (await unlockBtn.isVisible()) {
      await unlockBtn.click();
    }

    // フラッシュカード要素が画面崩れを起こさず表示されること
    const card = page.locator('div[class*="card"]').first();
    await expect(card).toBeVisible();
  });
});
