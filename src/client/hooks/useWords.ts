import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WordsResponse, Word, WordInput } from '@shared/types';
import { authedFetch } from '../lib/authedFetch';

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
  readonly createWord: (input: WordInput) => Promise<Word>;
  readonly updateWord: (params: { id: number; input: Partial<WordInput> }) => Promise<Word>;
  readonly deleteWord: (id: number) => Promise<{ success: boolean }>;
}

export function useWords({ userId, wordSetId, page = 1, limit = 10 }: UseWordsOptions): UseWordsReturn {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<WordsResponse>({
    queryKey: ['words', userId, wordSetId, page, limit],
    queryFn: async () => {
      if (userId === null || wordSetId === null) {
        return { words: [], total: 0, page, limit, totalPages: 0 };
      }
      const res = await authedFetch(`/api/words?wordSetId=${wordSetId}&page=${page}&limit=${limit}`);
      if (!res.ok) throw new Error('単語リストの取得に失敗しました');
      return res.json() as Promise<WordsResponse>;
    },
    enabled: userId !== null && wordSetId !== null,
  });

  const createWordMutation = useMutation({
    mutationFn: async (input: WordInput) => {
      const res = await authedFetch('/api/words', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || '単語の作成に失敗しました');
      }
      return res.json() as Promise<Word>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words', userId] });
      queryClient.invalidateQueries({ queryKey: ['session', userId] });
      queryClient.invalidateQueries({ queryKey: ['word-sets', userId] });
    },
  });

  const updateWordMutation = useMutation({
    mutationFn: async ({ id, input }: { id: number; input: Partial<WordInput> }) => {
      const res = await authedFetch(`/api/words/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || '単語の更新に失敗しました');
      }
      return res.json() as Promise<Word>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words', userId] });
      queryClient.invalidateQueries({ queryKey: ['session', userId] });
    },
  });

  const deleteWordMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await authedFetch(`/api/words/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || '単語の削除に失敗しました');
      }
      return res.json() as Promise<{ success: boolean }>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words', userId] });
      queryClient.invalidateQueries({ queryKey: ['session', userId] });
      queryClient.invalidateQueries({ queryKey: ['word-sets', userId] });
    },
  });

  return {
    data,
    isLoading: isLoading && userId !== null && wordSetId !== null,
    error: error instanceof Error ? error : null,
    refetch,
    createWord: createWordMutation.mutateAsync,
    updateWord: updateWordMutation.mutateAsync,
    deleteWord: deleteWordMutation.mutateAsync,
  };
}
