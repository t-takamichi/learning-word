import { useQuery } from '@tanstack/react-query';
import { hc } from 'hono/client';
import { useState, useEffect } from 'react';
import type { AppType } from '../../server/index';

const client = hc<AppType>('/');

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
  const [activeWordSetId, setActiveWordSetId] = useState<number | null>(null);

  // Load active word set ID from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('active_word_set_id');
    if (saved) {
      setActiveWordSetId(Number(saved));
    }
  }, []);

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
      const res = await client.api['word-sets'].$get({
        query: {
          userId: String(userId),
        },
      });
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
