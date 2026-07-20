import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUsers } from '../useUsers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

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

describe('useUsers hook - 超強化プロ仕様テスト (破損ストレージ耐性・認証整合性)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('正常系: localStorage からユーザー情報の正常復元と clearActiveUser', () => {
    localStorage.setItem('active_user_id', '42');
    localStorage.setItem('active_username', 'Taro');
    localStorage.setItem('active_user_token', 'fake-token-123');

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
    expect(result.current.activeUser).toEqual({ id: 42, username: 'Taro' });

    act(() => {
      result.current.clearActiveUser();
    });

    expect(result.current.activeUser).toBeNull();
  });

  it('😈 敵対的ケース1: localStorage の active_user_id に文字列 "invalid" 等の破損データが入っていた場合', () => {
    localStorage.setItem('active_user_id', 'invalid_number');
    localStorage.setItem('active_username', 'Taro');

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    expect(result.current.activeUserId).toBeNaN();
  });

  it('😈 敵対的ケース2: username のみ存在し active_user_id が欠損している片肺状態での安全な動作', () => {
    localStorage.setItem('active_username', 'Ghost');

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });
    expect(result.current.activeUser).toBeNull();
  });
});
