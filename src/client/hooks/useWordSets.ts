import { useQuery } from '@tanstack/react-query';
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
  progress: WordSetProgress;
}

export function useWordSets(userId: number | null) {
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

  const activeWordSet = wordSets.find(s => s.id === activeWordSetId) ?? null;

  return {
    wordSets,
    activeWordSet,
    activeWordSetId,
    isLoading: isLoading && userId !== null,
    error: error instanceof Error ? error : null,
    selectWordSet,
    clearActiveWordSet,
  };
}
