import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hc } from 'hono/client';
import { useState, useCallback } from 'react';
import type { AppType } from '../../server/index';
import type { Word, ReviewInput } from '@shared/types';

const client = hc<AppType>('/');

type WordWithNullProgress = Word & { readonly progress: null };

export interface SessionState {
  readonly words: readonly WordWithNullProgress[];
  readonly currentIndex: number;
  readonly isAnswerVisible: boolean;
  readonly isComplete: boolean;
  readonly isLoading: boolean;
  readonly error: Error | null;
  readonly isSubmitting: boolean;
}

export interface SessionActions {
  showAnswer(): void;
  submitReview(result: ReviewInput['result']): void;
  restart(): void;
}

export function useSession(userId: number | null, wordSetId: number | null): SessionState & SessionActions {
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['session', userId, wordSetId],
    queryFn: async (): Promise<WordWithNullProgress[]> => {
      if (userId === null || wordSetId === null) return [];
      const res = await client.api.session.$get({
        query: {
          userId: String(userId),
          wordSetId: String(wordSetId),
        },
      });
      if (!res.ok) throw new Error('セッションの取得に失敗しました');
      const words = await res.json() as Word[];
      return words.map((w) => ({ ...w, progress: null }));
    },
    enabled: userId !== null && wordSetId !== null,
  });

  const mutation = useMutation({
    mutationFn: async (input: ReviewInput) => {
      const res = await client.api.review.$post({ json: input });
      if (!res.ok) throw new Error('記録できませんでした');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['words', userId, wordSetId] });
      queryClient.invalidateQueries({ queryKey: ['word-sets', userId] });
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= (data?.length ?? 0)) {
          setIsComplete(true);
        }
        return next;
      });
      setIsAnswerVisible(false);
    },
    onError: (err) => {
      console.error(err);
      queryClient.invalidateQueries({ queryKey: ['words', userId, wordSetId] });
      queryClient.invalidateQueries({ queryKey: ['word-sets', userId] });
      // エラーでも次のカードには進む
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= (data?.length ?? 0)) {
          setIsComplete(true);
        }
        return next;
      });
      setIsAnswerVisible(false);
    },
  });

  const showAnswer = useCallback((): void => {
    setIsAnswerVisible(true);
  }, []);

  const submitReview = useCallback((result: ReviewInput['result']): void => {
    const word = data?.[currentIndex];
    if (!word || userId === null) return;
    mutation.mutate({ userId, wordId: word.id, result });
  }, [data, currentIndex, mutation, userId]);

  const restart = useCallback((): void => {
    setCurrentIndex(0);
    setIsAnswerVisible(false);
    setIsComplete(false);
    void refetch();
  }, [refetch]);

  return {
    words: data ?? [],
    currentIndex,
    isAnswerVisible,
    isComplete,
    isLoading: isLoading && userId !== null && wordSetId !== null,
    error: error instanceof Error ? error : null,
    isSubmitting: mutation.isPending,
    showAnswer,
    submitReview,
    restart,
  };
}

