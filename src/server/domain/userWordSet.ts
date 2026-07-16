import type { WordSet } from '../repositories/wordSetRepository';

export interface WordSetInput {
  name: string;
  level_tag: 'basic' | 'intermediate' | 'advanced';
  description?: string | null;
}

export interface IUserWordSetRepository {
  create(userId: number, input: WordSetInput): WordSet;
  update(userId: number, id: number, input: Partial<WordSetInput>): WordSet | null;
  delete(userId: number, id: number): boolean;
  countByUser(userId: number): number;
}
