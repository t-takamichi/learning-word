import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { authedFetch } from '../lib/authedFetch';

interface WordSetProgress {
  total: number;
  mastered: number;
}

interface WordSet {
  id: number;
  name: string;
  levelTag: 'basic' | 'intermediate' | 'advanced';
  description: string | null;
  createdBy: number | null;
  progress: WordSetProgress;
}

export function useWordSets(userId: number | null) {
  const queryClient = useQueryClient();
  
  // Read synchronously so the id is correct on the first render (avoids a null
  // window that would leave the session query disabled / show an empty state).
  const [activeWordSetId, setActiveWordSetId] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('active_word_set_id');
    return saved ? Number(saved) : null;
  });

  const selectWordSet = (id: number): void => {
    setActiveWordSetId(id);
    localStorage.setItem('active_word_set_id', String(id));
  };

  const clearActiveWordSet = (): void => {
    setActiveWordSetId(null);
    localStorage.removeItem('active_word_set_id');
  };

  // Queries
  const { data: wordSets = [], isLoading, error } = useQuery<WordSet[]>({
    queryKey: ['word-sets', userId],
    queryFn: async () => {
      if (userId === null) return [];
      const res = await authedFetch('/api/word-sets');
      if (!res.ok) throw new Error('単語セットの取得に失敗しました');
      return res.json() as Promise<WordSet[]>;
    },
    enabled: userId !== null,
  });

  // Mutations
  const createWordSetMutation = useMutation({
    mutationFn: async (input: { name: string; level_tag: 'basic' | 'intermediate' | 'advanced'; description?: string | null }) => {
      const res = await authedFetch('/api/word-sets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || '単語セットの作成に失敗しました');
      }
      return res.json() as Promise<WordSet>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-sets', userId] });
    },
  });

  const updateWordSetMutation = useMutation({
    mutationFn: async ({ id, input }: { id: number; input: { name?: string; level_tag?: 'basic' | 'intermediate' | 'advanced'; description?: string | null } }) => {
      const res = await authedFetch(`/api/word-sets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || '単語セットの更新に失敗しました');
      }
      return res.json() as Promise<WordSet>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['word-sets', userId] });
    },
  });

  const deleteWordSetMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await authedFetch(`/api/word-sets/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || '単語セットの削除に失敗しました');
      }
      return res.json() as Promise<{ success: boolean }>;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['word-sets', userId] });
      if (activeWordSetId === id) {
        clearActiveWordSet();
      }
    },
  });

  const activeWordSet = wordSets.find(s => s.id === activeWordSetId) ?? null;

  return {
    wordSets,
    activeWordSet,
    activeWordSetId,
    isLoading: isLoading && userId !== null,
    error: error instanceof Error ? error : null,
    selectWordSet,
    clearActiveWordSet,
    createWordSet: createWordSetMutation.mutateAsync,
    updateWordSet: updateWordSetMutation.mutateAsync,
    deleteWordSet: deleteWordSetMutation.mutateAsync,
    isMutating: createWordSetMutation.isPending || updateWordSetMutation.isPending || deleteWordSetMutation.isPending,
  };
}
