import type { IWordRepository } from '../domain/word';
import type { WordsResponse } from '@shared/types';

export class GetWordsUseCase {
  constructor(private readonly wordRepo: IWordRepository) {}

  execute(userId: number, wordSetId: number, page: number, limit: number): WordsResponse {
    const { words, total } = this.wordRepo.getWords(userId, wordSetId, page, limit);
    return {
      words,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
