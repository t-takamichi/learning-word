import type { IDictionaryRepository } from '../domain/dictionary';
import type { DictionaryWord } from '@shared/types';

export class SearchDictionaryUseCase {
  constructor(private readonly repo: IDictionaryRepository) {}

  execute(query: string, limit?: number): readonly string[] {
    if (!query) return [];
    return this.repo.search(query, limit);
  }
}

export class LookupDictionaryUseCase {
  constructor(private readonly repo: IDictionaryRepository) {}

  execute(english: string): DictionaryWord | null {
    if (!english) return null;
    return this.repo.findByEnglish(english);
  }
}
