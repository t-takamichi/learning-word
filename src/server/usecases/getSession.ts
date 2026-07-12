import type { IWordRepository } from '../domain/word';
import type { Word } from '@shared/types';

export class GetSessionUseCase {
  constructor(private readonly wordRepo: IWordRepository) {}

  execute(userId: number, wordSetId: number): readonly Word[] {
    return this.wordRepo.getSession(userId, wordSetId);
  }
}
