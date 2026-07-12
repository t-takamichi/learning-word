import type { DictionaryWord } from '@shared/types';

export interface IDictionaryRepository {
  search(query: string, limit?: number): readonly string[];
  findByEnglish(english: string): DictionaryWord | null;
}
