import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authedFetch } from '../authedFetch';

describe('authedFetch.ts - 超強化プロ仕様テスト (ネットワーク障害・HTTPエラー例外検証)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('正常系: トークンが存在する場合 x-user-token ヘッダーが付与されること', async () => {
    localStorage.setItem('active_user_token', 'my-secret-token-777');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }));

    await authedFetch('/api/test');

    expect(fetchSpy).toHaveBeenCalledWith('/api/test', expect.objectContaining({
      headers: expect.anything(),
    }));
  });

  it('😈 敵対的ケース1: サーバーが 401 Unauthorized を返した際、強制ログアウト処理が行われ UnauthorizedError が投げられること', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"error":"Unauthorized"}', { status: 401 }));

    await expect(authedFetch('/api/protected')).rejects.toThrow('認証の有効期限が切れました。ログインし直してください。');
  });

  it('😈 敵対的ケース2: サーバーが 500 Internal Server Error を返した際、Response オブジェクトが正しく返却されること', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"error":"Server Error"}', { status: 500 }));

    const res = await authedFetch('/api/error');
    expect(res.ok).toBe(false);
    expect(res.status).toBe(500);
  });

  it('😈 敵対的ケース3: ネットワーク不通 (Fetch rejected with TypeError) 時に呼び出し元へ例外が確実にスローされること', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(authedFetch('/api/offline')).rejects.toThrow('Failed to fetch');
  });
});
