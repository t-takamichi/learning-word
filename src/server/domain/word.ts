import type { Word, WordWithProgress } from '@shared/types';

export interface GetWordsResult {
  readonly words: readonly WordWithProgress[];
  readonly total: number;
}

export interface IWordRepository {
  getSession(userId: number, wordSetId: number): readonly Word[];
  getWords(userId: number, wordSetId: number, page: number, limit: number): GetWordsResult;
}
