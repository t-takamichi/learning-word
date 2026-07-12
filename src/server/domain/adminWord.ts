import type { Word, WordInput } from '@shared/types';

export interface IAdminWordRepository {
  findAll(): readonly Word[];
  findById(id: number): Word | null;
  create(input: WordInput): Word;
  update(id: number, input: Partial<WordInput>): Word | null;
  delete(id: number): boolean;
}
