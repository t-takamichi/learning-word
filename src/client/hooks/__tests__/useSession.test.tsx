import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSession } from '../useSession';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { authedFetch } from '../../lib/authedFetch';

// Mock authedFetch for session and review APIs
vi.mock('../../lib/authedFetch', () => ({
  authedFetch: vi.fn(),
}));

const mockAuthedFetch = authedFetch as unknown as ReturnType<typeof vi.fn>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useSession hook - 超強化プロ仕様テスト (異常系・境界値・通信障害網羅)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常系: 初期状態、進行、Undo、完了後復旧', async () => {
    mockAuthedFetch.mockImplementation((url: string) => {
      if (url.includes('/api/session')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 101, english: 'apple', japanese: 'りんご' },
            { id: 102, english: 'banana', japanese: 'バナナ' },
          ],
        });
      }
      return Promise.resolve({ ok: true, json: async () => ({ success: true }) });
    });

    const { result } = renderHook(() => useSession(1, 1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.words).toHaveLength(2);
    });

    // 進行
    act(() => {
      result.current.submitReview('good');
    });

    await waitFor(() => {
      expect(result.current.currentIndex).toBe(1);
    });

    // 完了
    act(() => {
      result.current.submitReview('good');
    });

    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });

    // 完了後の Undo 復旧
    act(() => {
      result.current.undo();
    });

    expect(result.current.isComplete).toBe(false);
    expect(result.current.currentIndex).toBe(1);
  });

  it('😈 敵対的ケース1: サーバーエラー (HTTP 500) 発生時でもアプリがクラッシュせず次のカードに進むこと', async () => {
    mockAuthedFetch.mockImplementation((url: string) => {
      if (url.includes('/api/session')) {
        return Promise.resolve({
          ok: true,
          json: async () => [{ id: 101, english: 'apple', japanese: 'りんご' }],
        });
      }
      // Review API fails with 500
      return Promise.resolve({ ok: false, status: 500 });
    });

    const { result } = renderHook(() => useSession(1, 1), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.words).toHaveLength(1);
    });

    act(() => {
      result.current.submitReview('again');
    });

    // エラーでも止まらずカード進行し、完走すること
    await waitFor(() => {
      expect(result.current.isComplete).toBe(true);
    });
  });

  it('😈 敵対的ケース2: 単語データが 0 件（空配列）のレベルを選択した場合の安全な挙動', async () => {
    mockAuthedFetch.mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    const { result } = renderHook(() => useSession(1, 99), { wrapper: createWrapper() });

    await waitFor(() => {
      expect(result.current.words).toEqual([]);
    });

    expect(result.current.canUndo).toBe(false);

    // 空の状態で操作してもクラッシュしない
    act(() => {
      result.current.submitReview('good');
      result.current.undo();
    });

    expect(result.current.currentIndex).toBe(0);
  });
});
