import type { Word, WordInput } from '@shared/types';

export interface IUserWordRepository {
  create(userId: number, input: WordInput): Word;
  update(userId: number, id: number, input: Partial<WordInput>): Word | null;
  delete(userId: number, id: number): boolean;
  countByUser(userId: number): number;
}
