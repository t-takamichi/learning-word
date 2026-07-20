import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWordSets } from '../useWordSets';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

vi.mock('../../lib/authedFetch', () => ({
  authedFetch: vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [
      { id: 10, name: 'Basic 100', category: 'General', count: 10 },
      { id: 20, name: 'Intermediate', category: 'General', count: 20 },
    ],
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useWordSets hook unit test', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('selectWordSet で activeWordSetId が更新され localStorage に格納されること', () => {
    const { result } = renderHook(() => useWordSets(1), { wrapper: createWrapper() });

    act(() => {
      result.current.selectWordSet(20);
    });

    expect(result.current.activeWordSetId).toBe(20);
    expect(localStorage.getItem('active_word_set_id')).toBe('20');
  });
});
