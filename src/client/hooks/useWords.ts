import { useQuery } from '@tanstack/react-query';
import { hc } from 'hono/client';
import type { AppType } from '../../server/index';
import type { WordsResponse } from '@shared/types';

const client = hc<AppType>('/');

interface UseWordsOptions {
  readonly userId: number | null;
  readonly wordSetId: number | null;
  readonly page?: number;
  readonly limit?: number;
}

interface UseWordsReturn {
  readonly data: WordsResponse | undefined;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly refetch: () => void;
}

export function useWords({ userId, wordSetId, page = 1, limit = 10 }: UseWordsOptions): UseWordsReturn {
  const { data, isLoading, error, refetch } = useQuery<WordsResponse>({
    queryKey: ['words', userId, wordSetId, page, limit],
    queryFn: async () => {
      if (userId === null || wordSetId === null) {
        return { words: [], total: 0, page, limit, totalPages: 0 };
      }
      const token = localStorage.getItem('active_user_token');
      const res = await fetch(`/api/words?wordSetId=${wordSetId}&page=${page}&limit=${limit}`, {
        headers: {
          'X-User-Token': token || '',
        },
      });
      if (!res.ok) throw new Error('単語リストの取得に失敗しました');
      return res.json() as Promise<WordsResponse>;
    },
    enabled: userId !== null && wordSetId !== null,
  });

  return {
    data,
    isLoading: isLoading && userId !== null && wordSetId !== null,
    error: error instanceof Error ? error : null,
    refetch,
  };
}
